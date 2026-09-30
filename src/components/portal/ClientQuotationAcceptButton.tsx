"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function ClientQuotationAcceptButton({ token }: { token: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [signName, setSignName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signName.trim()) {
      setError("Please enter your name to digitally accept this proposal.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portal/quotation/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, signature: signName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        router.refresh();
      } else {
        setError(data.error || "Failed to record acceptance.");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-black shadow-md transition"
      >
        <CheckCircle2 className="h-4 w-4" /> Accept & Approve Quotation
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/40 bg-[#0d1424] p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">Approve Proposal Digitally</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              By confirming, you approve this quotation for execution. GARVIX engineering team will proceed with order scheduling and billing.
            </p>

            {error && (
              <div className="mb-3 rounded-lg border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleAccept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Full Name / Signatory Authority *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Rathore (Managing Director)"
                  value={signName}
                  onChange={(e) => setSignName(e.target.value)}
                  className="w-full rounded-lg cyber-input py-2 px-3 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-black transition disabled:opacity-50"
                >
                  {loading ? "Confirming..." : "Confirm & Sign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
