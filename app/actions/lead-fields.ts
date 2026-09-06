"use server";

// Editing property/financial/contact fields from the dashboard -- this is
// new capability (nothing previously wrote these fields after intake).
// Row-level access to the lead stays fully RLS-enforced via the
// session-scoped client regardless; the category check here is what
// enforces the view/edit dial, since expressing "which JSON key changed"
// inside an RLS policy would mean duplicating field-categories.ts into SQL.

import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";
import { canEditCategory } from "@/lib/dashboard/permissions";
import { categoryForField, type FieldCategory } from "@/lib/dashboard/field-categories";

type UpdateResult = { ok: true } | { ok: false; error: string };

async function updateJsonField(
  leadId: string,
  category: FieldCategory,
  key: string,
  value: string
): Promise<UpdateResult> {
  const me = await getCurrentStaffProfile();
  if (!me) return { ok: false, error: "You must be signed in." };
  if (!canEditCategory(me, category)) {
    return { ok: false, error: "You don't have permission to edit this field." };
  }

  try {
    const supabase = await getSupabaseServerSessionClient();

    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("type, property_details, buyer_criteria")
      .eq("id", leadId)
      .maybeSingle();
    if (fetchError || !lead) {
      return { ok: false, error: "Could not find this lead." };
    }

    const leadType = lead.type as "seller" | "buyer";
    if (categoryForField(leadType, key) !== category) {
      return { ok: false, error: "That field isn't part of this category." };
    }

    const column = leadType === "seller" ? "property_details" : "buyer_criteria";
    const current = (lead[column] as Record<string, unknown>) ?? {};
    const updated = { ...current, [key]: value };

    const { error: updateError } = await supabase
      .from("leads")
      .update({ [column]: updated })
      .eq("id", leadId);
    if (updateError) {
      console.error("[lead-fields] failed to update field", updateError);
      return { ok: false, error: "Could not save this change. Please try again." };
    }

    return { ok: true };
  } catch (err) {
    console.error("[lead-fields] updateJsonField threw", err);
    return { ok: false, error: "Could not save this change. Please try again." };
  }
}

export async function updateLeadPropertyField(leadId: string, key: string, value: string): Promise<UpdateResult> {
  return updateJsonField(leadId, "property", key, value);
}

export async function updateLeadFinancialField(leadId: string, key: string, value: string): Promise<UpdateResult> {
  return updateJsonField(leadId, "financial", key, value);
}

export async function updateLeadContactInfo(
  leadId: string,
  patch: Partial<{ contactName: string; email: string; phone: string; contactPref: string }>
): Promise<UpdateResult> {
  const me = await getCurrentStaffProfile();
  if (!me) return { ok: false, error: "You must be signed in." };
  if (!canEditCategory(me, "contact")) {
    return { ok: false, error: "You don't have permission to edit contact info." };
  }

  const update: Record<string, string> = {};
  if (patch.contactName !== undefined) update.contact_name = patch.contactName;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.contactPref !== undefined) update.contact_pref = patch.contactPref;
  if (Object.keys(update).length === 0) return { ok: true };

  try {
    const supabase = await getSupabaseServerSessionClient();
    const { error } = await supabase.from("leads").update(update).eq("id", leadId);
    if (error) {
      console.error("[lead-fields] failed to update contact info", error);
      return { ok: false, error: "Could not save this change. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[lead-fields] updateLeadContactInfo threw", err);
    return { ok: false, error: "Could not save this change. Please try again." };
  }
}
