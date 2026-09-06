"use server";

import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getDefaultOrgId } from "@/lib/org";
import type { SellerLead } from "@/lib/types";

type SellerData = Omit<SellerLead, "type">;

export async function createDraftSellerLead(
  data: SellerData
): Promise<{ leadId: string } | { error: string }> {
  const supabase = getSupabaseServiceClient();

  const propertyDetails = {
    addressOrCityZip: data.addressOrCityZip,
    propertyType: data.propertyType,
    occupancy: data.occupancy,
    condition: data.condition,
    timeline: data.timeline,
    nextStep: data.nextStep,
    preferPrivateDiscussion: data.preferPrivateDiscussion,
    repairDetails: data.repairDetails,
    mortgageOrLiens: data.mortgageOrLiens,
    reasonForSelling: data.reasonForSelling,
  };

  const { data: row, error } = await supabase
    .from("leads")
    .insert({
      org_id: getDefaultOrgId(),
      type: "seller",
      status: "draft",
      contact_name: data.contact.fullName,
      email: data.contact.email,
      phone: data.contact.phone,
      contact_pref: data.contact.preferredContact,
      property_details: propertyDetails,
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("[leads] failed to create draft seller lead", error);
    return { error: "Could not start your photo upload session. Please try again." };
  }

  return { leadId: row.id as string };
}
