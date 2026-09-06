"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { listMfaFactors, verifyMfaCode } from "@/app/actions/onboarding";

export function MfaChallengeForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const factors = await listMfaFactors();
      if (cancelled) return;
      const verified = factors.find((f) => f.status === "verified");
      if (!verified) {
        setError("No two-factor method is set up on this account. Please contact your administrator.");
        setIsLoading(false);
        return;
      }
      setFactorId(verified.id);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setIsVerifying(true);
    setError(null);

    const result = await verifyMfaCode({ factorId, code });
    if (!result.ok) {
      setIsVerifying(false);
      setError(result.error);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-slate-300">
          6-digit code
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={6}
          disabled={!factorId}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-center text-lg tracking-[0.5em] text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
          placeholder="000000"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-950/60 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isVerifying} fullWidth disabled={!factorId || code.length !== 6}>
        Verify
      </Button>
    </form>
  );
}
