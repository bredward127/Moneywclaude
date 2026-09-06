"use client";

import { Mic } from "lucide-react";
import { humanizeKey, humanizeValue } from "@/lib/dashboard/humanize";
import { splitByCategory } from "@/lib/dashboard/field-categories";
import { updateLeadPropertyField, updateLeadFinancialField } from "@/app/actions/lead-fields";
import { EditableField } from "./EditableField";

export function StructuredAnswers({
  leadId,
  leadType,
  answers,
  transcriptRaw,
  canEditProperty,
  canEditFinancial,
}: {
  leadId: string;
  leadType: "seller" | "buyer";
  answers: Record<string, unknown>;
  transcriptRaw: string | null;
  canEditProperty: boolean;
  canEditFinancial: boolean;
}) {
  const { property, financial } = splitByCategory(leadType, answers);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          <Mic className="h-3.5 w-3.5" aria-hidden="true" />
          Audio transcript
        </h3>
        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {transcriptRaw || "No transcript recorded for this submission."}
        </p>
      </div>

      <div>
        <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Property details</h3>
        <dl className="mt-2 divide-y divide-slate-100">
          {property.map(([key, value]) => (
            <EditableField
              key={key}
              label={humanizeKey(key)}
              value={humanizeValue(value)}
              editable={canEditProperty}
              onSave={(newValue) => updateLeadPropertyField(leadId, key, newValue)}
            />
          ))}
        </dl>
      </div>

      {financial.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Financial details</h3>
          <dl className="mt-2 divide-y divide-slate-100">
            {financial.map(([key, value]) => (
              <EditableField
                key={key}
                label={humanizeKey(key)}
                value={humanizeValue(value)}
                editable={canEditFinancial}
                onSave={(newValue) => updateLeadFinancialField(leadId, key, newValue)}
              />
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
