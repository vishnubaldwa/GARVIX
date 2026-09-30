"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Building2, UserPlus } from "lucide-react";

const INDIAN_STATES = [
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "24", name: "Gujarat" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "33", name: "Tamil Nadu" },
  { code: "19", name: "West Bengal" },
  { code: "10", name: "Bihar" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
];

export function ClientCreateModal({
  onCreated,
  buttonLabel = "Add New Client",
  buttonClassName,
}: {
  onCreated?: (newCustomer: any) => void;
  buttonLabel?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [stateCode, setStateCode] = useState("06");
  const [state, setState] = useState("Haryana");
  const [billingAddress, setBillingAddress] = useState("");
  const [isB2B, setIsB2B] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGstinChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/\s/g, "");
    setGstin(cleaned);
    if (cleaned.length >= 2) {
      const code = cleaned.substring(0, 2);
      const matched = INDIAN_STATES.find((s) => s.code === code);
      if (matched) {
        setStateCode(matched.code);
        setState(matched.name);
      }
    }
  };

  const handleStateChange = (code: string) => {
    setStateCode(code);
    const matched = INDIAN_STATES.find((s) => s.code === code);
    if (matched) {
      setState(matched.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !phone.trim()) {
      setError("Company Name and Phone Number are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/clients/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactPerson: contactPerson.trim() || null,
          phone: phone.trim(),
          email: email.trim() || null,
          gstin: gstin.trim() || null,
          state,
          stateCode,
          billingAddress: billingAddress.trim() || null,
          isB2B,
        }),
      });

      const data = await res.json();
      if (res.ok && data.customer) {
        setOpen(false);
        setCompanyName("");
        setContactPerson("");
        setPhone("");
        setEmail("");
        setGstin("");
        setBillingAddress("");

        if (onCreated) {
          onCreated(data.customer);
        } else {
          router.refresh();
        }
      } else {
        setError(data.error || "Failed to create client.");
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
        className={
          buttonClassName ||
          "flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
        }
      >
        <UserPlus className="h-4 w-4" /> {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Business Client</h3>
                  <p className="text-xs text-slate-500">Register customer for quotations, delivery challans, and GST billing.</p>
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
                    Company / Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reliance Retail Ltd or Tanishq Jewellers"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma (Store Manager)"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. billing@relianceretail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Client GSTIN (15 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 06AAACG1234F1Z5"
                    value={gstin}
                    onChange={(e) => handleGstinChange(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    State (Place of Supply) *
                  </label>
                  <select
                    value={stateCode}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code}) {s.code === "06" ? "• (Home State - CGST+SGST)" : "• (IGST)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isB2B"
                    checked={isB2B}
                    onChange={(e) => setIsB2B(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isB2B" className="text-xs font-semibold text-slate-700">
                    B2B Registered Entity (for GSTR-1 B2B Sheet)
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Billing / Shipping Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Plot No 44, Udyog Vihar Phase 4, Gurugram, Haryana - 122016"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
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
                  <Plus className="h-4 w-4" /> {loading ? "Saving Client..." : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
