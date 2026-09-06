"use server";

// Contract packet lifecycle for the Wholesale & Contract Packet Manager.
// This panel is a status tracker and document-storage UI only: template
// selection is a fixed picklist, e-sign fields are manually-updated
// placeholders (no DocuSign/Dropbox Sign API calls), and executed documents
// are uploaded by staff, never generated. Nothing here drafts, sends, or
// executes a legal document.

import { randomBytes } from "node:crypto";
import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { assertLeadAccessible } from "@/lib/dashboard/access";
import { CONTRACT_DOCUMENTS_BUCKET } from "@/lib/dashboard/contracts";

const SIGNED_VIEW_URL_TTL_SECONDS = 15 * 60;

const CONTRACT_PACKET_STATUSES = ["draft", "prepared", "sent", "signed", "under_contract"] as const;
export type ContractPacketStatus = (typeof CONTRACT_PACKET_STATUSES)[number];

export interface ContractPacket {
  id: string;
  leadId: string;
  status: ContractPacketStatus;
  templateId: string | null;
  envelopeId: string | null;
  executedDocPath: string | null;
  createdAt: string;
}

function mapPacket(row: Record<string, unknown>): ContractPacket {
  return {
    id: row.id as string,
    leadId: row.lead_id as string,
    status: row.status as ContractPacketStatus,
    templateId: (row.template_id as string | null) ?? null,
    envelopeId: (row.envelope_id as string | null) ?? null,
    executedDocPath: (row.executed_doc_path as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function listContractPacketsForLead(leadId: string): Promise<ContractPacket[]> {
  const supabase = await getSupabaseServerSessionClient();
  const { data, error } = await supabase
    .from("contract_packets")
    .select()
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[contract-packets] failed to list packets", error);
    return [];
  }
  return data.map(mapPacket);
}

export async function createContractPacket({
  leadId,
  templateId,
}: {
  leadId: string;
  templateId?: string;
}): Promise<{ ok: true; packet: ContractPacket } | { ok: false; error: string }> {
  const supabase = await getSupabaseServerSessionClient();
  const { data, error } = await supabase
    .from("contract_packets")
    .insert({ lead_id: leadId, template_id: templateId ?? null })
    .select()
    .single();

  if (error || !data) {
    console.error("[contract-packets] failed to create packet", error);
    return { ok: false, error: "Could not start a contract packet. Please try again." };
  }
  return { ok: true, packet: mapPacket(data) };
}

export async function updateContractPacket({
  packetId,
  status,
  templateId,
  envelopeId,
}: {
  packetId: string;
  status?: ContractPacketStatus;
  templateId?: string;
  envelopeId?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (status && !CONTRACT_PACKET_STATUSES.includes(status)) {
    return { ok: false, error: "Unknown packet status." };
  }

  const update: Record<string, unknown> = {};
  if (status !== undefined) update.status = status;
  if (templateId !== undefined) update.template_id = templateId;
  if (envelopeId !== undefined) update.envelope_id = envelopeId;

  if (Object.keys(update).length === 0) {
    return { ok: false, error: "Nothing to update." };
  }

  const supabase = await getSupabaseServerSessionClient();
  const { error } = await supabase.from("contract_packets").update(update).eq("id", packetId);

  if (error) {
    console.error("[contract-packets] failed to update packet", error);
    return { ok: false, error: "Could not update this contract packet. Please try again." };
  }
  return { ok: true };
}

export async function createExecutedDocUploadTicket({
  leadId,
  filename,
}: {
  leadId: string;
  filename: string;
}): Promise<{ ok: true; path: string; token: string; signedUrl: string } | { ok: false; error: string }> {
  if (!(await assertLeadAccessible(leadId))) {
    return { ok: false, error: "You don't have access to this lead." };
  }

  const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
  const unique = `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const path = `${leadId}/${unique}-${safeName}`;

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.storage
    .from(CONTRACT_DOCUMENTS_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("[contract-packets] failed to create executed doc upload url", error);
    return { ok: false, error: "Could not start the upload. Please try again." };
  }
  return { ok: true, path, token: data.token, signedUrl: data.signedUrl };
}

export async function confirmExecutedDocUpload({
  packetId,
  path,
}: {
  packetId: string;
  path: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await getSupabaseServerSessionClient();
  const { error } = await supabase
    .from("contract_packets")
    .update({ executed_doc_path: path })
    .eq("id", packetId);

  if (error) {
    console.error("[contract-packets] failed to record executed doc path", error);
    return { ok: false, error: "The file uploaded, but we couldn't save it to this packet." };
  }
  return { ok: true };
}

export async function getExecutedDocSignedUrl(
  leadId: string,
  path: string
): Promise<{ url: string } | { error: string }> {
  if (!(await assertLeadAccessible(leadId))) {
    return { error: "You don't have access to this lead." };
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.storage
    .from(CONTRACT_DOCUMENTS_BUCKET)
    .createSignedUrl(path, SIGNED_VIEW_URL_TTL_SECONDS);

  if (error || !data) {
    console.error("[contract-packets] failed to create executed doc signed url", error);
    return { error: "Could not load this document." };
  }
  return { url: data.signedUrl };
}
