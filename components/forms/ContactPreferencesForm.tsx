"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { Field } from "./Field";
import { ChoiceGroup, type ChoiceOption } from "./ChoiceGroup";
import { SuccessPanel } from "./SuccessPanel";
import { Button } from "@/components/ui/Button";
import { inputClass } from "./styles";
import type { ContactPreferencesSubmission } from "@/lib/types";

const CONTACT_METHODS: ChoiceOption[] = [
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
];

const BEST_TIMES: ChoiceOption[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "anytime", label: "Anytime" },
];

type FormState = Omit<ContactPreferencesSubmission, "type">;

const INITIAL_STATE: FormState = {
  fullName: "",
  email: "",
  phone: "",
  preferredMethods: [],
  bestTime: "",
  optOut: false,
};

export function ContactPreferencesForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const canSubmit = form.fullName.trim() !== "" && (form.email.trim() !== "" || form.phone.trim() !== "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact-preferences", ...form }),
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
        title="Your preferences are saved"
        description={
          form.optOut
            ? "We've noted that you'd like to be removed from outreach. You will not be contacted going forward."
            : "We'll use these preferences the next time we reach out to you."
        }
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName" required>
            <input
              id="fullName"
              required
              className={inputClass}
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </Field>
          <Field label="Phone" htmlFor="phone" hint="Provide phone, email, or both.">
            <input
              id="phone"
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>

        <Field label="How should we reach you?" hint="Select all that apply.">
          <ChoiceGroup
            options={CONTACT_METHODS}
            value={form.preferredMethods}
            onChange={(v) => update("preferredMethods", v)}
            multiple
          />
        </Field>

        <Field label="Best time to reach you">
          <ChoiceGroup
            options={BEST_TIMES}
            value={form.bestTime ? [form.bestTime] : []}
            onChange={(v) => update("bestTime", v[0] ?? "")}
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-300">
          <input
            type="checkbox"
            checked={form.optOut}
            onChange={(e) => update("optOut", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">
            Please don&apos;t contact me — remove me from future outreach entirely.
          </span>
        </label>
      </div>

      {status === "error" && (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Something went wrong saving your preferences. Please try again.
        </div>
      )}

      <div className="mt-8 border-t border-slate-100 pt-6">
        <Button type="submit" isLoading={status === "submitting"} disabled={!canSubmit} fullWidth>
          Save preferences
        </Button>
      </div>
    </form>
  );
}
