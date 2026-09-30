"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, PackagePlus } from "lucide-react";

const CATEGORIES = [
  { value: "HARDWARE_READER", label: "Fixed RFID Reader (Hardware)", defaultHsn: "8471", unit: "PCS" },
  { value: "HARDWARE_HANDHELD", label: "Handheld RFID Scanner (Hardware)", defaultHsn: "8471", unit: "PCS" },
  { value: "HARDWARE_ANTENNA", label: "RFID Antenna (Hardware)", defaultHsn: "8523", unit: "PCS" },
  { value: "HARDWARE_TAG", label: "RFID Tags / Labels (Hardware)", defaultHsn: "8523", unit: "ROLL" },
  { value: "SOFTWARE_SERVICE", label: "Custom Software Engineering (Service)", defaultHsn: "998314", unit: "HOURS" },
  { value: "AMC_SUPPORT", label: "AMC & Maintenance Contract (Service)", defaultHsn: "998315", unit: "YEAR" },
];

export function ProductCreateModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("HARDWARE_READER");
  const [hsnCode, setHsnCode] = useState("8471");
  const [description, setDescription] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [unit, setUnit] = useState("PCS");
  const [currentStock, setCurrentStock] = useState("10");
  const [minStockAlert, setMinStockAlert] = useState("5");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCategoryChange = (catVal: string) => {
    setCategory(catVal);
    const cat = CATEGORIES.find((c) => c.value === catVal);
    if (cat) {
      setHsnCode(cat.defaultHsn);
      setUnit(cat.unit);
    }
  };

  const isHardware = category.startsWith("HARDWARE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !hsnCode.trim() || !sellingPrice) {
      setError("Item Name, SKU, HSN, and Selling Price are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category,
          hsnCode: hsnCode.trim(),
          description: description.trim() || null,
          purchasePrice: Number(purchasePrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          unit,
          currentStock: isHardware ? Number(currentStock) || 0 : 0,
          minStockAlert: isHardware ? Number(minStockAlert) || 5 : 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.product) {
        setOpen(false);
        setName("");
        setSku("");
        setPurchasePrice("");
        setSellingPrice("");
        setDescription("");
        router.refresh();
      } else {
        setError(data.error || "Failed to create item.");
      }
    } catch {
      setError("Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
      >
        <PackagePlus className="h-4 w-4" /> Add New Item / Solution
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <PackagePlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Item / Solution Master</h3>
                  <p className="text-xs text-slate-500">Add hardware products, RFID tags, software modules, or AMC services.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Item / Solution Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GX-800 8-Port Fixed RFID Reader or Warehouse RFID Software"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    SKU / Unique Item Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GX-RDR-800"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full admin-input py-2 px-3 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    HSN / SAC Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8471 or 998314"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Item Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    placeholder="e.g. 75000"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cost / Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 48000"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs font-mono text-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unit of Measure *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs"
                  >
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="ROLL">ROLL (Rolls / Spools)</option>
                    <option value="SET">SET (Kits)</option>
                    <option value="HOURS">HOURS (Development Hours)</option>
                    <option value="YEAR">YEAR (Annual Maintenance)</option>
                    <option value="JOB">JOB (One-time Project)</option>
                  </select>
                </div>

                {isHardware ? (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Initial Stock In Hand
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 10"
                        value={currentStock}
                        onChange={(e) => setCurrentStock(e.target.value)}
                        className="w-full admin-input py-2 px-3 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Low Stock Alert Limit
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 5"
                        value={minStockAlert}
                        onChange={(e) => setMinStockAlert(e.target.value)}
                        className="w-full admin-input py-2 px-3 text-xs font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2 rounded-lg bg-blue-50 border border-blue-200 p-2.5 text-[11px] text-blue-700 font-medium">
                    ⚡ <i>Service Item: Stock tracking is not required for software or AMC services.</i>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Description / Specifications
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Impinj R2000 chipset, 865-867 MHz India frequency, 33dBm output"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> {loading ? "Adding Item..." : "Add to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
