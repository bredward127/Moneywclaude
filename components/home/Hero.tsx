import { Home, Search, Mic, Clock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

const TRUST_POINTS = [
  { icon: Mic, label: "Voice or type — your choice" },
  { icon: Clock, label: "Takes about 2 minutes" },
  { icon: ShieldCheck, label: "Reviewed by a real person" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-900">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(37,99,235,0.35),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.25),transparent_40%)]"
      />
      <Container className="relative py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Buying or selling? Let&apos;s start with what you need.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Share your goals in about 2 minutes — by voice or by typing — and a real
            person reviews your details before anyone reaches out.
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Icon className="h-4 w-4 text-blue-400" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm transition-colors hover:border-blue-500/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <Home className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="mt-6 text-sm font-bold tracking-wide text-blue-400 uppercase">
              Selling a house?
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Tell Us About Your Property in 2 Minutes
            </h2>
            <p className="mt-3 flex-1 text-sm text-slate-400">
              Address, timeline, and condition — that&apos;s it. No walk-throughs, no
              pressure.
            </p>
            <LinkButton href="/sell" size="lg" fullWidth className="mt-6">
              Start Seller Intake
            </LinkButton>
          </div>

          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm transition-colors hover:border-blue-500/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <Search className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="mt-6 text-sm font-bold tracking-wide text-blue-400 uppercase">
              Looking to buy?
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">Tell Us What You Want</h2>
            <p className="mt-3 flex-1 text-sm text-slate-400">
              Budget, timeline, and must-haves — including criteria for investors.
            </p>
            <LinkButton href="/buy" size="lg" fullWidth className="mt-6">
              Start Buyer Intake
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
