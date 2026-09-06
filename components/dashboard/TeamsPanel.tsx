"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/forms/styles";
import { createTeam, deleteTeam, type Team } from "@/app/actions/teams";

export function TeamsPanel({ teams: initialTeams, orgId }: { teams: Team[]; orgId?: string }) {
  const router = useRouter();
  const [teams, setTeams] = useState(initialTeams);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await createTeam({ name, orgId });
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setTeams((prev) => [...prev, result.team]);
    setName("");
    router.refresh();
  }

  async function handleDelete(teamId: string) {
    if (!confirm("Delete this team? Members and customer assignments will be removed too.")) return;
    await deleteTeam(teamId);
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-end gap-2">
        <div className="flex-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className={inputClass}
          />
        </div>
        <Button
          type="submit"
          isLoading={isSubmitting}
          icon={<Plus className="h-4 w-4" aria-hidden="true" />}
          iconPosition="left"
        >
          Create
        </Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {teams.length === 0 ? (
        <p className="text-sm text-slate-500">No teams yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {teams.map((team) => (
            <li key={team.id} className="flex items-center justify-between gap-2 py-3">
              <Link
                href={`/dashboard/teams/${team.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {team.name}
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(team.id)}
                aria-label={`Delete ${team.name}`}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
