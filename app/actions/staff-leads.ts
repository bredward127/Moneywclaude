"use server";

// Trusted, service-role-backed handlers for internal lead management. Not
// yet wired to any route -- built for a future authenticated staff
// dashboard, which must check the caller's session/org/role before
// invoking these. RLS does not protect them on its own, since the service
// role client bypasses RLS by design.

import { getSupabaseServiceClient } from "@/lib/supabase/server";

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
  humanReviewFlag: boolean;
  createdAt: string;
}

export async function listOrgLeads(orgId: string): Promise<OrgLead[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, type, status, contact_name, email, phone, contact_pref, property_details, buyer_criteria, human_review_flag, created_at"
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[staff-leads] failed to list org leads", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id as string,
    type: row.type as string,
    status: row.status as string,
    contactName: row.contact_name as string,
    email: row.email as string,
    phone: row.phone as string,
    contactPref: row.contact_pref as string,
    propertyDetails: (row.property_details as Record<string, unknown>) ?? {},
    buyerCriteria: (row.buyer_criteria as Record<string, unknown>) ?? {},
    humanReviewFlag: row.human_review_flag as boolean,
    createdAt: row.created_at as string,
  }));
}

export async function setLeadReviewFlag(
  leadId: string,
  flag: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseServiceClient();
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
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);

  if (error) {
    console.error("[staff-leads] failed to update lead status", error);
    return { ok: false, error: "Could not update this lead. Please try again." };
  }
  return { ok: true };
}
