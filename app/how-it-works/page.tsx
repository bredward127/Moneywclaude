import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, EyeOff, Trash2, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { ProcessTimeline } from "@/components/how-it-works/ProcessTimeline";
import { FaqAccordion } from "@/components/how-it-works/FaqAccordion";

export const metadata: Metadata = {
  title: "How It Works | Property Intake & Resource Center",
  description:
    "See exactly how your information is handled — from a 2-minute voice or typed intake to a human review before anyone reaches out.",
};

interface PrivacyPoint {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}

const PRIVACY_POINTS: PrivacyPoint[] = [
  {
    icon: EyeOff,
    title: "Never broadcast to multiple agents",
    description: "Your submission isn't published or forwarded to a list of strangers.",
  },
  {
    icon: ShieldCheck,
    title: "Reviewed by a person, every time",
    description: "A team member reads your details before any outreach happens.",
  },
  {
    icon: SlidersHorizontal,
    title: "You control how we reach out",
    description: "Choose phone, text, or email — or opt out entirely, any time.",
    href: "/contact-preferences",
    linkLabel: "Manage contact preferences",
  },
  {
    icon: Trash2,
    title: "You can request deletion",
    description: "Ask us to delete your information whenever you'd like.",
    href: "/privacy",
    linkLabel: "Read the privacy policy",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-slate-900 py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-wide text-blue-400 uppercase">
              How it works
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Fast for you. Careful with your information.
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Here&apos;s exactly what happens after you share your goals with us.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <Container className="max-w-3xl">
          <ProcessTimeline />
        </Container>
      </section>

      <section className="bg-slate-50 py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Data privacy"
            title="Your information, on your terms"
            description="We built this around one rule: nothing happens with your details until a person has looked at them."
          />

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
            {PRIVACY_POINTS.map(({ icon: Icon, title, description, href, linkLabel }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{description}</p>
                {href && (
                  <Link
                    href={href}
                    className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {linkLabel} &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <Container className="max-w-3xl">
          <SectionHeading title="Frequently asked questions" />
          <div className="mt-10">
            <FaqAccordion />
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-16">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to get started?</h2>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <LinkButton href="/sell" variant="outlineLight" size="lg" fullWidth>
                I&apos;m selling
              </LinkButton>
              <LinkButton href="/buy" size="lg" fullWidth>
                I&apos;m buying
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
