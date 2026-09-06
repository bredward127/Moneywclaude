import type { OrgLead } from "@/app/actions/staff-leads";
import type { ContractPacket } from "@/app/actions/contract-packets";

export const WHOLESALE_STAGES = [
  "Reviewing",
  "Offer Discussed",
  "Contract Prepared",
  "Out for E-Sign",
  "Signed / Under Contract",
] as const;

/** Seller leads that requested a cash offer / wholesale conversation. */
export function isWholesaleCandidate(lead: OrgLead): boolean {
  return lead.type === "seller" && lead.propertyDetails.nextStep === "cash-offer";
}

/**
 * Derives one unified 5-stage position from two sources: the lead's own
 * status (Reviewing / Offer Discussed happen before any paperwork exists)
 * and its contract packet's status (Contract Prepared onward). There's no
 * separate "wholesale stage" column -- this reconciles the two schemas the
 * request's tracker actually spans.
 */
export function getWholesaleStageIndex(leadStatus: string, packet: ContractPacket | null): number {
  if (!packet || packet.status === "draft") {
    return leadStatus === "offer_discussed" ? 1 : 0;
  }
  if (packet.status === "prepared") return 2;
  if (packet.status === "sent") return 3;
  return 4; // signed or under_contract
}
