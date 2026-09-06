"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/forms/styles";
import { inviteAgencyUser } from "@/app/actions/agency-users";
import type { Team } from "@/app/actions/teams";

export function InviteAgencyUserForm({ teams, orgId }: { teams: Team[]; orgId?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isPartner, setIsPartner] = useState(false);
  const [canEditProperty, setCanEditProperty] = useState(false);
  const [canEditFinancial, setCanEditFinancial] = useState(false);
  const [canEditContact, setCanEditContact] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleTeam(teamId: string) {
    setSelectedTeamIds((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await inviteAgencyUser({
      email,
      orgId,
      isPartner,
      canEditPropertyDetails: canEditProperty,
      canEditFinancialDetails: canEditFinancial,
      canEditContactInfo: canEditContact,
      teamIds: selectedTeamIds,
    });

    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setEmail("");
    setIsPartner(false);
    setCanEditProperty(false);
    setCanEditFinancial(false);
    setCanEditContact(false);
    setSelectedTeamIds([]);
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="invite-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSuccess(false);
          }}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={isPartner}
          onChange={(e) => setIsPartner(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        This is a partner (routed leads only, no dashboard permissions)
      </label>

      {!isPartner && (
        <>
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Can edit</p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={canEditProperty}
                  onChange={(e) => setCanEditProperty(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Property details
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={canEditFinancial}
                  onChange={(e) => setCanEditFinancial(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Financial details
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={canEditContact}
                  onChange={(e) => setCanEditContact(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Contact info
              </label>
            </div>
          </div>

          {teams.length > 0 && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Teams</p>
              <div className="flex flex-wrap gap-4">
                {teams.map((team) => (
                  <label key={team.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedTeamIds.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {team.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Invite sent.</p>}

      <Button
        type="submit"
        isLoading={isSubmitting}
        icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}
        iconPosition="left"
      >
        Send invite
      </Button>
    </form>
  );
}
