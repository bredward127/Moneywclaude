"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowserSessionClient } from "@/lib/supabase/browser-session";

const darkInputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

export function ResetPasswordRequestForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const supabase = getSupabaseBrowserSessionClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/auth/confirm`,
    });

    // Supabase's own API never reveals whether the address is registered,
    // so there's nothing more specific to show either way -- this also
    // means there's nothing to catch here that would leak that either.
    setIsSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-emerald-950/60 px-4 py-3 text-sm text-emerald-300">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        If that email has an account, a reset link is on its way.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={darkInputClass}
          autoComplete="email"
        />
      </div>
      <Button type="submit" isLoading={isSubmitting} fullWidth>
        Send reset link
      </Button>
    </form>
  );
}
