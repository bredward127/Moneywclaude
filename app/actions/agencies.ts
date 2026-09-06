"use server";

import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";

// Agency = organizations row. Owner-only: organizations has no RLS write
// policy and its one select policy is self-org-only, so (like users writes)
// this goes through the service-role client with an app-level check rather
// than a new RLS policy just for this.

export interface Agency {
  id: string;
  name: string;
  createdAt: string;
}

function mapAgency(row: Record<string, unknown>): Agency {
  return { id: row.id as string, name: row.name as string, createdAt: row.created_at as string };
}

export async function listAgencies(): Promise<Agency[]> {
  const me = await getCurrentStaffProfile();
  if (!me?.isPlatformOwner) return [];

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map(mapAgency);
  } catch (err) {
    console.error("[agencies] listAgencies threw", err);
    return [];
  }
}

export async function createAgency({
  name,
}: {
  name: string;
}): Promise<{ ok: true; agency: Agency } | { ok: false; error: string }> {
  const me = await getCurrentStaffProfile();
  if (!me?.isPlatformOwner) {
    return { ok: false, error: "Only the platform owner can create agencies." };
  }
  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter an agency name." };
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("organizations")
      .insert({ name: trimmed })
      .select("id, name, created_at")
      .single();
    if (error || !data) {
      console.error("[agencies] failed to create agency", error);
      return { ok: false, error: "Could not create this agency. Please try again." };
    }
    return { ok: true, agency: mapAgency(data) };
  } catch (err) {
    console.error("[agencies] createAgency threw", err);
    return { ok: false, error: "Could not create this agency. Please try again." };
  }
}
