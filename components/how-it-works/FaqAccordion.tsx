"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Will I get calls from a bunch of different agents?",
    a: "No. Your submission goes to one team first. We don't broadcast your information to a list of agents — we review it and connect you with what's relevant to your specific request.",
  },
  {
    q: "Who actually reviews my submission?",
    a: "A real person on our team reviews every intake before any outreach happens. Nothing is auto-forwarded the moment you hit submit.",
  },
  {
    q: "Is my information secure?",
    a: "Your details are transmitted securely and used only to understand your goals and connect you with the right local resource — see our Privacy Policy for the full details.",
  },
  {
    q: "Can I change how you contact me, or opt out?",
    a: "Yes. Visit Contact Preferences any time to update your preferred contact method or opt out of future outreach entirely.",
  },
  {
    q: "Does submitting the form cost anything or commit me to selling or buying?",
    a: "No. Sharing your information is free and doesn't obligate you to list your property, make an offer, or move forward with anything.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {FAQS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-semibold text-slate-900">{item.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5">
                <p className="text-sm text-slate-600">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
