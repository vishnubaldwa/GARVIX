"use client";

import { useEffect, useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Building,
  User,
  Layers,
  MessageSquare,
} from "lucide-react";

export function ContactForm({
  companyInfo,
  defaultRequirement = "Custom Software",
}: {
  companyInfo?: { phone?: string; email?: string; state?: string };
  defaultRequirement?: string;
}) {
  const contactEmail = companyInfo?.email?.trim() || "info@garvix.in";
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    requirementType: defaultRequirement,
    requirementDetails: "",
  });
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const handleSelectSolution = (event: Event) => {
      const customEvent = event as CustomEvent<{ solution: string }>;
      if (customEvent.detail?.solution) {
        setFormData((prev) => ({
          ...prev,
          requirementType: customEvent.detail.solution,
        }));
        setHighlighted(true);
        setTimeout(() => setHighlighted(false), 1800);
      }
    };

    window.addEventListener("garvix:select-solution", handleSelectSolution);
    return () => {
      window.removeEventListener("garvix:select-solution", handleSelectSolution);
    };
  }, []);

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
          text:
            data.message ||
            `Thank you! Your enquiry has been sent to ${contactEmail}. Our team will contact you shortly.`,
        });
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          requirementType: "Custom Software",
          requirementDetails: "",
        });
      } else {
        setResponseMsg({
          type: "error",
          text: data.error || "Submission failed. Please check your details and try again.",
        });
      }
    } catch {
      setResponseMsg({
        type: "error",
        text: `Network error. Please try again or email us directly at ${contactEmail}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="contact"
      className={`mx-auto max-w-3xl rounded-3xl border bg-white p-6 sm:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.04)] transition-all duration-300 scroll-mt-24 ${
        highlighted
          ? "border-[#0071e3] ring-4 ring-[#0071e3]/15"
          : "border-black/[0.08]"
      }`}
    >
      <div className="text-center max-w-lg mx-auto mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
          Get in Touch
        </p>
        <h3 className="mt-2 text-2xl sm:text-4xl font-bold text-[#1d1d1f] tracking-tight">
          Tell us what you need.
        </h3>
        <p className="mt-2.5 text-sm text-[#86868b]">
          Request RFID samples, pricing, or discuss custom software tailored to your workflow. Enquiries go directly to{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="text-[#1d1d1f] font-medium hover:text-[#0071e3] underline underline-offset-2"
          >
            {contactEmail}
          </a>
          .
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
            <label className="block text-xs font-medium text-[#424245] mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
              <input
                type="text"
                required
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7]/60 py-2.5 pl-10 pr-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#0071e3]/15 focus:border-[#0071e3] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#424245] mb-1.5">
              Company / Business Name
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
              <input
                type="text"
                placeholder="Company name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7]/60 py-2.5 pl-10 pr-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#0071e3]/15 focus:border-[#0071e3] transition"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#424245] mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7]/60 py-2.5 pl-10 pr-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#0071e3]/15 focus:border-[#0071e3] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#424245] mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7]/60 py-2.5 pl-10 pr-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#0071e3]/15 focus:border-[#0071e3] transition font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#424245] mb-1.5">
            What are you looking for? <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Layers className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
            <select
              value={formData.requirementType}
              onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
              className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7]/60 py-2.5 pl-10 pr-3 text-sm font-medium text-[#1d1d1f] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#0071e3]/15 focus:border-[#0071e3] transition"
            >
              <option value="Retail POS & Store ERP">Retail POS &amp; Store ERP Software</option>
              <option value="Business ERP & Mobile App">GARVIX Business ERP &amp; Android Mobile App</option>
              <option value="Restaurant & Café Software">GARVIX Restaurant &amp; Caf&eacute; POS + KDS Software</option>
              <option value="Custom Software">Custom Software Development (ERP / App / Web)</option>
              <option value="Jewellery RFID">Jewellery RFID Tags & Software</option>
              <option value="Garment RFID">Garment Hang Tags, Hard Tags & Retail POS</option>
              <option value="Laundry RFID">Textile Laundry RFID Tags & Software</option>
              <option value="Anti-Metal RFID">Anti-Metal Industrial Tags & Asset Software</option>
              <option value="Vehicle RFID">Vehicle RFID Pass & Boom Barrier Software</option>
              <option value="Printable Rolls & Inlays">Printable RFID Label Rolls & Inlays</option>
              <option value="Complete Hardware + Software">Complete Turnkey Hardware + Software</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#424245] mb-1.5">
            Requirement Details <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
            <textarea
              required
              rows={3}
              placeholder="Briefly tell us about your requirement, quantity, or software workflow..."
              value={formData.requirementDetails}
              onChange={(e) => setFormData({ ...formData, requirementDetails: e.target.value })}
              className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7]/60 py-2.5 pl-10 pr-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#0071e3]/15 focus:border-[#0071e3] transition"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] py-3.5 px-6 text-sm font-medium text-white shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition disabled:opacity-50"
        >
          {loading ? (
            <span>Sending Enquiry...</span>
          ) : (
            <>
              <span>Send Enquiry</span>
              <Send className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="pt-4 border-t border-black/[0.06] flex flex-wrap items-center justify-center gap-6 text-xs text-[#86868b]">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-[#0071e3]" />
            <a
              href={`mailto:${contactEmail}`}
              className="text-[#1d1d1f] hover:text-[#0071e3] font-medium transition"
            >
              {contactEmail}
            </a>
          </div>
          {companyInfo?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[#0071e3]" />
              <a
                href={`tel:${companyInfo.phone.replace(/[^0-9+]/g, "")}`}
                className="text-[#1d1d1f] hover:text-[#0071e3] font-mono font-medium transition"
              >
                {companyInfo.phone}
              </a>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}