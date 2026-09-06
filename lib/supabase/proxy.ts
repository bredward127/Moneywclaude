import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DASHBOARD_PUBLIC_PATHS = [
  "/dashboard/login",
  "/dashboard/setup",
  "/dashboard/onboarding",
  "/dashboard/mfa-challenge",
  "/dashboard/reset-password",
];

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicDashboardPath = DASHBOARD_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (pathname.startsWith("/dashboard") && !isPublicDashboardPath && !user) {
    const loginUrl = new URL("/dashboard/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Mandatory two-factor: every account must reach aal2 before touching
  // anything but the public paths above. getAuthenticatorAssuranceLevel()
  // reads claims already on the loaded session -- no extra network or DB
  // round trip, so this doesn't add real cost to every dashboard request.
  if (pathname.startsWith("/dashboard") && !isPublicDashboardPath && user) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.currentLevel !== "aal2") {
      const needsChallenge = aal.nextLevel === "aal2";
      const target = needsChallenge ? "/dashboard/mfa-challenge" : "/dashboard/onboarding/mfa-enroll";
      const redirectUrl = new URL(target, request.url);
      if (needsChallenge) {
        redirectUrl.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
