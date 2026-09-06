import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";
import { listAgencyUsers } from "@/app/actions/agency-users";
import { listTeamsForOrg } from "@/app/actions/teams";
import { InviteAgencyUserForm } from "@/components/dashboard/InviteAgencyUserForm";
import { AgencyRosterPanel } from "@/components/dashboard/AgencyRosterPanel";
import { TeamsPanel } from "@/components/dashboard/TeamsPanel";

export default async function AgencyDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const profile = await getCurrentStaffProfile();
  if (!profile) redirect("/dashboard/login");
  if (!profile.isPlatformOwner) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Only the platform owner can manage agencies.
      </div>
    );
  }

  const [users, teams] = await Promise.all([listAgencyUsers(orgId), listTeamsForOrg(orgId)]);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/agencies"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to agencies
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Invite someone</h2>
          <div className="mt-4">
            <InviteAgencyUserForm teams={teams} orgId={orgId} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Roster</h2>
          <div className="mt-4">
            <AgencyRosterPanel users={users} viewerIsOwner={profile.isPlatformOwner} viewerId={profile.id} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Teams</h2>
          <div className="mt-4">
            <TeamsPanel teams={teams} orgId={orgId} />
          </div>
        </div>
      </div>
    </div>
  );
}
