import { redirect } from "next/navigation";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";
import { listAgencyUsers } from "@/app/actions/agency-users";
import { listTeamsForOrg } from "@/app/actions/teams";
import { InviteAgencyUserForm } from "@/components/dashboard/InviteAgencyUserForm";
import { AgencyRosterPanel } from "@/components/dashboard/AgencyRosterPanel";

export const metadata = { title: "Team | Dashboard" };

export default async function TeamPage() {
  const profile = await getCurrentStaffProfile();
  if (!profile) redirect("/dashboard/login");
  if (!profile.isAgencyAdmin && !profile.isPlatformOwner) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Only agency admins can manage the team.
      </div>
    );
  }

  const [users, teams] = await Promise.all([listAgencyUsers(undefined, { includeMfaStatus: true }), listTeamsForOrg()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        <p className="mt-1 text-sm text-slate-600">
          Invite staff and partner accounts, and manage who can edit what.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Invite someone</h2>
          <div className="mt-4">
            <InviteAgencyUserForm teams={teams} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Current team</h2>
          <div className="mt-4">
            <AgencyRosterPanel users={users} viewerIsOwner={profile.isPlatformOwner} viewerId={profile.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
