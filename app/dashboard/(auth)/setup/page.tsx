import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { isSetupNeeded } from "@/app/actions/auth";
import { SetupForm } from "./SetupForm";

// This reads live database state (is there a staff account yet?) that must
// never be baked into a build-time static page -- the answer changes the
// moment setup completes, and the page must reflect that on the very next
// request.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Setup",
};

export default async function DashboardSetupPage() {
  const needsSetup = await isSetupNeeded();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center gap-2 text-blue-400">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wide uppercase">Internal only</span>
        </div>

        {needsSetup ? (
          <>
            <h1 className="mt-3 text-2xl font-bold text-white">Create the first admin account</h1>
            <p className="mt-2 text-sm text-slate-400">
              This page only works once, while no staff accounts exist yet. After this, it
              permanently stops creating accounts -- add teammates from inside the dashboard
              instead.
            </p>
            <div className="mt-6">
              <SetupForm />
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-2xl font-bold text-white">Setup already complete</h1>
            <p className="mt-2 text-sm text-slate-400">
              A staff account already exists for this dashboard.
            </p>
            <Link
              href="/dashboard/login"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Go to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
