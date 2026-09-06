"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { selectClass } from "@/components/forms/styles";
import {
  assignPartnerRoute,
  updatePartnerRouteStatus,
  type OrgPartner,
  type PartnerRoute,
  type PartnerRouteStatus,
} from "@/app/actions/partner-routes";

const ROUTE_STATUSES: PartnerRouteStatus[] = ["assigned", "contacted", "closed"];

export function PartnerAssignment({
  leadId,
  partners,
  initialRoutes,
}: {
  leadId: string;
  partners: OrgPartner[];
  initialRoutes: PartnerRoute[];
}) {
  const router = useRouter();
  const [selectedPartner, setSelectedPartner] = useState(partners[0]?.id ?? "");
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAssign() {
    if (!selectedPartner) return;
    setIsAssigning(true);
    setError(null);
    const result = await assignPartnerRoute({ leadId, partnerId: selectedPartner });
    setIsAssigning(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleStatusChange(routeId: string, status: PartnerRouteStatus) {
    await updatePartnerRouteStatus({ routeId, status });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {partners.length === 0 ? (
        <p className="text-sm text-slate-500">
          No partner accounts yet. Add one from the Team page.
        </p>
      ) : (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className={selectClass}
            >
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.email}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            onClick={handleAssign}
            isLoading={isAssigning}
            icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}
            iconPosition="left"
          >
            Route
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {initialRoutes.length > 0 && (
        <ul className="space-y-2">
          {initialRoutes.map((route) => {
            const partnerEmail = partners.find((p) => p.id === route.partnerId)?.email ?? route.partnerId;
            return (
              <li
                key={route.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm"
              >
                <span className="font-medium text-slate-900">{partnerEmail}</span>
                <select
                  value={route.status}
                  onChange={(e) => handleStatusChange(route.id, e.target.value as PartnerRouteStatus)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs capitalize"
                >
                  {ROUTE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
