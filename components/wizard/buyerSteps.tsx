import { Field } from "@/components/forms/Field";
import { ChoiceGroup, type ChoiceOption } from "@/components/forms/ChoiceGroup";
import { inputClass } from "@/components/forms/styles";
import type { BuyerLead } from "@/lib/types";
import { matchChoice, matchChoices } from "@/lib/wizard-match";
import type { ReviewSection, WizardStep } from "./types";
import { choiceStep, labelFor } from "./stepHelpers";

export type BuyerData = Omit<BuyerLead, "type">;

export const INITIAL_BUYER_DATA: BuyerData = {
  goal: "",
  targetLocation: "",
  propertyTypes: [],
  bedrooms: "",
  bathrooms: "",
  minSquareFootage: "",
  budgetMin: "",
  budgetMax: "",
  purchaseTimeline: "",
  fundingPath: "",
  investorStrategy: "",
  propertyAlertOptIn: false,
  consent: false,
  contact: { fullName: "", email: "", phone: "", preferredContact: "" },
};

const GOALS: ChoiceOption[] = [
  { value: "primary-residence", label: "Primary Residence" },
  { value: "second-home", label: "Second Home" },
  { value: "investment", label: "Investment Property" },
];

const PROPERTY_TYPES: ChoiceOption[] = [
  { value: "single-family", label: "Single Family" },
  { value: "multifamily", label: "Multifamily" },
  { value: "condo", label: "Condo" },
  { value: "townhome", label: "Townhome" },
  { value: "land", label: "Land" },
  { value: "other", label: "Other" },
];

const BEDROOMS: ChoiceOption[] = [
  { value: "any", label: "Any" },
  { value: "1+", label: "1+" },
  { value: "2+", label: "2+" },
  { value: "3+", label: "3+" },
  { value: "4+", label: "4+" },
  { value: "5+", label: "5+" },
];

const BATHROOMS: ChoiceOption[] = [
  { value: "any", label: "Any" },
  { value: "1+", label: "1+" },
  { value: "2+", label: "2+" },
  { value: "3+", label: "3+" },
];

const PURCHASE_TIMELINE: ChoiceOption[] = [
  { value: "asap", label: "ASAP" },
  { value: "30-days", label: "30 Days" },
  { value: "60-90-days", label: "60-90 Days" },
  { value: "exploring", label: "Exploring Options" },
];

const FUNDING_PATH: ChoiceOption[] = [
  { value: "cash-ready", label: "Cash Ready" },
  { value: "pre-approved", label: "Pre-Approved Mortgage" },
  { value: "seeking-financing", label: "Seeking Financing" },
  { value: "exploring", label: "Exploring" },
];

const INVESTOR_STRATEGY: ChoiceOption[] = [
  { value: "rental", label: "Rental" },
  { value: "flip", label: "Flip" },
  { value: "house-hack", label: "House Hack" },
  { value: "wholesale", label: "Wholesale" },
];

const CONTACT_METHODS: ChoiceOption[] = [
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
];

