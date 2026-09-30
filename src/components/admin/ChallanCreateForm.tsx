"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Send, Truck } from "lucide-react";
import Link from "next/link";

interface CustomerOption {
  id: string;
  companyName: string;
  state: string;
  stateCode: string;
}

interface ProductOption {
  id: string;
  name: string;
  hsnCode: string;
  currentStock: number;
}

export function ChallanCreateForm({
  customers,
  products,
}: {
  customers: CustomerOption[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [challanType, setChallanType] = useState("RETURNABLE");
  const [reason, setReason] = useState("DEMO_TESTING");
  const [transporterName, setTransporterName] = useState("BlueDart Express");
  const [vehicleNumber, setVehicleNumber] = useState("HR-26-BR-9912");
  const [notes, setNotes] = useState("Hardware demo kit dispatched for on-site client feasibility trial.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [items, setItems] = useState<
    {
      productId: string;
      description: string;
      hsnCode: string;
      quantity: number;
      serialNumbersList: string;
    }[]
  >([
    {
      productId: products[0]?.id || "",
      description: products[0]?.name || "",
      hsnCode: products[0]?.hsnCode || "8471",
      quantity: 1,
      serialNumbersList: "GX400-26-00103",
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
      serialNumbersList: newItems[index].serialNumbersList || "",
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
        description: defaultProd?.name || "",
        hsnCode: defaultProd?.hsnCode || "8471",
        quantity: 1,
        serialNumbersList: "",
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError("Please select a customer.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/challans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          challanType,
          reason,
          transporterName,
          vehicleNumber,
          notes,
          items,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/challans");
        router.refresh();
      } else {
        setError(data.error || "Failed to create delivery challan.");
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
          href="/admin/challans"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Challans
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-xs font-bold uppercase text-black shadow-md hover:opacity-90 disabled:opacity-50"
        >
          <Truck className="h-4 w-4" /> {loading ? "Issuing..." : "Issue Delivery Challan"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Customer & Challan Mode Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Challan Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Customer / Consignee *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg cyber-input py-2.5 px-3 text-xs"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.companyName} ({c.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Challan Classification *
            </label>
            <select
              value={challanType}
              onChange={(e) => setChallanType(e.target.value)}
              className="w-full rounded-lg cyber-input py-2.5 px-3 text-xs font-bold"
            >
              <option value="RETURNABLE">RETURNABLE (Demo / Testing Kit / Trial)</option>
              <option value="NON_RETURNABLE">NON-RETURNABLE (Direct Installation / Dispatch)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dispatch Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg cyber-input py-2.5 px-3 text-xs"
            >
              <option value="DEMO_TESTING">Demo / Site Feasibility Testing</option>
              <option value="DEPLOYMENT_INSTALLATION">Phase Deployment / Installation</option>
              <option value="REPAIR_REPLACEMENT">Replacement / Service Unit</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Transporter Name
            </label>
            <input
              type="text"
              placeholder="e.g. BlueDart Express / Delhivery / By Hand"
              value={transporterName}
              onChange={(e) => setTransporterName(e.target.value)}
              className="w-full rounded-lg cyber-input py-2.5 px-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vehicle / LR Number
            </label>
            <input
              type="text"
              placeholder="e.g. HR-26-BR-9912"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full rounded-lg cyber-input py-2.5 px-3 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Dispatched Items & Serial Numbers */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hardware Items & Serial Numbers</h3>
          <button
            type="button"
            onClick={addItemRow}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            <Plus className="h-4 w-4" /> Add Hardware Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/80 bg-[#090e18] p-3 text-xs"
            >
              <div className="col-span-12 sm:col-span-4">
                <label className="block text-[10px] text-slate-400 mb-1">Product</label>
                <select
                  value={item.productId}
                  onChange={(e) => handleProductSelect(idx, e.target.value)}
                  className="w-full rounded cyber-input py-1.5 px-2 text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-12 sm:col-span-3">
                <label className="block text-[10px] text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                  className="w-full rounded cyber-input py-1.5 px-2 text-xs"
                />
              </div>

              <div className="col-span-4 sm:col-span-1">
                <label className="block text-[10px] text-slate-400 mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                  className="w-full rounded cyber-input py-1.5 px-2 text-xs font-mono"
                />
              </div>

              <div className="col-span-8 sm:col-span-3">
                <label className="block text-[10px] text-slate-400 mb-1">Attached Serial / IMEI Numbers</label>
                <input
                  type="text"
                  placeholder="e.g. GX400-001, GX400-002"
                  value={item.serialNumbersList}
                  onChange={(e) => handleItemChange(idx, "serialNumbersList", e.target.value)}
                  className="w-full rounded cyber-input py-1.5 px-2 text-xs font-mono text-cyan-300"
                />
              </div>

              <div className="col-span-12 sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Challan Dispatch Notes</h3>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg cyber-input p-3 text-xs leading-relaxed"
        ></textarea>
      </div>
    </form>
  );
}
