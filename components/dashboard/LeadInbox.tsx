"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { OrgLead } from "@/app/actions/staff-leads";
import { getLeadUrgency, URGENCY_LABELS, type Urgency } from "@/lib/dashboard/urgency";
import { selectClass, labelClass } from "@/components/forms/styles";
import { UrgencyBadge, IntentBadge, ReviewFlagBadge, TypeBadge } from "./LeadBadges";

function leadLocation(lead: OrgLead): string {
  if (lead.type === "seller") return (lead.propertyDetails.addressOrCityZip as string) || "—";
  return (lead.buyerCriteria.targetLocation as string) || "—";
}

export function LeadInbox({ leads }: { leads: OrgLead[] }) {
  const [typeFilter, setTypeFilter] = useState<"all" | "seller" | "buyer">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | Urgency>("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | "needed" | "not-needed">("all");

  const statusOptions = useMemo(
    () => Array.from(new Set(leads.map((l) => l.status))).sort(),
    [leads]
  );

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (typeFilter !== "all" && lead.type !== typeFilter) return false;
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (urgencyFilter !== "all" && getLeadUrgency(lead) !== urgencyFilter) return false;
      if (reviewFilter === "needed" && !lead.humanReviewFlag) return false;
      if (reviewFilter === "not-needed" && lead.humanReviewFlag) return false;
      return true;
    });
  }, [leads, typeFilter, statusFilter, urgencyFilter, reviewFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <div>
          <label className={labelClass}>Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className={selectClass}
          >
            <option value="all">All</option>
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">All</option>
            {statusOptions.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Urgency</label>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as typeof urgencyFilter)}
            className={selectClass}
          >
            <option value="all">All</option>
            <option value="high">{URGENCY_LABELS.high}</option>
            <option value="medium">{URGENCY_LABELS.medium}</option>
            <option value="low">{URGENCY_LABELS.low}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Human review</label>
          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value as typeof reviewFilter)}
            className={selectClass}
          >
            <option value="all">All</option>
            <option value="needed">Needed</option>
            <option value="not-needed">Not needed</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <p className="border-b border-slate-100 px-5 py-3 text-sm text-slate-500">
          {filtered.length} of {leads.length} leads
        </p>
        <ul className="divide-y divide-slate-100">
          {filtered.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/dashboard/leads/${lead.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge type={lead.type} />
                    <span className="font-semibold text-slate-900">{lead.contactName || "Unnamed"}</span>
                    <span className="text-sm text-slate-500 capitalize">{lead.status}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600">{leadLocation(lead)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <UrgencyBadge lead={lead} />
                    <IntentBadge lead={lead} />
                    <ReviewFlagBadge lead={lead} />
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-slate-500">
              No leads match these filters.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
