"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, X, Save } from "lucide-react";
import { formatINR } from "@/lib/gst";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function PurchaseCreateModalButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [billNumber, setBillNumber] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorGstin, setVendorGstin] = useState("");
  const [vendorState, setVendorState] = useState("Haryana");
  const [billDate, setBillDate] = useState(todayStr);
  const [subtotal, setSubtotal] = useState("");
  const [taxRate, setTaxRate] = useState("18");
  const [itcEligible, setItcEligible] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numericSub = Number(subtotal || 0);
  const numericRate = Number(taxRate || 0);
  const isIntra =
    vendorGstin.trim().toUpperCase().startsWith("06") ||
    vendorState.toLowerCase().includes("haryana");
  const totalTax = Math.round(((numericSub * numericRate) / 100) * 100) / 100;
  const grandTotal = numericSub + totalTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billNumber.trim() || !vendorName.trim() || numericSub <= 0) {
      setError("Bill Number, Vendor Name, and valid Taxable Amount are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billNumber: billNumber.trim(),
          vendorName: vendorName.trim(),
          vendorGstin: vendorGstin.trim().toUpperCase() || null,
          vendorState: vendorState.trim() || null,
          billDate,
          subtotal: numericSub,
          taxRate: numericRate,
          gstType: isIntra ? "INTRA_STATE" : "INTER_STATE",
          itcEligible,
          paymentStatus,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to record purchase bill.");
        return;
      }
      setOpen(false);
      setBillNumber("");
      setVendorName("");
      setVendorGstin("");
      setSubtotal("");
      setNotes("");
      router.refresh();
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
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
      >
        <PlusCircle className="h-4 w-4" /> Add Purchase Bill
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Record Vendor Purchase Bill</h3>
                <p className="text-[11px] text-slate-500">
                  Auto-computes CGST/SGST vs IGST and updates GSTR-3B Eligible ITC
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor Bill / Inv # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUP/26-27/104"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bill Date *</label>
                  <input
                    type="date"
                    required
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vendor / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chainway India Pvt Ltd, AWS India, Dell"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full admin-input py-2 px-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 06AAACC1234F1Z5"
                    value={vendorGstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setVendorGstin(val);
                      if (val.startsWith("06")) setVendorState("Haryana");
                      else if (val.startsWith("07")) setVendorState("Delhi");
                      else if (val.startsWith("27")) setVendorState("Maharashtra");
                      else if (val.startsWith("29")) setVendorState("Karnataka");
                      else if (val.startsWith("09")) setVendorState("Uttar Pradesh");
                    }}
                    className="w-full admin-input py-2 px-3 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor State</label>
                  <input
                    type="text"
                    placeholder="e.g. Haryana, Delhi, Maharashtra"
                    value={vendorState}
                    onChange={(e) => setVendorState(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taxable Subtotal (₹) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="e.g. 50000"
                    value={subtotal}
                    onChange={(e) => setSubtotal(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Rate (%)</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  >
                    <option value="18">18% GST (Standard IT/RFID)</option>
                    <option value="12">12% GST</option>
                    <option value="5">5% GST</option>
                    <option value="28">28% GST</option>
                    <option value="0">0% Exempt / Unregistered</option>
                  </select>
                </div>
              </div>

              {numericSub > 0 && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-600">
                    {isIntra ? "CGST + SGST" : "IGST"} ({numericRate}%):{" "}
                    <strong className="text-emerald-700">{formatINR(totalTax)}</strong>
                  </span>
                  <span className="text-slate-900 font-bold text-xs">
                    Bill Total: {formatINR(grandTotal)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 pt-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={itcEligible}
                    onChange={(e) => setItcEligible(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Eligible for GST ITC</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Items Summary</label>
                <input
                  type="text"
                  placeholder="e.g. 5x UHF Readers + 1000 RFID tags"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full admin-input py-2 px-3"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> {loading ? "Saving..." : "Save Purchase Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
