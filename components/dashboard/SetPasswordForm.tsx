"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { setNewPassword } from "@/app/actions/onboarding";

const darkInputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

/** Shared by first-time onboarding and password-reset confirmation -- both are "set a password for the already-verified session in front of you," just with a different next step. */
export function SetPasswordForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const result = await setNewPassword({ password });
    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={darkInputClass}
          autoComplete="new-password"
        />
        <p className="mt-1.5 text-xs text-slate-500">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-300">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={darkInputClass}
          autoComplete="new-password"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-950/60 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isSubmitting} fullWidth>
        Continue
      </Button>
    </form>
  );
}
