export const BIDSNAP_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbz_tISOJkSulSDneF_SeCV2XsFstBRHkuaV8jcepFABxBcRFZIWBFylps1pJLnGg3K6Yg/exec";

export type BidSnapInputs = {
  projectType: string;
  areaSqft: number; // must match Google Script
  location: string;
  qualityLevel: string;
  additionalSpec?: string;
};

export async function apiGenerateEstimate(inputs: BidSnapInputs) {
  try {
    const res = await fetch(BIDSNAP_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "estimate",
        inputs,
      }),
    });

    const data = await res.json();
    console.log("API Estimate Response:", data); // DEBUG LOG

    if (!data.ok) throw new Error(data.error || "Estimate failed");
    return data.estimate;
  } catch (err) {
    console.error("Error in apiGenerateEstimate:", err);
    throw err;
  }
}

export async function apiGenerateProposal(inputs: BidSnapInputs, estimate: any) {
  try {
    const res = await fetch(BIDSNAP_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "proposal",
        inputs,
        estimate,
      }),
    });

    const data = await res.json();
    console.log("API Proposal Response:", data); // DEBUG LOG

    if (!data.ok) throw new Error(data.error || "Proposal failed");
    return data.proposal;
  } catch (err) {
    console.error("Error in apiGenerateProposal:", err);
    throw err;
  }
}

