"use server";

// Agency user lifecycle: invite (email-based, no admin-set password -- see
// app/actions/onboarding.ts for what the invitee does after clicking the
// link), plus the roster/permission management built on top of it. Every
// write here goes through the service-role client with an app-level check,
// the same pattern app/actions/auth.ts's old inviteTeamMember used -- there
// is no RLS write policy on `users` at all, by design.

import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";

export interface AgencyUser {
  id: string;
  email: string;
  orgId: string;
  role: string;
  isAgencyAdmin: boolean;
  canEditPropertyDetails: boolean;
  canEditFinancialDetails: boolean;
  canEditContactInfo: boolean;
  teamIds: string[];
  createdAt: string;
  /** Whether they have a working authenticator app enrolled. null = we couldn't read it. */
  mfaEnrolled: boolean | null;
}

function mapAgencyUser(row: Record<string, unknown>, mfaEnrolled: boolean | null): AgencyUser {
  const teamMembers = (row.team_members as { team_id: string }[] | null) ?? [];
  return {
    id: row.id as string,
    email: row.email as string,
    orgId: row.org_id as string,
    role: row.role as string,
    isAgencyAdmin: Boolean(row.is_agency_admin),
    canEditPropertyDetails: Boolean(row.can_edit_property_details),
    canEditFinancialDetails: Boolean(row.can_edit_financial_details),
    canEditContactInfo: Boolean(row.can_edit_contact_info),
    teamIds: teamMembers.map((tm) => tm.team_id),
    createdAt: row.created_at as string,
    mfaEnrolled,
  };
}

/**
 * Reads whether each roster member has a *verified* authenticator factor.
 * MFA factors live in the `auth` schema, which PostgREST can't reach, so
 * this is one admin API call per person rather than a join -- fine at this
 * app's scale (an agency roster is a handful of people, and the calls run
 * in parallel), and it degrades to `null` ("unknown") per user rather than
 * failing the whole roster.
 */
async function readMfaEnrollment(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  userIds: string[]
): Promise<Map<string, boolean | null>> {
  const entries = await Promise.all(
    userIds.map(async (userId): Promise<[string, boolean | null]> => {
      try {
        const { data, error } = await supabase.auth.admin.mfa.listFactors({ userId });
        if (error) {
          console.error("[agency-users] failed to read MFA factors", error);
          return [userId, null];
        }
        return [userId, (data?.factors ?? []).some((factor) => factor.status === "verified")];
      } catch (err) {
        console.error("[agency-users] readMfaEnrollment threw", err);
        return [userId, null];
      }
    })
  );
  return new Map(entries);
}

export async function inviteAgencyUser({
  email,
  orgId,
  isPartner = false,
  canEditPropertyDetails = false,
  canEditFinancialDetails = false,
  canEditContactInfo = false,
  teamIds = [],
}: {
  email: string;
  /** Only honored when the caller is the platform owner; otherwise forced to the caller's own org. */
  orgId?: string;
  /** Partners are a separate, orthogonal channel (see partner_routes) -- dials/teams don't apply to them. */
  isPartner?: boolean;
  canEditPropertyDetails?: boolean;
  canEditFinancialDetails?: boolean;
  canEditContactInfo?: boolean;
  teamIds?: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentStaffProfile();
  if (!me) {
    return { ok: false, error: "You must be signed in to invite someone." };
  }
  if (!me.isAgencyAdmin && !me.isPlatformOwner) {
    return { ok: false, error: "Only an agency admin can invite new users." };
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { ok: false, error: "Enter an email address." };
  }

  const targetOrgId = me.isPlatformOwner && orgId ? orgId : me.orgId;

  try {
    const supabase = getSupabaseServiceClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const { data: created, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      trimmedEmail,
      { redirectTo: `${siteUrl}/auth/confirm` }
    );
    if (inviteError || !created.user) {
      console.error("[agency-users] failed to invite user", inviteError);
      return { ok: false, error: inviteError?.message ?? "Could not send the invite." };
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: created.user.id,
      org_id: targetOrgId,
      email: trimmedEmail,
      role: isPartner ? "partner" : "reviewer",
      can_edit_property_details: isPartner ? false : canEditPropertyDetails,
      can_edit_financial_details: isPartner ? false : canEditFinancialDetails,
      can_edit_contact_info: isPartner ? false : canEditContactInfo,
    });
    if (insertError) {
      console.error("[agency-users] failed to provision invited user profile", insertError);
      await supabase.auth.admin.deleteUser(created.user.id);
      return { ok: false, error: "Could not finish setting up this invite. Please try again." };
    }

    if (!isPartner && teamIds.length > 0) {
      const { error: teamError } = await supabase
        .from("team_members")
        .insert(teamIds.map((teamId) => ({ team_id: teamId, user_id: created.user.id })));
      if (teamError) {
        // Non-fatal: the account and invite are already good; team
        // assignment can be fixed up afterward from the team roster page.
        console.error("[agency-users] failed to assign teams to invited user", teamError);
      }
    }

    return { ok: true };
  } catch (err) {
    console.error("[agency-users] inviteAgencyUser threw", err);
    return { ok: false, error: "Could not send the invite. Please try again." };
  }
}

