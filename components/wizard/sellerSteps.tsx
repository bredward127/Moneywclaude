import { Field } from "@/components/forms/Field";
import { ChoiceGroup } from "@/components/forms/ChoiceGroup";
import { inputClass } from "@/components/forms/styles";
import { PhotoUploadStep } from "@/components/photos/PhotoUploadStep";
import type { SellerLead } from "@/lib/types";
import {
  PROPERTY_TYPES,
  OCCUPANCY,
  CONDITION,
  TIMELINE,
  NEXT_STEP,
  CONTACT_METHODS,
} from "@/lib/seller-options";
import type { ReviewSection, WizardStep } from "./types";
import { labelFor } from "./stepHelpers";
import { PropertyDetailsStep } from "./PropertyDetailsStep";
import { AdditionalDetailsStep } from "./AdditionalDetailsStep";

export type SellerData = Omit<SellerLead, "type">;

export type PhotoChoice = "now" | "later" | null;

export interface PhotoStepState {
  leadId: string | null;
  choice: PhotoChoice;
  photoCount: number;
}

export const INITIAL_PHOTO_STATE: PhotoStepState = {
  leadId: null,
  choice: null,
  photoCount: 0,
};

export const INITIAL_SELLER_DATA: SellerData = {
  addressOrCityZip: "",
  propertyType: "",
  occupancy: "",
  condition: "",
  timeline: "",
  nextStep: "",
  preferPrivateDiscussion: false,
  repairDetails: "",
  mortgageOrLiens: "",
  reasonForSelling: "",
  consent: false,
  marketingOptIn: false,
  contact: { fullName: "", email: "", phone: "", preferredContact: "" },
};