export function buildBuyerSteps({
  data,
  update,
}: {
  data: BuyerData;
  update: <K extends keyof BuyerData>(key: K, value: BuyerData[K]) => void;
}): WizardStep[] {
  const steps: WizardStep[] = [
    choiceStep({
      id: "goal",
      title: "What's your goal?",
      voicePrompt: "What's your goal? A primary residence, a second home, or an investment property?",
      voicePlaceholder: 'Try saying: "investment property"',
      options: GOALS,
      value: data.goal,
      onChange: (v) => update("goal", v),
    }),
    {
      id: "location",
      title: "Where are you looking?",
      subtitle: "Cities, neighborhoods, or ZIP codes.",
      voicePrompt: "Where are you looking? Cities, neighborhoods, or ZIP codes.",
      voicePlaceholder: 'Try saying: "Downtown, Maple Heights, or 90210"',
      allowVoiceInput: true,
      applyTranscript: (t) => update("targetLocation", t),
      canProceed: data.targetLocation.trim() !== "",
      content: (
        <Field label="Target location" htmlFor="targetLocation" required>
          <input
            id="targetLocation"
            className={inputClass}
            value={data.targetLocation}
            onChange={(e) => update("targetLocation", e.target.value)}
            placeholder="Downtown, Maple Heights, 90210"
          />
        </Field>
      ),
    },
    {
      id: "specs",
      title: "What kind of property, and how big?",
      voicePrompt: "What property types are you interested in? Single Family, Multifamily, Condo, Townhome, or Land.",
      voicePlaceholder: 'Try saying: "single family" — you can pick more than one',
      allowVoiceInput: true,
      applyTranscript: (t) => {
        const matches = matchChoices(t, PROPERTY_TYPES);
        if (matches.length > 0) {
          update("propertyTypes", Array.from(new Set([...data.propertyTypes, ...matches])));
        }
      },
      previewMatch: (t) => {
        const matches = matchChoices(t, PROPERTY_TYPES);
        return matches.length > 0
          ? matches.map((v) => labelFor(PROPERTY_TYPES, v)).join(", ")
          : null;
      },
      canProceed: data.propertyTypes.length > 0,
      content: (
        <div className="space-y-5">
          <Field label="Property type" required hint="Select all that apply.">
            <ChoiceGroup
              options={PROPERTY_TYPES}
              value={data.propertyTypes}
              onChange={(v) => update("propertyTypes", v)}
              multiple
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Minimum bedrooms">
              <ChoiceGroup
                options={BEDROOMS}
                value={data.bedrooms ? [data.bedrooms] : []}
                onChange={(v) => update("bedrooms", v[0] ?? "")}
              />
            </Field>
            <Field label="Minimum bathrooms">
              <ChoiceGroup
                options={BATHROOMS}
                value={data.bathrooms ? [data.bathrooms] : []}
                onChange={(v) => update("bathrooms", v[0] ?? "")}
              />
            </Field>
          </div>
          <Field label="Minimum square footage" htmlFor="minSquareFootage" hint="Optional">
            <input
              id="minSquareFootage"
              inputMode="numeric"
              className={inputClass}
              value={data.minSquareFootage}
              onChange={(e) => update("minSquareFootage", e.target.value)}
              placeholder="1,500"
            />
          </Field>
        </div>
      ),
    },
    {
      id: "budget",
      title: "What's your budget and timeline?",
      voicePrompt: "How soon are you looking to purchase? ASAP, 30 days, 60 to 90 days, or exploring options?",
      voicePlaceholder: 'Try saying: "as soon as possible"',
      allowVoiceInput: true,
      applyTranscript: (t) => {
        const match = matchChoice(t, PURCHASE_TIMELINE);
        if (match) update("purchaseTimeline", match);
      },
      previewMatch: (t) => {
        const match = matchChoice(t, PURCHASE_TIMELINE);
        return match ? labelFor(PURCHASE_TIMELINE, match) : null;
      },
      canProceed: data.purchaseTimeline !== "",
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Minimum budget" htmlFor="budgetMin" hint="Optional">
              <input
                id="budgetMin"
                inputMode="numeric"
                className={inputClass}
                value={data.budgetMin}
                onChange={(e) => update("budgetMin", e.target.value)}
                placeholder="$200,000"
              />
            </Field>
            <Field label="Maximum budget" htmlFor="budgetMax" hint="Optional">
              <input
                id="budgetMax"
                inputMode="numeric"
                className={inputClass}
                value={data.budgetMax}
                onChange={(e) => update("budgetMax", e.target.value)}
                placeholder="$400,000"
              />
            </Field>
          </div>
          <Field label="Purchase timeline" required>
            <ChoiceGroup
              options={PURCHASE_TIMELINE}
              value={data.purchaseTimeline ? [data.purchaseTimeline] : []}
              onChange={(v) => update("purchaseTimeline", v[0] ?? "")}
            />
          </Field>
        </div>
      ),
    },
    choiceStep({
      id: "funding",
      title: "How are you funding the purchase?",
      voicePrompt:
        "How are you funding the purchase? Cash ready, pre-approved mortgage, seeking financing, or exploring?",
      voicePlaceholder: 'Try saying: "pre-approved"',
      options: FUNDING_PATH,
      value: data.fundingPath,
      onChange: (v) => update("fundingPath", v),
    }),
  ];

  if (data.goal === "investment") {
    steps.push(
      choiceStep({
        id: "investor-strategy",
        title: "What's your investment strategy?",
        voicePrompt: "What's your investment strategy? Rental, flip, house hack, or wholesale?",
        voicePlaceholder: 'Try saying: "rental"',
        options: INVESTOR_STRATEGY,
        value: data.investorStrategy,
        onChange: (v) => update("investorStrategy", v),
      })
    );
  }

  steps.push({
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
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-300">
          <input
            type="checkbox"
            checked={data.propertyAlertOptIn}
            onChange={(e) => update("propertyAlertOptIn", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">
            Send me alerts when new properties match my criteria.
          </span>
        </label>
      </div>
    ),
  });

  return steps;
}

