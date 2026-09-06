import Link from "next/link";
import { Inbox, FileSignature, Users, UsersRound, Building2, LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import type { StaffProfile } from "@/lib/dashboard/auth";

export function DashboardNav({ profile }: { profile: StaffProfile }) {
  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-5 w-5 text-blue-400" aria-hidden="true" />
            <span className="text-sm font-semibold">Dashboard</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Inbox className="h-4 w-4" aria-hidden="true" />
              Lead Inbox
            </Link>
            <Link
              href="/dashboard/wholesale"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <FileSignature className="h-4 w-4" aria-hidden="true" />
              Wholesale
            </Link>
            {(profile.isAgencyAdmin || profile.isPlatformOwner) && (
              <>
                <Link
                  href="/dashboard/team"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Team
                </Link>
                <Link
                  href="/dashboard/teams"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <UsersRound className="h-4 w-4" aria-hidden="true" />
                  Teams
                </Link>
              </>
            )}
            {profile.isPlatformOwner && (
              <Link
                href="/dashboard/agencies"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Agencies
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-400 sm:inline">{profile.email}</span>
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
            {profile.isPlatformOwner ? "Owner" : profile.isAgencyAdmin ? "Agency Admin" : profile.role}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