export function buildSellerSteps({
  data,
  update,
  photoState,
  onPhotoLeadCreated,
  onPhotoChoiceChange,
  onPhotoCountChange,
}: {
  data: SellerData;
  update: <K extends keyof SellerData>(key: K, value: SellerData[K]) => void;
  photoState: PhotoStepState;
  onPhotoLeadCreated: (leadId: string) => void;
  onPhotoChoiceChange: (choice: "now" | "later") => void;
  onPhotoCountChange: (count: number) => void;
}): WizardStep[] {
  return [
    {
      id: "address",
      title: "What's the property address?",
      subtitle: "A full address is great — city and ZIP works too.",
      voicePrompt: "What's the property address? A full address is great, or just the city and ZIP.",
      voicePlaceholder: 'Try saying: "123 Main Street, Springfield" or "Springfield, 62704"',
      allowVoiceInput: true,
      applyTranscript: (t) => update("addressOrCityZip", t),
      canProceed: data.addressOrCityZip.trim() !== "",
      content: (
        <Field label="Property address or city & ZIP" htmlFor="addressOrCityZip" required>
          <input
            id="addressOrCityZip"
            className={inputClass}
            value={data.addressOrCityZip}
            onChange={(e) => update("addressOrCityZip", e.target.value)}
            placeholder="123 Main St, Springfield, IL 62704"
          />
        </Field>
      ),
    },
    {
      id: "property-details",
      title: "Tell us about the property",
      subtitle: "Speak it all at once, or tap through each answer below.",
      voicePrompt:
        "Tell us about the property. You can describe it in your own words, or answer each question by tapping.",
      allowVoiceInput: false,
      canProceed:
        data.propertyType !== "" &&
        data.occupancy !== "" &&
        data.condition !== "" &&
        data.timeline !== "" &&
        data.nextStep !== "",
      content: <PropertyDetailsStep data={data} update={update} />,
    },
    {
      id: "additional-details",
      title: "A few optional details",
      subtitle: "Totally optional — skip anything you'd rather discuss directly.",
      voicePrompt:
        "A few optional details about repairs, mortgage or liens, and your reason for selling — speak them all at once, type them, or skip this and discuss them privately.",
      allowVoiceInput: false,
      canProceed: true,
      content: <AdditionalDetailsStep data={data} update={update} />,
    },
    {
      id: "contact",
      title: "How should we reach you?",
      voicePrompt: "Last step — how should we reach you?",
      allowVoiceInput: false,
      canProceed:
        data.contact.fullName.trim() !== "" &&
        (data.contact.email.trim() !== "" || data.contact.phone.trim() !== ""),
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName" required>
              <input
                id="fullName"
                className={inputClass}
                value={data.contact.fullName}
                onChange={(e) => update("contact", { ...data.contact, fullName: e.target.value })}
              />
            </Field>
            <Field label="Phone" htmlFor="phone" hint="Provide phone, email, or both.">
              <input
                id="phone"
                type="tel"
                className={inputClass}
                value={data.contact.phone}
                onChange={(e) => update("contact", { ...data.contact, phone: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              className={inputClass}
              value={data.contact.email}
              onChange={(e) => update("contact", { ...data.contact, email: e.target.value })}
            />
          </Field>
          <Field label="Preferred contact method">
            <ChoiceGroup
              options={CONTACT_METHODS}
              value={data.contact.preferredContact ? [data.contact.preferredContact] : []}
              onChange={(v) => update("contact", { ...data.contact, preferredContact: v[0] ?? "" })}
            />
          </Field>
        </div>
      ),
    },
    {
      id: "photos",
      title: "Add photos of your property",
      subtitle: "Optional — add a few now, or get a secure link to add them whenever works for you.",
      voicePrompt:
        "Would you like to add property photos now, or get a secure link to add them later? This step is optional.",
      allowVoiceInput: false,
      canProceed: true,
      content: (
        <PhotoUploadStep
          leadId={photoState.leadId}
          choice={photoState.choice}
          sellerData={data}
          onLeadCreated={onPhotoLeadCreated}
          onChoiceChange={onPhotoChoiceChange}
          onPhotoCountChange={onPhotoCountChange}
        />
      ),
    },
  ];
}

export function buildSellerReviewSections(
  data: SellerData,
  photoState: PhotoStepState
): ReviewSection[] {
  const photoSummary =
    photoState.choice === "now"
      ? `${photoState.photoCount} photo${photoState.photoCount === 1 ? "" : "s"} added`
      : photoState.choice === "later"
        ? "Secure upload link sent"
        : "Not added yet";

  return [
    {
      title: "Property",
      items: [
        { label: "Address", value: data.addressOrCityZip || "—", stepIndex: 0 },
        {
          label: "Property type",
          value: labelFor(PROPERTY_TYPES, data.propertyType) || "—",
          stepIndex: 1,
        },
        { label: "Occupancy", value: labelFor(OCCUPANCY, data.occupancy) || "—", stepIndex: 1 },
        { label: "Condition", value: labelFor(CONDITION, data.condition) || "—", stepIndex: 1 },
      ],
    },
    {
      title: "Selling plans",
      items: [
        { label: "Timeline", value: labelFor(TIMELINE, data.timeline) || "—", stepIndex: 1 },
        {
          label: "Preferred next step",
          value: labelFor(NEXT_STEP, data.nextStep) || "—",
          stepIndex: 1,
        },
      ],
    },
    {
      title: "Additional details",
      items: data.preferPrivateDiscussion
        ? [{ label: "Details", value: "Prefers to discuss privately", stepIndex: 2 }]
        : [
            { label: "Repairs", value: data.repairDetails || "Not provided", stepIndex: 2 },
            { label: "Mortgage / liens", value: data.mortgageOrLiens || "Not provided", stepIndex: 2 },
            {
              label: "Reason for selling",
              value: data.reasonForSelling || "Not provided",
              stepIndex: 2,
            },
          ],
    },
    {
      title: "Contact",
      items: [
        { label: "Name", value: data.contact.fullName || "—", stepIndex: 3 },
        { label: "Phone", value: data.contact.phone || "Not provided", stepIndex: 3 },
        { label: "Email", value: data.contact.email || "Not provided", stepIndex: 3 },
        {
          label: "Preferred contact",
          value: labelFor(CONTACT_METHODS, data.contact.preferredContact) || "No preference",
          stepIndex: 3,
        },
      ],
    },
    {
      title: "Photos",
      items: [{ label: "Property photos", value: photoSummary, stepIndex: 4 }],
    },
  ];
}
