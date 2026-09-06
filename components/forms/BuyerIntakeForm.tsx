"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, TrendingUp } from "lucide-react";
import { Field } from "./Field";
import { ChoiceGroup, type ChoiceOption } from "./ChoiceGroup";
import { VoiceTextarea } from "./VoiceTextarea";
import { ProgressSteps } from "./ProgressSteps";
import { SuccessPanel } from "./SuccessPanel";
import { DataConsentSection } from "./DataConsentSection";
import { Button } from "@/components/ui/Button";
import { inputClass } from "./styles";
import type { BuyerLead } from "@/lib/types";

const STEPS = ["Criteria", "Budget", "Contact"];

const PROPERTY_TYPES: ChoiceOption[] = [
  { value: "single-family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi-family", label: "Multi-Family" },
  { value: "land", label: "Land" },
];

const BEDROOMS: ChoiceOption[] = [
  { value: "any", label: "Any" },
  { value: "1+", label: "1+" },
  { value: "2+", label: "2+" },
  { value: "3+", label: "3+" },
  { value: "4+", label: "4+" },
];

const FINANCING: ChoiceOption[] = [
  { value: "cash", label: "Cash buyer" },
  { value: "pre-approved", label: "Pre-approved" },
  { value: "need-financing", label: "Need financing" },
];

const TIMELINES: ChoiceOption[] = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "6-12-months", label: "6–12 months" },
  { value: "exploring", label: "Just exploring" },
];

const CONTACT_METHODS: ChoiceOption[] = [
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
];

type FormState = Omit<BuyerLead, "type">;

const INITIAL_STATE: FormState = {
  propertyTypes: [],
  areas: "",
  bedrooms: "",
  budgetMin: "",
  budgetMax: "",
  financing: "",
  timeline: "",
  isInvestor: false,
  investorNotes: "",
  notes: "",
  consent: false,
  contact: { fullName: "", email: "", phone: "", preferredContact: "" },
};

export function BuyerIntakeForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateContact(key: keyof FormState["contact"], value: string) {
    setForm((prev) => ({ ...prev, contact: { ...prev.contact, [key]: value } }));
  }

  const canProceedFromStep0 = form.propertyTypes.length > 0 && form.areas.trim() !== "";
  const canProceedFromStep1 = form.financing !== "" && form.timeline !== "";
  const canSubmit =
    form.contact.fullName.trim() !== "" &&
    (form.contact.email.trim() !== "" || form.contact.phone.trim() !== "") &&
    form.consent;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "buyer", ...form }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <SuccessPanel
        title="Thanks — we've got your criteria"
        description="A member of our team will review what you're looking for and reach out using your preferred contact method, usually within one business day."
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <ProgressSteps steps={STEPS} currentStep={step} />

      <div className="mt-8 space-y-6">
        {step === 0 && (
          <>
            <Field label="Property type" required hint="Select all that apply.">
              <ChoiceGroup
                options={PROPERTY_TYPES}
                value={form.propertyTypes}
                onChange={(v) => update("propertyTypes", v)}
                multiple
              />
            </Field>
            <Field
              label="Preferred areas"
              htmlFor="areas"
              required
              hint="Cities, neighborhoods, or ZIP codes."
            >
              <input
                id="areas"
                required
                className={inputClass}
                value={form.areas}
                onChange={(e) => update("areas", e.target.value)}
                placeholder="Downtown, Maple Heights, 90210"
              />
            </Field>
            <Field label="Minimum bedrooms">
              <ChoiceGroup
                options={BEDROOMS}
                value={form.bedrooms ? [form.bedrooms] : []}
                onChange={(v) => update("bedrooms", v[0] ?? "")}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Minimum budget" htmlFor="budgetMin">
                <input
                  id="budgetMin"
                  className={inputClass}
                  value={form.budgetMin}
                  onChange={(e) => update("budgetMin", e.target.value)}
                  placeholder="$200,000"
                />
              </Field>
              <Field label="Maximum budget" htmlFor="budgetMax">
                <input
                  id="budgetMax"
                  className={inputClass}
                  value={form.budgetMax}
                  onChange={(e) => update("budgetMax", e.target.value)}
                  placeholder="$400,000"
                />
              </Field>
            </div>
            <Field label="Financing status" required>
              <ChoiceGroup
                options={FINANCING}
                value={form.financing ? [form.financing] : []}
                onChange={(v) => update("financing", v[0] ?? "")}
              />
            </Field>
            <Field label="Timeline" required>
              <ChoiceGroup
                options={TIMELINES}
                value={form.timeline ? [form.timeline] : []}
                onChange={(v) => update("timeline", v[0] ?? "")}
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-300">
              <input
                type="checkbox"
                checked={form.isInvestor}
                onChange={(e) => update("isInvestor", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                <span className="text-sm text-slate-700">
                  I&apos;m buying as an investor (rental, flip, or portfolio addition)
                </span>
              </span>
            </label>

            {form.isInvestor && (
              <Field
                label="Investor criteria"
                htmlFor="investorNotes"
                hint="Target cap rate, cash vs. financing, number of units, etc."
              >
                <input
                  id="investorNotes"
                  className={inputClass}
                  value={form.investorNotes}
                  onChange={(e) => update("investorNotes", e.target.value)}
                  placeholder="8%+ cap rate, cash purchase, open to multi-family"
                />
              </Field>
            )}

            <Field label="Anything else we should know?" htmlFor="notes">
              <VoiceTextarea
                id="notes"
                value={form.notes}
                onChange={(v) => update("notes", v)}
                placeholder="Must-haves, deal breakers, school districts…"
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" required>
                <input
                  id="fullName"
                  required
                  className={inputClass}
                  value={form.contact.fullName}
                  onChange={(e) => updateContact("fullName", e.target.value)}
                />
              </Field>
              <Field label="Phone" htmlFor="phone" hint="Provide phone, email, or both.">
                <input
                  id="phone"
                  type="tel"
                  className={inputClass}
                  value={form.contact.phone}
                  onChange={(e) => updateContact("phone", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Email" htmlFor="email">
              <input
                id="email"
                type="email"
                className={inputClass}
                value={form.contact.email}
                onChange={(e) => updateContact("email", e.target.value)}
              />
            </Field>
            <Field label="Preferred contact method">
              <ChoiceGroup
                options={CONTACT_METHODS}
                value={form.contact.preferredContact ? [form.contact.preferredContact] : []}
                onChange={(v) => updateContact("preferredContact", v[0] ?? "")}
              />
            </Field>
            <DataConsentSection
              checked={form.consent}
              onChange={(v) => update("consent", v)}
              consentLabel="I understand my buying criteria will be reviewed by a real person before anyone reaches out."
            />
          </>
        )}
      </div>

      {status === "error" && (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Something went wrong sending your information. Please try again.
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
        {step > 0 ? (
          <Button
            type="button"
            variant="ghost"
            icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
            iconPosition="left"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
        ) : (
          <span />
        )}

        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            disabled={step === 0 ? !canProceedFromStep0 : !canProceedFromStep1}
            icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue
          </Button>
        ) : (
          <Button type="submit" isLoading={status === "submitting"} disabled={!canSubmit}>
            Submit
          </Button>
        )}
      </div>
    </form>
  );
}
