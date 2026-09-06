import type { Metadata } from "next";
import { ShieldCheck, Clock, UserCheck, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PropertyIntakeWizard } from "@/components/wizard/PropertyIntakeWizard";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SELLER_VIDEO } from "@/lib/videos";

export const metadata: Metadata = {
  title: "Seller Intake | Property Intake & Resource Center",
  description:
    "Tell us about your property in about 2 minutes, by voice or by typing. A real person reviews every submission.",
};

const REASONS = [
  {
    icon: Clock,
    title: "Takes about 2 minutes",
    description: "A handful of quick questions — nothing like a full listing application.",
  },
  {
    icon: UserCheck,
    title: "Reviewed by a person",
    description: "Your details aren't blasted to a list of agents. A real person reads them first.",
  },
  {
    icon: ShieldCheck,
    title: "No obligation",
    description: "Sharing your property details doesn't commit you to listing or selling.",
  },
  {
    icon: MapPin,
    title: "Local context matters",
    description: "We factor in your specific area, not just a generic valuation model.",
  },
];

export default function SellPage() {
  return (
    <>
      <section className="bg-slate-900 py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-wide text-blue-400 uppercase">
              Selling a house?
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tell us about your property in 2 minutes
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Answer a short set of questions by voice or by typing. No walk-throughs, no
              pressure, and no obligation to list.
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
                  <VideoPlayer {...SELLER_VIDEO} />
                </div>
                <h2 className="mt-8 text-xl font-bold text-slate-900">
                  Why share your details here?
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
              <PropertyIntakeWizard mode="seller" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
