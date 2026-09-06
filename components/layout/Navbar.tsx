"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const NAV_LINKS = [
  { href: "/sell", label: "Sell" },
  { href: "/buy", label: "Buy" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/articles", label: "Resources" },
];

function isNavLinkActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = isNavLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sell"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Sell
          </Link>
          <Link
            href="/buy"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-900/30 transition-colors hover:bg-blue-700"
          >
            Buy
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-white/10 bg-slate-900 px-4 pt-2 pb-6 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = isNavLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/sell"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Selling a house?
            </Link>
            <Link
              href="/buy"
              onClick={() => setIsOpen(false)}
              className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-blue-900/30 transition-colors hover:bg-blue-700"
            >
              Looking to buy?
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
