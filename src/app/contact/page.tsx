import { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { getCompanySettings } from "@/lib/settings";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Radio,
  Send,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Engineering Desk | GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  description:
    "Schedule an architecture consultation with GARVIX Software Solutions Private Limited. Connect with our engineering desk for custom software and RFID automation across India.",
};

export default async function ContactPage() {
  const company = await getCompanySettings();
  const cleanPhone = company.phone ? company.phone.replace(/[^0-9+]/g, "") : "";

  const faqs = [
    {
      q: "Do you provide on-site RFID hardware installation and testing?",
      a: "Yes. GARVIX engineers travel to your facility, warehouse, or retail stores across India. We mount antennas, align RF power levels to eliminate stray reads, test tag readability on physical merchandise, and train your staff on operating handheld guns and software portals.",
    },
    {
      q: "Can your custom software integrate with our existing Tally or ERP?",
      a: "Absolutely. We engineer clean REST APIs and database connectors that sync sales invoices, inventory stock movements, and item masters directly with Tally, SAP, or legacy custom accounting systems without disrupting current workflows.",
    },
    {
      q: "What warranty and support do you provide on RFID readers and antennas?",
      a: "All fixed readers, gate portals, and handheld scanner guns deployed by GARVIX include a 1-Year Comprehensive Replacement Warranty. We also offer ongoing Annual Maintenance Contracts (AMC) with preventative checkups and 24/7 Telegram/Phone support desks.",
    },
    {
      q: "How fast can a custom software or RFID solution be deployed?",
      a: "Standard turnkey solutions (such as Jewellery RFID stock audit, FASTag parking, or warehouse gate portals) typically go live within 10 to 14 business days. Complex bespoke multi-branch ERP architectures are deployed in phased sprints.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden pt-20 pb-16 border-b border-cyan-500/20 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[550px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none"></div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 mb-6 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span>Direct Engineering Consultation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Connect with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">GARVIX Engineering Desk</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tell us about your operational challenge. You will speak directly with a systems architect who understands hardware physics and enterprise software.
          </p>
        </div>
      </section>

      {/* Contact Grid: Form on Left, Direct Details on Right */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7">
              <ContactForm
                companyInfo={{
                  phone: company.phone,
                  email: company.email,
                  state: company.state,
                }}
              />
            </div>

            {/* Direct Info Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Desk Card */}
              <div className="rounded-3xl border border-cyan-500/30 bg-[#090e1c] p-6 sm:p-8 space-y-6 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    CORPORATE COMMUNICATIONS
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Direct Contact Channels
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Reach our technical leads during business hours (9:00 AM – 7:00 PM IST).
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-800 bg-[#060a14]">
                    <Phone className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Direct Phone & WhatsApp:</span>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="text-white hover:text-cyan-300 font-mono font-bold text-sm transition"
                      >
                        {company.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-800 bg-[#060a14]">
                    <Mail className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Official Email Desk:</span>
                      <a
                        href={`mailto:${company.email}`}
                        className="text-white hover:text-cyan-300 font-mono font-bold text-sm transition"
                      >
                        {company.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-800 bg-[#060a14]">
                    <MapPin className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Registered Office & Testing Lab:</span>
                      <span className="text-slate-200 leading-relaxed block mt-0.5 font-medium">
                        {company.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-800 bg-[#060a14]">
                    <Clock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Support SLA & Hours:</span>
                      <span className="text-emerald-300 font-semibold block mt-0.5">
                        Monday – Saturday: 9:00 AM – 7:00 PM IST
                      </span>
                      <span className="text-[11px] text-slate-500">24/7 emergency response for critical AMC clients</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                  <span>GSTIN: <strong className="text-white">{company.gstin}</strong></span>
                  <span className="text-cyan-400 font-semibold">State Code: {company.stateCode}</span>
                </div>
              </div>

              {/* Telegram Instant Bot Callout */}
              <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#0c1630] to-[#070b16] p-6 text-xs space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <Send className="h-4 w-4" />
                  <span>Instant Bot Dispatch</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Connected to @garvix_software_bot
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Every enquiry submitted through this portal is instantly routed to our on-call operations engineers via secure Telegram webhook dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 border-t border-slate-900 bg-[#05070c]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Common questions regarding our implementation timelines, hardware compatibility, and deployment models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-800 bg-[#090e1c] p-6 space-y-2 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <h4 className="text-sm font-bold text-white">
                    {faq.q}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-6.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
