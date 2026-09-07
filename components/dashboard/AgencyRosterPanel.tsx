"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, ShieldAlert, Trash2 } from "lucide-react";
import {
  removeAgencyUser,
  resetUserMfa,
  updateAgencyUserPermissions,
  setAgencyAdminStatus,
  type AgencyUser,
} from "@/app/actions/agency-users";

type Dial = "canEditPropertyDetails" | "canEditFinancialDetails" | "canEditContactInfo";

interface RowNotice {
  userId: string;
  tone: "ok" | "error";
  text: string;
}

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
  const [notice, setNotice] = useState<RowNotice | null>(null);

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

  async function handleResetMfa(user: AgencyUser) {
    const isSelf = user.id === viewerId;
    const warning = isSelf
      ? "Reset your own two-factor authentication?\n\nYou'll be signed out immediately and will scan a new QR code the next time you sign in."
      : `Reset two-factor authentication for ${user.email}?\n\nThey'll be signed out of any active session and will scan a new QR code the next time they sign in. Their password is unchanged.`;
    if (!confirm(warning)) return;

    setPendingId(user.id);
    setNotice(null);
    const result = await resetUserMfa(user.id);
    setPendingId(null);

    if (!result.ok) {
      setNotice({ userId: user.id, tone: "error", text: result.error });
      return;
    }
    setNotice({
      userId: user.id,
      tone: "ok",
      text:
        result.removed > 0
          ? isSelf
            ? "Your two-factor was reset. Sign in again to set up a new authenticator app."
            : "Two-factor reset. They'll set up a new authenticator app the next time they sign in."
          : "This account had no two-factor set up. They'll be asked to set it up at their next sign-in.",
    });
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
        const rowNotice = notice?.userId === user.id ? notice : null;

        return (
          <li key={user.id} className="space-y-2 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
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
                {user.mfaEnrolled === true && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    2FA active
                  </span>
                )}
                {user.mfaEnrolled === false && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                    2FA not set up
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleResetMfa(user)}
                  disabled={isPending}
                  aria-label={`Reset two-factor authentication for ${user.email}`}
                  className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
                >
                  <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset 2FA
                </button>
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
            </div>

            {rowNotice && (
              <p
                role="status"
                className={`text-xs ${rowNotice.tone === "ok" ? "text-emerald-700" : "text-red-600"}`}
              >
                {rowNotice.text}
              </p>
            )}

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
