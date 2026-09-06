"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { selectClass } from "@/components/forms/styles";
import {
  addTeamMember,
  removeTeamMember,
  assignCustomerToTeam,
  unassignCustomerFromTeam,
  type TeamMember,
  type TeamCustomer,
} from "@/app/actions/teams";

export function TeamDetailPanel({
  teamId,
  members,
  candidateUsers,
  customers,
  candidateLeads,
}: {
  teamId: string;
  members: TeamMember[];
  candidateUsers: { id: string; email: string }[];
  customers: TeamCustomer[];
  candidateLeads: { id: string; contactName: string }[];
}) {
  const router = useRouter();
  const memberIds = new Set(members.map((m) => m.userId));
  const assignedLeadIds = new Set(customers.map((c) => c.leadId));
  const availableUsers = candidateUsers.filter((u) => !memberIds.has(u.id));
  const availableLeads = candidateLeads.filter((l) => !assignedLeadIds.has(l.id));

  const [selectedUserId, setSelectedUserId] = useState(availableUsers[0]?.id ?? "");
  const [selectedLeadId, setSelectedLeadId] = useState(availableLeads[0]?.id ?? "");
  const [isBusy, setIsBusy] = useState(false);

  async function handleAddMember() {
    if (!selectedUserId) return;
    setIsBusy(true);
    await addTeamMember({ teamId, userId: selectedUserId });
    setIsBusy(false);
    router.refresh();
  }

  async function handleRemoveMember(userId: string) {
    setIsBusy(true);
    await removeTeamMember({ teamId, userId });
    setIsBusy(false);
    router.refresh();
  }

  async function handleAssignLead() {
    if (!selectedLeadId) return;
    setIsBusy(true);
    await assignCustomerToTeam({ leadId: selectedLeadId, teamId });
    setIsBusy(false);
    router.refresh();
  }

  async function handleUnassignLead(leadId: string) {
    setIsBusy(true);
    await unassignCustomerFromTeam(leadId);
    setIsBusy(false);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Members</h2>
        {availableUsers.length > 0 && (
          <div className="mt-3 flex items-end gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className={selectClass}
            >
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={handleAddMember}
              isLoading={isBusy}
              icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}
              iconPosition="left"
            >
              Add
            </Button>
          </div>
        )}
        <ul className="mt-4 divide-y divide-slate-100">
          {members.length === 0 ? (
            <li className="py-3 text-sm text-slate-500">No members yet.</li>
          ) : (
            members.map((m) => (
              <li key={m.userId} className="flex items-center justify-between gap-2 py-3">
                <span className="text-sm text-slate-700">{m.email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(m.userId)}
                  disabled={isBusy}
                  aria-label={`Remove ${m.email}`}
                  className="text-slate-400 hover:text-red-600"
                >
                  <UserMinus className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Assigned customers</h2>
        {availableLeads.length > 0 && (
          <div className="mt-3 flex items-end gap-2">
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className={selectClass}
            >
              {availableLeads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.contactName}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={handleAssignLead}
              isLoading={isBusy}
              icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}
              iconPosition="left"
            >
              Assign
            </Button>
          </div>
        )}
        <ul className="mt-4 divide-y divide-slate-100">
          {customers.length === 0 ? (
            <li className="py-3 text-sm text-slate-500">No customers assigned yet.</li>
          ) : (
            customers.map((c) => (
              <li key={c.leadId} className="flex items-center justify-between gap-2 py-3">
                <span className="text-sm text-slate-700">{c.contactName}</span>
                <button
                  type="button"
                  onClick={() => handleUnassignLead(c.leadId)}
                  disabled={isBusy}
                  aria-label={`Unassign ${c.contactName}`}
                  className="text-slate-400 hover:text-red-600"
                >
                  <UserMinus className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
