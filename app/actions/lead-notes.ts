"use server";

import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";

export interface LeadNote {
  id: string;
  leadId: string;
  authorId: string | null;
  authorEmail: string;
  body: string;
  createdAt: string;
}

function mapNote(row: Record<string, unknown>): LeadNote {
  return {
    id: row.id as string,
    leadId: row.lead_id as string,
    authorId: (row.author_id as string | null) ?? null,
    authorEmail: row.author_email as string,
    body: row.body as string,
    createdAt: row.created_at as string,
  };
}

export async function listNotesForLead(leadId: string): Promise<LeadNote[]> {
  try {
    const supabase = await getSupabaseServerSessionClient();
    const { data, error } = await supabase
      .from("lead_notes")
      .select("id, lead_id, author_id, author_email, body, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapNote);
  } catch (err) {
    console.error("[lead-notes] listNotesForLead threw", err);
    return [];
  }
}

/**
 * Open to anyone who can see the lead, regardless of their edit dials --
 * notes are a request/comment channel, not an edit to the record itself.
 */
export async function addNoteToLead({
  leadId,
  body,
}: {
  leadId: string;
  body: string;
}): Promise<{ ok: true; note: LeadNote } | { ok: false; error: string }> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a note before saving." };
  }

  const me = await getCurrentStaffProfile();
  if (!me) {
    return { ok: false, error: "You must be signed in to add a note." };
  }

  try {
    const supabase = await getSupabaseServerSessionClient();
    const { data, error } = await supabase
      .from("lead_notes")
      .insert({ lead_id: leadId, author_id: me.id, author_email: me.email, body: trimmed })
      .select("id, lead_id, author_id, author_email, body, created_at")
      .single();

    if (error || !data) {
      console.error("[lead-notes] failed to add note", error);
      return { ok: false, error: "Could not save this note. Please try again." };
    }

    return { ok: true, note: mapNote(data) };
  } catch (err) {
    console.error("[lead-notes] addNoteToLead threw", err);
    return { ok: false, error: "Could not save this note. Please try again." };
  }
}
