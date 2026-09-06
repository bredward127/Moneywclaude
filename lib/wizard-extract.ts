import type { ChoiceOption } from "@/components/forms/ChoiceGroup";
import { matchChoice } from "./wizard-match";

export interface FieldMatcher<K extends string> {
  field: K;
  options: ChoiceOption[];
}

/**
 * Scans one freeform utterance against every field's option set
 * independently, so a single sentence like "it's a vacant multifamily,
 * needs major repairs, I want to sell ASAP for a cash offer" fills every
 * matching field instead of just whichever one happened to be listening.
 */
export function extractChoiceFields<K extends string>(
  text: string,
  matchers: FieldMatcher<K>[]
): Partial<Record<K, string>> {
  const result: Partial<Record<K, string>> = {};
  for (const matcher of matchers) {
    const match = matchChoice(text, matcher.options);
    if (match) result[matcher.field] = match;
  }
  return result;
}

interface NarrativeBucket {
  field: "repairDetails" | "mortgageOrLiens" | "reasonForSelling";
  keywords: string[];
}

const NARRATIVE_BUCKETS: NarrativeBucket[] = [
  {
    field: "mortgageOrLiens",
    keywords: [
      "mortgage", "owe", "lien", "balance", "loan", "second mortgage", "heloc",
      "tax lien", "refinance", "equity",
    ],
  },
  {
    field: "repairDetails",
    keywords: [
      "repair", "roof", "hvac", "foundation", "plumbing", "electrical", "wiring",
      "needs work", "fix", "damage", "leak", "mold", "furnace", "water heater",
    ],
  },
  {
    field: "reasonForSelling",
    keywords: [
      "relocat", "moving", "divorce", "downsiz", "inherit", "financial",
      "job", "retire", "upgrad", "family", "estate", "can't afford", "behind on",
    ],
  },
];

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|(?:,\s+(?=and\s+))|\.\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Best-effort rule-based split of one freeform utterance into the three
 * narrative fields, by routing each sentence to whichever field's keywords
 * it mentions. Deliberately conservative: a sentence matching no keywords is
 * left out rather than guessed at. This is the fallback tier -- real natural
 * language understanding happens via extractNarrativeDetailsWithAI when
 * ANTHROPIC_API_KEY is configured.
 */
export function extractNarrativeFields(
  text: string
): Partial<Record<NarrativeBucket["field"], string>> {
  const sentences = splitIntoSentences(text);
  const result: Partial<Record<NarrativeBucket["field"], string[]>> = {};

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    for (const bucket of NARRATIVE_BUCKETS) {
      if (bucket.keywords.some((keyword) => lower.includes(keyword))) {
        (result[bucket.field] ??= []).push(sentence);
        break; // first matching bucket wins, avoids double-filing one sentence
      }
    }
  }

  const joined: Partial<Record<NarrativeBucket["field"], string>> = {};
  for (const bucket of NARRATIVE_BUCKETS) {
    const sentencesForField = result[bucket.field];
    if (sentencesForField?.length) joined[bucket.field] = sentencesForField.join(". ");
  }
  return joined;
}
