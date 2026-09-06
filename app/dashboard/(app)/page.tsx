import { listOrgLeads } from "@/app/actions/staff-leads";
import { LeadInbox } from "@/components/dashboard/LeadInbox";

export const metadata = { title: "Lead Inbox | Dashboard" };

export default async function DashboardHomePage() {
  const leads = await listOrgLeads();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lead Inbox</h1>
        <p className="mt-1 text-sm text-slate-600">
          Every seller and buyer submission for your organization.
        </p>
      </div>
      <LeadInbox leads={leads} />
    </div>
  );
}
