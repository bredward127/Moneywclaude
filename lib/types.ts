export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  preferredContact: string;
}

export interface SellerLead {
  type: "seller";
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  timeline: string;
  condition: string;
  estimatedValue: string;
  notes: string;
  contact: ContactInfo;
}

export interface BuyerLead {
  type: "buyer";
  propertyTypes: string[];
  areas: string;
  bedrooms: string;
  budgetMin: string;
  budgetMax: string;
  financing: string;
  timeline: string;
  isInvestor: boolean;
  investorNotes: string;
  notes: string;
  contact: ContactInfo;
}

export interface ContactPreferencesSubmission {
  type: "contact-preferences";
  fullName: string;
  email: string;
  phone: string;
  preferredMethods: string[];
  bestTime: string;
  optOut: boolean;
}

export type IntakeSubmission = SellerLead | BuyerLead | ContactPreferencesSubmission;
