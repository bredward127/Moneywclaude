import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * A Supabase client authenticated as the current dashboard user's own
 * session (via cookies), not the service role. Queries through this client
 * are subject to RLS exactly as designed: staff see their own
 * organization's data, partners see only leads routed to them. This is the
 * client every staff/partner-facing Server Component and Server Action
 * should use -- reach for the service-role client only for operations RLS
 * cannot express (e.g. storage signed URLs), and only after checking access
 * through this client first.
 */
export async function getSupabaseServerSessionClient() {
  // Call cookies() before the env-var check, not after: reading a dynamic
  // API is what tells Next.js this route can't be statically prerendered.
  // If the config-error throw happened first, a build with a missing env
  // var would never reach cookies() during the prerender pass, so Next
  // would try to prerender this route anyway -- turning a per-request 500
  // into a hard build failure for the whole deployment.
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set."
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component that can't set cookies -- proxy.ts
          // is responsible for refreshing the session in that case, matching
          // the standard @supabase/ssr Next.js pattern.
        }
      },
    },
  });
}
