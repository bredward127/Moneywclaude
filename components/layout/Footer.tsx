import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ARTICLES } from "@/lib/articles";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Get Started",
    links: [
      { href: "/sell", label: "Seller Intake" },
      { href: "/buy", label: "Buyer Intake" },
      { href: "/how-it-works", label: "How It Works" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/articles", label: "All Articles" },
      ...ARTICLES.map((article) => ({
        href: `/articles/${article.slug}`,
        label: article.shortTitle,
      })),
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" },
      { href: "/contact-preferences", label: "Contact Preferences" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              A fast, voice-first way to share your buying or selling goals — reviewed by a
              real person before anyone reaches out.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
          <p>
            &copy; {year} Property Resource. This service helps connect you with local real
            estate resources and does not itself act as a licensed broker, agent, lender, or
            appraiser.
          </p>
        </div>
      </div>
    </footer>
  );
}
