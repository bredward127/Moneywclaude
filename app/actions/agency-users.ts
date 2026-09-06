"use server";

// Agency user lifecycle: invite (email-based, no admin-set password -- see
// app/actions/onboarding.ts for what the invitee does after clicking the
// link), and the roster/permission management built out in a later phase.
// Every write here goes through the service-role client with an app-level
// check, the same pattern app/actions/auth.ts's inviteTeamMember already
// used -- there's no RLS write policy on `users` at all, by design.

import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";

export async function inviteAgencyUser({
  email,
  orgId,
  canEditPropertyDetails,
  canEditFinancialDetails,
  canEditContactInfo,
  teamIds,
}: {
  email: string;
  /** Only honored when the caller is the platform owner; otherwise forced to the caller's own org. */
  orgId?: string;
  canEditPropertyDetails: boolean;
  canEditFinancialDetails: boolean;
  canEditContactInfo: boolean;
  teamIds: string[];
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
      role: "reviewer",
      can_edit_property_details: canEditPropertyDetails,
      can_edit_financial_details: canEditFinancialDetails,
      can_edit_contact_info: canEditContactInfo,
    });
    if (insertError) {
      console.error("[agency-users] failed to provision invited user profile", insertError);
      await supabase.auth.admin.deleteUser(created.user.id);
      return { ok: false, error: "Could not finish setting up this invite. Please try again." };
    }

    if (teamIds.length > 0) {
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
