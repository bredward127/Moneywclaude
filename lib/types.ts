export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  preferredContact: string;
}

export interface SellerLead {
  type: "seller";
  addressOrCityZip: string;
  propertyType: string;
  occupancy: string;
  condition: string;
  timeline: string;
  nextStep: string;
  preferPrivateDiscussion: boolean;
  repairDetails: string;
  mortgageOrLiens: string;
  reasonForSelling: string;
  consent: boolean;
  marketingOptIn: boolean;
  contact: ContactInfo;
}

export interface BuyerLead {
  type: "buyer";
  goal: string;
  targetLocation: string;
  propertyTypes: string[];
  bedrooms: string;
  bathrooms: string;
  minSquareFootage: string;
  budgetMin: string;
  budgetMax: string;
  purchaseTimeline: string;
  fundingPath: string;
  investorStrategy: string;
  propertyAlertOptIn: boolean;
  consent: boolean;
  marketingOptIn: boolean;
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
