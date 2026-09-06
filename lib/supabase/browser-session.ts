"use client";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Session-persisting browser client for the dashboard's login form. Distinct
 * from lib/supabase/client.ts, which deliberately disables session
 * persistence for the public, unauthenticated photo-upload flow.
 */
export function getSupabaseBrowserSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set."
    );
  }
  return createBrowserClient(url, publishableKey);
}
