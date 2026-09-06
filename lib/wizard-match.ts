import type { ChoiceOption } from "@/components/forms/ChoiceGroup";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function overlapScore(normalizedTranscript: string, label: string): number {
  const words = normalize(label).split(" ").filter(Boolean);
  if (words.length === 0) return 0;
  const matched = words.filter((word) => normalizedTranscript.includes(word));
  return matched.length / words.length;
}

const MATCH_THRESHOLD = 0.5;

/** Best single matching option for a spoken answer, or null if nothing scores highly enough. */
export function matchChoice(transcript: string, options: ChoiceOption[]): string | null {
  const normalized = normalize(transcript);
  if (!normalized) return null;

  let best: { value: string; score: number } | null = null;
  for (const option of options) {
    const score = overlapScore(normalized, option.label);
    if (score > 0 && (!best || score > best.score)) {
      best = { value: option.value, score };
    }
  }

  return best && best.score >= MATCH_THRESHOLD ? best.value : null;
}

/** All options a spoken answer plausibly refers to, for multi-select steps. */
export function matchChoices(transcript: string, options: ChoiceOption[]): string[] {
  const normalized = normalize(transcript);
  if (!normalized) return [];

  return options
    .filter((option) => overlapScore(normalized, option.label) >= MATCH_THRESHOLD)
    .map((option) => option.value);
}

/** Pulls the first plain number out of spoken text, e.g. "around 350000 dollars" -> "350000". */
export function extractNumber(transcript: string): string | null {
  const match = transcript.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? match[0] : null;
}
