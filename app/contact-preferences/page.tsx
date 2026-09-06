import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ContactPreferencesForm } from "@/components/forms/ContactPreferencesForm";

export const metadata: Metadata = {
  title: "Contact Preferences | Property Intake & Resource Center",
  description:
    "Choose how and when we contact you, or opt out of outreach entirely.",
};

export default function ContactPreferencesPage() {
  return (
    <>
      <section className="bg-slate-900 py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Contact Preferences
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Tell us how and when you&apos;d like to hear from us — or opt out entirely.
              You&apos;re always in control.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container className="max-w-2xl">
          <ContactPreferencesForm />
        </Container>
      </section>
    </>
  );
}
