import type { OrgLead } from "@/app/actions/staff-leads";

export function isMotivatedSeller(lead: OrgLead): boolean {
  return lead.type === "seller" && lead.propertyDetails.timeline === "asap";
}

export function isCashReadyBuyer(lead: OrgLead): boolean {
  return lead.type === "buyer" && lead.buyerCriteria.fundingPath === "cash-ready";
}
