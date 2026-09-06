import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

const SELLER_POINTS = [
  "Property address, type, and condition",
  "Your timeline and reason for selling",
  "A rough sense of your asking price",
];

const BUYER_POINTS = [
  "Budget, financing status, and timeline",
  "Preferred areas, size, and property type",
  "Investor criteria — cap rate, cash vs. financing",
];

export function AudienceSplit() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h3 className="text-xl font-bold text-slate-900">If you&apos;re selling</h3>
            <p className="mt-2 text-sm text-slate-600">
              We&apos;ll ask about your property and your timeline:
            </p>
            <ul className="mt-5 space-y-3">
              {SELLER_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/sell"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Start seller intake
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h3 className="text-xl font-bold text-slate-900">If you&apos;re buying</h3>
            <p className="mt-2 text-sm text-slate-600">
              We&apos;ll ask about what you&apos;re looking for:
            </p>
            <ul className="mt-5 space-y-3">
              {BUYER_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/buy"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Start buyer intake
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
