/** Estimate form input – matches frontend spec */
export interface EstimateInput {
  projectType: string;
  areaSquareFeet: number;
  qualityLevel: "basic" | "standard" | "premium";
  location: string;
  notes?: string;
}

export interface LineItem {
  id: string;
  category: "materials" | "labor" | "equipment" | "other";
  item: string;
  description?: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  editable: boolean;
  notes?: string;
}

export interface QuoteTotals {
  materials: number;
  labor: number;
  other: number;
  subtotal: number;
  tax?: number;
  total: number;
}

export interface QuoteData {
  id: string;
  projectInfo: EstimateInput;
  lineItems: LineItem[];
  totals: QuoteTotals;
  totalCostRange: { min: number; max: number; currency: string };
  timeline: { min: number; max: number; unit: string };
  confidence: "low" | "medium" | "high";
  assumptions: string[];
  createdAt: string;
  updatedAt: string;
}
