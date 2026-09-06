import { Container } from "@/components/ui/Container";

export function LegalHeader({ title, updated }: { title: string; updated: string }) {
  return (
    <section className="bg-slate-900 py-14">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-slate-400">Last updated: {updated}</p>
        </div>
      </Container>
    </section>
  );
}
