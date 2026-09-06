import { CheckCircle2, XCircle } from "lucide-react";
import type { ConsentRecord } from "@/app/actions/staff-leads";

export function ConsentLog({ records }: { records: ConsentRecord[] }) {
  if (records.length === 0) {
    return <p className="text-sm text-slate-500">No consent record found for this lead.</p>;
  }

  return (
    <ul className="space-y-3">
      {records.map((record) => (
        <li key={record.id} className="rounded-lg border border-slate-200 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5 font-medium text-slate-900">
              {record.privacyAgreed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
              )}
              Privacy consent {record.privacyAgreed ? "agreed" : "not agreed"}
            </span>
            <span className="text-slate-500">
              Marketing opt-in: {record.marketingOptIn ? "Yes" : "No"}
            </span>
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 sm:grid-cols-4">
            <div>
              <dt className="uppercase tracking-wide">Disclosure</dt>
              <dd className="text-slate-700">{record.disclosureVersion}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide">Recorded</dt>
              <dd className="text-slate-700">{new Date(record.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide">IP address</dt>
              <dd className="text-slate-700">{record.ipAddress ?? "—"}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide">User agent</dt>
              <dd className="truncate text-slate-700" title={record.userAgent ?? undefined}>
                {record.userAgent ?? "—"}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
