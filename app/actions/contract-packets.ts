"use server";

// Trusted, service-role-backed handlers for the contract packet lifecycle.
// Not yet wired to any route -- built for a future authenticated staff
// dashboard, which must check the caller's session/org/role before
// invoking these.

import { getSupabaseServiceClient } from "@/lib/supabase/server";

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

export async function createContractPacket({
  leadId,
  templateId,
}: {
  leadId: string;
  templateId?: string;
}): Promise<{ ok: true; packet: ContractPacket } | { ok: false; error: string }> {
  const supabase = getSupabaseServiceClient();
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
  envelopeId,
  executedDocPath,
}: {
  packetId: string;
  status?: ContractPacketStatus;
  envelopeId?: string;
  executedDocPath?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (status && !CONTRACT_PACKET_STATUSES.includes(status)) {
    return { ok: false, error: "Unknown packet status." };
  }

  const update: Record<string, unknown> = {};
  if (status !== undefined) update.status = status;
  if (envelopeId !== undefined) update.envelope_id = envelopeId;
  if (executedDocPath !== undefined) update.executed_doc_path = executedDocPath;

  if (Object.keys(update).length === 0) {
    return { ok: false, error: "Nothing to update." };
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("contract_packets").update(update).eq("id", packetId);

  if (error) {
    console.error("[contract-packets] failed to update packet", error);
    return { ok: false, error: "Could not update this contract packet. Please try again." };
  }
  return { ok: true };
}

export async function listContractPacketsForLead(leadId: string): Promise<ContractPacket[]> {
  const supabase = getSupabaseServiceClient();
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
