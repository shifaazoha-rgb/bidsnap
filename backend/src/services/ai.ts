import Anthropic from "@anthropic-ai/sdk";
import type { EstimateInput, QuoteData, LineItem } from "../types/estimate.js";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are an expert construction estimator. Generate accurate, realistic quotes in JSON only.

Output a single valid JSON object (no markdown, no code fence) with this exact shape:
{
  "totalCostRange": { "min": number, "max": number, "currency": "USD" },
  "timeline": { "min": number, "max": number, "unit": "days" },
  "confidence": "low" | "medium" | "high",
  "breakdown": { "materials": number, "labor": number, "other": number },
  "lineItems": [
    { "category": "materials"|"labor"|"equipment"|"other", "item": string, "quantity": number, "unit": string, "unitCost": number, "notes": string (optional) }
  ],
  "assumptions": string[]
}

Use realistic prices for the project type, area, quality, and location. Quantities and unit costs should be plausible.`;

export async function generateQuote(input: EstimateInput, quoteId: string): Promise<QuoteData> {
  const userPrompt = `Create a detailed estimate for:
- Project: ${input.projectType}
- Area: ${input.areaSquareFeet} sq ft
- Quality: ${input.qualityLevel}
- Location: ${input.location}
${input.notes ? `- Notes: ${input.notes}` : ""}

Respond with only the JSON object, no other text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content
    .filter((block): block is { type: "text"; text: string } => block.type === "text")
    .map((b) => b.text)
    .join("");
  const raw = text.replace(/```json?\s*|\s*```/g, "").trim();
  const parsed = JSON.parse(raw) as {
    totalCostRange: { min: number; max: number; currency: string };
    timeline: { min: number; max: number; unit: string };
    confidence: "low" | "medium" | "high";
    breakdown: { materials: number; labor: number; other: number };
    lineItems: Array<{
      category: LineItem["category"];
      item: string;
      quantity: number;
      unit: string;
      unitCost: number;
      notes?: string;
    }>;
    assumptions: string[];
  };

  const now = new Date().toISOString();
  const lineItems: LineItem[] = parsed.lineItems.map((row, i) => {
    const totalCost = row.quantity * row.unitCost;
    return {
      id: `${quoteId}_${i + 1}`,
      category: row.category,
      item: row.item,
      quantity: row.quantity,
      unit: row.unit,
      unitCost: row.unitCost,
      totalCost,
      editable: true,
      notes: row.notes,
    };
  });

  const totals = {
    materials: parsed.breakdown.materials,
    labor: parsed.breakdown.labor,
    other: parsed.breakdown.other,
    subtotal: parsed.breakdown.materials + parsed.breakdown.labor + parsed.breakdown.other,
    total: parsed.breakdown.materials + parsed.breakdown.labor + parsed.breakdown.other,
  };

  const quote: QuoteData = {
    id: quoteId,
    projectInfo: input,
    lineItems,
    totals,
    totalCostRange: parsed.totalCostRange,
    timeline: parsed.timeline,
    confidence: parsed.confidence,
    assumptions: parsed.assumptions,
    createdAt: now,
    updatedAt: now,
  };

  return quote;
}
