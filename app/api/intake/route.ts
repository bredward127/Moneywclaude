import { NextResponse } from "next/server";

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
