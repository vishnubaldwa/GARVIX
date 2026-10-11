"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, X, History, AlertCircle, Check } from "lucide-react";
import { formatINR } from "@/lib/gst";

interface QuotationReviseModalProps {
  quote: {
    id: string;
    quoteNumber: string;
    totalAmount: number;
    subtotal: number;
    notes?: string | null;
    customer: {
      companyName: string;
      phone?: string | null;
    };
    items: {
      id?: string;
      productId?: string | null;
      description: string;
      hsnCode: string;
      quantity: number;
      unitPrice: number;
    }[];
  };
}

export function QuotationReviseModal({ quote }: QuotationReviseModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Parse existing revision history
  let meta: { rev: number; history: any[] } = { rev: 1, history: [] };
  try {
    if (quote.notes && quote.notes.startsWith("{")) {
      meta = JSON.parse(quote.notes);
    }
  } catch {}

  const currentRev = meta.rev || 1;

  const [items, setItems] = useState(
    quote.items.map((i) => ({
      productId: i.productId || "",
      description: i.description,
      hsnCode: i.hsnCode || "8471",
      quantity: i.quantity || 1,
      unitPrice: i.unitPrice || 0,
    }))
  );

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const newSubtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const newGrandTotal = newSubtotal * 1.18; // 18% standard GST

  const handleItemChange = (idx: number, field: "quantity" | "unitPrice", val: number) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    setItems(updated);
  };

  const handleSaveRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtotal <= 0) {
      setError("Please ensure valid quantity and rates.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/quotations/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotationId: quote.id,
          items,
          reason: reason.trim() || `Client negotiation - Rate updated to ${formatINR(newGrandTotal)}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(data.error || "Failed to revise quotation.");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        title="Revise rate and track negotiation history"
      >
        <RefreshCw className="h-3 w-3 text-blue-600" />
        <span>Revise Rate</span>
        {currentRev > 1 && (
          <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] text-blue-800 font-mono">
            R{currentRev}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Revise Quotation #{quote.quoteNumber}
                  </h3>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 font-mono">
                    Current: Rev {currentRev} ➔ New: Rev {currentRev + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Client: <strong className="text-slate-700">{quote.customer.companyName}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveRevision} className="mt-4 space-y-4 text-xs">
              {/* Items Table */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Revise Line Items & Rates
                </label>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item / Service</th>
                        <th className="py-2.5 px-3 w-20">Qty</th>
                        <th className="py-2.5 px-3 w-32">Rate (₹)</th>
                        <th className="py-2.5 px-3 text-right w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 block">{it.description}</span>
                            <span className="text-[10px] text-slate-400 font-mono">HSN: {it.hsnCode}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min="1"
                              value={it.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                              className="w-full admin-input py-1 px-2 text-xs font-mono font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min="0"
                              value={it.unitPrice}
                              onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                              className="w-full admin-input py-1 px-2 text-xs font-mono font-bold text-blue-600"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                            {formatINR(it.quantity * it.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Comparison Summary */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">
                    Previous Total (Rev {currentRev})
                  </span>
                  <span className="text-sm font-semibold text-slate-500 line-through">
                    {formatINR(quote.totalAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-600 uppercase block font-sans font-bold">
                    Revised Total (Rev {currentRev + 1})
                  </span>
                  <span className="text-base font-black text-blue-600">
                    {formatINR(newGrandTotal)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Incl. 18% GST ({formatINR(newGrandTotal - newSubtotal)})
                  </span>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason for Revision / Negotiation Note *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer requested 10% discount on software module"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs"
                />
              </div>

              {/* Revision History Log */}
              {meta.history && meta.history.length > 0 && (
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 font-sans">
                    <History className="h-3 w-3" /> Previous Negotiation History
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-[11px]">
                    {meta.history.map((h: any, hIdx: number) => (
                      <div key={hIdx} className="flex justify-between items-center text-slate-600 border-b border-slate-200/60 pb-1">
                        <div>
                          <span className="font-bold text-slate-800">Rev {h.rev}:</span> {formatINR(h.totalAmount)}
                          <span className="text-[10px] text-slate-400 font-sans block">
                            Note: {h.reason}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 text-right">
                          {new Date(h.date).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{loading ? "Saving Revision..." : `Issue Revision (Rev ${currentRev + 1})`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
