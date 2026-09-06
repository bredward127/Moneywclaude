import Link from "next/link";
import { ArrowRight, MessageSquareText, UserCheck, PhoneCall } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    icon: MessageSquareText,
    title: "1. Share your goals",
    description: "Answer a short set of questions by voice or by typing — about 2 minutes.",
  },
  {
    icon: UserCheck,
    title: "2. A person reviews it",
    description: "No mass-blast to dozens of agents. A real person looks at your details first.",
  },
  {
    icon: PhoneCall,
    title: "3. You get connected",
    description: "We reach out using the contact method you choose, on your timeline.",
  },
];

export function ProcessPreview() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Simple, human, and fast"
          description="No spam, no obligation, and no juggling calls from a dozen strangers."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            See our full privacy &amp; review process
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
