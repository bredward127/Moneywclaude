import "server-only";
import { cache } from "react";
import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";

export type StaffRole = "admin" | "reviewer" | "acquisitions" | "partner";

export interface StaffProfile {
  id: string;
  email: string;
  orgId: string;
  role: StaffRole;
  isPlatformOwner: boolean;
  isAgencyAdmin: boolean;
  canEditProperty: boolean;
  canEditFinancial: boolean;
  canEditContact: boolean;
  teamIds: string[];
  passwordSetAt: string | null;
}

export type StaffSessionState =
  | { status: "unauthenticated" }
  | { status: "unprovisioned"; email: string }
  | { status: "ok"; profile: StaffProfile };

/**
 * Resolves the current dashboard visitor's session and, separately,
 * whether it's linked to a public.users row (RLS-scoped -- a user can
 * always read their own row via users_select_self). Kept as three distinct
 * states rather than a plain nullable profile so callers can tell "not
 * logged in" (redirect to login) apart from "logged in but not
 * provisioned" (show a message -- redirecting would just log them back
 * into the same unprovisioned account and loop).
 *
 * Wrapped in React.cache: this is called from more places per request now
 * (permission checks, team scoping) than the one call per page it used to
 * get, so de-duplicating within a single render pass avoids redundant
 * round trips for the same request.
 */
export const getStaffSessionState = cache(async (): Promise<StaffSessionState> => {
  const supabase = await getSupabaseServerSessionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "unauthenticated" };

  const { data: profile } = await supabase
    .from("users")
    .select(
      "id, org_id, email, role, is_platform_owner, is_agency_admin, can_edit_property_details, can_edit_financial_details, can_edit_contact_info, password_set_at, team_members(team_id)"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return { status: "unprovisioned", email: user.email ?? "" };

  const teamMembers = (profile.team_members ?? []) as { team_id: string }[];

  return {
    status: "ok",
    profile: {
      id: profile.id as string,
      email: profile.email as string,
      orgId: profile.org_id as string,
      role: profile.role as StaffRole,
      isPlatformOwner: Boolean(profile.is_platform_owner),
      isAgencyAdmin: Boolean(profile.is_agency_admin),
      canEditProperty: Boolean(profile.can_edit_property_details),
      canEditFinancial: Boolean(profile.can_edit_financial_details),
      canEditContact: Boolean(profile.can_edit_contact_info),
      teamIds: teamMembers.map((tm) => tm.team_id),
      passwordSetAt: (profile.password_set_at as string | null) ?? null,
    },
  };
});

/** Convenience accessor for call sites that only care about the happy path. */
export async function getCurrentStaffProfile(): Promise<StaffProfile | null> {
  const state = await getStaffSessionState();
  return state.status === "ok" ? state.profile : null;
}
