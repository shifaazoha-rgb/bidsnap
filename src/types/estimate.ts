/** Estimate form input – matches spec */
export interface EstimateInput {
  projectType: string;
  areaSquareFeet: number;
  qualityLevel: "basic" | "standard" | "premium";
  location: string;
  notes?: string;
}

/** Line item – matches spec */
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

/** Quote totals */
export interface QuoteTotals {
  materials: number;
  labor: number;
  other: number;
  subtotal: number;
  tax?: number;
  total: number;
}

/** Full quote – matches spec */
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
