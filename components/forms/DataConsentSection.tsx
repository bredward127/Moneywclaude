"use client";

import Link from "next/link";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { DATA_MANAGEMENT_VIDEO } from "@/lib/videos";

export function DataConsentSection({
  checked,
  onChange,
  consentLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  consentLabel: string;
}) {
  return (
    <div className="space-y-4 border-t border-slate-100 pt-6">
      <div>
        <p className="text-sm font-semibold text-slate-900">See how your data is handled</p>
        <p className="mt-1 text-sm text-slate-600">
          A quick look at our review process before you submit.
        </p>
        <div className="mt-3 max-w-[200px]">
          <VideoPlayer {...DATA_MANAGEMENT_VIDEO} />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-300">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-slate-700">
          {consentLabel} I&apos;ve read the{" "}
          <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>{" "}
          and consent to being contacted.
        </span>
      </label>
    </div>
  );
}
