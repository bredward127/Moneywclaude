import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isRecord(body) || typeof body.type !== "string") {
    return NextResponse.json({ ok: false, error: "Missing submission type." }, { status: 400 });
  }

  if (body.type === "seller" || body.type === "buyer") {
    const contact = isRecord(body.contact) ? body.contact : {};
    const fullName = asString(contact.fullName);
    const email = asString(contact.email);
    const phone = asString(contact.phone);

    if (!fullName.trim() || (!email.trim() && !phone.trim())) {
      return NextResponse.json(
        { ok: false, error: "Name and at least one contact method are required." },
        { status: 400 }
      );
    }

    if (body.consent !== true) {
      return NextResponse.json(
        { ok: false, error: "Consent to be contacted is required." },
        { status: 400 }
      );
    }

    if (body.type === "seller") {
      const { leadId, ...payload } = body as Record<string, unknown> & { leadId?: unknown };
      const supabase = getSupabaseServiceClient();
      const row = {
        type: "seller",
        status: "submitted",
        contact_name: fullName,
        contact_email: email,
        contact_phone: phone,
        contact_preferred_method: asString(contact.preferredContact),
        consent: true,
        payload,
      };

      const { error } =
        typeof leadId === "string" && leadId
          ? await supabase.from("leads").update(row).eq("id", leadId).eq("type", "seller")
          : await supabase.from("leads").insert(row);

      if (error) {
        console.error("[intake] failed to persist seller lead", error);
        return NextResponse.json(
          { ok: false, error: "Could not save your submission. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true });
    }
  } else if (body.type === "contact-preferences") {
    const email = asString(body.email);
    const phone = asString(body.phone);

    if (!email.trim() && !phone.trim()) {
      return NextResponse.json(
        { ok: false, error: "An email or phone number is required." },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json({ ok: false, error: "Unknown submission type." }, { status: 400 });
  }

  console.log(`[intake] received "${body.type}" submission`, JSON.stringify(body));

  return NextResponse.json({ ok: true });
}
