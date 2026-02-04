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
  materials: { color: "#3B82F6", bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]", icon: "🧱" },
  labor: { color: "#60A5FA", bg: "bg-[#D1E9FF]", text: "text-[#1D4ED8]", icon: "👷" },
  equipment: { color: "#93C5FD", bg: "bg-[#E0F2FE]", text: "text-[#0F172A]", icon: "🔧" },
  other: { color: "#94A3B8", bg: "bg-[#F8FAFF]", text: "text-[#0F172A]", icon: "📦" },
};

const CONFIDENCE_CONFIG = {
  low: { width: "33%", color: "bg-[#EF4444]", label: "Low Accuracy" },
  medium: { width: "66%", color: "bg-[#F59E0B]", label: "Medium Accuracy" },
  high: { width: "100%", color: "bg-[#22C55E]", label: "High Precision" },
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
    <div className="min-h-screen bg-[#F8FAFF] pb-20">
      {/* Premium Header */}
      <div className="bg-[#0F172A] relative overflow-hidden text-white pt-12 pb-24 px-4 text-center">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#60A5FA]/10 rounded-full blur-[80px]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <Link
            to="/estimate"
            state={{ estimateInput: quote.projectInfo }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#93C5FD] text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md hover:bg-white/10 transition-colors"
          >
            ← Back to Editor
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Project Proposal</h1>
          <p className="text-white/60 text-lg font-medium">
            Prepared for: <span className="text-white">{quote.projectInfo.location || "Confidential Project"}</span>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Total Estimate */}
          <div className="bg-white rounded-[2rem] p-8 shadow-premium-xl border border-[#E2E8F0] group hover:border-[#3B82F6] transition-all duration-300">
            <div className="flex items-center gap-3 text-[#475569] text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">💰</span>
              Total Estimate
            </div>
            <p className="text-3xl font-black text-[#0F172A] tracking-tight">
              {formatINR(range.min)} – {formatINR(range.max)}
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-[2rem] p-8 shadow-premium-xl border border-[#E2E8F0] group hover:border-[#3B82F6] transition-all duration-300">
            <div className="flex items-center gap-3 text-[#475569] text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">⏱️</span>
              Timeline
            </div>
            <p className="text-3xl font-black text-[#0F172A] tracking-tight">
              {quote.timeline.min}–{quote.timeline.max} {quote.timeline.unit}
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-premium-xl border border-[#E2E8F0] group hover:border-[#3B82F6] transition-all duration-300">
            <div className="flex items-center gap-3 text-[#475569] text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">📈</span>
              Confidence
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-3 bg-[#E2E8F0] rounded-full overflow-hidden w-full">
                <div
                  className={`h-full ${confidence.color} rounded-full transition-all duration-1000 shadow-sm`}
                  style={{ width: confidence.width }}
                />
              </div>
              <span className="text-sm font-bold text-[#0F172A] flex items-center justify-between uppercase">
                {confidence.label}
                <span className="text-[#3B82F6]">{confidence.width}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown - Pie Chart */}
        <section className="bg-white rounded-[2rem] p-10 shadow-premium-xl border border-[#E2E8F0] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
            <span className="text-[12rem] select-none">📊</span>
          </div>
          <h2 className="text-xl font-black text-[#0F172A] mb-8 flex items-center gap-3 uppercase tracking-tight">
            <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xl shadow-sm">🔍</span>
            Revenue Distribution
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
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {totals.materials > 0 && (
                  <div className="p-6 rounded-[1.5rem] bg-[#F8FAFF] border border-[#DBEAFE] hover:bg-[#EFF6FF] transition-colors group">
                    <p className="text-xs text-[#3B82F6] font-black uppercase tracking-widest mb-2">🧱 Materials</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black text-[#0F172A]">{formatINR(totals.materials)}</p>
                      <p className="text-sm font-bold text-[#475569]">
                        {totals.total > 0 ? Math.round((totals.materials / totals.total) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                )}
                {totals.labor > 0 && (
                  <div className="p-6 rounded-[1.5rem] bg-[#F8FAFF] border border-[#DBEAFE] hover:bg-[#EFF6FF] transition-colors group">
                    <p className="text-xs text-[#60A5FA] font-black uppercase tracking-widest mb-2">👷 Labor</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black text-[#0F172A]">{formatINR(totals.labor)}</p>
                      <p className="text-sm font-bold text-[#475569]">
                        {totals.total > 0 ? Math.round((totals.labor / totals.total) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                )}
                {totals.equipment > 0 && (
                  <div className="p-6 rounded-[1.5rem] bg-[#F8FAFF] border border-[#DBEAFE] hover:bg-[#EFF6FF] transition-colors group">
                    <p className="text-xs text-[#93C5FD] font-black uppercase tracking-widest mb-2">🔧 Equipment</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black text-[#0F172A]">{formatINR(totals.equipment)}</p>
                      <p className="text-sm font-bold text-[#475569]">
                        {totals.total > 0 ? Math.round((totals.equipment / totals.total) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                )}
                {totals.other > 0 && (
                  <div className="p-6 rounded-[1.5rem] bg-[#F8FAFF] border border-[#DBEAFE] hover:bg-[#EFF6FF] transition-colors group">
                    <p className="text-xs text-[#94A3B8] font-black uppercase tracking-widest mb-2">📦 Other</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black text-[#0F172A]">{formatINR(totals.other)}</p>
                      <p className="text-sm font-bold text-[#475569]">
                        {totals.total > 0 ? Math.round((totals.other / totals.total) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[#6B7280]">No line items yet.</p>
          )}
        </section>

        {/* Line Items Table */}
        <section className="bg-white rounded-[2rem] shadow-premium-xl border border-[#E2E8F0] mb-8 overflow-hidden">
          <div className="p-8 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFF]">
            <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-3 uppercase tracking-tight">
              <span className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-xl shadow-sm">📋</span>
              Inventory Breakdown
            </h2>
            <span className="px-4 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-black uppercase tracking-widest">{quote.lineItems.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F1F6FF] border-b border-[#E2E8F0]">
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
                    <tr key={item.id} className="border-b border-[#E2E8F0]/70 hover:bg-[#F8FAFF] transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-[#0F172A]">{item.item}</p>
                        {item.notes && <p className="text-xs text-[#64748B] mt-0.5">{item.notes}</p>}
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
                            className="w-20 px-2 py-1.5 rounded-lg border-2 border-[#E2E8F0] focus:border-[#2563EB] outline-none bg-[#F8FAFF]"
                          />
                        ) : (
                          <span className="text-[#0F172A]">{item.quantity} {item.unit}</span>
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
                            className="w-24 px-2 py-1.5 rounded-lg border-2 border-[#E2E8F0] focus:border-[#2563EB] outline-none bg-[#F8FAFF]"
                          />
                        ) : (
                          <span className="text-[#0F172A]">{formatINR(item.unitCost)}</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-[#0F172A]">{formatINR(item.quantity * item.unitCost)}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                            className={`p-2 rounded-lg transition-colors ${editingId === item.id
                              ? "bg-[#A8E6CF] text-[#1F3B2C] hover:bg-[#7FD8B5]"
                              : "bg-[#F3FFF7] text-[#6B7280] hover:bg-[#A8E6CF] hover:text-[#1F3B2C]"
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
            <div className="p-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowAddRow(true)}
                className="inline-flex items-center gap-2 text-[#2563EB] hover:text-[#1E40AF] font-medium text-sm transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center border border-[#DBEAFE]">+</span>
                Add custom line item
              </button>
            </div>
          ) : (
            <AddLineItemRow onAdd={addLineItem} onCancel={() => setShowAddRow(false)} />
          )}
          <div className="p-4 border-t border-[#E2E8F0] bg-gradient-to-r from-[#F8FAFF] to-white flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Grand Total</span>
            <span className="text-2xl font-bold text-[#0F172A]">{formatINR(totals.total)}</span>
          </div>
        </section>

        {/* Assumptions */}
        <section className="bg-white rounded-[2rem] p-10 shadow-premium-xl border border-[#E2E8F0] mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 p-4 opacity-[0.03]">
            <span className="text-[12rem] select-none">📝</span>
          </div>
          <h2 className="text-xl font-black text-[#0F172A] mb-8 flex items-center gap-3 uppercase tracking-tight relative z-10">
            <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xl shadow-sm">📑</span>
            Project Terms
          </h2>
          <ul className="space-y-4 relative z-10">
            {quote.assumptions.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-[#475569] font-medium leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] text-xs font-bold mt-0.5 shrink-0">✓</span>
                {a}
              </li>
            ))}
          </ul>
        </section>

        {/* Floating Actions */}
        <section className="flex flex-wrap items-center justify-center gap-4 pb-12">
          <Link
            to="/estimate"
            state={{ estimateInput: quote.projectInfo }}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-[#0F172A] bg-white border-2 border-[#E2E8F0] hover:border-[#3B82F6] hover:bg-[#F8FAFF] transition-all shadow-premium-lg hover:-translate-y-1"
          >
            ✏️ Modify Estimate
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-white bg-[#3B82F6] hover:bg-[#1D4ED8] transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_40px_rgba(29,78,216,0.4)] hover:-translate-y-1"
          >
            📄 Finalize & Export
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-[#475569] bg-slate-100 border border-[#E2E8F0] hover:bg-slate-200 transition-all shadow-premium-md"
          >
            🔗 Copy Secure Link
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
      className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFF] grid gap-3 md:grid-cols-7 md:items-end"
    >
      <input
        type="text"
        placeholder="Item name"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        className="px-3 py-2.5 rounded-lg border-2 border-[#E2E8F0] focus:border-[#2563EB] outline-none md:col-span-2 bg-white"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as LineItem["category"])}
        className="px-3 py-2.5 rounded-lg border-2 border-[#E2E8F0] focus:border-[#2563EB] outline-none bg-white"
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
        className="px-3 py-2.5 rounded-lg border-2 border-[#E2E8F0] focus:border-[#2563EB] outline-none bg-white"
      />
      <input
        type="text"
        placeholder="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className="px-3 py-2.5 rounded-lg border-2 border-[#E2E8F0] focus:border-[#2563EB] outline-none bg-white"
      />
      <input
        type="number"
        min={0}
        step={1}
        placeholder="₹ Cost"
        value={unitCost || ""}
        onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
        className="px-3 py-2.5 rounded-lg border-2 border-[#E2E8F0] focus:border-[#2563EB] outline-none bg-white"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg font-medium text-white bg-[#2563EB] hover:bg-[#1E40AF] transition-colors border border-[#DBEAFE]"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg font-medium text-[#64748B] bg-white border-2 border-[#E2E8F0] hover:bg-[#F8FAFF] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
