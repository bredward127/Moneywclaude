"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PhotoDropzone } from "./PhotoDropzone";

export function DeferredPhotoUpload({ leadId }: { leadId: string }) {
  const [count, setCount] = useState(0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <PhotoDropzone leadId={leadId} onPhotoCountChange={setCount} />
      {count > 0 && (
        <p className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-blue-600">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {count} photo{count === 1 ? "" : "s"} added — thanks!
        </p>
      )}
    </div>
  );
}
