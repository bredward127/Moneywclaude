"use server";

// The set-password -> mandatory TOTP enrollment sequence every new account
// (invited or self-bootstrapped) goes through, plus the code-verify step a
// returning account with an already-enrolled factor hits on login. Shared
// by both onboarding and post-reset flows -- see lib/supabase/proxy.ts for
// how a session gets routed here in the first place.

import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function setNewPassword({
  password,
}: {
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  try {
    const supabase = await getSupabaseServerSessionClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { ok: false, error: "Your session has expired. Please use the link again." };
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      console.error("[onboarding] failed to set password", updateError);
      return { ok: false, error: updateError.message || "Could not set your password. Please try again." };
    }

    try {
      const service = getSupabaseServiceClient();
      const { error: stampError } = await service
        .from("users")
        .update({ password_set_at: new Date().toISOString() })
        .eq("id", user.id);
      if (stampError) {
        console.error("[onboarding] failed to stamp password_set_at", stampError);
      }
    } catch (err) {
      // The password itself is already set at this point -- don't block the
      // user on this secondary bookkeeping write failing.
      console.error("[onboarding] password_set_at stamp threw", err);
    }

    return { ok: true };
  } catch (err) {
    console.error("[onboarding] setNewPassword threw", err);
    return { ok: false, error: "Could not set your password. Please try again." };
  }
}

export async function enrollMfaFactor(): Promise<
  { ok: true; factorId: string; qrCode: string; secret: string } | { ok: false; error: string }
> {
  try {
    const supabase = await getSupabaseServerSessionClient();
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error || !data) {
      console.error("[onboarding] failed to enroll MFA factor", error);
      return { ok: false, error: "Could not start two-factor setup. Please try again." };
    }
    return { ok: true, factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  } catch (err) {
    console.error("[onboarding] enrollMfaFactor threw", err);
    return { ok: false, error: "Could not start two-factor setup. Please try again." };
  }
}

export async function verifyMfaCode({
  factorId,
  code,
}: {
  factorId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = code.trim();
  if (!/^\d{6}$/.test(trimmed)) {
    return { ok: false, error: "Enter the 6-digit code from your authenticator app." };
  }

  try {
    const supabase = await getSupabaseServerSessionClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: trimmed });
    if (error) {
      console.error("[onboarding] failed to verify MFA code", error);
      return { ok: false, error: "That code didn't work. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[onboarding] verifyMfaCode threw", err);
    return { ok: false, error: "That code didn't work. Please try again." };
  }
}

export interface MfaFactorSummary {
  id: string;
  status: "verified" | "unverified";
}

export async function listMfaFactors(): Promise<MfaFactorSummary[]> {
  try {
    const supabase = await getSupabaseServerSessionClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error || !data) return [];
    return data.totp.map((factor) => ({ id: factor.id, status: factor.status }));
  } catch (err) {
    console.error("[onboarding] listMfaFactors threw", err);
    return [];
  }
}
