import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { QuoteData, LineItem, QuoteTotals } from "../types/estimate";
import { mockQuote } from "../data/mockQuote";
import { formatINR } from "../utils/currency";

function recalcTotals(lineItems: LineItem[]): QuoteTotals {
  let materials = 0;
  let labor = 0;
  let equipment = 0;
  let other = 0;
  for (const row of lineItems) {
    const total = row.quantity * row.unitCost;
    if (row.category === "materials") materials += total;
    else if (row.category === "labor") labor += total;
    else if (row.category === "equipment") equipment += total;
    else other += total;
  }
  const subtotal = materials + labor + equipment + other;
  return { materials, labor, equipment, other, subtotal, total: subtotal };
}

const CATEGORY_CONFIG = {
  materials: { color: "#F48FB1", bg: "bg-[#F8BBD0]", text: "text-[#4A1D2F]", icon: "🧱" },
  labor: { color: "#7BC47F", bg: "bg-[#CDEAC0]", text: "text-[#1F3B2C]", icon: "👷" },
  equipment: { color: "#6B7280", bg: "bg-[#F3FAF5]", text: "text-[#1F2937]", icon: "🔧" },
  other: { color: "#6B7280", bg: "bg-[#F3FAF5]", text: "text-[#1F2937]", icon: "📦" },
};

const CONFIDENCE_CONFIG = {
  low: { width: "33%", color: "bg-[#F87171]", label: "Low" },
  medium: { width: "66%", color: "bg-[#FBBF24]", label: "Medium" },
  high: { width: "100%", color: "bg-[#7BC47F]", label: "High" },
};

