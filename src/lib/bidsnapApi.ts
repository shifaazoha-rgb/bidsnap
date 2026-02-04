export const BIDSNAP_API_BASE = "http://localhost:3001/api";

export type BidSnapInputs = {
  projectType: string;
  areaSqft: number; // must match Google Script
  location: string;
  qualityLevel: string;
  additionalSpec?: string;
};

import type { QuoteData } from "../types/estimate";

export async function apiGenerateEstimate(inputs: BidSnapInputs): Promise<QuoteData> {
  try {
    const res = await fetch(`${BIDSNAP_API_BASE}/estimates/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectType: inputs.projectType,
        areaSquareFeet: inputs.areaSqft,
        qualityLevel: inputs.qualityLevel,
        location: inputs.location,
        notes: inputs.additionalSpec,
      }),
    });

    const data = await res.json();
    console.log("API Generate Response:", data);

    if (!res.ok) throw new Error(data.error || "Generation failed");
    return data as QuoteData;
  } catch (err) {
    console.error("Error in apiGenerateEstimate:", err);
    throw err;
  }
}

