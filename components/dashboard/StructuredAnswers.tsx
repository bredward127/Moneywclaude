import { Mic } from "lucide-react";
import { humanizeKey, humanizeValue } from "@/lib/dashboard/humanize";

export function StructuredAnswers({
  answers,
  transcriptRaw,
}: {
  answers: Record<string, unknown>;
  transcriptRaw: string | null;
}) {
  const entries = Object.entries(answers);

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
        <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Structured answers
        </h3>
        <dl className="mt-2 divide-y divide-slate-100">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-sm text-slate-500">{humanizeKey(key)}</dt>
              <dd className="text-right text-sm font-medium text-slate-900">
                {humanizeValue(value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
