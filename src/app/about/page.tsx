import { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { getCompanySettings } from "@/lib/settings";
import Link from "next/link";
import {
  Radio,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Users,
  Award,
  ArrowRight,
  Zap,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  description:
    "Learn about GARVIX Software Solutions Private Limited — a premier technology company engineering bespoke enterprise software and end-to-end RFID automation across India.",
};

export default async function AboutPage() {
  const company = await getCompanySettings();

  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-20 border-b border-cyan-500/20 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[650px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none"></div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 mb-6 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
            <Building2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Company Profile & Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">GARVIX</span> Software Solutions
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            GARVIX is not just a software agency or an RFID hardware vendor. We provide businesses and institutions with complete technology and physical-to-digital automation ecosystems.
          </p>
        </div>
      </section>

      {/* Core Philosophy Banner */}
      <section className="py-20 border-b border-slate-900 bg-[#050810]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/50 via-[#0a1224] to-blue-950/50 p-8 sm:p-12 text-center shadow-[0_0_50px_rgba(0,242,254,0.15)]">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 block mb-3">
              OUR GUIDING ARCHITECTURAL PRINCIPLE
            </span>
            <blockquote className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
              “We don&apos;t force businesses to adapt to software. We build software that adapts to the business.”
            </blockquote>
            <p className="mt-4 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Every company operates with distinct operational DNA, vendor relationships, and floor workflows. Our software and RFID systems are engineered around your reality.
            </p>
          </div>
        </div>
      </section>

      {/* The Two Pillars */}
      <section className="py-24 border-b border-cyan-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Two Synergistic Pillars of Competency
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Why settle for disconnected vendors when you can have a single technology powerhouse?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1 */}
            <div className="rounded-3xl border border-cyan-500/30 bg-[#090e1c] p-8 space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-white">
                1. Custom Software Engineering
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We design and build bespoke ERP systems, school management engines, point of sale (POS) billing counters, inventory ledgers, and Android mobile applications. Every feature, database constraint, and user permission is tailored to eliminate bottlenecks.
              </p>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Full source code ownership with zero recurring user licensing penalties</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Haryana GST (State Code 06) built-in with 1-click CA tax return exports</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Mobile-friendly client portals with digital signature approvals & UPI QR</span>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-3xl border border-blue-500/30 bg-[#090e1c] p-8 space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-950/60 text-blue-400">
                <Radio className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-white">
                2. Complete RFID Automation
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We deliver full turnkey RFID solutions spanning hardware procurement, antenna tuning, inlay selection, on-site commissioning, and socket middleware. From diamond jewellery showcases to high-speed warehouse loading dock doors.
              </p>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  <span>WPC-compliant Indian frequency (865-867 MHz) readers & antennas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  <span>Specialized on-metal tags, tamper-evident jewellery tails, and smart cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  <span>Single point of responsibility: Hardware + Software + Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal & Corporate Standards */}
      <section className="py-20 bg-[#05070c]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-[#090e1c] p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                  LEGAL ENTITY
                </span>
                <h4 className="text-lg font-bold text-white">
                  GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Incorporated under the Companies Act. Registered office located in Haryana with state code 06.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                  HEADQUARTERS & LAB
                </span>
                <h4 className="text-lg font-bold text-white">
                  Engineering & Testing Lab
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {company.address}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                  DIRECT CONTACT
                </span>
                <h4 className="text-lg font-bold text-white">
                  Consultation Desk
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Email: {company.email}<br />
                  Phone: {company.phone}<br />
                  GSTIN: {company.gstin}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
