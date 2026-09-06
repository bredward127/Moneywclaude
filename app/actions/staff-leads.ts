"use server";

// Session-authenticated handlers for the staff dashboard. These use the
// caller's own Supabase session, not the service role, so RLS
// (leads_staff_select / leads_staff_update) is the real access control:
// results are automatically scoped to the caller's organization and
// excluded entirely for the partner role.

import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";

export interface OrgLead {
  id: string;
  type: string;
  status: string;
  contactName: string;
  email: string;
  phone: string;
  contactPref: string;
  propertyDetails: Record<string, unknown>;
  buyerCriteria: Record<string, unknown>;
  transcriptRaw: string | null;
  humanReviewFlag: boolean;
  createdAt: string;
}

const LEAD_COLUMNS =
  "id, type, status, contact_name, email, phone, contact_pref, property_details, buyer_criteria, transcript_raw, human_review_flag, created_at";

function mapLead(row: Record<string, unknown>): OrgLead {
  return {
    id: row.id as string,
    type: row.type as string,
    status: row.status as string,
    contactName: row.contact_name as string,
    email: row.email as string,
    phone: row.phone as string,
    contactPref: row.contact_pref as string,
    propertyDetails: (row.property_details as Record<string, unknown>) ?? {},
    buyerCriteria: (row.buyer_criteria as Record<string, unknown>) ?? {},
    transcriptRaw: (row.transcript_raw as string | null) ?? null,
    humanReviewFlag: row.human_review_flag as boolean,
    createdAt: row.created_at as string,
  };
}

export async function listOrgLeads(): Promise<OrgLead[]> {
  const supabase = await getSupabaseServerSessionClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[staff-leads] failed to list org leads", error);
    return [];
  }
  return data.map(mapLead);
}

export async function getLead(leadId: string): Promise<OrgLead | null> {
  const supabase = await getSupabaseServerSessionClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("id", leadId)
    .maybeSingle();

  if (error || !data) return null;
  return mapLead(data);
}

export interface ConsentRecord {
  id: string;
  disclosureVersion: string;
  privacyAgreed: boolean;
  marketingOptIn: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export async function listConsentRecordsForLead(leadId: string): Promise<ConsentRecord[]> {
  const supabase = await getSupabaseServerSessionClient();
  const { data, error } = await supabase
    .from("consent_records")
    .select("id, disclosure_version, privacy_agreed, marketing_opt_in, ip_address, user_agent, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[staff-leads] failed to list consent records", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id as string,
    disclosureVersion: row.disclosure_version as string,
    privacyAgreed: row.privacy_agreed as boolean,
    marketingOptIn: row.marketing_opt_in as boolean,
    ipAddress: (row.ip_address as string | null) ?? null,
    userAgent: (row.user_agent as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
}

export async function setLeadReviewFlag(
  leadId: string,
  flag: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await getSupabaseServerSessionClient();
  const { error } = await supabase.from("leads").update({ human_review_flag: flag }).eq("id", leadId);

  if (error) {
    console.error("[staff-leads] failed to update review flag", error);
    return { ok: false, error: "Could not update this lead. Please try again." };
  }
  return { ok: true };
}

export async function updateLeadStatus(
  leadId: string,
  status: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await getSupabaseServerSessionClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);

  if (error) {
    console.error("[staff-leads] failed to update lead status", error);
    return { ok: false, error: "Could not update this lead. Please try again." };
  }
  return { ok: true };
}
