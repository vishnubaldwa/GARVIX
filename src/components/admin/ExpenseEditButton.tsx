"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  X,
  Save,
  Paperclip,
  ExternalLink,
  Trash2,
  Plus,
} from "lucide-react";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  EXPENSE_PAYMENT_MODES,
  REIMBURSEMENT_STATUSES,
} from "./ExpenseCreateForm";

export interface EditableExpenseRecord {
  id: string;
  expenseDate: string; // ISO string
  category: string;
  amount: number;
  description: string;
  paymentMode: string;
  vendorName: string | null;
  paidBy: string | null;
  billNumber: string | null;
  referenceNo: string | null;
  reimbursementStatus: string;
  notes: string | null;
  hasReceipt: boolean;
  receiptName: string | null;
}

interface ExpenseEditButtonProps {
  expense: EditableExpenseRecord;
  customCategories?: string[];
  staffNames?: string[];
}

function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ExpenseEditButton({
  expense,
  customCategories = [],
  staffNames = [],
}: ExpenseEditButtonProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state initialized on open
  const [category, setCategory] = useState(expense.category);
  const [creatingCat, setCreatingCat] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => toDateInputValue(expense.expenseDate));
  const [amount, setAmount] = useState(String(expense.amount));
  const [description, setDescription] = useState(expense.description);
  const [paymentMode, setPaymentMode] = useState(expense.paymentMode || "UPI");
  const [vendorName, setVendorName] = useState(expense.vendorName || "");
  const [paidBy, setPaidBy] = useState(expense.paidBy || "Company Account");
  const [customPaidBy, setCustomPaidBy] = useState("");
  const [reimbursementStatus, setReimbursementStatus] = useState(
    expense.reimbursementStatus || "COMPANY_PAID"
  );
  const [billNumber, setBillNumber] = useState(expense.billNumber || "");
  const [referenceNo, setReferenceNo] = useState(expense.referenceNo || "");
  const [notes, setNotes] = useState(expense.notes || "");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [removeReceipt, setRemoveReceipt] = useState(false);

  const uniqueStaff = Array.from(new Set(staffNames.filter(Boolean)));

  const buildCategoryOptions = () => {
    const map = new Map<string, string>();
    DEFAULT_EXPENSE_CATEGORIES.forEach((c) => map.set(c.value, c.label));
    customCategories.forEach((cat) => {
      if (cat && !map.has(cat)) map.set(cat, `🏷️ ${cat.replace(/_/g, " ")}`);
    });
    if (category && !map.has(category)) {
      map.set(category, `🏷️ ${category.replace(/_/g, " ")}`);
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  };

  const openModal = () => {
    setCategory(expense.category);
    setCreatingCat(false);
    setNewCat("");
    setExpenseDate(toDateInputValue(expense.expenseDate));
    setAmount(String(expense.amount));
    setDescription(expense.description);
    setPaymentMode(expense.paymentMode || "UPI");
    setVendorName(expense.vendorName || "");

    const initialPaid = expense.paidBy || "Company Account";
    if (initialPaid === "Company Account" || uniqueStaff.includes(initialPaid)) {
      setPaidBy(initialPaid);
      setCustomPaidBy("");
    } else {
      setPaidBy("__OTHER__");
      setCustomPaidBy(initialPaid);
    }

    setReimbursementStatus(expense.reimbursementStatus || "COMPANY_PAID");
    setBillNumber(expense.billNumber || "");
    setReferenceNo(expense.referenceNo || "");
    setNotes(expense.notes || "");
    setReceiptFile(null);
    setRemoveReceipt(false);
    setError("");
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const resolvedPaidBy =
        paidBy === "__OTHER__" ? customPaidBy.trim() : paidBy;

      const formData = new FormData();
      formData.append("category", category);
      formData.append("expenseDate", expenseDate);
      formData.append("amount", String(numericAmount));
      formData.append("description", description.trim());
      formData.append("paymentMode", paymentMode);
      formData.append("vendorName", vendorName.trim());
      formData.append("paidBy", resolvedPaidBy);
      formData.append("reimbursementStatus", reimbursementStatus);
      formData.append("billNumber", billNumber.trim());
      formData.append("referenceNo", referenceNo.trim());
      formData.append("notes", notes.trim());
      if (removeReceipt) formData.append("removeReceipt", "true");
      if (receiptFile) formData.append("receipt", receiptFile);

      const res = await fetch(`/api/admin/expenses/${expense.id}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update expense.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error occurred while updating.");
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = buildCategoryOptions();

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        title="Edit expense (Super Admin)"
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Expense Entry</h3>
                <p className="text-[11px] text-slate-500">
                  Super Admin Control • Changes are recorded in Security Audit Logs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs text-left font-sans">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Category *</label>
                  <button
                    type="button"
                    onClick={() => setCreatingCat((v) => !v)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" /> {creatingCat ? "Cancel" : "New Category"}
                  </button>
                </div>
                {creatingCat ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Custom category name"
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      className="flex-1 admin-input py-2 px-3"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const t = newCat.trim();
                        if (t) {
                          setCategory(t);
                          setCreatingCat(false);
                          setNewCat("");
                        }
                      }}
                      className="rounded-lg bg-blue-600 px-3 py-2 font-bold text-white hover:bg-blue-700"
                    >
                      Use
                    </button>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full admin-input py-2 px-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor / Paid To</label>
                  <input
                    type="text"
                    placeholder="Vendor or party name"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid By</label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full admin-input py-2 px-3"
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
                  <label className="block font-semibold text-slate-700 mb-1">Reimbursement Status</label>
                  <select
                    value={reimbursementStatus}
                    onChange={(e) => setReimbursementStatus(e.target.value)}
                    className="w-full admin-input py-2 px-3"
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
                  <label className="block font-semibold text-slate-700 mb-1">Paid By Name</label>
                  <input
                    type="text"
                    placeholder="Enter Director / Staff name"
                    value={customPaidBy}
                    onChange={(e) => setCustomPaidBy(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bill / Invoice No.</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-08"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UTR / Txn Ref No.</label>
                  <input
                    type="text"
                    placeholder="Bank / UPI reference"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
              </div>

              {/* Bill / Receipt Section */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Bill / Receipt Attachment</label>
                {expense.hasReceipt && !removeReceipt && !receiptFile && (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2">
                    <a
                      href={`/api/admin/expenses/${expense.id}/receipt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:underline truncate"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{expense.receiptName || "View Attached Bill"}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setRemoveReceipt(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 shrink-0 ml-2"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-2 cursor-pointer transition text-slate-600 truncate">
                    <Paperclip className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">
                      {receiptFile
                        ? receiptFile.name
                        : expense.hasReceipt && !removeReceipt
                        ? "Upload new file to replace bill"
                        : "Attach bill photo or PDF (max 10 MB)"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setReceiptFile(f);
                        if (f) setRemoveReceipt(false);
                      }}
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
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional details or project context..."
                  className="w-full admin-input py-2 px-3 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
