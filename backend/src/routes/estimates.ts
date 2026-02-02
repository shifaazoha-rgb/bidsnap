import { Router, type Request, type Response } from "express";
import { getEstimate, setEstimate } from "../store.js";
import { generateQuote } from "../services/ai.js";
import { mockQuoteFromInput } from "../services/mockQuote.js";
import type { EstimateInput, QuoteData } from "../types/estimate.js";

const router = Router();

function generateId(): string {
  return `est_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** POST /api/estimates/generate – generate new estimate using AI (or mock if no API key) */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const body = req.body as EstimateInput;
    const { projectType, areaSquareFeet, qualityLevel, location, notes } = body;

    if (
      !projectType ||
      typeof areaSquareFeet !== "number" ||
      areaSquareFeet <= 0 ||
      areaSquareFeet > 100000 ||
      !qualityLevel ||
      !location ||
      location.length < 3
    ) {
      res.status(400).json({
        error: "Invalid input",
        details: "projectType, areaSquareFeet (1–100000), qualityLevel, and location (min 3 chars) required",
      });
      return;
    }

    const input: EstimateInput = {
      projectType,
      areaSquareFeet,
      qualityLevel: qualityLevel as EstimateInput["qualityLevel"],
      location,
      notes: notes && String(notes).slice(0, 500),
    };

    const quoteId = generateId();
    let quote: QuoteData;
    if (process.env.ANTHROPIC_API_KEY) {
      quote = await generateQuote(input, quoteId);
    } else {
      quote = mockQuoteFromInput(input, quoteId);
    }
    await setEstimate(quote);
    res.status(201).json(quote);
  } catch (err) {
    console.error("POST /api/estimates/generate", err);
    res.status(500).json({ error: "Failed to generate estimate" });
  }
});

/** GET /api/estimates/:id – retrieve saved estimate */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    const quote = id ? await getEstimate(id) : undefined;
    if (!quote) {
      res.status(404).json({ error: "Estimate not found" });
      return;
    }
    res.json(quote);
  } catch (err) {
    console.error("GET /api/estimates/:id", err);
    res.status(500).json({ error: "Failed to get estimate" });
  }
});

/** PUT /api/estimates/:id – update estimate after edits */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    const existing = id ? await getEstimate(id) : undefined;
    if (!existing) {
      res.status(404).json({ error: "Estimate not found" });
      return;
    }
    const body = req.body as Partial<QuoteData>;
    const updated: QuoteData = {
      ...existing,
      ...body,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    await setEstimate(updated);
    res.json(updated);
  } catch (err) {
    console.error("PUT /api/estimates/:id", err);
    res.status(500).json({ error: "Failed to update estimate" });
  }
});

/** POST /api/estimates/:id/duplicate – clone estimate */
router.post("/:id/duplicate", async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    const existing = id ? await getEstimate(id) : undefined;
    if (!existing) {
      res.status(404).json({ error: "Estimate not found" });
      return;
    }
    const newId = generateId();
    const now = new Date().toISOString();
    const cloned: QuoteData = {
      ...existing,
      id: newId,
      lineItems: existing.lineItems.map((item) => ({
        ...item,
        id: `${newId}_${item.id.split("_").pop() ?? item.id}`,
      })),
      createdAt: now,
      updatedAt: now,
    };
    await setEstimate(cloned);
    res.status(201).json(cloned);
  } catch (err) {
    console.error("POST /api/estimates/:id/duplicate", err);
    res.status(500).json({ error: "Failed to duplicate estimate" });
  }
});

export default router;
