// Which property_details/buyer_criteria JSON keys count as "financial" vs
// "property" for the per-agency-user edit dials. There's no separate
// financial column in the schema -- these fields are interleaved in the
// same JSONB blob as everything else -- so the split is done here in code,
// the same way lib/dashboard/urgency.ts/intent.ts already read specific
// known keys out of these same blobs. "Contact info" is a third category
// but always maps to the leads table's own contact_name/email/phone/
// contact_pref columns, never to anything in this file.

export type FieldCategory = "property" | "financial";

export const SELLER_FIELD_CATEGORIES: Record<string, FieldCategory> = {
  addressOrCityZip: "property",
  propertyType: "property",
  occupancy: "property",
  condition: "property",
  timeline: "property",
  nextStep: "property",
  preferPrivateDiscussion: "property",
  repairDetails: "property",
  mortgageOrLiens: "financial",
  reasonForSelling: "property",
};

export const BUYER_FIELD_CATEGORIES: Record<string, FieldCategory> = {
  goal: "property",
  targetLocation: "property",
  propertyTypes: "property",
  bedrooms: "property",
  bathrooms: "property",
  minSquareFootage: "property",
  budgetMin: "financial",
  budgetMax: "financial",
  purchaseTimeline: "property",
  fundingPath: "financial",
  investorStrategy: "financial",
  propertyAlertOptIn: "property",
};

export function categoryForField(leadType: "seller" | "buyer", key: string): FieldCategory | undefined {
  return (leadType === "seller" ? SELLER_FIELD_CATEGORIES : BUYER_FIELD_CATEGORIES)[key];
}

export function splitByCategory(
  leadType: "seller" | "buyer",
  answers: Record<string, unknown>
): { property: [string, unknown][]; financial: [string, unknown][] } {
  const property: [string, unknown][] = [];
  const financial: [string, unknown][] = [];

  for (const entry of Object.entries(answers)) {
    const [key] = entry;
    if (categoryForField(leadType, key) === "financial") {
      financial.push(entry);
    } else {
      property.push(entry);
    }
  }

  return { property, financial };
}
