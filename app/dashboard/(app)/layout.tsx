import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { getStaffSessionState } from "@/lib/dashboard/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { signOut } from "@/app/actions/auth";

// Every page under this layout reads the caller's own session and live
// database state -- never statically prerenderable. Declared explicitly
// (in addition to cookies() usage naturally forcing this) so a build never
// attempts to prerender this subtree even if a future refactor changes
// call order somewhere in that chain.
export const dynamic = "force-dynamic";

export default async function DashboardAppLayout({ children }: { children: React.ReactNode }) {
  const state = await getStaffSessionState();

  if (state.status === "unauthenticated") {
    redirect("/dashboard/login");
  }

  if (state.status === "unprovisioned") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <AlertCircle className="h-6 w-6 text-amber-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Account not set up</h1>
          <p className="mt-2 text-sm text-slate-600">
            {state.email} is signed in, but isn&apos;t linked to a staff profile yet. Ask an
            admin to add you as a teammate.
          </p>
          <form action={signOut} className="mt-6">
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <DashboardNav profile={state.profile} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
