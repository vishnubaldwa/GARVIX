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
  MessageCircle,
} from "lucide-react";

export function ContactForm({
  companyInfo,
  defaultRequirement = "Jewellery RFID",
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
          text: "Thank you! Your inquiry has been received. Our solutions engineering team will reach out within 2 hours.",
        });
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          industry: "Retail & Jewellery",
          requirementType: "Jewellery RFID",
          requirementDetails: "",
        });
      } else {
        setResponseMsg({
          type: "error",
          text: data.error || "Submission failed. Please check your inputs and try again.",
        });
      }
    } catch {
      setResponseMsg({
        type: "error",
        text: "Network error occurred. Please try again or chat directly on WhatsApp.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="contact"
      className="mx-auto max-w-4xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.05)] relative overflow-hidden"
    >
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-3">
          <span>Schedule On-Site Consultation</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Request a Custom Proposal & Live Demo
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
          Tell us about your operations. We will demonstrate how GARVIX RFID and tailored software eliminate manual errors and streamline your workflows.
        </p>
      </div>

      {responseMsg && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-2xl p-4 text-xs font-medium ${
            responseMsg.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {responseMsg.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          )}
          <span className="leading-relaxed">{responseMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Company / Business Name
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Sharma Jewellers & Exports"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Work Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="rahul@sharmajewellers.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Phone / WhatsApp Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="+91 99507 18876"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Industry Domain <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="Retail & Jewellery">Jewellery & Gemstones</option>
                <option value="Warehousing & Logistics">Warehousing & Logistics</option>
                <option value="Manufacturing & WIP">Manufacturing & Factory Assembly</option>
                <option value="Education & Schools">Education & Campus RFID</option>
                <option value="Corporate Offices & IT">Corporate Asset Tracking</option>
                <option value="Healthcare & Hospitals">Healthcare & Linen Tracking</option>
                <option value="Other">Other Enterprise Workflow</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Primary Solution Needed <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Layers className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <select
                value={formData.requirementType}
                onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs font-semibold text-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="Jewellery RFID">Jewellery RFID Tags & JewelTrack™ ERP</option>
                <option value="Garment Tags">Garment Hang Tags & Apparel Retail POS</option>
                <option value="Hard Security Tags">EAS Hard Tags & Anti-Theft Gates</option>
                <option value="Laundry RFID">Textile Laundry Tags & LinenTrack™ ERP</option>
                <option value="Anti-Metal Tags">Anti-Metal Tags & Plant Machinery ERP</option>
                <option value="Vehicle Pass">Vehicle Windshield Pass & Boom Barrier</option>
                <option value="Printable Rolls">Printable RFID Rolls & Clear Inlays</option>
                <option value="Custom Software">Bespoke Enterprise Software & Cloud ERP</option>
                <option value="Complete Solution">Complete Turnkey Hardware + Software Solution</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Operational Overview & Pain Points <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <textarea
              required
              rows={3}
              placeholder="Tell us about your current audit process, number of inventory items or locations, and what challenges you want to eliminate..."
              value={formData.requirementDetails}
              onChange={(e) => setFormData({ ...formData, requirementDetails: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            ></textarea>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-slate-900 hover:bg-black py-3 px-6 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
          >
            {loading ? (
              <span>Submitting Details...</span>
            ) : (
              <>
                <span>Submit Inquiry to Engineering Team</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          <a
            href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20would%20like%20to%20schedule%20a%20live%20RFID%20and%20Software%20demonstration"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 py-3 px-6 text-xs font-semibold text-slate-800 shadow-sm transition"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>Chat Directly on WhatsApp</span>
          </a>
        </div>

        {companyInfo?.phone && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Direct Line:{" "}
                <a
                  href={`tel:${companyInfo.phone.replace(/[^0-9+]/g, "")}`}
                  className="text-slate-900 hover:text-blue-600 font-mono font-medium transition"
                >
                  {companyInfo.phone}
                </a>
              </span>
            </div>
            {companyInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Email:{" "}
                  <a
                    href={`mailto:${companyInfo.email}`}
                    className="text-slate-900 hover:text-blue-600 font-mono font-medium transition"
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