export async function listAgencyUsers(
  orgId?: string,
  /**
   * Two-factor status costs one admin API call per person, so only the two
   * roster views that actually render it ask for it -- the team member
   * picker doesn't, and gets `mfaEnrolled: null` instead.
   */
  options: { includeMfaStatus?: boolean } = {}
): Promise<AgencyUser[]> {
  const me = await getCurrentStaffProfile();
  if (!me || (!me.isPlatformOwner && !me.isAgencyAdmin)) return [];
  const targetOrgId = me.isPlatformOwner ? (orgId ?? me.orgId) : me.orgId;
  if (!me.isPlatformOwner && targetOrgId !== me.orgId) return [];

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, email, org_id, role, is_agency_admin, can_edit_property_details, can_edit_financial_details, can_edit_contact_info, created_at, team_members(team_id)"
      )
      .eq("org_id", targetOrgId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    const mfaByUserId = options.includeMfaStatus
      ? await readMfaEnrollment(
          supabase,
          data.map((row) => row.id as string)
        )
      : new Map<string, boolean | null>();
    return data.map((row) => mapAgencyUser(row, mfaByUserId.get(row.id as string) ?? null));
  } catch (err) {
    console.error("[agency-users] listAgencyUsers threw", err);
    return [];
  }
}

async function assertManageable(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentStaffProfile();
  if (!me || (!me.isPlatformOwner && !me.isAgencyAdmin)) {
    return { ok: false, error: "Only an agency admin can manage users." };
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { data: target } = await supabase
      .from("users")
      .select("org_id, is_platform_owner")
      .eq("id", userId)
      .maybeSingle();
    if (!target) {
      return { ok: false, error: "Could not find this user." };
    }
    // The owner's own account is off-limits to everyone else. Without this,
    // an agency admin who happens to share the owner's org could remove the
    // owner, strip their permissions, or reset their two-factor.
    if (target.is_platform_owner && !me.isPlatformOwner) {
      return { ok: false, error: "The platform owner's account can't be managed here." };
    }
    if (me.isPlatformOwner) return { ok: true };
    if (target.org_id !== me.orgId) {
      return { ok: false, error: "You can only manage users in your own agency." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[agency-users] assertManageable threw", err);
    return { ok: false, error: "Could not verify access. Please try again." };
  }
}

export async function removeAgencyUser(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentStaffProfile();
  if (me?.id === userId) {
    return { ok: false, error: "You can't remove your own account." };
  }
  const allowed = await assertManageable(userId);
  if (!allowed.ok) return allowed;

  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error("[agency-users] failed to remove user", error);
      return { ok: false, error: "Could not remove this user. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[agency-users] removeAgencyUser threw", err);
    return { ok: false, error: "Could not remove this user. Please try again." };
  }
}

export async function updateAgencyUserPermissions({
  userId,
  canEditPropertyDetails,
  canEditFinancialDetails,
  canEditContactInfo,
}: {
  userId: string;
  canEditPropertyDetails: boolean;
  canEditFinancialDetails: boolean;
  canEditContactInfo: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await assertManageable(userId);
  if (!allowed.ok) return allowed;

  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase
      .from("users")
      .update({
        can_edit_property_details: canEditPropertyDetails,
        can_edit_financial_details: canEditFinancialDetails,
        can_edit_contact_info: canEditContactInfo,
      })
      .eq("id", userId);
    if (error) {
      console.error("[agency-users] failed to update permissions", error);
      return { ok: false, error: "Could not save these permissions. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[agency-users] updateAgencyUserPermissions threw", err);
    return { ok: false, error: "Could not save these permissions. Please try again." };
  }
}

/** The one bit only the platform owner may ever flip -- enforced again at the DB layer by enforce_admin_grant_restriction. */
export async function setAgencyAdminStatus({
  userId,
  isAgencyAdmin,
}: {
  userId: string;
  isAgencyAdmin: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentStaffProfile();
  if (!me?.isPlatformOwner) {
    return { ok: false, error: "Only the platform owner can change admin status." };
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from("users").update({ is_agency_admin: isAgencyAdmin }).eq("id", userId);
    if (error) {
      console.error("[agency-users] failed to update admin status", error);
      return { ok: false, error: "Could not update admin status. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[agency-users] setAgencyAdminStatus threw", err);
    return { ok: false, error: "Could not update admin status. Please try again." };
  }
}

/**
 * Clears every two-factor factor on an account, so the next sign-in walks
 * them back through QR-code enrollment with a fresh authenticator app.
 * This is the recovery path for a lost or wiped phone.
 *
 * Safe to hand to agency admins: deleting a factor doesn't grant access to
 * the account. There is no admin-set-password path anywhere in this app --
 * a password can only be set by the account holder from a link emailed to
 * their own inbox -- so an admin who resets someone's 2FA still can't sign
 * in as them. Supabase logs the target out of all active sessions when a
 * verified factor is deleted, which is what makes this useful for a
 * genuinely lost device rather than just a re-enrollment convenience.
 */
export async function resetUserMfa(
  userId: string
): Promise<{ ok: true; removed: number } | { ok: false; error: string }> {
  const allowed = await assertManageable(userId);
  if (!allowed.ok) return allowed;

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error: listError } = await supabase.auth.admin.mfa.listFactors({ userId });
    if (listError) {
      console.error("[agency-users] failed to list MFA factors for reset", listError);
      return { ok: false, error: "Could not read this user's two-factor setup. Please try again." };
    }

    // Unverified factors -- an enrollment someone started and never
    // finished -- are cleared too. They're invisible to the user but still
    // count against the account, so leaving them behind can block the fresh
    // enrollment this reset exists to unblock.
    const factors = data?.factors ?? [];
    for (const factor of factors) {
      const { error: deleteError } = await supabase.auth.admin.mfa.deleteFactor({
        userId,
        id: factor.id,
      });
      if (deleteError) {
        console.error("[agency-users] failed to delete MFA factor", deleteError);
        return { ok: false, error: "Could not reset two-factor for this user. Please try again." };
      }
    }

    return { ok: true, removed: factors.length };
  } catch (err) {
    console.error("[agency-users] resetUserMfa threw", err);
    return { ok: false, error: "Could not reset two-factor for this user. Please try again." };
  }
}
