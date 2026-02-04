import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config(); // loads your API key from .env

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate estimate
export async function generateEstimate(projectDetails) {
  const prompt = `
You are a construction cost estimator.
Generate a detailed renovation estimate in JSON format.
Include:
- Materials with quantity, unit price, and total price
- Labor cost
- Total estimate

Project Details: ${JSON.stringify(projectDetails)}
Output JSON only.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2, // low randomness for consistent results
  });

  const estimateJSON = response.choices[0].message.content;

  // Convert string to JSON
  return JSON.parse(estimateJSON);
}

// Function to generate client-ready proposal
export async function generateProposal(projectDetails, estimate) {
  const prompt = `
You are a professional renovation assistant.
Create a client-ready proposal using this project data and estimate:
Project Details: ${JSON.stringify(projectDetails)}
Estimate: ${JSON.stringify(estimate)}

Include scope of work, material and labor breakdown, professional language.
Output plain text.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}
