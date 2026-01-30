import "dotenv/config";
import express from "express";
import cors from "cors";
import estimatesRouter from "./routes/estimates.js";
import proposalsRouter from "./routes/proposals.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.use("/api/estimates", estimatesRouter);
app.use("/api/proposals", proposalsRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "bidssnap-backend" });
});

app.listen(PORT, () => {
  console.log(`BidSnap API running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set – estimate generation will use mock fallback");
  }
});
