import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateEstimate, generateProposal } from "./ai.js";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Endpoint to generate estimate
app.post("/generateEstimate", async (req, res) => {
  try {
    const projectDetails = req.body;
    const estimate = await generateEstimate(projectDetails);

    // Optional: save to Supabase
    await supabase.from("projects").insert([
      { projectDetails, estimate }
    ]);

    res.json(estimate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate estimate" });
  }
});

// Endpoint to generate proposal
app.post("/generateProposal", async (req, res) => {
  try {
    const { projectDetails, estimate } = req.body;
    const proposal = await generateProposal(projectDetails, estimate);

    // Optional: save proposal to Supabase
    await supabase.from("projects").update({ proposal })
      .eq("projectDetails", projectDetails);

    res.send(proposal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate proposal" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
