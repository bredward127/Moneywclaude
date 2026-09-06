import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLead, listConsentRecordsForLead } from "@/app/actions/staff-leads";
import { listOrgPartners, listRoutesForLead } from "@/app/actions/partner-routes";
import { listNotesForLead } from "@/app/actions/lead-notes";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";
import { TypeBadge, UrgencyBadge, IntentBadge, ReviewFlagBadge } from "@/components/dashboard/LeadBadges";
import { LeadStatusControls } from "@/components/dashboard/LeadStatusControls";
import { ConsentLog } from "@/components/dashboard/ConsentLog";
import { StructuredAnswers } from "@/components/dashboard/StructuredAnswers";
import { ContactDetailsSection } from "@/components/dashboard/ContactDetailsSection";
import { LeadNotes } from "@/components/dashboard/LeadNotes";
import { PhotoGallery } from "@/components/dashboard/PhotoGallery";
import { PartnerAssignment } from "@/components/dashboard/PartnerAssignment";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lead = await getLead(id);
  if (!lead) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-semibold text-slate-900">Lead not found</p>
        <p className="mt-1 text-sm text-slate-600">
          It may not exist, or you may not have access to it.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-blue-600">
          Back to inbox
        </Link>
      </div>
    );
  }

  const [consentRecords, partners, routes, notes, me] = await Promise.all([
    listConsentRecordsForLead(id),
    listOrgPartners(),
    listRoutesForLead(id),
    listNotesForLead(id),
    getCurrentStaffProfile(),
  ]);

  const canEditProperty = me?.isPlatformOwner || me?.isAgencyAdmin || me?.canEditProperty || false;
  const canEditFinancial = me?.isPlatformOwner || me?.isAgencyAdmin || me?.canEditFinancial || false;
  const canEditContact = me?.isPlatformOwner || me?.isAgencyAdmin || me?.canEditContact || false;

  const structuredAnswers = lead.type === "seller" ? lead.propertyDetails : lead.buyerCriteria;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to inbox
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={lead.type} />
              <h1 className="text-2xl font-bold text-slate-900">{lead.contactName || "Unnamed lead"}</h1>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <UrgencyBadge lead={lead} />
              <IntentBadge lead={lead} />
              <ReviewFlagBadge lead={lead} />
            </div>
          </div>
          <LeadStatusControls leadId={lead.id} status={lead.status} humanReviewFlag={lead.humanReviewFlag} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Contact details
            </h2>
            <div className="mt-3">
              <ContactDetailsSection
                leadId={lead.id}
                contactName={lead.contactName}
                email={lead.email}
                phone={lead.phone}
                contactPref={lead.contactPref}
                createdAt={lead.createdAt}
                canEditContact={canEditContact}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Transcript & structured answers
            </h2>
            <div className="mt-3">
              <StructuredAnswers
                leadId={lead.id}
                leadType={lead.type as "seller" | "buyer"}
                answers={structuredAnswers}
                transcriptRaw={lead.transcriptRaw}
                canEditProperty={canEditProperty}
                canEditFinancial={canEditFinancial}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Property photos
            </h2>
            <div className="mt-3">
              <PhotoGallery leadId={lead.id} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Notes</h2>
            <div className="mt-3">
              <LeadNotes leadId={lead.id} initialNotes={notes} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Consent verification log
            </h2>
            <div className="mt-3">
              <ConsentLog records={consentRecords} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Partner assignment
            </h2>
            <div className="mt-3">
              <PartnerAssignment leadId={lead.id} partners={partners} initialRoutes={routes} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