export default function QuoteDashboard() {
  useParams(); // quote id from URL (used for future API fetch)
  const location = useLocation();
  const state = location.state as { quote?: QuoteData; estimateInput?: QuoteData["projectInfo"] } | null;
  const passedQuote = state?.quote;
  const passedInput = state?.estimateInput;
  const initialQuote: QuoteData = passedQuote ?? {
    ...mockQuote,
    ...(passedInput && { projectInfo: passedInput }),
  };

  const [quote, setQuote] = useState<QuoteData>(initialQuote);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddRow, setShowAddRow] = useState(false);

  const totals = useMemo(() => recalcTotals(quote.lineItems), [quote.lineItems]);

  const derivedTotalCostRange = useMemo(() => {
    // Keep the UI consistent with editable line-items.
    const base = totals.total;
    const spread = quote.confidence === "high" ? 0.05 : quote.confidence === "medium" ? 0.1 : 0.2;
    const currency = quote.totalCostRange.currency || "INR";
    if (base <= 0) return { ...quote.totalCostRange, currency };
    return {
      min: Math.max(0, Math.round(base * (1 - spread))),
      max: Math.max(0, Math.round(base * (1 + spread))),
      currency,
    };
  }, [quote.confidence, quote.totalCostRange, totals.total]);

  const chartData = useMemo(
    () =>
      [
        { name: "Materials", value: totals.materials, color: CATEGORY_CONFIG.materials.color },
        { name: "Labor", value: totals.labor, color: CATEGORY_CONFIG.labor.color },
        { name: "Equipment", value: totals.equipment, color: CATEGORY_CONFIG.equipment.color },
        { name: "Other", value: totals.other, color: CATEGORY_CONFIG.other.color },
      ].filter((d) => d.value > 0),
    [totals]
  );

  const handleQuantityOrUnitCostChange = (itemId: string, field: "quantity" | "unitCost", value: number) => {
    setQuote((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((row) => {
        if (row.id !== itemId) return row;
        const next = { ...row, [field]: value };
        next.totalCost = field === "quantity" ? value * row.unitCost : row.quantity * value;
        return next;
      }),
    }));
  };

  const deleteLineItem = (itemId: string) => {
    setQuote((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== itemId),
    }));
    setEditingId(null);
  };

  const addLineItem = (item: Omit<LineItem, "id">) => {
    const newId = String(Date.now());
    setQuote((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { ...item, id: newId }],
    }));
    setShowAddRow(false);
    setEditingId(newId);
  };

  const range = derivedTotalCostRange;
  const confidence = CONFIDENCE_CONFIG[quote.confidence];

  return (
    <div className="min-h-screen bg-[#FFF6FA]">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-[#F8BBD0] via-[#F48FB1] to-[#F48FB1] text-[#4A1D2F] px-4 py-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/estimate"
            state={{ estimateInput: quote.projectInfo }}
            className="inline-flex items-center gap-1 text-[#4A1D2F]/80 hover:text-[#4A1D2F] mb-4 text-sm font-medium transition-colors"
          >
            ← Back to Form
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl shrink-0">
              💰
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {quote.projectInfo.projectType}
              </h1>
              <p className="text-white/70 text-sm flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1">📐 {quote.projectInfo.areaSquareFeet} sq ft</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 capitalize">✨ {quote.projectInfo.qualityLevel}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">📍 {quote.projectInfo.location}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Total Estimate */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#EAD7E1]">
            <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-2">
              <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center">💰</span>
              Total Estimate
            </div>
            <p className="text-2xl font-bold text-[#1F2937]">
              {formatINR(range.min)} – {formatINR(range.max)}
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#EAD7E1]">
            <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-2">
              <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center">⏱️</span>
              Timeline
            </div>
            <p className="text-2xl font-bold text-[#1F2937]">
              {quote.timeline.min}–{quote.timeline.max} {quote.timeline.unit}
            </p>
          </div>

          {/* Confidence */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#EAD7E1]">
            <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-2">
              <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center">📈</span>
              Confidence
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-[#EAD7E1] rounded-full overflow-hidden">
                <div
                  className={`h-full ${confidence.color} rounded-full transition-all duration-500`}
                  style={{ width: confidence.width }}
                />
              </div>
              <span className="text-sm font-semibold text-[#1F2937]">{confidence.label}</span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown - Pie Chart */}
        <section className="bg-white rounded-2xl p-6 shadow-lg border border-[#EAD7E1] mb-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center text-lg">📊</span>
            Cost Breakdown
          </h2>
          {chartData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [typeof v === "number" ? formatINR(v) : v, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {totals.materials > 0 && (
                  <div className="p-4 rounded-xl bg-[#FFF6FA] border border-[#EAD7E1]">
                    <p className="text-sm text-[#4A1D2F] font-medium mb-1">🧱 Materials</p>
                    <p className="text-xl font-bold text-[#1F2937]">{formatINR(totals.materials)}</p>
                    <p className="text-xs text-[#6B7280]">
                      {totals.total > 0 ? Math.round((totals.materials / totals.total) * 100) : 0}% of total
                    </p>
                  </div>
                )}
                {totals.labor > 0 && (
                  <div className="p-4 rounded-xl bg-[#F3FAF5] border border-[#EAD7E1]">
                    <p className="text-sm text-[#1F3B2C] font-medium mb-1">👷 Labor</p>
                    <p className="text-xl font-bold text-[#1F2937]">{formatINR(totals.labor)}</p>
                    <p className="text-xs text-[#6B7280]">
                      {totals.total > 0 ? Math.round((totals.labor / totals.total) * 100) : 0}% of total
                    </p>
                  </div>
                )}
                {totals.equipment > 0 && (
                  <div className="p-4 rounded-xl bg-white border border-[#EAD7E1]">
                    <p className="text-sm text-[#1F2937] font-medium mb-1">🔧 Equipment</p>
                    <p className="text-xl font-bold text-[#1F2937]">{formatINR(totals.equipment)}</p>
                    <p className="text-xs text-[#6B7280]">
                      {totals.total > 0 ? Math.round((totals.equipment / totals.total) * 100) : 0}% of total
                    </p>
                  </div>
                )}
                {totals.other > 0 && (
                  <div className="p-4 rounded-xl bg-white border border-[#EAD7E1]">
                    <p className="text-sm text-[#1F2937] font-medium mb-1">📦 Other</p>
                    <p className="text-xl font-bold text-[#1F2937]">{formatINR(totals.other)}</p>
                    <p className="text-xs text-[#6B7280]">
                      {totals.total > 0 ? Math.round((totals.other / totals.total) * 100) : 0}% of total
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[#6B7280]">No line items yet.</p>
          )}
        </section>

        {/* Line Items Table */}
        <section className="bg-white rounded-2xl shadow-lg border border-[#EAD7E1] mb-6 overflow-hidden">
          <div className="p-4 border-b border-[#EAD7E1] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1F2937] flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center text-lg">📋</span>
              Line Items
            </h2>
            <span className="text-sm text-[#6B7280]">{quote.lineItems.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F3FAF5] border-b border-[#EAD7E1]">
                  <th className="p-4 text-left font-semibold text-[#1F2937]">Item</th>
                  <th className="p-4 text-left font-semibold text-[#1F2937]">Category</th>
                  <th className="p-4 text-left font-semibold text-[#1F2937]">Qty</th>
                  <th className="p-4 text-left font-semibold text-[#1F2937]">Unit Cost</th>
                  <th className="p-4 text-left font-semibold text-[#1F2937]">Total</th>
                  <th className="p-4 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {quote.lineItems.map((item) => {
                  const cat = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.other;
                  return (
                    <tr key={item.id} className="border-b border-[#EAD7E1]/70 hover:bg-[#FFF6FA] transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-[#1F2937]">{item.item}</p>
                        {item.notes && <p className="text-xs text-[#6B7280] mt-0.5">{item.notes}</p>}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cat.bg} ${cat.text}`}>
                          {cat.icon} {item.category}
                        </span>
                      </td>
                      <td className="p-4">
                        {editingId === item.id ? (
                          <input
                            type="number"
                            min={0.01}
                            step={0.01}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityOrUnitCostChange(item.id, "quantity", Number(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-1.5 rounded-lg border-2 border-[#EAD7E1] focus:border-[#F48FB1] outline-none bg-[#FFF6FA]"
                          />
                        ) : (
                          <span className="text-[#1F2937]">{item.quantity} {item.unit}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === item.id ? (
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={item.unitCost}
                            onChange={(e) =>
                              handleQuantityOrUnitCostChange(item.id, "unitCost", Number(e.target.value) || 0)
                            }
                            className="w-24 px-2 py-1.5 rounded-lg border-2 border-[#EAD7E1] focus:border-[#F48FB1] outline-none bg-[#FFF6FA]"
                          />
                        ) : (
                          <span className="text-[#1F2937]">{formatINR(item.unitCost)}</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-[#1F2937]">{formatINR(item.quantity * item.unitCost)}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              editingId === item.id
                                ? "bg-[#F8BBD0] text-[#4A1D2F] hover:bg-[#F48FB1]"
                                : "bg-[#F3FAF5] text-[#6B7280] hover:bg-[#F8BBD0] hover:text-[#4A1D2F]"
                            }`}
                            title={editingId === item.id ? "Save" : "Edit"}
                          >
                            {editingId === item.id ? "✓" : "✏️"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLineItem(item.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!showAddRow ? (
            <div className="p-4 border-t border-[#EAD7E1]">
              <button
                type="button"
                onClick={() => setShowAddRow(true)}
                className="inline-flex items-center gap-2 text-[#4A1D2F] hover:text-[#4A1D2F] font-medium text-sm transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-[#F8BBD0] text-[#4A1D2F] flex items-center justify-center border border-[#EAD7E1]">+</span>
                Add custom line item
              </button>
            </div>
          ) : (
            <AddLineItemRow onAdd={addLineItem} onCancel={() => setShowAddRow(false)} />
          )}
          <div className="p-4 border-t border-[#EAD7E1] bg-gradient-to-r from-[#FFF6FA] to-white flex items-center justify-between">
            <span className="text-[#6B7280] font-medium">Grand Total</span>
            <span className="text-2xl font-bold text-[#4A1D2F]">{formatINR(totals.total)}</span>
          </div>
        </section>

        {/* Assumptions */}
        <section className="bg-white rounded-2xl p-6 shadow-lg border border-[#EAD7E1] mb-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center text-lg">📝</span>
            Assumptions & Notes
          </h2>
          <ul className="space-y-2">
            {quote.assumptions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-[#1F2937]">
                <span className="text-[#7BC47F] mt-0.5">✓</span>
                {a}
              </li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-3 pb-8">
          <Link
            to="/estimate"
            state={{ estimateInput: quote.projectInfo }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[#1F2937] bg-white border-2 border-[#EAD7E1] hover:border-[#F48FB1] hover:bg-[#FFF6FA] transition-all"
          >
            ✏️ Edit Estimate
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[#4A1D2F] bg-[#F8BBD0] hover:bg-[#F48FB1] transition-all shadow-lg shadow-[#F48FB1]/20 hover:shadow-xl border border-[#EAD7E1]"
          >
            📄 Download PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[#1F2937] bg-white border-2 border-[#EAD7E1] hover:border-[#A7D7A0] hover:bg-[#F3FAF5] transition-all"
          >
            🔗 Share Link
          </button>
        </section>
      </div>
    </div>
  );
}

function AddLineItemRow({
  onAdd,
  onCancel,
}: {
  onAdd: (item: Omit<LineItem, "id">) => void;
  onCancel: () => void;
}) {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("each");
  const [unitCost, setUnitCost] = useState(0);
  const [category, setCategory] = useState<LineItem["category"]>("other");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAdd({
      category,
      item: item || "Custom item",
      quantity,
      unit,
      unitCost,
      totalCost: quantity * unitCost,
      editable: true,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-[#EAD7E1] bg-[#FFF6FA] grid gap-3 md:grid-cols-7 md:items-end"
    >
      <input
        type="text"
        placeholder="Item name"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        className="px-3 py-2.5 rounded-lg border-2 border-[#EAD7E1] focus:border-[#F48FB1] outline-none md:col-span-2 bg-white"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as LineItem["category"])}
        className="px-3 py-2.5 rounded-lg border-2 border-[#EAD7E1] focus:border-[#F48FB1] outline-none bg-white"
      >
        <option value="materials">🧱 Materials</option>
        <option value="labor">👷 Labor</option>
        <option value="equipment">🔧 Equipment</option>
        <option value="other">📦 Other</option>
      </select>
      <input
        type="number"
        min={0.01}
        step={0.01}
        placeholder="Qty"
        value={quantity || ""}
        onChange={(e) => setQuantity(Number(e.target.value) || 0)}
        className="px-3 py-2.5 rounded-lg border-2 border-[#EAD7E1] focus:border-[#F48FB1] outline-none bg-white"
      />
      <input
        type="text"
        placeholder="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className="px-3 py-2.5 rounded-lg border-2 border-[#EAD7E1] focus:border-[#F48FB1] outline-none bg-white"
      />
      <input
        type="number"
        min={0}
        step={1}
        placeholder="₹ Cost"
        value={unitCost || ""}
        onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
        className="px-3 py-2.5 rounded-lg border-2 border-[#EAD7E1] focus:border-[#F48FB1] outline-none bg-white"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg font-medium text-[#4A1D2F] bg-[#F8BBD0] hover:bg-[#F48FB1] transition-colors border border-[#EAD7E1]"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg font-medium text-[#6B7280] bg-white border-2 border-[#EAD7E1] hover:bg-[#FFF6FA] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
