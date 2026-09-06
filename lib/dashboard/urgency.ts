import type { OrgLead } from "@/app/actions/staff-leads";

export type Urgency = "high" | "medium" | "low";

const TIMELINE_URGENCY: Record<string, Urgency> = {
  asap: "high",
  "30-days": "medium",
  "60-90-days": "low",
  exploring: "low",
};

export function getLeadUrgency(lead: OrgLead): Urgency {
  const timeline =
    lead.type === "seller"
      ? (lead.propertyDetails.timeline as string | undefined)
      : (lead.buyerCriteria.purchaseTimeline as string | undefined);
  return TIMELINE_URGENCY[timeline ?? ""] ?? "low";
}

export const URGENCY_LABELS: Record<Urgency, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};
