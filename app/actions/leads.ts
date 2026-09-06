"use server";

import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { SellerLead } from "@/lib/types";

type SellerData = Omit<SellerLead, "type">;

export async function createDraftSellerLead(
  data: SellerData
): Promise<{ leadId: string } | { error: string }> {
  const supabase = getSupabaseServiceClient();

  const { data: row, error } = await supabase
    .from("leads")
    .insert({
      type: "seller",
      status: "draft",
      contact_name: data.contact.fullName,
      contact_email: data.contact.email,
      contact_phone: data.contact.phone,
      contact_preferred_method: data.contact.preferredContact,
      consent: data.consent,
      payload: data,
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("[leads] failed to create draft seller lead", error);
    return { error: "Could not start your photo upload session. Please try again." };
  }

  return { leadId: row.id as string };
}
