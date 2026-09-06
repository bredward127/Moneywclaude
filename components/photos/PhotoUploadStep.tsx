"use client";

import { useState } from "react";
import { AlertCircle, Camera, Check, Copy, Loader2, Send } from "lucide-react";
import { createDraftSellerLead } from "@/app/actions/leads";
import { createUploadLink } from "@/app/actions/photos";
import type { SellerData } from "@/components/wizard/sellerSteps";
import { PhotoDropzone } from "./PhotoDropzone";

export function PhotoUploadStep({
  leadId,
  choice,
  sellerData,
  onLeadCreated,
  onChoiceChange,
  onPhotoCountChange,
}: {
  leadId: string | null;
  choice: "now" | "later" | null;
  sellerData: SellerData;
  onLeadCreated: (leadId: string) => void;
  onChoiceChange: (choice: "now" | "later") => void;
  onPhotoCountChange: (count: number) => void;
}) {
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [uploadLink, setUploadLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  async function ensureLead(): Promise<string | null> {
    if (leadId) return leadId;
    setIsStarting(true);
    setStartError(null);
    const result = await createDraftSellerLead(sellerData);
    setIsStarting(false);
    if ("error" in result) {
      setStartError(result.error);
      return null;
    }
    onLeadCreated(result.leadId);
    return result.leadId;
  }

  async function handleAddNow() {
    const id = await ensureLead();
    if (id) onChoiceChange("now");
  }

  async function generateLink(id: string) {
    setIsStarting(true);
    setStartError(null);
    const result = await createUploadLink(id);
    setIsStarting(false);
    if (!result.ok) {
      setStartError(result.error);
      return;
    }
    setUploadLink(result.url);
  }

  async function handleSendLater() {
    const id = await ensureLead();
    if (id) {
      onChoiceChange("later");
      await generateLink(id);
    }
  }

  async function handleCopy() {
    if (!uploadLink) return;
    await navigator.clipboard.writeText(uploadLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  if (choice === "now" && leadId) {
    return <PhotoDropzone leadId={leadId} onPhotoCountChange={onPhotoCountChange} />;
  }

  if (choice === "later") {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
        {isStarting ? (
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Creating your secure upload link…
          </p>
        ) : startError ? (
          <p className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {startError}
          </p>
        ) : uploadLink ? (
          <>
            <p className="text-sm font-semibold text-slate-900">Your secure upload link is ready</p>
            <p className="mt-1 text-sm text-slate-600">
              Bookmark this link — it&apos;s valid for 14 days and only works for your property.
            </p>
            <div className="mt-3 flex items-stretch gap-2">
              <input
                readOnly
                value={uploadLink}
                onFocus={(e) => e.target.select()}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {isCopied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {isCopied ? "Copied" : "Copy"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Ready to get your secure upload link for this property.
            </p>
            <button
              type="button"
              onClick={() => leadId && generateLink(leadId)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Generate my upload link
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <button
        type="button"
        onClick={handleAddNow}
        disabled={isStarting}
        className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 p-6 text-left transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <Camera className="h-5 w-5 text-blue-600" aria-hidden="true" />
        </span>
        <span>
          <span className="block font-semibold text-slate-900">
            Add Property Photos Now (Optional)
          </span>
          <span className="mt-1 block text-sm text-slate-600">
            Upload a few photos right here — takes about a minute.
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={handleSendLater}
        disabled={isStarting}
        className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 p-6 text-left transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <Send className="h-5 w-5 text-blue-600" aria-hidden="true" />
        </span>
        <span>
          <span className="block font-semibold text-slate-900">Send Me a Secure Upload Link Later</span>
          <span className="mt-1 block text-sm text-slate-600">
            Get a private link so you can add photos whenever it&apos;s convenient.
          </span>
        </span>
      </button>

      {isStarting && (
        <p className="col-span-full flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          One moment…
        </p>
      )}
      {startError && (
        <p className="col-span-full flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {startError}
        </p>
      )}
    </div>
  );
}
