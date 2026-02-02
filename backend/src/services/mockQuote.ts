import type { EstimateInput, QuoteData, LineItem } from "../types/estimate.js";

/** Build a mock quote from form input when ANTHROPIC_API_KEY is not set (INR) */
export function mockQuoteFromInput(input: EstimateInput, quoteId: string): QuoteData {
  const now = new Date().toISOString();
  
  // Base rate per sq ft in INR (varies by quality)
  const ratePerSqFt = input.qualityLevel === "premium" ? 85 : input.qualityLevel === "standard" ? 65 : 45;
  const base = input.areaSquareFeet * ratePerSqFt;
  
  const materials = Math.round(base * 0.55);
  const labor = Math.round(base * 0.38);
  const other = Math.round(base * 0.07);
  const total = materials + labor + other;
  const min = Math.round(total * 0.9);
  const max = Math.round(total * 1.2);

  const materialQty = Math.ceil(input.areaSquareFeet / 80);
  const laborDays = Math.ceil(input.areaSquareFeet / 300);

  const lineItems: LineItem[] = [
    {
      id: `${quoteId}_1`,
      category: "materials",
      item: `${input.qualityLevel === "premium" ? "Premium" : input.qualityLevel === "standard" ? "Standard" : "Basic"} Materials`,
      quantity: materialQty,
      unit: "units",
      unitCost: Math.round(materials / materialQty),
      totalCost: materials,
      editable: true,
      notes: `For ${input.projectType.toLowerCase()}`,
    },
    {
      id: `${quoteId}_2`,
      category: "labor",
      item: "Skilled Labor",
      quantity: laborDays,
      unit: "days",
      unitCost: Math.round(labor / laborDays),
      totalCost: labor,
      editable: true,
      notes: "Includes 2 workers",
    },
    {
      id: `${quoteId}_3`,
      category: "other",
      item: "Supplies & Miscellaneous",
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
    totalCostRange: { min, max, currency: "INR" },
    timeline: { min: Math.max(3, laborDays - 1), max: laborDays + 3, unit: "days" },
    confidence: "medium",
    assumptions: [
      `Based on ${input.areaSquareFeet} sq ft area`,
      `${input.qualityLevel.charAt(0).toUpperCase() + input.qualityLevel.slice(1)} quality materials`,
      `Location: ${input.location}`,
      input.notes ? `Notes: ${input.notes}` : "Standard assumptions applied",
      "Prices in Indian Rupees (INR)",
    ].filter(Boolean) as string[],
    createdAt: now,
    updatedAt: now,
  };
}
