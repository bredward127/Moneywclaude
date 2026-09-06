import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";
import { listTeamMembers, listTeamCustomers, listTeamsForOrg } from "@/app/actions/teams";
import { listAgencyUsers } from "@/app/actions/agency-users";
import { listOrgLeads } from "@/app/actions/staff-leads";
import { TeamDetailPanel } from "@/components/dashboard/TeamDetailPanel";

export default async function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const profile = await getCurrentStaffProfile();
  if (!profile) redirect("/dashboard/login");
  if (!profile.isAgencyAdmin && !profile.isPlatformOwner) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Only agency admins can manage teams.
      </div>
    );
  }

  const [teams, members, customers, agencyUsers, leads] = await Promise.all([
    listTeamsForOrg(),
    listTeamMembers(teamId),
    listTeamCustomers(teamId),
    listAgencyUsers(),
    listOrgLeads(),
  ]);

  const team = teams.find((t) => t.id === teamId);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/teams"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to teams
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{team?.name ?? "Team"}</h1>
      </div>

      <TeamDetailPanel
        teamId={teamId}
        members={members}
        candidateUsers={agencyUsers.filter((u) => u.role !== "partner").map((u) => ({ id: u.id, email: u.email }))}
        customers={customers}
        candidateLeads={leads.map((l) => ({ id: l.id, contactName: l.contactName || "Unnamed lead" }))}
      />
    </div>
  );
}
