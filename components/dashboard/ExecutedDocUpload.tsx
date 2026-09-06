"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, AlertCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { createExecutedDocUploadTicket, confirmExecutedDocUpload } from "@/app/actions/contract-packets";
import { CONTRACT_DOCUMENTS_BUCKET } from "@/lib/dashboard/contracts";

export function ExecutedDocUpload({
  leadId,
  packetId,
  hasExecutedDoc,
}: {
  leadId: string;
  packetId: string;
  hasExecutedDoc: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Executed documents must be a PDF.");
      return;
    }
    setIsUploading(true);
    setError(null);

    const ticket = await createExecutedDocUploadTicket({ leadId, filename: file.name });
    if (!ticket.ok) {
      setIsUploading(false);
      setError(ticket.error);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error: uploadError } = await supabase.storage
      .from(CONTRACT_DOCUMENTS_BUCKET)
      .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });

    if (uploadError) {
      setIsUploading(false);
      setError(uploadError.message);
      return;
    }

    const confirmed = await confirmExecutedDocUpload({ packetId, path: ticket.path });
    setIsUploading(false);
    if (!confirmed.ok) {
      setError(confirmed.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {hasExecutedDoc ? (
          <FileText className="h-4 w-4 text-green-600" aria-hidden="true" />
        ) : (
          <Upload className="h-4 w-4" aria-hidden="true" />
        )}
        {isUploading
          ? "Uploading…"
          : hasExecutedDoc
            ? "Replace executed document"
            : "Upload executed document"}
      </button>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
