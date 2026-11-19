"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, X, Save } from "lucide-react";

function oneYearLaterStr(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function SerialCreateModalButton({
  products,
}: {
  products: { id: string; name: string; sku: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [serialNumber, setSerialNumber] = useState("");
  const [imei, setImei] = useState("");
  const [status, setStatus] = useState("IN_STOCK");
  const [warrantyExpiry, setWarrantyExpiry] = useState(oneYearLaterStr);
  const [incrementStock, setIncrementStock] = useState(true);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !serialNumber.trim()) {
      setError("Please select a Product and enter at least one Serial Number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/inventory/serials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          serialNumber: serialNumber.trim(),
          imei: imei.trim() || null,
          status,
          warrantyExpiry: warrantyExpiry || null,
          incrementStock,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add serial number.");
        return;
      }
      setOpen(false);
      setSerialNumber("");
      setImei("");
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
          setProductId(products[0]?.id || "");
          setError("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
      >
        <PlusCircle className="h-4 w-4" /> Add Serial / IMEI
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Register Hardware Serial / IMEI</h3>
                <p className="text-[11px] text-slate-500">
                  Tip: Paste multiple serials separated by commas or new lines for batch entry
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hardware Product *</label>
                {products.length === 0 ? (
                  <p className="text-rose-600 font-medium">
                    No products found. Please add a Product first under Hardware &amp; Products.
                  </p>
                ) : (
                  <select
                    required
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Serial / Barcode Number(s) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. GRV-UHF-2026-001 (or comma/newline separated list)"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full admin-input py-2 px-3 font-mono uppercase resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IMEI / Chip ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="For single unit entry"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={warrantyExpiry}
                    onChange={(e) => setWarrantyExpiry(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    <option value="IN_STOCK">IN STOCK</option>
                    <option value="UNDER_SERVICE">UNDER SERVICE</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 pt-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={incrementStock}
                    onChange={(e) => setIncrementStock(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Add to Product Stock</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Batch / vendor reference or warehouse shelf..."
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
                  disabled={loading || products.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> {loading ? "Saving..." : "Register Serial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
