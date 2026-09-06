"use client";

import { EditableField } from "./EditableField";
import { updateLeadContactInfo } from "@/app/actions/lead-fields";

export function ContactDetailsSection({
  leadId,
  contactName,
  email,
  phone,
  contactPref,
  createdAt,
  canEditContact,
}: {
  leadId: string;
  contactName: string;
  email: string;
  phone: string;
  contactPref: string;
  createdAt: string;
  canEditContact: boolean;
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      <EditableField
        label="Full name"
        value={contactName}
        editable={canEditContact}
        onSave={(v) => updateLeadContactInfo(leadId, { contactName: v })}
      />
      <EditableField
        label="Email"
        value={email}
        editable={canEditContact}
        onSave={(v) => updateLeadContactInfo(leadId, { email: v })}
      />
      <EditableField
        label="Phone"
        value={phone}
        editable={canEditContact}
        onSave={(v) => updateLeadContactInfo(leadId, { phone: v })}
      />
      <EditableField
        label="Preferred contact method"
        value={contactPref}
        editable={canEditContact}
        onSave={(v) => updateLeadContactInfo(leadId, { contactPref: v })}
      />
      <div className="py-2.5">
        <dt className="text-sm text-slate-500">Submitted</dt>
        <dd className="text-sm font-medium text-slate-900">{new Date(createdAt).toLocaleString()}</dd>
      </div>
    </dl>
  );
}
