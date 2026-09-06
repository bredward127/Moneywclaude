"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { inputClass, selectClass, labelClass } from "@/components/forms/styles";
import { inviteTeamMember } from "@/app/actions/auth";
import type { StaffRole } from "@/lib/dashboard/auth";

const ROLES: { value: StaffRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "reviewer", label: "Reviewer" },
  { value: "acquisitions", label: "Acquisitions" },
  { value: "partner", label: "Partner" },
];

export function InviteTeamMemberForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("reviewer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await inviteTeamMember({ email, password, role });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setEmail("");
    setPassword("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="teammate-email" className={labelClass}>
          Email
        </label>
        <input
          id="teammate-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="teammate-password" className={labelClass}>
          Temporary password
        </label>
        <input
          id="teammate-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="teammate-role" className={labelClass}>
          Role
        </label>
        <select
          id="teammate-role"
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
          className={selectClass}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Teammate added.
        </div>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Add teammate
      </Button>
    </form>
  );
}
