import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

export function AuthPageShell({
  eyebrow = "Internal only",
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center gap-2 text-blue-400">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wide uppercase">{eyebrow}</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
