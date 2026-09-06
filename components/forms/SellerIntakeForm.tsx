"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Field } from "./Field";
import { ChoiceGroup, type ChoiceOption } from "./ChoiceGroup";
import { VoiceTextarea } from "./VoiceTextarea";
import { ProgressSteps } from "./ProgressSteps";
import { SuccessPanel } from "./SuccessPanel";
import { Button } from "@/components/ui/Button";
import { inputClass } from "./styles";
import type { SellerLead } from "@/lib/types";

const STEPS = ["Property", "Details", "Contact"];

const PROPERTY_TYPES: ChoiceOption[] = [
  { value: "single-family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi-family", label: "Multi-Family" },
  { value: "land", label: "Land" },
  { value: "other", label: "Other" },
];

const TIMELINES: ChoiceOption[] = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "6-12-months", label: "6–12 months" },
  { value: "exploring", label: "Just exploring" },
];

const CONDITIONS: ChoiceOption[] = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "needs-work", label: "Needs work" },
];

const CONTACT_METHODS: ChoiceOption[] = [
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
];

type FormState = Omit<SellerLead, "type">;

const INITIAL_STATE: FormState = {
  address: "",
  city: "",
  state: "",
  zip: "",
  propertyType: "",
  timeline: "",
  condition: "",
  estimatedValue: "",
  notes: "",
  contact: { fullName: "", email: "", phone: "", preferredContact: "" },
};

export function SellerIntakeForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateContact(key: keyof FormState["contact"], value: string) {
    setForm((prev) => ({ ...prev, contact: { ...prev.contact, [key]: value } }));
  }

  const canProceedFromStep0 =
    form.address.trim() !== "" && form.city.trim() !== "" && form.propertyType !== "";
  const canProceedFromStep1 = form.timeline !== "" && form.condition !== "";
  const canSubmit =
    form.contact.fullName.trim() !== "" &&
    (form.contact.email.trim() !== "" || form.contact.phone.trim() !== "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "seller", ...form }),
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
        title="Thanks — we've got your details"
        description="A member of our team will review your property information and reach out using your preferred contact method, usually within one business day."
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
            <Field label="Street address" htmlFor="address" required>
              <input
                id="address"
                required
                className={inputClass}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="123 Main St"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="City" htmlFor="city" required>
                <input
                  id="city"
                  required
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </Field>
              <Field label="State" htmlFor="state">
                <input
                  id="state"
                  className={inputClass}
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                />
              </Field>
              <Field label="ZIP" htmlFor="zip">
                <input
                  id="zip"
                  className={inputClass}
                  value={form.zip}
                  onChange={(e) => update("zip", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Property type" required>
              <ChoiceGroup
                options={PROPERTY_TYPES}
                value={form.propertyType ? [form.propertyType] : []}
                onChange={(v) => update("propertyType", v[0] ?? "")}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="How soon are you looking to sell?" required>
              <ChoiceGroup
                options={TIMELINES}
                value={form.timeline ? [form.timeline] : []}
                onChange={(v) => update("timeline", v[0] ?? "")}
              />
            </Field>
            <Field label="Property condition" required>
              <ChoiceGroup
                options={CONDITIONS}
                value={form.condition ? [form.condition] : []}
                onChange={(v) => update("condition", v[0] ?? "")}
              />
            </Field>
            <Field
              label="Estimated value (optional)"
              htmlFor="estimatedValue"
              hint="A rough number is fine."
            >
              <input
                id="estimatedValue"
                className={inputClass}
                value={form.estimatedValue}
                onChange={(e) => update("estimatedValue", e.target.value)}
                placeholder="$350,000"
              />
            </Field>
            <Field label="Anything else we should know?" htmlFor="notes">
              <VoiceTextarea
                id="notes"
                value={form.notes}
                onChange={(v) => update("notes", v)}
                placeholder="Recent upgrades, tenants, liens, ideal closing date…"
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
