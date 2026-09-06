import { Check } from "lucide-react";
import { WHOLESALE_STAGES } from "@/lib/dashboard/wholesale";

export function WholesaleStageTracker({ stageIndex }: { stageIndex: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {WHOLESALE_STAGES.map((label, index) => {
        const isDone = index < stageIndex;
        const isCurrent = index === stageIndex;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                isDone
                  ? "bg-green-600 text-white"
                  : isCurrent
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
            </span>
            <span className={`text-xs font-medium ${isCurrent ? "text-slate-900" : "text-slate-500"}`}>
              {label}
            </span>
            {index < WHOLESALE_STAGES.length - 1 && (
              <span className="mx-1 h-px w-6 bg-slate-200" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
