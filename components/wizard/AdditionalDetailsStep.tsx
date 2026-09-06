"use client";

import { Field } from "@/components/forms/Field";
import { VoiceTextarea } from "@/components/forms/VoiceTextarea";
import { extractNarrativeFields } from "@/lib/wizard-extract";
import { extractNarrativeDetailsWithAI } from "@/app/actions/ai-extract";
import { SpeakAllButton } from "./SpeakAllButton";
import type { SellerData } from "./sellerSteps";

interface NarrativeFields {
  repairDetails?: string;
  mortgageOrLiens?: string;
  reasonForSelling?: string;
}

export function AdditionalDetailsStep({
  data,
  update,
}: {
  data: SellerData;
  update: <K extends keyof SellerData>(key: K, value: SellerData[K]) => void;
}) {
  function append(existing: string, addition: string): string {
    return existing ? `${existing} ${addition}` : addition;
  }

  function applyFields(fields: NarrativeFields) {
    if (fields.repairDetails) {
      update("repairDetails", append(data.repairDetails, fields.repairDetails));
    }
    if (fields.mortgageOrLiens) {
      update("mortgageOrLiens", append(data.mortgageOrLiens, fields.mortgageOrLiens));
    }
    if (fields.reasonForSelling) {
      update("reasonForSelling", append(data.reasonForSelling, fields.reasonForSelling));
    }
  }

  async function handleTranscript(transcript: string) {
    applyFields(extractNarrativeFields(transcript));
    const ai = await extractNarrativeDetailsWithAI(transcript);
    if (ai) applyFields(ai);
  }

  return (
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
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="mb-3 text-sm text-slate-700">
              Speak all three at once and we&apos;ll sort them into the right box below.
            </p>
            <SpeakAllButton
              label="Speak repairs, mortgage & reason"
              onTranscript={handleTranscript}
            />
          </div>

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
  );
}
