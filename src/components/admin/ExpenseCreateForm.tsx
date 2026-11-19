"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Tag, Paperclip, ChevronDown, ChevronUp } from "lucide-react";

export const DEFAULT_EXPENSE_CATEGORIES: { value: string; label: string }[] = [
  { value: "TRAVEL", label: "✈️ Travel & Site Survey" },
  { value: "HARDWARE_RND", label: "🔧 Hardware R&D & Prototyping" },
  { value: "CLOUD_SERVER", label: "☁️ Cloud Servers & Subscriptions" },
  { value: "OFFICE_SUPPLIES", label: "🏢 Office & Facility" },
  { value: "MARKETING", label: "📢 Marketing & Leads" },
  { value: "MISC", label: "⚡ Miscellaneous" },
];

export const EXPENSE_PAYMENT_MODES: { value: string; label: string }[] = [
  { value: "UPI", label: "UPI" },
  { value: "NEFT_RTGS", label: "Bank Transfer (NEFT/IMPS)" },
  { value: "COMPANY_CARD", label: "Corporate Card" },
  { value: "CASH", label: "Petty Cash" },
];

export const REIMBURSEMENT_STATUSES: { value: string; label: string }[] = [
  { value: "COMPANY_PAID", label: "Company Paid (No Reimbursement)" },
  { value: "PENDING", label: "Pending Reimbursement" },
  { value: "REIMBURSED", label: "Reimbursed / Settled" },
];

function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface ExpenseCreateFormProps {
  initialCustomCategories?: string[];
  staffNames?: string[];
}

export function ExpenseCreateForm({
  initialCustomCategories = [],
  staffNames = [],
}: ExpenseCreateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<{ value: string; label: string }[]>(() => {
    const list = [...DEFAULT_EXPENSE_CATEGORIES];
    const defaultValues = new Set(DEFAULT_EXPENSE_CATEGORIES.map((c) => c.value));

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
  const [expenseDate, setExpenseDate] = useState(todayDateString);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");

  // Extra detail fields
  const [showMore, setShowMore] = useState(true);
  const [vendorName, setVendorName] = useState("");
  const [paidBy, setPaidBy] = useState("Company Account");
  const [customPaidBy, setCustomPaidBy] = useState("");
  const [reimbursementStatus, setReimbursementStatus] = useState("COMPANY_PAID");
  const [billNumber, setBillNumber] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem("garvix_custom_expense_categories") || "[]"
      );
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

    const existing = categories.find(
      (c) =>
        c.value.toLowerCase() === trimmed.toLowerCase() ||
        c.label.toLowerCase() === trimmed.toLowerCase()
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

    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem("garvix_custom_expense_categories") || "[]"
      );
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
      const resolvedPaidBy =
        paidBy === "__OTHER__" ? customPaidBy.trim() : paidBy;

      const formData = new FormData();
      formData.append("category", category);
      formData.append("amount", String(Number(amount)));
      formData.append("description", description.trim());
      formData.append("paymentMode", paymentMode);
      if (expenseDate) formData.append("expenseDate", expenseDate);
      if (vendorName.trim()) formData.append("vendorName", vendorName.trim());
      if (resolvedPaidBy) formData.append("paidBy", resolvedPaidBy);
      formData.append("reimbursementStatus", reimbursementStatus);
      if (billNumber.trim()) formData.append("billNumber", billNumber.trim());
      if (referenceNo.trim()) formData.append("referenceNo", referenceNo.trim());
      if (notes.trim()) formData.append("notes", notes.trim());
      if (receiptFile) formData.append("receipt", receiptFile);

      const res = await fetch("/api/admin/expenses/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setDescription("");
        setAmount("");
        setVendorName("");
        setBillNumber("");
        setReferenceNo("");
        setNotes("");
        setPaidBy("Company Account");
        setCustomPaidBy("");
        setReimbursementStatus("COMPANY_PAID");
        setReceiptFile(null);
        setExpenseDate(todayDateString());
        if (fileInputRef.current) fileInputRef.current.value = "";
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

  const uniqueStaff = Array.from(new Set(staffNames.filter(Boolean)));

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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
                placeholder="e.g. Company formation, Staff Welfare..."
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
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-700 font-semibold mb-1">Expense Date *</label>
          <input
            type="date"
            required
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full admin-input py-2 px-2.5 font-mono text-slate-900"
          />
        </div>
        <div>
          <label className="block text-slate-700 font-semibold mb-1">Amount (₹) *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="e.g. 4500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full admin-input py-2 px-3 font-mono font-bold text-slate-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-700 font-semibold mb-1">Description *</label>
        <input
          type="text"
          required
          placeholder="e.g. Razorpay Rize company registration fee"
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
          {EXPENSE_PAYMENT_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Collapsible Additional Details */}
      <div className="pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="w-full flex items-center justify-between py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition"
        >
          <span>Additional Details (Optional)</span>
          {showMore ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showMore && (
          <div className="mt-2.5 space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Vendor / Paid To</label>
              <input
                type="text"
                placeholder="e.g. Razorpay Rize, MCA, Amazon, Local Shop"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full admin-input py-2 px-3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Paid By</label>
                <select
                  value={paidBy}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaidBy(val);
                    if (val === "Company Account") {
                      setReimbursementStatus("COMPANY_PAID");
                    } else if (reimbursementStatus === "COMPANY_PAID") {
                      setReimbursementStatus("PENDING");
                    }
                  }}
                  className="w-full admin-input py-2 px-2.5"
                >
                  <option value="Company Account">Company Account</option>
                  {uniqueStaff.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="__OTHER__">Other Person...</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reimbursement</label>
                <select
                  value={reimbursementStatus}
                  onChange={(e) => setReimbursementStatus(e.target.value)}
                  className="w-full admin-input py-2 px-2.5"
                >
                  {REIMBURSEMENT_STATUSES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {paidBy === "__OTHER__" && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Paid By Name</label>
                <input
                  type="text"
                  placeholder="Enter Director / Staff name"
                  value={customPaidBy}
                  onChange={(e) => setCustomPaidBy(e.target.value)}
                  className="w-full admin-input py-2 px-3"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bill / Invoice No.</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-08"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  className="w-full admin-input py-2 px-2.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">UTR / Txn Ref No.</label>
                <input
                  type="text"
                  placeholder="e.g. 4291827364"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full admin-input py-2 px-2.5 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Bill / Receipt (PDF or Photo)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-2 cursor-pointer transition text-slate-600 truncate">
                  <Paperclip className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">
                    {receiptFile ? receiptFile.name : "Attach bill photo or PDF (max 10 MB)"}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {receiptFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition"
                    title="Clear file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Notes / Remarks</label>
              <textarea
                rows={2}
                placeholder="Any extra context, client/project reference, or remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full admin-input py-2 px-3 resize-none"
              />
            </div>
          </div>
        )}
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
