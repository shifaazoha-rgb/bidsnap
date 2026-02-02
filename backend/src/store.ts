import type { QuoteData } from "./types/estimate.js";
import { getSupabase, hasSupabase } from "./lib/supabase.js";

/** In-memory fallback when Supabase is not configured */
const memoryStore = new Map<string, QuoteData>();

function quoteToRow(quote: QuoteData) {
  return {
    id: quote.id,
    project_info: quote.projectInfo,
    line_items: quote.lineItems,
    totals: quote.totals,
    total_cost_range: quote.totalCostRange,
    timeline: quote.timeline,
    confidence: quote.confidence,
    assumptions: quote.assumptions,
    created_at: quote.createdAt,
    updated_at: quote.updatedAt,
  };
}

function rowToQuote(row: {
  id: string;
  project_info: unknown;
  line_items: unknown;
  totals: unknown;
  total_cost_range: unknown;
  timeline: unknown;
  confidence: string;
  assumptions: unknown;
  created_at: string;
  updated_at: string;
}): QuoteData {
  return {
    id: row.id,
    projectInfo: row.project_info as QuoteData["projectInfo"],
    lineItems: row.line_items as QuoteData["lineItems"],
    totals: row.totals as QuoteData["totals"],
    totalCostRange: row.total_cost_range as QuoteData["totalCostRange"],
    timeline: row.timeline as QuoteData["timeline"],
    confidence: row.confidence as QuoteData["confidence"],
    assumptions: row.assumptions as QuoteData["assumptions"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getEstimate(id: string): Promise<QuoteData | undefined> {
  if (hasSupabase()) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("estimates")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return undefined; // no rows
      throw error;
    }
    return data ? rowToQuote(data) : undefined;
  }
  return memoryStore.get(id);
}

export async function setEstimate(quote: QuoteData): Promise<void> {
  if (hasSupabase()) {
    const supabase = getSupabase();
    const row = quoteToRow(quote);
    const { error } = await supabase.from("estimates").upsert(row, {
      onConflict: "id",
    });
    if (error) throw error;
    return;
  }
  memoryStore.set(quote.id, quote);
}

export async function deleteEstimate(id: string): Promise<boolean> {
  if (hasSupabase()) {
    const supabase = getSupabase();
    const { error } = await supabase.from("estimates").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
  return memoryStore.delete(id);
}

export async function listEstimateIds(): Promise<string[]> {
  if (hasSupabase()) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("estimates")
      .select("id")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => r.id);
  }
  return Array.from(memoryStore.keys());
}
