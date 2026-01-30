import type { QuoteData } from "./types/estimate.js";

/** In-memory store for MVP. Replace with PostgreSQL/MongoDB later. */
const estimates = new Map<string, QuoteData>();

export function getEstimate(id: string): QuoteData | undefined {
  return estimates.get(id);
}

export function setEstimate(quote: QuoteData): void {
  estimates.set(quote.id, quote);
}

export function deleteEstimate(id: string): boolean {
  return estimates.delete(id);
}

export function listEstimateIds(): string[] {
  return Array.from(estimates.keys());
}
