"use server";

// Optional AI tier for turning one freeform spoken description into several
// structured fields at once. Gated entirely behind ANTHROPIC_API_KEY: every
// exported function here returns null immediately if it's unset, or if the
// Anthropic call fails for any reason, so callers always have
// lib/wizard-extract.ts's rule-based extraction to fall back to. Nothing
// here is required for the wizard to work -- it just makes the voice intake
// smarter when a key is configured.

import { PROPERTY_TYPES, OCCUPANCY, CONDITION, TIMELINE, NEXT_STEP } from "@/lib/seller-options";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

export interface PropertyDetailsExtraction {
  propertyType?: string;
  occupancy?: string;
  condition?: string;
  timeline?: string;
  nextStep?: string;
}

export interface NarrativeDetailsExtraction {
  repairDetails?: string;
  mortgageOrLiens?: string;
  reasonForSelling?: string;
}

interface ExtractionTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

async function callExtractionTool<F extends string>(
  transcript: string,
  tool: ExtractionTool,
  fields: F[]
): Promise<Partial<Record<F, string>> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !transcript.trim()) return null;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 512,
        tools: [tool],
        tool_choice: { type: "tool", name: tool.name },
        messages: [
          {
            role: "user",
            content:
              `A home seller said the following about their property, in their own words. ` +
              `Extract only what they clearly stated -- never guess, infer, or fill in a ` +
              `field they didn't actually mention.\n\n"${transcript}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("[ai-extract] Anthropic API error", response.status, await response.text());
      return null;
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; input?: unknown }>;
    };
    const toolUse = data.content?.find((block) => block.type === "tool_use");
    const input = toolUse?.input;
    if (!input || typeof input !== "object") return null;

    const result: Partial<Record<F, string>> = {};
    for (const field of fields) {
      const value = (input as Record<string, unknown>)[field];
      if (typeof value === "string" && value.trim()) {
        result[field] = value.trim();
      }
    }
    return result;
  } catch (err) {
    console.error(`[ai-extract] ${tool.name} threw`, err);
    return null;
  }
}

export async function extractPropertyDetailsWithAI(
  transcript: string
): Promise<PropertyDetailsExtraction | null> {
  const result = await callExtractionTool<keyof PropertyDetailsExtraction & string>(
    transcript,
    {
      name: "extract_property_details",
      description:
        "Record the seller's property type, occupancy, condition, timeline to sell, and " +
        "desired next step -- but only the fields the speaker actually stated.",
      input_schema: {
        type: "object",
        properties: {
          propertyType: {
            type: "string",
            enum: PROPERTY_TYPES.map((o) => o.value),
            description: "The kind of property, if stated.",
          },
          occupancy: {
            type: "string",
            enum: OCCUPANCY.map((o) => o.value),
            description:
              "Whether it's owner-occupied, vacant, tenant-occupied, or inherited, if stated.",
          },
          condition: {
            type: "string",
            enum: CONDITION.map((o) => o.value),
            description: "The property's condition, if stated.",
          },
          timeline: {
            type: "string",
            enum: TIMELINE.map((o) => o.value),
            description: "How soon they want to sell, if stated.",
          },
          nextStep: {
            type: "string",
            enum: NEXT_STEP.map((o) => o.value),
            description: "What they want to happen next, if stated.",
          },
        },
      },
    },
    ["propertyType", "occupancy", "condition", "timeline", "nextStep"]
  );
  if (!result) return null;

  // Defense in depth: only trust values that are actually valid options, even
  // though the schema's enum already constrains what the model can return.
  if (result.propertyType && !PROPERTY_TYPES.some((o) => o.value === result.propertyType)) {
    delete result.propertyType;
  }
  if (result.occupancy && !OCCUPANCY.some((o) => o.value === result.occupancy)) {
    delete result.occupancy;
  }
  if (result.condition && !CONDITION.some((o) => o.value === result.condition)) {
    delete result.condition;
  }
  if (result.timeline && !TIMELINE.some((o) => o.value === result.timeline)) {
    delete result.timeline;
  }
  if (result.nextStep && !NEXT_STEP.some((o) => o.value === result.nextStep)) {
    delete result.nextStep;
  }
  return result;
}

export async function extractNarrativeDetailsWithAI(
  transcript: string
): Promise<NarrativeDetailsExtraction | null> {
  return callExtractionTool<keyof NarrativeDetailsExtraction & string>(
    transcript,
    {
      name: "extract_narrative_details",
      description:
        "Split what the seller said into repair needs, mortgage or lien details, and reason " +
        "for selling -- only the topics they actually brought up.",
      input_schema: {
        type: "object",
        properties: {
          repairDetails: {
            type: "string",
            description:
              "What they said about repairs, condition issues, or needed work. Omit if not mentioned.",
          },
          mortgageOrLiens: {
            type: "string",
            description:
              "What they said about mortgage balance, liens, or loans owed. Omit if not mentioned.",
          },
          reasonForSelling: {
            type: "string",
            description: "What they said about why they're selling. Omit if not mentioned.",
          },
        },
      },
    },
    ["repairDetails", "mortgageOrLiens", "reasonForSelling"]
  );
}
