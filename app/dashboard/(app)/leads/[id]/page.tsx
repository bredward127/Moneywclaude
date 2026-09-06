import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLead, listConsentRecordsForLead } from "@/app/actions/staff-leads";
import { listOrgPartners, listRoutesForLead } from "@/app/actions/partner-routes";
import { TypeBadge, UrgencyBadge, IntentBadge, ReviewFlagBadge } from "@/components/dashboard/LeadBadges";
import { LeadStatusControls } from "@/components/dashboard/LeadStatusControls";
import { ConsentLog } from "@/components/dashboard/ConsentLog";
import { StructuredAnswers } from "@/components/dashboard/StructuredAnswers";
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

  const [consentRecords, partners, routes] = await Promise.all([
    listConsentRecordsForLead(id),
    listOrgPartners(),
    listRoutesForLead(id),
  ]);

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
            <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{lead.email || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Phone</dt>
                <dd className="font-medium text-slate-900">{lead.phone || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Preferred contact method</dt>
                <dd className="font-medium text-slate-900 capitalize">{lead.contactPref || "No preference"}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Submitted</dt>
                <dd className="font-medium text-slate-900">{new Date(lead.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Transcript & structured answers
            </h2>
            <div className="mt-3">
              <StructuredAnswers answers={structuredAnswers} transcriptRaw={lead.transcriptRaw} />
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
