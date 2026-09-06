import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { ARTICLES, getArticle } from "@/lib/articles";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: `${article.title} | Property Intake & Resource Center`,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: "2026-09-06",
    publisher: {
      "@type": "Organization",
      name: "Property Resource",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-slate-900 py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span
              className={`inline-block w-fit rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                article.audience === "seller"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-teal-500/20 text-teal-300"
              }`}
            >
              {article.audience} guide
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-400">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {article.readTime}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container className="max-w-4xl">
          <div className="grid grid-cols-1 items-start gap-10 sm:grid-cols-[1fr_220px]">
            <p className="text-lg text-slate-700">{article.intro}</p>
            <div className="mx-auto w-full max-w-[220px]">
              <VideoPlayer {...article.video} />
            </div>
          </div>

          <div className="mt-12 space-y-10">
            {article.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-xl font-bold text-slate-900">{section.heading}</h2>
                <div className="mt-3 space-y-4">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index} className="text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-16">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to talk about your situation?
            </h2>
            <p className="text-slate-300">
              Share your goals by voice or typing in about two minutes — no obligation, reviewed
              by a real person.
            </p>
            <LinkButton href={article.ctaHref} size="lg">
              {article.ctaLabel}
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
