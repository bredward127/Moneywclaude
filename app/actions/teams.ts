"use server";

// Unlike users/organizations, teams/team_members/team_customers have real
// RLS write policies (teams_admin_all etc. -- see the phase-2 migration),
// so every function here uses the session-scoped client and lets RLS do
// the authorization, rather than the service-role-plus-app-check pattern
// agencies.ts/agency-users.ts use.

import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";

export interface Team {
  id: string;
  orgId: string;
  name: string;
  createdAt: string;
}

function mapTeam(row: Record<string, unknown>): Team {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
  };
}

export async function listTeamsForOrg(orgId?: string): Promise<Team[]> {
  try {
    const me = await getCurrentStaffProfile();
    if (!me) return [];
    const targetOrgId = me.isPlatformOwner ? (orgId ?? me.orgId) : me.orgId;

    const supabase = await getSupabaseServerSessionClient();
    const { data, error } = await supabase
      .from("teams")
      .select("id, org_id, name, created_at")
      .eq("org_id", targetOrgId)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map(mapTeam);
  } catch (err) {
    console.error("[teams] listTeamsForOrg threw", err);
    return [];
  }
}

export async function createTeam({
  name,
  orgId,
}: {
  name: string;
  orgId?: string;
}): Promise<{ ok: true; team: Team } | { ok: false; error: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Enter a team name." };

  try {
    const me = await getCurrentStaffProfile();
    if (!me) return { ok: false, error: "You must be signed in." };
    const targetOrgId = me.isPlatformOwner && orgId ? orgId : me.orgId;

    const supabase = await getSupabaseServerSessionClient();
    const { data, error } = await supabase
      .from("teams")
      .insert({ org_id: targetOrgId, name: trimmed, created_by: me.id })
      .select("id, org_id, name, created_at")
      .single();

    if (error || !data) {
      console.error("[teams] failed to create team", error);
      return { ok: false, error: "Could not create this team. Please try again." };
    }
    return { ok: true, team: mapTeam(data) };
  } catch (err) {
    console.error("[teams] createTeam threw", err);
    return { ok: false, error: "Could not create this team. Please try again." };
  }
}

export async function deleteTeam(teamId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await getSupabaseServerSessionClient();
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) {
      console.error("[teams] failed to delete team", error);
      return { ok: false, error: "Could not delete this team. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[teams] deleteTeam threw", err);
    return { ok: false, error: "Could not delete this team. Please try again." };
  }
}

export interface TeamMember {
  userId: string;
  email: string;
}

export async function listTeamMembers(teamId: string): Promise<TeamMember[]> {
  try {
    const supabase = await getSupabaseServerSessionClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("user_id, users(email)")
      .eq("team_id", teamId);
    if (error || !data) return [];
    return data.map((row) => {
      const user = Array.isArray(row.users) ? row.users[0] : row.users;
      return {
        userId: row.user_id as string,
        email: (user as { email: string } | undefined)?.email ?? (row.user_id as string),
      };
    });
  } catch (err) {
    console.error("[teams] listTeamMembers threw", err);
    return [];
  }
}

export async function addTeamMember({
  teamId,
  userId,
}: {
  teamId: string;
  userId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await getSupabaseServerSessionClient();
    const { error } = await supabase.from("team_members").insert({ team_id: teamId, user_id: userId });
    if (error) {
      console.error("[teams] failed to add team member", error);
      return { ok: false, error: "Could not add this member. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[teams] addTeamMember threw", err);
    return { ok: false, error: "Could not add this member. Please try again." };
  }
}

export async function removeTeamMember({
  teamId,
  userId,
}: {
  teamId: string;
  userId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await getSupabaseServerSessionClient();
    const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", userId);
    if (error) {
      console.error("[teams] failed to remove team member", error);
      return { ok: false, error: "Could not remove this member. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[teams] removeTeamMember threw", err);
    return { ok: false, error: "Could not remove this member. Please try again." };
  }
}

export interface TeamCustomer {
  leadId: string;
  contactName: string;
}

export async function listTeamCustomers(teamId: string): Promise<TeamCustomer[]> {
  try {
    const supabase = await getSupabaseServerSessionClient();
    const { data, error } = await supabase
      .from("team_customers")
      .select("lead_id, leads(contact_name)")
      .eq("team_id", teamId);
    if (error || !data) return [];
    return data.map((row) => {
      const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;
      return {
        leadId: row.lead_id as string,
        contactName: (lead as { contact_name: string } | undefined)?.contact_name || "Unnamed lead",
      };
    });
  } catch (err) {
    console.error("[teams] listTeamCustomers threw", err);
    return [];
  }
}

/**
 * Upserts on lead_id, which is unique -- this both assigns and reassigns a
 * customer to exactly one team. The cross-agency guard (a lead can only go
 * to a team in its own org) is checked here rather than in RLS: embedding a
 * direct join to `leads` inside team_customers' own policy triggers
 * Postgres's row-security recursion guard, since leads' own policy already
 * calls a function that queries leads again -- two independent top-level
 * queries avoid that self-reference entirely.
 */
export async function assignCustomerToTeam({
  leadId,
  teamId,
}: {
  leadId: string;
  teamId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await getSupabaseServerSessionClient();

    const [{ data: team }, { data: lead }] = await Promise.all([
      supabase.from("teams").select("org_id").eq("id", teamId).maybeSingle(),
      supabase.from("leads").select("org_id").eq("id", leadId).maybeSingle(),
    ]);
    if (!team || !lead) {
      return { ok: false, error: "Could not find this team or customer." };
    }
    if (team.org_id !== lead.org_id) {
      return { ok: false, error: "This customer belongs to a different agency." };
    }

    const { error } = await supabase
      .from("team_customers")
      .upsert({ lead_id: leadId, team_id: teamId }, { onConflict: "lead_id" });
    if (error) {
      console.error("[teams] failed to assign customer to team", error);
      return { ok: false, error: "Could not assign this customer. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[teams] assignCustomerToTeam threw", err);
    return { ok: false, error: "Could not assign this customer. Please try again." };
  }
}

export async function unassignCustomerFromTeam(
  leadId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await getSupabaseServerSessionClient();
    const { error } = await supabase.from("team_customers").delete().eq("lead_id", leadId);
    if (error) {
      console.error("[teams] failed to unassign customer", error);
      return { ok: false, error: "Could not unassign this customer. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[teams] unassignCustomerFromTeam threw", err);
    return { ok: false, error: "Could not unassign this customer. Please try again." };
  }
}
