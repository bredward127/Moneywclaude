import { redirect } from "next/navigation";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";
import { listAgencies } from "@/app/actions/agencies";
import { AgencyListPanel } from "@/components/dashboard/AgencyListPanel";

export const metadata = { title: "Agencies | Dashboard" };

export default async function AgenciesPage() {
  const profile = await getCurrentStaffProfile();
  if (!profile) redirect("/dashboard/login");
  if (!profile.isPlatformOwner) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Only the platform owner can manage agencies.
      </div>
    );
  }

  const agencies = await listAgencies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agencies</h1>
        <p className="mt-1 text-sm text-slate-600">Create and manage every agency on the platform.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <AgencyListPanel agencies={agencies} />
      </div>
    </div>
  );
}
