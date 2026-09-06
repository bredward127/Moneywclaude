"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { setLeadReviewFlag, updateLeadStatus } from "@/app/actions/staff-leads";

const STATUS_OPTIONS = ["draft", "submitted", "offer_discussed", "closed", "archived"];

export function LeadStatusControls({
  leadId,
  status,
  humanReviewFlag,
}: {
  leadId: string;
  status: string;
  humanReviewFlag: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleStatusChange(value: string) {
    setIsPending(true);
    await updateLeadStatus(leadId, value);
    setIsPending(false);
    router.refresh();
  }

  async function handleToggleReview() {
    setIsPending(true);
    await setLeadReviewFlag(leadId, !humanReviewFlag);
    setIsPending(false);
    router.refresh();
  }

  const options = STATUS_OPTIONS.includes(status) ? STATUS_OPTIONS : [status, ...STATUS_OPTIONS];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 capitalize"
      >
        {options.map((option) => (
          <option key={option} value={option} className="capitalize">
            {option.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggleReview}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${
          humanReviewFlag
            ? "border-purple-300 bg-purple-50 text-purple-700"
            : "border-slate-300 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {humanReviewFlag ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
        {humanReviewFlag ? "Clear review flag" : "Flag for review"}
      </button>
    </div>
  );
}
