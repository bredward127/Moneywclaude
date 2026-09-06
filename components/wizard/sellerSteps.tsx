import { Field } from "@/components/forms/Field";
import { ChoiceGroup, type ChoiceOption } from "@/components/forms/ChoiceGroup";
import { VoiceTextarea } from "@/components/forms/VoiceTextarea";
import { inputClass } from "@/components/forms/styles";
import { PhotoUploadStep } from "@/components/photos/PhotoUploadStep";
import type { SellerLead } from "@/lib/types";
import type { ReviewSection, WizardStep } from "./types";
import { choiceStep, labelFor } from "./stepHelpers";

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

const PROPERTY_TYPES: ChoiceOption[] = [
  { value: "single-family", label: "Single Family" },
  { value: "multifamily", label: "Multifamily" },
  { value: "condo", label: "Condo" },
  { value: "townhome", label: "Townhome" },
  { value: "land", label: "Land" },
  { value: "other", label: "Other" },
];

const OCCUPANCY: ChoiceOption[] = [
  { value: "owner-occupied", label: "Owner-Occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "tenant-occupied", label: "Tenant-Occupied" },
  { value: "inherited", label: "Inherited" },
];

const CONDITION: ChoiceOption[] = [
  { value: "move-in-ready", label: "Move-in Ready" },
  { value: "cosmetic-updates", label: "Cosmetic Updates Needed" },
  { value: "major-repairs", label: "Major Repairs Needed" },
];

const TIMELINE: ChoiceOption[] = [
  { value: "asap", label: "ASAP" },
  { value: "30-days", label: "30 Days" },
  { value: "60-90-days", label: "60-90 Days" },
  { value: "exploring", label: "Exploring Options" },
];

const NEXT_STEP: ChoiceOption[] = [
  { value: "cash-offer", label: "Cash Offer Conversation" },
  { value: "listing-consultation", label: "Listing Consultation" },
  { value: "valuation", label: "General Valuation" },
  { value: "callback", label: "Callback" },
];

const CONTACT_METHODS: ChoiceOption[] = [
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
];

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
    choiceStep({
      id: "property-type",
      title: "What type of property is it?",
      voicePrompt:
        "What type of property is it? Single Family, Multifamily, Condo, Townhome, Land, or Other.",
      voicePlaceholder: 'Try saying: "single family" or "condo"',
      options: PROPERTY_TYPES,
      value: data.propertyType,
      onChange: (v) => update("propertyType", v),
    }),
    choiceStep({
      id: "occupancy",
      title: "Is the property currently occupied?",
      voicePrompt: "Is the property owner-occupied, vacant, tenant-occupied, or inherited?",
      voicePlaceholder: 'Try saying: "vacant" or "tenant occupied"',
      options: OCCUPANCY,
      value: data.occupancy,
      onChange: (v) => update("occupancy", v),
    }),
    choiceStep({
      id: "condition",
      title: "What condition is the property in?",
      voicePrompt:
        "Is it move-in ready, does it need cosmetic updates, or does it need major repairs?",
      voicePlaceholder: 'Try saying: "needs major repairs"',
      options: CONDITION,
      value: data.condition,
      onChange: (v) => update("condition", v),
    }),
    choiceStep({
      id: "timeline",
      title: "How soon are you looking to sell?",
      voicePrompt:
        "How soon are you looking to sell? ASAP, 30 days, 60 to 90 days, or are you just exploring options?",
      voicePlaceholder: 'Try saying: "as soon as possible"',
      options: TIMELINE,
      value: data.timeline,
      onChange: (v) => update("timeline", v),
    }),
    choiceStep({
      id: "next-step",
      title: "What would you like to happen next?",
      voicePrompt:
        "What would you like to happen next? A cash offer conversation, a listing consultation, a general valuation, or a callback?",
      voicePlaceholder: 'Try saying: "cash offer"',
      options: NEXT_STEP,
      value: data.nextStep,
      onChange: (v) => update("nextStep", v),
    }),
    {
      id: "sensitive-details",
      title: "A few optional details",
      subtitle: "Totally optional — skip anything you'd rather discuss directly.",
      voicePrompt:
        "A few optional details about repairs, mortgage or liens, and your reason for selling — or you can skip these and discuss them privately.",
      allowVoiceInput: false,
      canProceed: true,
      content: (
        <div className="space-y-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-300">
            <input
              type="checkbox"
              checked={data.preferPrivateDiscussion}
              onChange={(e) => update("preferPrivateDiscussion", e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">
              I&apos;d prefer to discuss these details privately instead of typing them here.
            </span>
          </label>

          {!data.preferPrivateDiscussion && (
            <>
              <Field label="Repair details" htmlFor="repairDetails" hint="Optional">
                <VoiceTextarea
                  id="repairDetails"
                  value={data.repairDetails}
                  onChange={(v) => update("repairDetails", v)}
                  placeholder="Roof, HVAC, foundation, anything notable…"
                  rows={2}
                />
              </Field>
              <Field label="Estimated mortgage or liens" htmlFor="mortgageOrLiens" hint="Optional">
                <VoiceTextarea
                  id="mortgageOrLiens"
                  value={data.mortgageOrLiens}
                  onChange={(v) => update("mortgageOrLiens", v)}
                  placeholder="Remaining balance, second mortgage, tax liens…"
                  rows={2}
                />
              </Field>
              <Field label="Reason for selling" htmlFor="reasonForSelling" hint="Optional">
                <VoiceTextarea
                  id="reasonForSelling"
                  value={data.reasonForSelling}
                  onChange={(v) => update("reasonForSelling", v)}
                  placeholder="Relocating, downsizing, financial, inherited property…"
                  rows={2}
                />
              </Field>
            </>
          )}
        </div>
      ),
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
        { label: "Occupancy", value: labelFor(OCCUPANCY, data.occupancy) || "—", stepIndex: 2 },
        { label: "Condition", value: labelFor(CONDITION, data.condition) || "—", stepIndex: 3 },
      ],
    },
    {
      title: "Selling plans",
      items: [
        { label: "Timeline", value: labelFor(TIMELINE, data.timeline) || "—", stepIndex: 4 },
        {
          label: "Preferred next step",
          value: labelFor(NEXT_STEP, data.nextStep) || "—",
          stepIndex: 5,
        },
      ],
    },
    {
      title: "Additional details",
      items: data.preferPrivateDiscussion
        ? [{ label: "Details", value: "Prefers to discuss privately", stepIndex: 6 }]
        : [
            { label: "Repairs", value: data.repairDetails || "Not provided", stepIndex: 6 },
            { label: "Mortgage / liens", value: data.mortgageOrLiens || "Not provided", stepIndex: 6 },
            {
              label: "Reason for selling",
              value: data.reasonForSelling || "Not provided",
              stepIndex: 6,
            },
          ],
    },
    {
      title: "Contact",
      items: [
        { label: "Name", value: data.contact.fullName || "—", stepIndex: 7 },
        { label: "Phone", value: data.contact.phone || "Not provided", stepIndex: 7 },
        { label: "Email", value: data.contact.email || "Not provided", stepIndex: 7 },
        {
          label: "Preferred contact",
          value: labelFor(CONTACT_METHODS, data.contact.preferredContact) || "No preference",
          stepIndex: 7,
        },
      ],
    },
    {
      title: "Photos",
      items: [{ label: "Property photos", value: photoSummary, stepIndex: 8 }],
    },
  ];
}
