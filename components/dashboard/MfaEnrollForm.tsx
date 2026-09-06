"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { enrollMfaFactor, verifyMfaCode } from "@/app/actions/onboarding";

export function MfaEnrollForm() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await enrollMfaFactor();
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setFactorId(result.factorId);
      setQrCode(result.qrCode);
      setSecret(result.secret);
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

    router.push("/dashboard");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Preparing your two-factor setup…
      </div>
    );
  }

  if (!factorId || !qrCode) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-950/60 px-4 py-3 text-sm text-red-300">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        {error ?? "Could not start two-factor setup."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- data: URI from Supabase, not a static asset */}
        <img src={qrCode} alt="Scan this QR code with your authenticator app" className="mx-auto h-48 w-48" />
      </div>
      {secret && (
        <p className="text-center text-xs text-slate-500">
          Can&apos;t scan it? Enter this code manually:{" "}
          <span className="font-mono text-slate-300">{secret}</span>
        </p>
      )}

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
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-center text-lg tracking-[0.5em] text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          placeholder="000000"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-950/60 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isVerifying} fullWidth disabled={code.length !== 6}>
        Verify &amp; finish setup
      </Button>
    </form>
  );
}
