import { z } from "zod";

const requiredText = z.string();

export const contactInfoSchema = z
  .object({
    fullName: requiredText.trim().min(1, "Full name is required."),
    email: requiredText.trim(),
    phone: requiredText.trim(),
    preferredContact: requiredText,
  })
  .refine((contact) => contact.email !== "" || contact.phone !== "", {
    message: "Provide an email or phone number.",
    path: ["email"],
  })
  .refine((contact) => contact.email === "" || z.string().email().safeParse(contact.email).success, {
    message: "Enter a valid email address.",
    path: ["email"],
  });

const requiredConsent = z
  .boolean()
  .refine((value) => value === true, "Consent to be contacted is required.");

export const sellerIntakeSchema = z.object({
  type: z.literal("seller"),
  leadId: z.string().uuid().optional(),
  addressOrCityZip: requiredText.trim().min(1, "Property address or city/ZIP is required."),
  propertyType: requiredText,
  occupancy: requiredText,
  condition: requiredText,
  timeline: requiredText,
  nextStep: requiredText,
  preferPrivateDiscussion: z.boolean(),
  repairDetails: requiredText,
  mortgageOrLiens: requiredText,
  reasonForSelling: requiredText,
  consent: requiredConsent,
  marketingOptIn: z.boolean().default(false),
  contact: contactInfoSchema,
});

export const buyerIntakeSchema = z.object({
  type: z.literal("buyer"),
  goal: requiredText,
  targetLocation: requiredText.trim().min(1, "Target location is required."),
  propertyTypes: z.array(z.string()),
  bedrooms: requiredText,
  bathrooms: requiredText,
  minSquareFootage: requiredText,
  budgetMin: requiredText,
  budgetMax: requiredText,
  purchaseTimeline: requiredText,
  fundingPath: requiredText,
  investorStrategy: requiredText,
  propertyAlertOptIn: z.boolean(),
  consent: requiredConsent,
  marketingOptIn: z.boolean().default(false),
  contact: contactInfoSchema,
});

export const contactPreferencesSchema = z
  .object({
    type: z.literal("contact-preferences"),
    fullName: requiredText,
    email: requiredText.trim(),
    phone: requiredText.trim(),
    preferredMethods: z.array(z.string()),
    bestTime: requiredText,
    optOut: z.boolean(),
  })
  .refine((value) => value.email !== "" || value.phone !== "", {
    message: "An email or phone number is required.",
    path: ["email"],
  });

export const intakeSubmissionSchema = z.discriminatedUnion("type", [
  sellerIntakeSchema,
  buyerIntakeSchema,
  contactPreferencesSchema,
]);

export type SellerIntakeInput = z.infer<typeof sellerIntakeSchema>;
export type BuyerIntakeInput = z.infer<typeof buyerIntakeSchema>;
export type ContactPreferencesInput = z.infer<typeof contactPreferencesSchema>;
export type IntakeSubmissionInput = z.infer<typeof intakeSubmissionSchema>;

export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid submission.";
}
