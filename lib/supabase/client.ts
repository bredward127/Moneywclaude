"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client using only the publishable key. This key is safe to
 * expose — on its own it cannot read or write anything, since every table and
 * the property-photos bucket have RLS enabled with no anon/authenticated
 * policies. Its only job client-side is completing an upload against a
 * signed URL/token that a server action already generated.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set."
    );
  }

  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const PROPERTY_PHOTOS_BUCKET = "property-photos";
