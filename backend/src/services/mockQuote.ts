import type { EstimateInput, QuoteData, LineItem } from "../types/estimate.js";

/** Build a mock quote from form input when ANTHROPIC_API_KEY is not set */
export function mockQuoteFromInput(input: EstimateInput, quoteId: string): QuoteData {
  const now = new Date().toISOString();
  const base = input.areaSquareFeet * 10;
  const materials = Math.round(base * 0.6);
  const labor = Math.round(base * 0.35);
  const other = Math.round(base * 0.05);
  const total = materials + labor + other;
  const min = Math.round(total * 0.9);
  const max = Math.round(total * 1.15);

  const lineItems: LineItem[] = [
    {
      id: `${quoteId}_1`,
      category: "materials",
      item: `${input.qualityLevel} materials`,
      quantity: Math.ceil(input.areaSquareFeet / 100),
      unit: "units",
      unitCost: Math.round(materials / Math.ceil(input.areaSquareFeet / 100)),
      totalCost: materials,
      editable: true,
    },
    {
      id: `${quoteId}_2`,
      category: "labor",
      item: "Labor",
      quantity: Math.ceil(input.areaSquareFeet / 400),
      unit: "days",
      unitCost: Math.round(labor / Math.ceil(input.areaSquareFeet / 400)),
      totalCost: labor,
      editable: true,
    },
    {
      id: `${quoteId}_3`,
      category: "other",
      item: "Supplies & misc",
      quantity: 1,
      unit: "lot",
      unitCost: other,
      totalCost: other,
      editable: true,
    },
  ];

  return {
    id: quoteId,
    projectInfo: input,
    lineItems,
    totals: {
      materials,
      labor,
      other,
      subtotal: total,
      total,
    },
    totalCostRange: { min, max, currency: "USD" },
    timeline: { min: 3, max: 7, unit: "days" },
    confidence: "medium",
    assumptions: [
      `Based on ${input.areaSquareFeet} sq ft, ${input.qualityLevel} quality.`,
      "Location: " + input.location,
      input.notes ? "Notes: " + input.notes : "Standard assumptions applied.",
    ].filter(Boolean),
    createdAt: now,
    updatedAt: now,
  };
}
