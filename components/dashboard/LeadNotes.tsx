"use client";

import { useState } from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { textareaClass } from "@/components/forms/styles";
import { addNoteToLead, type LeadNote } from "@/app/actions/lead-notes";

export function LeadNotes({ leadId, initialNotes }: { leadId: string; initialNotes: LeadNote[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await addNoteToLead({ leadId, body });
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setNotes((prev) => [result.note, ...prev]);
    setBody("");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note for the team…"
          rows={2}
          className={textareaClass}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" isLoading={isSubmitting} disabled={!body.trim()}>
          Add note
        </Button>
      </form>

      {notes.length === 0 ? (
        <p className="text-sm text-slate-500">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="text-slate-700">{note.body}</p>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                <StickyNote className="h-3 w-3" aria-hidden="true" />
                {note.authorEmail} · {new Date(note.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
