"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Phone, Mail, Building, User, HelpCircle } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    solution: "RFID_JEWELLERY",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setResponseMsg({
          type: "success",
          text: "Enquiry submitted successfully! A notification has been dispatched to our Telegram operations bot.",
        });
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          solution: "RFID_JEWELLERY",
          message: "",
        });
      } else {
        setResponseMsg({
          type: "error",
          text: data.error || "Submission failed. Please check details and try again.",
        });
      }
    } catch {
      setResponseMsg({
        type: "error",
        text: "Network error occurred. Please try again or call us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact" className="mx-auto max-w-4xl rounded-2xl border border-cyan-500/30 bg-[#0a0f1e]/90 p-6 md:p-10 shadow-[0_0_60px_rgba(0,242,254,0.12)]">
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-3">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          Instant Telegram Dispatch Connected
        </div>
        <h3 className="text-2xl md:text-3xl font-extrabold text-white">
          Request a Custom <span className="text-cyan-400">Solution & Demo</span>
        </h3>
        <p className="mt-2 text-xs md:text-sm text-slate-400">
          Tell us about your RFID hardware requirements or custom software needs. Our Haryana engineering desk receives your query in real-time.
        </p>
      </div>

      {responseMsg && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-xl p-4 text-xs font-medium ${
            responseMsg.type === "success"
              ? "border border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
              : "border border-rose-500/40 bg-rose-950/30 text-rose-300"
          }`}
        >
          {responseMsg.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          )}
          <span>{responseMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. Vikram Rathore"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg cyber-input py-2.5 pl-9 pr-3 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Company / Business Name
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Royal Jewels Pvt Ltd"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full rounded-lg cyber-input py-2.5 pl-9 pr-3 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="contact@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg cyber-input py-2.5 pl-9 pr-3 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Phone / WhatsApp Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg cyber-input py-2.5 pl-9 pr-3 text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Primary Area of Interest *
          </label>
          <div className="relative">
            <select
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              className="w-full rounded-lg cyber-input py-2.5 px-3 text-xs"
            >
              <option value="RFID_JEWELLERY">💎 Jewellery RFID Real-Time Stock Audit System</option>
              <option value="RFID_WAREHOUSE">📦 Warehouse, Pallet & Dispatch Verification RFID</option>
              <option value="RFID_ASSET">💻 IT Equipment & High-Value Fixed Asset Tracking</option>
              <option value="RFID_FASTAG">🚗 FASTag Automated Boom Barrier & Parking Solution</option>
              <option value="CUSTOM_SOFTWARE">⚡ Custom ERP / Web Application / Mobile Development</option>
              <option value="OTHER">🔧 RFID Hardware Tags, Fixed Readers & Antennas Supply</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Project Scope or Specific Requirements *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Tell us about item quantity, number of locations/gates, current workflow pain points..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full rounded-lg cyber-input p-3 text-xs"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(0,242,254,0.4)] transition hover:opacity-95 disabled:opacity-50"
        >
          {loading ? (
            <span>Transmitting to Engineering Desk...</span>
          ) : (
            <>
              <span>Send Enquiry to GARVIX Team</span>
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
