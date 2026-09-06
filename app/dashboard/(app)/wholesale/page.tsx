import { listOrgLeads } from "@/app/actions/staff-leads";
import { listContractPacketsForLead } from "@/app/actions/contract-packets";
import { isWholesaleCandidate } from "@/lib/dashboard/wholesale";
import { ContractPacketPanel } from "@/components/dashboard/ContractPacketPanel";

export const metadata = { title: "Wholesale & Contracts | Dashboard" };

export default async function WholesalePage() {
  const leads = await listOrgLeads();
  const candidates = leads.filter(isWholesaleCandidate);

  const packets = await Promise.all(
    candidates.map(async (lead) => {
      const leadPackets = await listContractPacketsForLead(lead.id);
      return leadPackets[0] ?? null;
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Wholesale & Contract Packet Manager</h1>
        <p className="mt-1 text-sm text-slate-600">
          Seller leads that requested a cash offer / wholesale conversation. This panel only
          tracks status and stores documents staff upload -- it never drafts, sends, or executes
          a legal contract.
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No leads are currently marked for a cash offer / wholesale conversation.
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((lead, index) => (
            <ContractPacketPanel key={lead.id} lead={lead} packet={packets[index]} />
          ))}
        </div>
      )}
    </div>
  );
}
