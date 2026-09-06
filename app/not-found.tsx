import { Compass } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center bg-white py-24">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Compass className="h-7 w-7 text-blue-600" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Page not found
          </h1>
          <p className="mt-3 text-slate-600">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/" variant="outlineDark">
              Back home
            </LinkButton>
            <LinkButton href="/sell">Start an intake</LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
