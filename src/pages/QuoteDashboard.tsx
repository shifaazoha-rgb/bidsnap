import { useState, useMemo } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { QuoteData, LineItem, QuoteTotals } from "../types/estimate";
import { mockQuote } from "../data/mockQuote";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function recalcTotals(lineItems: LineItem[]): QuoteTotals {
  let materials = 0;
  let labor = 0;
  let other = 0;
  for (const row of lineItems) {
    const total = row.quantity * row.unitCost;
    if (row.category === "materials") materials += total;
    else if (row.category === "labor") labor += total;
    else other += total;
  }
  const subtotal = materials + labor + other;
  return { materials, labor, other, subtotal, total: subtotal };
}

const CONFIDENCE_DOTS = { low: 2, medium: 3, high: 5 } as const;
const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b"];

export default function QuoteDashboard() {
  const { id } = useParams();
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

  const totals = useMemo(
    () => recalcTotals(quote.lineItems),
    [quote.lineItems]
  );

  const chartData = useMemo(
    () => [
      { name: "Materials", value: totals.materials, fill: CHART_COLORS[0] },
      { name: "Labor", value: totals.labor, fill: CHART_COLORS[1] },
      { name: "Other", value: totals.other, fill: CHART_COLORS[2] },
    ].filter((d) => d.value > 0),
    [totals]
  );

  const handleQuantityOrUnitCostChange = (itemId: string, field: "quantity" | "unitCost", value: number) => {
    setQuote((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((row) => {
        if (row.id !== itemId) return row;
        const next = { ...row, [field]: value, totalCost: row.quantity * row.unitCost };
        if (field === "quantity") next.totalCost = value * row.unitCost;
        else next.totalCost = row.quantity * value;
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

  const dots = CONFIDENCE_DOTS[quote.confidence] ?? 3;
  const range = quote.totalCostRange;

  return (
    <div className="min-h-screen px-4 py-8 bg-[var(--color-background)]">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/estimate"
          state={{ estimateInput: quote.projectInfo }}
          className="text-[var(--color-primary)] hover:underline mb-6 inline-block font-medium"
        >
          ← Edit estimate
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-1">
          {quote.projectInfo.projectType} – Quote {id ?? quote.id}
        </h1>
        <p className="text-[var(--color-neutral)] mb-8">
          {quote.projectInfo.areaSquareFeet} sq ft · {quote.projectInfo.qualityLevel} · {quote.projectInfo.location}
        </p>

        {/* Summary card */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-neutral)]/20 bg-white p-6 shadow-[var(--shadow-md)] mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-neutral)] uppercase tracking-wide mb-4">
            Summary
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-[var(--color-neutral)]">Total estimate</p>
              <p className="text-xl font-semibold text-[#0f172a]">
                {formatCurrency(range.min)} – {formatCurrency(range.max)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral)]">Timeline</p>
              <p className="text-xl font-semibold text-[#0f172a]">
                {quote.timeline.min}–{quote.timeline.max} {quote.timeline.unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral)]">Confidence</p>
              <p className="text-xl font-semibold text-[#0f172a] flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < dots ? "bg-[var(--color-secondary)]" : "bg-[var(--color-neutral)]/30"
                    }`}
                    aria-hidden
                  />
                ))}
                <span className="ml-1 capitalize text-base">{quote.confidence}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Cost breakdown chart */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-neutral)]/20 bg-white p-6 shadow-[var(--shadow-md)] mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-neutral)] uppercase tracking-wide mb-4">
            Cost breakdown
          </h2>
          {chartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 24 }}>
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [typeof v === "number" ? formatCurrency(v) : String(v ?? ""), ""]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-neutral)]">No line items yet.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {totals.materials > 0 && (
              <span className="text-[#0f172a]">
                Materials: {formatCurrency(totals.materials)} (
                {totals.total > 0 ? Math.round((totals.materials / totals.total) * 100) : 0}%)
              </span>
            )}
            {totals.labor > 0 && (
              <span className="text-[#0f172a]">
                Labor: {formatCurrency(totals.labor)} (
                {totals.total > 0 ? Math.round((totals.labor / totals.total) * 100) : 0}%)
              </span>
            )}
            {totals.other > 0 && (
              <span className="text-[#0f172a]">
                Other: {formatCurrency(totals.other)} (
                {totals.total > 0 ? Math.round((totals.other / totals.total) * 100) : 0}%)
              </span>
            )}
          </div>
        </section>

        {/* Line items table */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-neutral)]/20 bg-white overflow-hidden shadow-[var(--shadow-md)] mb-6">
          <div className="p-4 border-b border-[var(--color-neutral)]/20">
            <h2 className="text-sm font-semibold text-[var(--color-neutral)] uppercase tracking-wide">
              Line items
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-neutral)]/20 bg-[var(--color-background)]">
                  <th className="p-3 font-medium text-[#0f172a]">Item</th>
                  <th className="p-3 font-medium text-[#0f172a]">Qty</th>
                  <th className="p-3 font-medium text-[#0f172a]">Unit</th>
                  <th className="p-3 font-medium text-[#0f172a]">Unit cost</th>
                  <th className="p-3 font-medium text-[#0f172a]">Total</th>
                  <th className="p-3 w-10" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {quote.lineItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--color-neutral)]/10 hover:bg-[var(--color-background)]/50"
                  >
                    <td className="p-3 text-[#0f172a]">{item.item}</td>
                    <td className="p-3">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min={0.01}
                          step={0.01}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityOrUnitCostChange(
                              item.id,
                              "quantity",
                              Number(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 rounded border border-[var(--color-neutral)]/30"
                        />
                      ) : (
                        <span>{item.quantity}</span>
                      )}
                    </td>
                    <td className="p-3 text-[var(--color-neutral)]">{item.unit}</td>
                    <td className="p-3">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.unitCost}
                          onChange={(e) =>
                            handleQuantityOrUnitCostChange(
                              item.id,
                              "unitCost",
                              Number(e.target.value) || 0
                            )
                          }
                          className="w-24 px-2 py-1 rounded border border-[var(--color-neutral)]/30"
                        />
                      ) : (
                        formatCurrency(item.unitCost)
                      )}
                    </td>
                    <td className="p-3 font-medium text-[#0f172a]">
                      {formatCurrency(item.quantity * item.unitCost)}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingId(editingId === item.id ? null : item.id)
                        }
                        className="text-[var(--color-primary)] hover:underline text-xs font-medium"
                      >
                        {editingId === item.id ? "Done" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLineItem(item.id)}
                        className="ml-2 text-[var(--color-error)] hover:underline text-xs font-medium"
                        aria-label={`Delete ${item.item}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!showAddRow ? (
            <div className="p-3 border-t border-[var(--color-neutral)]/10">
              <button
                type="button"
                onClick={() => setShowAddRow(true)}
                className="text-[var(--color-primary)] hover:underline font-medium text-sm"
              >
                + Add custom line item
              </button>
            </div>
          ) : (
            <AddLineItemRow
              onAdd={addLineItem}
              onCancel={() => setShowAddRow(false)}
            />
          )}
          <div className="p-4 border-t border-[var(--color-neutral)]/20 bg-[var(--color-background)]/50 text-right">
            <p className="text-lg font-semibold text-[#0f172a]">
              Total: {formatCurrency(totals.total)}
            </p>
          </div>
        </section>

        {/* Assumptions */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-neutral)]/20 bg-white p-6 shadow-[var(--shadow-md)] mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-neutral)] uppercase tracking-wide mb-3">
            Assumptions & notes
          </h2>
          <ul className="list-disc list-inside text-[#0f172a] space-y-1">
            {quote.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-3">
          <Link
            to="/estimate"
            state={{ estimateInput: quote.projectInfo }}
            className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--radius-md)] font-medium text-[var(--color-primary)] bg-white border border-[var(--color-neutral)]/30 hover:bg-[var(--color-background)] transition-colors"
          >
            Edit estimate
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--radius-md)] font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Download PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--radius-md)] font-medium text-[var(--color-neutral)] bg-white border border-[var(--color-neutral)]/30 hover:bg-[var(--color-background)] transition-colors"
          >
            Share link
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

  const handleSubmit = (e: React.FormEvent) => {
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
      className="p-4 border-t border-[var(--color-neutral)]/20 bg-[var(--color-background)]/30 grid gap-3 md:grid-cols-6 md:items-end"
    >
      <input
        type="text"
        placeholder="Item name"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        className="px-3 py-2 rounded border border-[var(--color-neutral)]/30 md:col-span-2"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as LineItem["category"])}
        className="px-3 py-2 rounded border border-[var(--color-neutral)]/30"
      >
        <option value="materials">Materials</option>
        <option value="labor">Labor</option>
        <option value="equipment">Equipment</option>
        <option value="other">Other</option>
      </select>
      <input
        type="number"
        min={0.01}
        step={0.01}
        placeholder="Qty"
        value={quantity || ""}
        onChange={(e) => setQuantity(Number(e.target.value) || 0)}
        className="px-3 py-2 rounded border border-[var(--color-neutral)]/30"
      />
      <input
        type="text"
        placeholder="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className="px-3 py-2 rounded border border-[var(--color-neutral)]/30"
      />
      <input
        type="number"
        min={0}
        step={0.01}
        placeholder="Unit cost"
        value={unitCost || ""}
        onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
        className="px-3 py-2 rounded border border-[var(--color-neutral)]/30"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-2 rounded-[var(--radius-md)] font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-[var(--radius-md)] font-medium text-[var(--color-neutral)] border border-[var(--color-neutral)]/30 hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
