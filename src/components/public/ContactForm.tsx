"use client";

import { useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Building,
  User,
  Layers,
  Briefcase,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export function ContactForm({
  companyInfo,
  defaultRequirement = "Custom Software",
}: {
  companyInfo?: { phone?: string; email?: string; state?: string };
  defaultRequirement?: string;
}) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    industry: "Retail & Jewellery",
    requirementType: defaultRequirement,
    requirementDetails: "",
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
          text: "Thank you! Your requirements have been submitted successfully. A GARVIX technology consultant will connect with you within 2 business hours.",
        });
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          industry: "Retail & Jewellery",
          requirementType: "Custom Software",
          requirementDetails: "",
        });
      } else {
        setResponseMsg({
          type: "error",
          text: data.error || "Submission failed. Please verify your details and try again.",
        });
      }
    } catch {
      setResponseMsg({
        type: "error",
        text: "Network error occurred. Please try again or call our engineering desk directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="contact"
      className="mx-auto max-w-4xl rounded-3xl border border-cyan-500/30 bg-[#0a0f1e]/95 p-6 sm:p-10 shadow-[0_0_60px_rgba(0,242,254,0.12)] backdrop-blur-xl relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-600/10 blur-[90px] pointer-events-none"></div>

      <div className="text-center max-w-xl mx-auto mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-3 shadow-[0_0_15px_rgba(0,242,254,0.2)]">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Real-Time Consultation & Architecture Design</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Request a Solution <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Proposal & Demo</span>
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
          Tell us how your business works. Our engineers will design a customized software or RFID automation system around your exact operations.
        </p>
      </div>

      {responseMsg && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-2xl p-4 text-xs font-medium ${
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
          <span className="leading-relaxed">{responseMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. Vikram Singhania"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl cyber-input py-2.5 pl-9 pr-3 text-xs focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Company / Institution Name
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Acme Enterprise Pvt Ltd"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full rounded-xl cyber-input py-2.5 pl-9 pr-3 text-xs focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Work Email Address <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="vikram@acme.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl cyber-input py-2.5 pl-9 pr-3 text-xs focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Phone / WhatsApp Number <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl cyber-input py-2.5 pl-9 pr-3 text-xs focus:ring-1 focus:ring-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Industry <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full rounded-xl cyber-input py-2.5 pl-9 pr-3 text-xs focus:ring-1 focus:ring-cyan-400"
              >
                <option value="Retail & Jewellery">Retail & Jewellery</option>
                <option value="Education & Schools">Education & Schools</option>
                <option value="Warehousing & Logistics">Warehousing & Logistics</option>
                <option value="Manufacturing & WIP">Manufacturing & WIP</option>
                <option value="Corporate Offices & IT">Corporate Offices & IT</option>
                <option value="Healthcare & Hospitals">Healthcare & Hospitals</option>
                <option value="Hospitality & Hotels">Hospitality & Hotels</option>
                <option value="Distribution & Wholesale">Distribution & Wholesale</option>
                <option value="Other">Other Industry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Requirement Type <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <select
                value={formData.requirementType}
                onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                className="w-full rounded-xl cyber-input py-2.5 pl-9 pr-3 text-xs focus:ring-1 focus:ring-cyan-400 font-semibold text-cyan-300"
              >
                <option value="Custom Software">Custom Software</option>
                <option value="RFID Automation">RFID Automation</option>
                <option value="POS / Retail">POS / Retail</option>
                <option value="Inventory Automation">Inventory Automation</option>
                <option value="School Automation">School Automation</option>
                <option value="ERP">ERP System</option>
                <option value="Other">Other Requirement</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Requirement Details / Project Scope <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <textarea
              required
              rows={4}
              placeholder="Describe your current operational process, number of users/locations, hardware needs, timeline, or pain points..."
              value={formData.requirementDetails}
              onChange={(e) => setFormData({ ...formData, requirementDetails: e.target.value })}
              className="w-full rounded-xl cyber-input py-2.5 pl-9 pr-3 text-xs focus:ring-1 focus:ring-cyan-400"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(0,242,254,0.4)] transition hover:opacity-95 disabled:opacity-50 overflow-hidden"
        >
          {loading ? (
            <span>Transmitting to Engineering Desk...</span>
          ) : (
            <>
              <span>Submit Requirement to GARVIX Engineers</span>
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        {companyInfo?.phone && (
          <div className="mt-4 pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-cyan-400" />
              <span>
                Call Desk:{" "}
                <a
                  href={`tel:${companyInfo.phone.replace(/[^0-9+]/g, "")}`}
                  className="text-white hover:text-cyan-400 font-mono font-bold transition"
                >
                  {companyInfo.phone}
                </a>
              </span>
            </div>
            {companyInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-400" />
                <span>
                  Email:{" "}
                  <a
                    href={`mailto:${companyInfo.email}`}
                    className="text-white hover:text-cyan-400 font-mono font-bold transition"
                  >
                    {companyInfo.email}
                  </a>
                </span>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
