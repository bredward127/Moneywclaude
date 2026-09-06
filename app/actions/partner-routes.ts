"use server";

// Trusted, service-role-backed handlers for lead routing. Not yet wired to
// any route -- built for a future authenticated staff/partner dashboard,
// which must check the caller's session/org/role before invoking these.

import { getSupabaseServiceClient } from "@/lib/supabase/server";

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

export async function assignPartnerRoute({
  leadId,
  partnerId,
  notes,
}: {
  leadId: string;
  partnerId: string;
  notes?: string;
}): Promise<{ ok: true; route: PartnerRoute } | { ok: false; error: string }> {
  const supabase = getSupabaseServiceClient();
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

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("partner_routes").update(update).eq("id", routeId);

  if (error) {
    console.error("[partner-routes] failed to update route", error);
    return { ok: false, error: "Could not update this route. Please try again." };
  }
  return { ok: true };
}

export async function listRoutesForLead(leadId: string): Promise<PartnerRoute[]> {
  const supabase = getSupabaseServiceClient();
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

export async function listRoutesForPartner(partnerId: string): Promise<PartnerRoute[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("partner_routes")
    .select()
    .eq("partner_id", partnerId)
    .order("routed_at", { ascending: false });

  if (error || !data) {
    console.error("[partner-routes] failed to list routes for partner", error);
    return [];
  }
  return data.map(mapRoute);
}
