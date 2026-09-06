import "server-only";
import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";

export type StaffRole = "admin" | "reviewer" | "acquisitions" | "partner";

export interface StaffProfile {
  id: string;
  email: string;
  orgId: string;
  role: StaffRole;
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
 */
export async function getStaffSessionState(): Promise<StaffSessionState> {
  const supabase = await getSupabaseServerSessionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "unauthenticated" };

  const { data: profile } = await supabase
    .from("users")
    .select("id, org_id, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return { status: "unprovisioned", email: user.email ?? "" };

  return {
    status: "ok",
    profile: {
      id: profile.id as string,
      email: profile.email as string,
      orgId: profile.org_id as string,
      role: profile.role as StaffRole,
    },
  };
}

/** Convenience accessor for call sites that only care about the happy path. */
export async function getCurrentStaffProfile(): Promise<StaffProfile | null> {
  const state = await getStaffSessionState();
  return state.status === "ok" ? state.profile : null;
}
