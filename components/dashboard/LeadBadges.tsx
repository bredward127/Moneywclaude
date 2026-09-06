import { Flame, DollarSign, Eye } from "lucide-react";
import type { OrgLead } from "@/app/actions/staff-leads";
import { getLeadUrgency, URGENCY_LABELS, type Urgency } from "@/lib/dashboard/urgency";
import { isMotivatedSeller, isCashReadyBuyer } from "@/lib/dashboard/intent";

const URGENCY_CLASSES: Record<Urgency, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

export function UrgencyBadge({ lead }: { lead: OrgLead }) {
  const urgency = getLeadUrgency(lead);
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${URGENCY_CLASSES[urgency]}`}>
      {URGENCY_LABELS[urgency]} urgency
    </span>
  );
}

export function IntentBadge({ lead }: { lead: OrgLead }) {
  if (isMotivatedSeller(lead)) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
        <Flame className="h-3 w-3" aria-hidden="true" />
        Motivated seller
      </span>
    );
  }
  if (isCashReadyBuyer(lead)) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
        <DollarSign className="h-3 w-3" aria-hidden="true" />
        Cash ready
      </span>
    );
  }
  return null;
}

export function ReviewFlagBadge({ lead }: { lead: OrgLead }) {
  if (!lead.humanReviewFlag) return null;
  return (
    <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
      <Eye className="h-3 w-3" aria-hidden="true" />
      Needs review
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        type === "seller" ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"
      }`}
    >
      {type}
    </span>
  );
}
