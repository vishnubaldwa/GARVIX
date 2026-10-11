"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Tag } from "lucide-react";

const DEFAULT_CATEGORIES: { value: string; label: string }[] = [
  { value: "TRAVEL", label: "✈️ Travel & Site Survey" },
  { value: "HARDWARE_RND", label: "🔧 Hardware R&D & Prototyping" },
  { value: "CLOUD_SERVER", label: "☁️ Cloud Servers & Subscriptions" },
  { value: "OFFICE_SUPPLIES", label: "🏢 Office & Facility" },
  { value: "MARKETING", label: "📢 Marketing & Leads" },
  { value: "MISC", label: "⚡ Miscellaneous" },
];

interface ExpenseCreateFormProps {
  initialCustomCategories?: string[];
}

export function ExpenseCreateForm({ initialCustomCategories = [] }: ExpenseCreateFormProps) {
  const router = useRouter();

  // Combine default categories with any existing custom categories from DB
  const [categories, setCategories] = useState<{ value: string; label: string }[]>(() => {
    const list = [...DEFAULT_CATEGORIES];
    const defaultValues = new Set(DEFAULT_CATEGORIES.map((c) => c.value));

    initialCustomCategories.forEach((cat) => {
      if (cat && !defaultValues.has(cat)) {
        list.push({
          value: cat,
          label: `🏷️ ${cat.replace(/_/g, " ")}`,
        });
        defaultValues.add(cat);
      }
    });

    return list;
  });

  const [category, setCategory] = useState("TRAVEL");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Also sync categories from localStorage
  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem("garvix_custom_expense_categories") || "[]");
      if (Array.isArray(stored) && stored.length > 0) {
        setCategories((prev) => {
          const existingValues = new Set(prev.map((c) => c.value));
          const toAdd = stored
            .filter((cat) => cat && !existingValues.has(cat))
            .map((cat) => ({
              value: cat,
              label: `🏷️ ${cat.replace(/_/g, " ")}`,
            }));
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
        });
      }
    } catch {}
  }, []);

  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    // Check if category exists (case-insensitive)
    const existing = categories.find(
      (c) => c.value.toLowerCase() === trimmed.toLowerCase() || c.label.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      setCategory(existing.value);
      setIsCreatingNew(false);
      setNewCategoryName("");
      return;
    }

    const newEntry = {
      value: trimmed,
      label: `🏷️ ${trimmed}`,
    };

    setCategories((prev) => [...prev, newEntry]);
    setCategory(newEntry.value);
    setIsCreatingNew(false);
    setNewCategoryName("");

    // Persist to localStorage
    try {
      const stored: string[] = JSON.parse(localStorage.getItem("garvix_custom_expense_categories") || "[]");
      if (!stored.includes(trimmed)) {
        stored.push(trimmed);
        localStorage.setItem("garvix_custom_expense_categories", JSON.stringify(stored));
      }
    } catch {}
  };

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
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700 font-medium">
          {error}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-slate-700 font-semibold">Expense Category *</label>
          {!isCreatingNew && (
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> New Category
            </button>
          )}
        </div>

        <select
          value={isCreatingNew ? "__CREATE_NEW__" : category}
          onChange={(e) => {
            if (e.target.value === "__CREATE_NEW__") {
              setIsCreatingNew(true);
            } else {
              setCategory(e.target.value);
              setIsCreatingNew(false);
            }
          }}
          className="w-full admin-input py-2 px-3"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
          <option value="__CREATE_NEW__" className="text-blue-600 font-bold">
            ➕ + Create New Category...
          </option>
        </select>

        {isCreatingNew && (
          <div className="mt-2.5 p-3 rounded-xl border border-blue-200 bg-blue-50/70 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-blue-600" /> Create Custom Category
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-slate-400 hover:text-slate-600"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Staff Welfare, Food & Snacks, Tooling..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNewCategory();
                  } else if (e.key === "Escape") {
                    setIsCreatingNew(false);
                  }
                }}
                className="flex-1 admin-input py-1.5 px-3 text-xs bg-white text-slate-900 font-medium placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shrink-0"
              >
                Save
              </button>
            </div>
            <p className="text-[10px] text-blue-700/80">
              Tip: Press Enter to save and automatically select this category.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-slate-700 font-semibold mb-1">Amount (₹) *</label>
        <input
          type="number"
          min="1"
          required
          placeholder="e.g. 4500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full admin-input py-2 px-3 font-mono font-bold text-slate-900"
        />
      </div>

      <div>
        <label className="block text-slate-700 font-semibold mb-1">Description *</label>
        <input
          type="text"
          required
          placeholder="e.g. Gurugram to Jaipur site audit travel"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full admin-input py-2 px-3"
        />
      </div>

      <div>
        <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          className="w-full admin-input py-2 px-3"
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
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 font-bold uppercase text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
      >
        <Plus className="h-4 w-4" /> {loading ? "Recording..." : "Log Expense Entry"}
      </button>
    </form>
  );
}
