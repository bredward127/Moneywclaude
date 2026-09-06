"use server";

// Session-authenticated handlers for lead routing. RLS
// (partner_routes_staff_all / partner_routes_partner_*) enforces who may
// assign, update, or see routes -- this file just runs queries as the
// caller.

import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";

const PARTNER_ROUTE_STATUSES = ["assigned", "contacted", "closed"] as const;
export type PartnerRouteStatus = (typeof PARTNER_ROUTE_STATUSES)[number];

export interface PartnerRoute {
  id: string;
  leadId: string;
  partnerId: string;
  status: PartnerRouteStatus;
  notes: string | null;
  routedAt: string;
}

export interface OrgPartner {
  id: string;
  email: string;
}

function mapRoute(row: Record<string, unknown>): PartnerRoute {
  return {
    id: row.id as string,
    leadId: row.lead_id as string,
    partnerId: row.partner_id as string,
    status: row.status as PartnerRouteStatus,
    notes: (row.notes as string | null) ?? null,
    routedAt: row.routed_at as string,
  };
}

export async function listOrgPartners(): Promise<OrgPartner[]> {
  const supabase = await getSupabaseServerSessionClient();
  const { data, error } = await supabase.from("users").select("id, email").eq("role", "partner");

  if (error || !data) {
    console.error("[partner-routes] failed to list org partners", error);
    return [];
  }
  return data.map((row) => ({ id: row.id as string, email: row.email as string }));
}

export async function assignPartnerRoute({
  leadId,
  partnerId,
  notes,
}: {
  leadId: string;
  partnerId: string;
  notes?: string;
}): Promise<{ ok: true; route: PartnerRoute } | { ok: false; error: string }> {
  const supabase = await getSupabaseServerSessionClient();
  const { data, error } = await supabase
    .from("partner_routes")
    .insert({ lead_id: leadId, partner_id: partnerId, notes: notes ?? null })
    .select()
    .single();

  if (error || !data) {
    console.error("[partner-routes] failed to assign route", error);
    return { ok: false, error: "Could not assign this lead to a partner. Please try again." };
  }
  return { ok: true, route: mapRoute(data) };
}

export async function updatePartnerRouteStatus({
  routeId,
  status,
  notes,
}: {
  routeId: string;
  status: PartnerRouteStatus;
  notes?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!PARTNER_ROUTE_STATUSES.includes(status)) {
    return { ok: false, error: "Unknown route status." };
  }

  const update: Record<string, unknown> = { status };
  if (notes !== undefined) update.notes = notes;

  const supabase = await getSupabaseServerSessionClient();
  const { error } = await supabase.from("partner_routes").update(update).eq("id", routeId);

  if (error) {
    console.error("[partner-routes] failed to update route", error);
    return { ok: false, error: "Could not update this route. Please try again." };
  }
  return { ok: true };
}

export async function listRoutesForLead(leadId: string): Promise<PartnerRoute[]> {
  const supabase = await getSupabaseServerSessionClient();
  const { data, error } = await supabase
    .from("partner_routes")
    .select()
    .eq("lead_id", leadId)
    .order("routed_at", { ascending: false });

  if (error || !data) {
    console.error("[partner-routes] failed to list routes for lead", error);
    return [];
  }
  return data.map(mapRoute);
}
