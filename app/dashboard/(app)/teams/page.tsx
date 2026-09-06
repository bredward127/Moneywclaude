import { redirect } from "next/navigation";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";
import { listTeamsForOrg } from "@/app/actions/teams";
import { TeamsPanel } from "@/components/dashboard/TeamsPanel";

export const metadata = { title: "Teams | Dashboard" };

export default async function TeamsPage() {
  const profile = await getCurrentStaffProfile();
  if (!profile) redirect("/dashboard/login");
  if (!profile.isAgencyAdmin && !profile.isPlatformOwner) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Only agency admins can manage teams.
      </div>
    );
  }

  const teams = await listTeamsForOrg();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Teams</h1>
        <p className="mt-1 text-sm text-slate-600">
          Group your agency&apos;s users so they only see the customers assigned to their team.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <TeamsPanel teams={teams} />
      </div>
    </div>
  );
}
