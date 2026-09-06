import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Resources | Property Intake & Resource Center",
  description:
    "Straightforward guides for common seller and buyer situations — inherited homes, major repairs, and finding your first investment deal.",
};

export default function ArticlesIndexPage() {
  return (
    <>
      <section className="bg-slate-900 py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-wide text-blue-400 uppercase">Resources</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Guides for real situations, not generic advice
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Straightforward answers for the seller and buyer situations we hear about most.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <Container>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 p-6 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
              >
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    article.audience === "seller"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-teal-100 text-teal-700"
                  }`}
                >
                  {article.audience}
                </span>
                <h2 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-700">
                  {article.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-slate-600">{article.description}</p>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {article.readTime}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-blue-600 group-hover:gap-1.5">
                    Read
                    <ArrowRight className="h-4 w-4 transition-all" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
