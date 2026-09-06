import type { Metadata } from "next";
import { TrendingUp, Clock, UserCheck, Building2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PropertyIntakeWizard } from "@/components/wizard/PropertyIntakeWizard";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { BUYER_VIDEO } from "@/lib/videos";

export const metadata: Metadata = {
  title: "Buyer Intake | Property Intake & Resource Center",
  description:
    "Tell us what you're looking for in about 2 minutes, by voice or by typing — including criteria for investors.",
};

const REASONS = [
  {
    icon: Clock,
    title: "Takes about 2 minutes",
    description: "Budget, timeline, and must-haves — nothing like a mortgage application.",
  },
  {
    icon: UserCheck,
    title: "Reviewed by a person",
    description: "Your criteria isn't blasted to a list of agents. A real person reads it first.",
  },
  {
    icon: Building2,
    title: "Any property type",
    description: "Single family, condo, multi-family, or land — tell us what fits your plan.",
  },
  {
    icon: TrendingUp,
    title: "Built for investors too",
    description: "Flag cap rate targets, cash vs. financing, and portfolio goals.",
  },
];

export default function BuyPage() {
  return (
    <>
      <section className="bg-slate-900 py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-wide text-blue-400 uppercase">
              Looking to buy?
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tell us what you want
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Answer a short set of questions by voice or by typing — whether you&apos;re
              buying a home or building a rental portfolio.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <div className="mx-auto max-w-[280px] sm:max-w-xs lg:mx-0">
                  <VideoPlayer {...BUYER_VIDEO} />
                </div>
                <h2 className="mt-8 text-xl font-bold text-slate-900">
                  Why share your criteria here?
                </h2>
                <ul className="mt-6 space-y-6">
                  {REASONS.map(({ icon: Icon, title, description }) => (
                    <li key={title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{title}</p>
                        <p className="mt-1 text-sm text-slate-600">{description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <PropertyIntakeWizard mode="buyer" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
