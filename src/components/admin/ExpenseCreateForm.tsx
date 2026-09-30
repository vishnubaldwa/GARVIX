"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send } from "lucide-react";

export function ExpenseCreateForm() {
  const router = useRouter();
  const [category, setCategory] = useState("TRAVEL");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description.trim()) {
      setError("Please fill in valid amount and description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/expenses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          description: description.trim(),
          paymentMode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setDescription("");
        setAmount("");
        router.refresh();
      } else {
        setError(data.error || "Failed to log expense.");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="rounded border border-rose-500/40 bg-rose-950/40 p-2 text-rose-300">
          {error}
        </div>
      )}

      <div>
        <label className="block text-slate-300 font-semibold mb-1">Expense Category *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg cyber-input py-2 px-3"
        >
          <option value="TRAVEL">✈️ Travel & Site Survey</option>
          <option value="HARDWARE_RND">🔧 Hardware R&D & Prototyping</option>
          <option value="CLOUD_SERVER">☁️ Cloud Servers & Subscriptions</option>
          <option value="OFFICE_SUPPLIES">🏢 Office & Facility</option>
          <option value="MARKETING">📢 Marketing & Leads</option>
          <option value="MISC">⚡ Miscellaneous</option>
        </select>
      </div>

      <div>
        <label className="block text-slate-300 font-semibold mb-1">Amount (₹) *</label>
        <input
          type="number"
          min="1"
          required
          placeholder="e.g. 4500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg cyber-input py-2 px-3 font-mono font-bold text-white"
        />
      </div>

      <div>
        <label className="block text-slate-300 font-semibold mb-1">Description *</label>
        <input
          type="text"
          required
          placeholder="e.g. Gurugram to Jaipur site audit travel"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg cyber-input py-2 px-3"
        />
      </div>

      <div>
        <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          className="w-full rounded-lg cyber-input py-2 px-3"
        >
          <option value="UPI">UPI</option>
          <option value="NEFT_RTGS">Bank Transfer (NEFT/IMPS)</option>
          <option value="COMPANY_CARD">Corporate Card</option>
          <option value="CASH">Petty Cash</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-amber-600 py-2.5 font-bold uppercase text-black hover:opacity-90 transition disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> {loading ? "Recording..." : "Log Expense Entry"}
      </button>
    </form>
  );
}
