"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  removeAgencyUser,
  updateAgencyUserPermissions,
  setAgencyAdminStatus,
  type AgencyUser,
} from "@/app/actions/agency-users";

type Dial = "canEditPropertyDetails" | "canEditFinancialDetails" | "canEditContactInfo";

export function AgencyRosterPanel({
  users,
  viewerIsOwner,
  viewerId,
}: {
  users: AgencyUser[];
  viewerIsOwner: boolean;
  viewerId: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDialChange(user: AgencyUser, field: Dial, value: boolean) {
    setPendingId(user.id);
    await updateAgencyUserPermissions({
      userId: user.id,
      canEditPropertyDetails: field === "canEditPropertyDetails" ? value : user.canEditPropertyDetails,
      canEditFinancialDetails: field === "canEditFinancialDetails" ? value : user.canEditFinancialDetails,
      canEditContactInfo: field === "canEditContactInfo" ? value : user.canEditContactInfo,
    });
    setPendingId(null);
    router.refresh();
  }

  async function handleAdminToggle(user: AgencyUser, value: boolean) {
    setPendingId(user.id);
    await setAgencyAdminStatus({ userId: user.id, isAgencyAdmin: value });
    setPendingId(null);
    router.refresh();
  }

  async function handleRemove(user: AgencyUser) {
    if (!confirm(`Remove ${user.email}? This can't be undone.`)) return;
    setPendingId(user.id);
    await removeAgencyUser(user.id);
    setPendingId(null);
    router.refresh();
  }

  if (users.length === 0) {
    return <p className="text-sm text-slate-500">No one has been added to this agency yet.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {users.map((user) => {
        const isPartner = user.role === "partner";
        const isSelf = user.id === viewerId;
        const isPending = pendingId === user.id;

        return (
          <li key={user.id} className="space-y-2 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{user.email}</span>
                {isPartner && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    Partner
                  </span>
                )}
                {user.isAgencyAdmin && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    Agency admin
                  </span>
                )}
              </div>
              {!isSelf && (
                <button
                  type="button"
                  onClick={() => handleRemove(user)}
                  disabled={isPending}
                  aria-label={`Remove ${user.email}`}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>

            {!isPartner && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={user.canEditPropertyDetails}
                    disabled={isPending}
                    onChange={(e) => handleDialChange(user, "canEditPropertyDetails", e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Edit property
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={user.canEditFinancialDetails}
                    disabled={isPending}
                    onChange={(e) => handleDialChange(user, "canEditFinancialDetails", e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Edit financial
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={user.canEditContactInfo}
                    disabled={isPending}
                    onChange={(e) => handleDialChange(user, "canEditContactInfo", e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Edit contact
                </label>
                {viewerIsOwner && !isSelf && (
                  <label className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                    <input
                      type="checkbox"
                      checked={user.isAgencyAdmin}
                      disabled={isPending}
                      onChange={(e) => handleAdminToggle(user, e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Agency admin
                  </label>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
