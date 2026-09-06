import type { StaffProfile } from "./auth";

export type EditableCategory = "property" | "financial" | "contact";

/** Owner/agency-admin always have full edit rights -- otherwise it's whatever the caller's own dial says. */
export function canEditCategory(profile: StaffProfile, category: EditableCategory): boolean {
  if (profile.isPlatformOwner || profile.isAgencyAdmin) return true;
  if (category === "property") return profile.canEditProperty;
  if (category === "financial") return profile.canEditFinancial;
  return profile.canEditContact;
}
