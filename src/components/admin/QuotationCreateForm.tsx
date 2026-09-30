"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR, HARYANA_STATE_CODE } from "@/lib/gst";
import { Plus, Trash2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

interface CustomerOption {
  id: string;
  companyName: string;
  state: string;
  stateCode: string;
  gstin?: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  hsnCode: string;
  sellingPrice: number;
}

export function QuotationCreateForm({
  customers,
  products,
}: {
  customers: CustomerOption[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [validUntilDays, setValidUntilDays] = useState(15);
  const [terms, setTerms] = useState(
    "1. 50% Advance with official Purchase Order, 50% on installation.\n2. 1-Year Comprehensive Warranty on hardware.\n3. Haryana Jurisdiction."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const isIntraState = (selectedCustomer?.stateCode || HARYANA_STATE_CODE) === HARYANA_STATE_CODE;

  const [items, setItems] = useState<
    {
      productId: string;
      description: string;
      hsnCode: string;
      quantity: number;
      unitPrice: number;
    }[]
  >([
    {
      productId: products[0]?.id || "",
      description: products[0]?.name || "",
      hsnCode: products[0]?.hsnCode || "8471",
      quantity: 1,
      unitPrice: products[0]?.sellingPrice || 0,
    },
  ]);

  const handleProductSelect = (index: number, pId: string) => {
    const prod = products.find((p) => p.id === pId);
    if (!prod) return;
    const newItems = [...items];
    newItems[index] = {
      productId: prod.id,
      description: prod.name,
      hsnCode: prod.hsnCode,
      quantity: newItems[index].quantity || 1,
      unitPrice: prod.sellingPrice,
    };
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: val };
    setItems(newItems);
  };

  const addItemRow = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        productId: defaultProd?.id || "",
        description: defaultProd?.name || "Custom Line Item",
        hsnCode: defaultProd?.hsnCode || "998314",
        quantity: 1,
        unitPrice: defaultProd?.sellingPrice || 1000,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxRate = 18;
  const totalTax = Math.round(((subtotal * taxRate) / 100) * 100) / 100;
  const cgst = isIntraState ? Math.round((totalTax / 2) * 100) / 100 : 0;
  const sgst = isIntraState ? Math.round((totalTax / 2) * 100) / 100 : 0;
  const igst = !isIntraState ? totalTax : 0;
  const grandTotal = subtotal + totalTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError("Please select a customer.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/quotations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          validUntilDays,
          terms,
          items,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/quotations");
        router.refresh();
      } else {
        setError(data.error || "Failed to create quotation.");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quotations
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <Send className="h-4 w-4" /> {loading ? "Generating..." : "Save & Generate Quotation"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Customer Selection Card */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Customer & State Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Client / Organization *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full admin-input py-2 px-3 text-xs"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.state} - Code {c.stateCode}) {c.gstin ? `[GSTIN: ${c.gstin}]` : "[Non-GST]"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tax Rule Detected
            </label>
            <div className="rounded-lg border border-blue-200 bg-blue-50 py-2 px-3 text-xs font-mono font-bold text-blue-800">
              {isIntraState ? "Intra-State: CGST (9%) + SGST (9%)" : "Inter-State: IGST (18%)"}
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Card */}
      <div className="admin-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Line Items</h3>
          <button
            type="button"
            onClick={addItemRow}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            <Plus className="h-4 w-4" /> Add Item Row
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs"
            >
              <div className="col-span-12 sm:col-span-4">
                <label className="block text-[10px] text-slate-500 mb-1">Product / Preset</label>
                <select
                  value={item.productId}
                  onChange={(e) => handleProductSelect(idx, e.target.value)}
                  className="w-full admin-input py-1.5 px-2 text-xs"
                >
                  <option value="">-- Custom Description --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-12 sm:col-span-3">
                <label className="block text-[10px] text-slate-500 mb-1">Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                  className="w-full admin-input py-1.5 px-2 text-xs"
                />
              </div>

              <div className="col-span-4 sm:col-span-1">
                <label className="block text-[10px] text-slate-500 mb-1">HSN/SAC</label>
                <input
                  type="text"
                  value={item.hsnCode}
                  onChange={(e) => handleItemChange(idx, "hsnCode", e.target.value)}
                  className="w-full admin-input py-1.5 px-2 text-xs font-mono"
                />
              </div>

              <div className="col-span-4 sm:col-span-1">
                <label className="block text-[10px] text-slate-500 mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                  className="w-full admin-input py-1.5 px-2 text-xs font-mono"
                />
              </div>

              <div className="col-span-4 sm:col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1">Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                  className="w-full admin-input py-1.5 px-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="col-span-12 sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="border-t border-slate-200 pt-4 flex justify-end font-mono text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span> <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
            </div>
            {isIntraState ? (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9%):</span> <span className="text-slate-700">{formatINR(cgst)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (9%):</span> <span className="text-slate-700">{formatINR(sgst)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-500">
                <span>IGST (18%):</span> <span className="text-slate-700">{formatINR(igst)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-200 pt-2">
              <span>Grand Total:</span> <span className="text-blue-600">{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Card */}
      <div className="admin-card p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Terms & Conditions</h3>
        <textarea
          rows={3}
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          className="w-full admin-input p-3 text-xs leading-relaxed"
        ></textarea>
      </div>
    </form>
  );
}
