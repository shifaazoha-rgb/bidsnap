import { Router, type Request, type Response } from "express";
import { getEstimate } from "../store.js";

const router = Router();

/** POST /api/proposals/generate – generate PDF proposal (placeholder) */
router.post("/generate", (req: Request, res: Response) => {
  const { estimateId } = req.body as { estimateId?: string };
  if (!estimateId) {
    res.status(400).json({ error: "estimateId required" });
    return;
  }
  const quote = getEstimate(estimateId);
  if (!quote) {
    res.status(404).json({ error: "Estimate not found" });
    return;
  }
  // TODO: Use PDFKit or Puppeteer to generate PDF, upload to storage, return URL
  res.json({
    message: "PDF generation not yet implemented",
    estimateId,
    pdfUrl: null,
  });
});

export default router;
