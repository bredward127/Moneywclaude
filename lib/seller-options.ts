import type { ChoiceOption } from "@/components/forms/ChoiceGroup";

// Shared between the seller wizard steps (client-rendered ChoiceGroup
// options) and the AI extraction server action (which needs the same value
// enums to constrain what Claude is allowed to return) -- kept in one place
// so the two can never drift apart.

export const PROPERTY_TYPES: ChoiceOption[] = [
  { value: "single-family", label: "Single Family" },
  { value: "multifamily", label: "Multifamily" },
  { value: "condo", label: "Condo" },
  { value: "townhome", label: "Townhome" },
  { value: "land", label: "Land" },
  { value: "other", label: "Other" },
];

export const OCCUPANCY: ChoiceOption[] = [
  { value: "owner-occupied", label: "Owner-Occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "tenant-occupied", label: "Tenant-Occupied" },
  { value: "inherited", label: "Inherited" },
];

export const CONDITION: ChoiceOption[] = [
  { value: "move-in-ready", label: "Move-in Ready" },
  { value: "cosmetic-updates", label: "Cosmetic Updates Needed" },
  { value: "major-repairs", label: "Major Repairs Needed" },
];

export const TIMELINE: ChoiceOption[] = [
  { value: "asap", label: "ASAP" },
  { value: "30-days", label: "30 Days" },
  { value: "60-90-days", label: "60-90 Days" },
  { value: "exploring", label: "Exploring Options" },
];

export const NEXT_STEP: ChoiceOption[] = [
  { value: "cash-offer", label: "Cash Offer Conversation" },
  { value: "listing-consultation", label: "Listing Consultation" },
  { value: "valuation", label: "General Valuation" },
  { value: "callback", label: "Callback" },
];

export const CONTACT_METHODS: ChoiceOption[] = [
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
];
