"use client";

import { ChoiceGroup } from "@/components/forms/ChoiceGroup";
import { Field } from "@/components/forms/Field";
import { extractChoiceFields, type FieldMatcher } from "@/lib/wizard-extract";
import { extractPropertyDetailsWithAI } from "@/app/actions/ai-extract";
import { PROPERTY_TYPES, OCCUPANCY, CONDITION, TIMELINE, NEXT_STEP } from "@/lib/seller-options";
import { SpeakAllButton } from "./SpeakAllButton";
import type { SellerData } from "./sellerSteps";

type PropertyDetailsField = "propertyType" | "occupancy" | "condition" | "timeline" | "nextStep";

const MATCHERS: FieldMatcher<PropertyDetailsField>[] = [
  { field: "propertyType", options: PROPERTY_TYPES },
  { field: "occupancy", options: OCCUPANCY },
  { field: "condition", options: CONDITION },
  { field: "timeline", options: TIMELINE },
  { field: "nextStep", options: NEXT_STEP },
];

export function PropertyDetailsStep({
  data,
  update,
}: {
  data: SellerData;
  update: <K extends keyof SellerData>(key: K, value: SellerData[K]) => void;
}) {
  function applyFields(fields: Partial<Record<PropertyDetailsField, string>>) {
    if (fields.propertyType) update("propertyType", fields.propertyType);
    if (fields.occupancy) update("occupancy", fields.occupancy);
    if (fields.condition) update("condition", fields.condition);
    if (fields.timeline) update("timeline", fields.timeline);
    if (fields.nextStep) update("nextStep", fields.nextStep);
  }

  async function handleTranscript(transcript: string) {
    // Rule-based match applies instantly; the AI pass (when configured)
    // follows and overwrites with a more accurate read of the same words.
    applyFields(extractChoiceFields(transcript, MATCHERS));
    const ai = await extractPropertyDetailsWithAI(transcript);
    if (ai) applyFields(ai);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <p className="mb-3 text-sm text-slate-700">
          Describe the property in your own words and we&apos;ll fill in what we can below —
          for example, &quot;it&apos;s a vacant multifamily that needs major repairs, and
          I&apos;d like to sell ASAP for a cash offer.&quot;
        </p>
        <SpeakAllButton label="Speak your answers" onTranscript={handleTranscript} />
      </div>

      <Field label="Property type" required>
        <ChoiceGroup
          options={PROPERTY_TYPES}
          value={data.propertyType ? [data.propertyType] : []}
          onChange={(v) => update("propertyType", v[0] ?? "")}
        />
      </Field>
      <Field label="Occupancy" required>
        <ChoiceGroup
          options={OCCUPANCY}
          value={data.occupancy ? [data.occupancy] : []}
          onChange={(v) => update("occupancy", v[0] ?? "")}
        />
      </Field>
      <Field label="Condition" required>
        <ChoiceGroup
          options={CONDITION}
          value={data.condition ? [data.condition] : []}
          onChange={(v) => update("condition", v[0] ?? "")}
        />
      </Field>
      <Field label="Timeline to sell" required>
        <ChoiceGroup
          options={TIMELINE}
          value={data.timeline ? [data.timeline] : []}
          onChange={(v) => update("timeline", v[0] ?? "")}
        />
      </Field>
      <Field label="Preferred next step" required>
        <ChoiceGroup
          options={NEXT_STEP}
          value={data.nextStep ? [data.nextStep] : []}
          onChange={(v) => update("nextStep", v[0] ?? "")}
        />
      </Field>
    </div>
  );
}
