import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getDefaultOrgId } from "@/lib/org";
import { DISCLOSURE_VERSION, getClientIp } from "@/lib/consent";
import {
  intakeSubmissionSchema,
  firstIssueMessage,
  type SellerIntakeInput,
  type BuyerIntakeInput,
} from "@/lib/validation/intake";

async function recordConsent(
  leadId: string,
  request: Request,
  privacyAgreed: boolean,
  marketingOptIn: boolean
) {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("consent_records").insert({
    lead_id: leadId,
    disclosure_version: DISCLOSURE_VERSION,
    privacy_agreed: privacyAgreed,
    marketing_opt_in: marketingOptIn,
    ip_address: getClientIp(request),
    user_agent: request.headers.get("user-agent"),
  });
  if (error) {
    console.error("[intake] failed to record consent", error);
  }
}

function sellerPropertyDetails(data: SellerIntakeInput) {
  return {
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
}

function buyerCriteria(data: BuyerIntakeInput) {
  return {
    goal: data.goal,
    targetLocation: data.targetLocation,
    propertyTypes: data.propertyTypes,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    minSquareFootage: data.minSquareFootage,
    budgetMin: data.budgetMin,
    budgetMax: data.budgetMax,
    purchaseTimeline: data.purchaseTimeline,
    fundingPath: data.fundingPath,
    investorStrategy: data.investorStrategy,
    propertyAlertOptIn: data.propertyAlertOptIn,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = intakeSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  const submission = parsed.data;

  if (submission.type === "seller") {
    const supabase = getSupabaseServiceClient();
    const row = {
      org_id: getDefaultOrgId(),
      type: "seller",
      status: "submitted",
      contact_name: submission.contact.fullName,
      email: submission.contact.email,
      phone: submission.contact.phone,
      contact_pref: submission.contact.preferredContact,
      property_details: sellerPropertyDetails(submission),
    };

    const { data: lead, error } = submission.leadId
      ? await supabase
          .from("leads")
          .update(row)
          .eq("id", submission.leadId)
          .eq("type", "seller")
          .select("id")
          .single()
      : await supabase.from("leads").insert(row).select("id").single();

    if (error || !lead) {
      console.error("[intake] failed to persist seller lead", error);
      return NextResponse.json(
        { ok: false, error: "Could not save your submission. Please try again." },
        { status: 500 }
      );
    }

    await recordConsent(lead.id as string, request, true, submission.marketingOptIn);
    return NextResponse.json({ ok: true });
  }

  if (submission.type === "buyer") {
    const supabase = getSupabaseServiceClient();
    const row = {
      org_id: getDefaultOrgId(),
      type: "buyer",
      status: "submitted",
      contact_name: submission.contact.fullName,
      email: submission.contact.email,
      phone: submission.contact.phone,
      contact_pref: submission.contact.preferredContact,
      buyer_criteria: buyerCriteria(submission),
    };

    const { data: lead, error } = await supabase.from("leads").insert(row).select("id").single();

    if (error || !lead) {
      console.error("[intake] failed to persist buyer lead", error);
      return NextResponse.json(
        { ok: false, error: "Could not save your submission. Please try again." },
        { status: 500 }
      );
    }

    await recordConsent(lead.id as string, request, true, submission.marketingOptIn);
    return NextResponse.json({ ok: true });
  }

  console.log(`[intake] received "${submission.type}" submission`, JSON.stringify(submission));
  return NextResponse.json({ ok: true });
}
