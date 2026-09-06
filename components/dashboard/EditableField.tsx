"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";

export function EditableField({
  label,
  value,
  editable,
  onSave,
}: {
  label: string;
  value: string;
  editable: boolean;
  onSave: (newValue: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setDraft(value);
    setError(null);
    setIsEditing(true);
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    const result = await onSave(draft);
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save this change.");
      return;
    }
    setIsEditing(false);
    router.refresh();
  }

  if (isEditing) {
    return (
      <div className="py-2.5">
        <dt className="text-sm text-slate-500">{label}</dt>
        <div className="mt-1 flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Save"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
            aria-label="Cancel"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="group flex items-start justify-between gap-4 py-2.5">
      <div>
        <dt className="text-sm text-slate-500">{label}</dt>
        <dd className="text-sm font-medium text-slate-900">{value || "—"}</dd>
      </div>
      {editable && (
        <button
          type="button"
          onClick={startEditing}
          aria-label={`Edit ${label}`}
          className="shrink-0 rounded-full p-1 text-slate-300 opacity-0 hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
