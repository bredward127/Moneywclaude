import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";

// Confirms an invite/recovery email link and starts a session, per
// Supabase's documented SSR pattern: the email template links here with
// token_hash+type instead of Supabase's own hosted confirmation URL, so
// verifyOtp() runs (and writes the session cookie) in this app rather than
// on Supabase's domain. Outside /dashboard on purpose -- proxy.ts's matcher
// never touches this route, so no allowlist entry is needed for it.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    try {
      const supabase = await getSupabaseServerSessionClient();
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) {
        const target =
          type === "recovery" ? "/dashboard/reset-password/confirm" : "/dashboard/onboarding/set-password";
        return NextResponse.redirect(new URL(target, request.url));
      }
      console.error("[auth-confirm] verifyOtp failed", error);
    } catch (err) {
      console.error("[auth-confirm] threw", err);
    }
  }

  return NextResponse.redirect(new URL("/dashboard/login?error=link_expired", request.url));
}
