"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle2, X } from "lucide-react";
import { formatINR } from "@/lib/gst";

export function RecordPaymentModal({ invoice }: { invoice: any }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(invoice.balanceDue || 0);
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/invoices/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: Number(amount),
          paymentMode,
          referenceNumber: referenceNumber.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(data.error || "Failed to record payment.");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (invoice.paymentStatus === "PAID") {
    return (
      <span className="text-[11px] text-emerald-400 font-semibold px-2 py-1 select-none">
        Settled
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setAmount(invoice.balanceDue);
          setOpen(true);
        }}
        className="flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
        title="Record Client Payment"
      >
        <CreditCard className="h-3 w-3 text-emerald-400" />
        <span>Pay</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/40 bg-[#0d1424] p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Record Payment</h3>
                <p className="text-xs text-cyan-400 font-mono mt-0.5">
                  Invoice #{invoice.invoiceNumber} • Balance Due: {formatINR(invoice.balanceDue)}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleRecord} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  max={invoice.balanceDue}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-lg cyber-input py-2 px-3 text-xs font-mono font-bold text-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full rounded-lg cyber-input py-2 px-3 text-xs"
                >
                  <option value="UPI">UPI (PhonePe, GPay, Paytm, BHIM)</option>
                  <option value="NEFT_RTGS">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                  <option value="CASH">Cash Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  UTR / Reference / Transaction No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC1290391823 or UPI Ref 41829012"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full rounded-lg cyber-input py-2 px-3 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50% advance for hardware delivery"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg cyber-input py-2 px-3 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-black transition disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