export function buildBuyerReviewSections(data: BuyerData): ReviewSection[] {
  const specsStepIndex = 2;
  const budgetStepIndex = 3;
  const fundingStepIndex = 4;
  const investorStepIndex = data.goal === "investment" ? 5 : -1;
  const contactStepIndex = data.goal === "investment" ? 6 : 5;

  const sections: ReviewSection[] = [
    {
      title: "What you're looking for",
      items: [
        { label: "Goal", value: labelFor(GOALS, data.goal) || "—", stepIndex: 0 },
        { label: "Location", value: data.targetLocation || "—", stepIndex: 1 },
        {
          label: "Property type",
          value:
            data.propertyTypes.map((v) => labelFor(PROPERTY_TYPES, v)).join(", ") || "—",
          stepIndex: specsStepIndex,
        },
        {
          label: "Bedrooms / Bathrooms",
          value: `${labelFor(BEDROOMS, data.bedrooms) || "Any"} bd / ${labelFor(BATHROOMS, data.bathrooms) || "Any"} ba`,
          stepIndex: specsStepIndex,
        },
        {
          label: "Min. square footage",
          value: data.minSquareFootage || "No minimum",
          stepIndex: specsStepIndex,
        },
      ],
    },
    {
      title: "Budget & timeline",
      items: [
        {
          label: "Budget range",
          value:
            data.budgetMin || data.budgetMax
              ? `${data.budgetMin || "—"} to ${data.budgetMax || "—"}`
              : "Not specified",
          stepIndex: budgetStepIndex,
        },
        {
          label: "Purchase timeline",
          value: labelFor(PURCHASE_TIMELINE, data.purchaseTimeline) || "—",
          stepIndex: budgetStepIndex,
        },
        {
          label: "Funding path",
          value: labelFor(FUNDING_PATH, data.fundingPath) || "—",
          stepIndex: fundingStepIndex,
        },
      ],
    },
  ];

  if (data.goal === "investment") {
    sections.push({
      title: "Investor strategy",
      items: [
        {
          label: "Strategy",
          value: labelFor(INVESTOR_STRATEGY, data.investorStrategy) || "—",
          stepIndex: investorStepIndex,
        },
      ],
    });
  }

  sections.push({
    title: "Contact",
    items: [
      { label: "Name", value: data.contact.fullName || "—", stepIndex: contactStepIndex },
      { label: "Phone", value: data.contact.phone || "Not provided", stepIndex: contactStepIndex },
      { label: "Email", value: data.contact.email || "Not provided", stepIndex: contactStepIndex },
      {
        label: "Preferred contact",
        value: labelFor(CONTACT_METHODS, data.contact.preferredContact) || "No preference",
        stepIndex: contactStepIndex,
      },
      {
        label: "Property alerts",
        value: data.propertyAlertOptIn ? "Opted in" : "Not opted in",
        stepIndex: contactStepIndex,
      },
    ],
  });

  return sections;
}
