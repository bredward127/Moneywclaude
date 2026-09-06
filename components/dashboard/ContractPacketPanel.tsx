"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSignature, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { selectClass, labelClass, inputClass } from "@/components/forms/styles";
import { WholesaleStageTracker } from "./WholesaleStageTracker";
import { ExecutedDocUpload } from "./ExecutedDocUpload";
import type { OrgLead } from "@/app/actions/staff-leads";
import {
  createContractPacket,
  updateContractPacket,
  getExecutedDocSignedUrl,
  type ContractPacket,
  type ContractPacketStatus,
} from "@/app/actions/contract-packets";
import { CONTRACT_TEMPLATES } from "@/lib/dashboard/contracts";
import { getWholesaleStageIndex } from "@/lib/dashboard/wholesale";

const PACKET_STATUSES: ContractPacketStatus[] = ["draft", "prepared", "sent", "signed", "under_contract"];

export function ContractPacketPanel({ lead, packet }: { lead: OrgLead; packet: ContractPacket | null }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isViewingDoc, setIsViewingDoc] = useState(false);

  const stageIndex = getWholesaleStageIndex(lead.status, packet);

  async function handleStart() {
    setIsStarting(true);
    await createContractPacket({ leadId: lead.id });
    setIsStarting(false);
    router.refresh();
  }

  async function handleTemplateChange(templateId: string) {
    if (!packet) return;
    await updateContractPacket({ packetId: packet.id, templateId });
    router.refresh();
  }

  async function handleStatusChange(status: ContractPacketStatus) {
    if (!packet) return;
    await updateContractPacket({ packetId: packet.id, status });
    router.refresh();
  }

  async function handleEnvelopeIdChange(envelopeId: string) {
    if (!packet) return;
    await updateContractPacket({ packetId: packet.id, envelopeId });
    router.refresh();
  }

  async function handleViewDoc() {
    if (!packet?.executedDocPath) return;
    setIsViewingDoc(true);
    const result = await getExecutedDocSignedUrl(lead.id, packet.executedDocPath);
    setIsViewingDoc(false);
    if ("url" in result) window.open(result.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{lead.contactName || "Unnamed lead"}</p>
          <p className="text-sm text-slate-500">{lead.propertyDetails.addressOrCityZip as string}</p>
        </div>
        <a href={`/dashboard/leads/${lead.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View full lead
        </a>
      </div>

      <WholesaleStageTracker stageIndex={stageIndex} />

      {!packet ? (
        <Button
          type="button"
          size="md"
          onClick={handleStart}
          isLoading={isStarting}
          icon={<FileSignature className="h-4 w-4" aria-hidden="true" />}
          iconPosition="left"
        >
          Start contract packet
        </Button>
      ) : (
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Attorney-approved template</label>
            <select
              defaultValue={packet.templateId ?? ""}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Not selected</option>
              {CONTRACT_TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Packet status</label>
            <select
              defaultValue={packet.status}
              onChange={(e) => handleStatusChange(e.target.value as ContractPacketStatus)}
              className={selectClass}
            >
              {PACKET_STATUSES.map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              E-sign envelope ID <span className="font-normal text-slate-400">(DocuSign / Dropbox Sign placeholder — no live integration; enter the envelope ID from your e-sign tool manually)</span>
            </label>
            <input
              type="text"
              defaultValue={packet.envelopeId ?? ""}
              onBlur={(e) => handleEnvelopeIdChange(e.target.value)}
              placeholder="e.g. envelope ID from DocuSign or Dropbox Sign"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Executed document</label>
            <div className="flex flex-wrap items-center gap-2">
              <ExecutedDocUpload leadId={lead.id} packetId={packet.id} hasExecutedDoc={Boolean(packet.executedDocPath)} />
              {packet.executedDocPath && (
                <button
                  type="button"
                  onClick={handleViewDoc}
                  disabled={isViewingDoc}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {isViewingDoc ? "Loading…" : "View"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
