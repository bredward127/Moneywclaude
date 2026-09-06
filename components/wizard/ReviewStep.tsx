"use client";

import { AlertCircle } from "lucide-react";
import { DataConsentSection } from "@/components/forms/DataConsentSection";
import { Button } from "@/components/ui/Button";
import type { ReviewSection } from "./types";

export function ReviewStep({
  sections,
  onEdit,
  consent,
  onConsentChange,
  consentLabel,
  marketingOptIn,
  onMarketingOptInChange,
  status,
  onSubmit,
}: {
  sections: ReviewSection[];
  onEdit: (stepIndex: number) => void;
  consent: boolean;
  onConsentChange: (checked: boolean) => void;
  consentLabel: string;
  marketingOptIn: boolean;
  onMarketingOptInChange: (checked: boolean) => void;
  status: "idle" | "submitting" | "error";
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {section.title}
          </h3>
          <dl className="mt-3 divide-y divide-slate-100">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 py-3 first:pt-0"
              >
                <div>
                  <dt className="text-sm text-slate-500">{item.label}</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{item.value}</dd>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(item.stepIndex)}
                  className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              </div>
            ))}
          </dl>
        </div>
      ))}

      <DataConsentSection
        checked={consent}
        onChange={onConsentChange}
        consentLabel={consentLabel}
        marketingOptIn={marketingOptIn}
        onMarketingOptInChange={onMarketingOptInChange}
      />

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Something went wrong sending your information. Please try again.
        </div>
      )}

      <Button
        type="button"
        onClick={onSubmit}
        isLoading={status === "submitting"}
        disabled={!consent}
        fullWidth
        size="lg"
      >
        Submit
      </Button>
    </div>
  );
}
