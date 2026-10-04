"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  Building,
  GraduationCap,
  Boxes,
  Users,
  Smartphone,
  Cloud,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  ShoppingBag,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export function SoftwareShowcase() {
  const [activeTab, setActiveTab] = useState(0);

  const softwareModules = [
    {
      id: "erp",
      title: "Custom ERP & Supply Chain",
      icon: Database,
      badge: "Enterprise SCM",
      tagline: "Tailored to your procurement, warehousing, assembly, and invoicing lifecycle.",
      details:
        "Generic ERPs like SAP or Tally force you into rigid hierarchies. GARVIX builds tailor-made enterprise ERP systems featuring multi-branch inventory, bill of materials (BOM), automated vendor reconciliation, purchase orders, and dynamic Haryana/Interstate GST calculations.",
      bulletPoints: [
        "Haryana State Code (06) automated CGST+SGST vs IGST split",
        "E-Way Bill generation, Vehicle LR tracking & Transporter IDs",
        "1-Click CA Return multi-sheet Excel exports (GSTR-1 & GSTR-3B)",
        "Delivery challan engine (Returnable trials vs Non-Returnable sales)",
      ],
      stats: { primary: "100%", label: "GST Compliant", secondary: "Zero", label2: "Manual Workarounds" },
    },
    {
      id: "school",
      title: "School & Campus ERP",
      icon: GraduationCap,
      badge: "Institutions",
      tagline: "Comprehensive academic, fee ledger, and automated RFID gate attendance.",
      details:
        "An all-in-one institutional engine managing student enrollments, bus transport tracking, grade books, staff biometric/RFID clock-ins, fee installments with UPI payment gateway integration, and automated instant WhatsApp absence alerts to parents when students scan past the campus gate.",
      bulletPoints: [
        "Sub-second UHF gate attendance as students walk through main gates",
        "Automated WhatsApp & SMS notifications dispatched to parents",
        "Fee ledger with automated receipt generation and overdue reminders",
        "Driver bus route tracking & campus library book issue automation",
      ],
      stats: { primary: "1,200+", label: "Students/Min Gate Speed", secondary: "< 3 sec", label2: "Parent Alert Latency" },
    },
    {
      id: "pos",
      title: "Retail & Smart POS Billing",
      icon: ShoppingBag,
      badge: "High-Speed Retail",
      tagline: "Lightning-fast billing with barcode, RFID tray scanning, and UPI QR payments.",
      details:
        "Engineered for high-footfall retail stores, supermarkets, and luxury jewellery boutiques. Point of Sale systems that can read entire batches of merchandise in seconds, print thermal GST invoices, sync live multi-store inventory, and generate dynamic NPCI UPI payment QR codes on customer-facing screens.",
      bulletPoints: [
        "Jewellery showcase tray batch billing without barcode line-of-sight",
        "Dynamic NPCI UPI QR code generation on billing counter displays",
        "Instant multi-store inventory reservation and cross-store transfers",
        "Offline billing fallback with automated background synchronization",
      ],
      stats: { primary: "90%", label: "Faster Checkout Speed", secondary: "Zero", label2: "Billing Queue Fatigue" },
    },
    {
      id: "warehouse",
      title: "Warehouse & WMS Automation",
      icon: Boxes,
      badge: "Logistics",
      tagline: "Real-time bin locations, pallet dispatch verification, and cycle counting.",
      details:
        "Warehouse Management Systems that integrate directly with handheld Android RFID guns and dock door reader portals. Track pallets from inward receipt to rack put-away, wave picking, packing, and vehicle loading verification with zero human error.",
      bulletPoints: [
        "Forklift dock portal auto-verification matching packing slips",
        "Automated shelf/bin localization with audible handheld signal Geiger modes",
        "First-In, First-Out (FIFO) batch tracking with expiration monitors",
        "Serialized item tracking ensuring warranty provenance from inward to sale",
      ],
      stats: { primary: "99.8%", label: "Stock Accuracy", secondary: "95%", label2: "Dispatch Error Reduction" },
    },
    {
      id: "crm",
      title: "CRM & Field Service Desk",
      icon: Users,
      badge: "Sales & Support",
      tagline: "Lead qualification, interactive quotes, customer portal, and RMA service tracking.",
      details:
        "Empower your sales and support teams with instant lead capture from web enquiries, interactive digital proposal links with 1-click customer digital acceptance, Telegram bot alerts, and field technician service ticket management.",
      bulletPoints: [
        "Web client portal where customers view and digitally accept quotations",
        "1-Click Quotation-to-Invoice conversion without double-entry",
        "Instant Telegram lead alerts directly to your mobile sales team",
        "Field service ticket logging with serial number warranty lookups",
      ],
      stats: { primary: "4x", label: "Quotation Turnaround", secondary: "100%", label2: "Audit Trail Integrity" },
    },
    {
      id: "mobile",
      title: "Handheld Android & Mobile Apps",
      icon: Smartphone,
      badge: "Floor Mobility",
      tagline: "Native Android applications built for rugged industrial scanner guns.",
      details:
        "We build high-performance native Android applications specifically tailored for Zebra, Chainway, and Honeywell industrial handheld computers. Floor staff can conduct lightning-fast audits, scan high shelves, and manage warehouse stock even in dead WiFi zones.",
      bulletPoints: [
        "Seamless SDK integration with hardware laser scanners & RFID modules",
        "Offline-first architecture with SQLite local cache and auto-sync",
        "Audible audio-frequency Geiger counter for locating missing tagged items",
        "Ergonomic, high-contrast dark UI designed for warehouse lighting",
      ],
      stats: { primary: "50k+", label: "Daily Floor Scans", secondary: "100%", label2: "Offline Capable" },
    },
  ];

  return (
    <section className="py-24 border-t border-cyan-500/20 bg-[#07090e] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-300 mb-4 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>Workflow-Adaptive Software Engineering</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Your Business Has Its Own Workflow.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-cyan-500">
              Your Software Should Too.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Most businesses spend lakhs trying to bend their operations to fit rigid off-the-shelf software. <strong>GARVIX does the exact opposite:</strong> we engineer modern, secure, and scalable software crafted precisely around how your company actually operates.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {softwareModules.map((mod, idx) => {
            const Icon = mod.icon;
            const isSelected = activeTab === idx;

            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-300 ${
                  isSelected
                    ? "border border-cyan-400 bg-cyan-950/70 text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.3)] scale-[1.02]"
                    : "border border-slate-800 bg-[#0c1220]/70 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{mod.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Module Deep-Dive Showcase Card */}
        <div className="rounded-3xl border border-cyan-500/30 bg-[#090e1c] p-6 sm:p-10 shadow-[0_0_60px_rgba(0,242,254,0.12)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/50 text-cyan-400">
                  {(() => {
                    const CurrentIcon = softwareModules[activeTab].icon;
                    return <CurrentIcon className="h-6 w-6" />;
                  })()}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                    {softwareModules[activeTab].badge}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {softwareModules[activeTab].title}
                  </h3>
                </div>
              </div>

              <p className="text-sm font-semibold text-slate-200 leading-snug">
                {softwareModules[activeTab].tagline}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {softwareModules[activeTab].details}
              </p>

              <div className="space-y-2.5 pt-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Engineered Advantages:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {softwareModules[activeTab].bulletPoints.map((pt) => (
                    <div
                      key={pt}
                      className="flex items-start gap-2 rounded-xl border border-slate-800/80 bg-[#070b14] p-3 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                      <span className="leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:opacity-90 transition"
                >
                  <span>Build Custom Software</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/software"
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-5 py-3 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/10 transition"
                >
                  <span>View Technical Specs</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Code & Metric Visual */}
            <div className="lg:col-span-5 space-y-4">
              {/* Stat Counters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-cyan-500/30 bg-[#070b16] p-5 text-center">
                  <div className="text-3xl font-black text-cyan-400 font-mono">
                    {softwareModules[activeTab].stats.primary}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-semibold">
                    {softwareModules[activeTab].stats.label}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-500/30 bg-[#070b16] p-5 text-center">
                  <div className="text-3xl font-black text-white font-mono">
                    {softwareModules[activeTab].stats.secondary}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-semibold">
                    {softwareModules[activeTab].stats.label2}
                  </div>
                </div>
              </div>

              {/* Code / Architecture Snippet */}
              <div className="rounded-2xl border border-slate-800 bg-[#050810] p-5 font-mono text-[11px] text-slate-300 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-500">
                  <span>architecture-schema.sql</span>
                  <span className="text-cyan-400">PostgreSQL + Node.js 22</span>
                </div>
                <div className="space-y-1 text-slate-400 leading-relaxed">
                  <p><span className="text-pink-400">CREATE TABLE</span> <span className="text-cyan-300">branch_inventory_ledger</span> (</p>
                  <p className="pl-4">id <span className="text-emerald-400">UUID PRIMARY KEY</span>,</p>
                  <p className="pl-4">epc_serial <span className="text-emerald-400">VARCHAR(64) UNIQUE</span>,</p>
                  <p className="pl-4">hsn_sac <span className="text-emerald-400">VARCHAR(8)</span>,</p>
                  <p className="pl-4">state_code <span className="text-emerald-400">CHAR(2) DEFAULT &apos;06&apos;</span>,</p>
                  <p className="pl-4">dispatched_status <span className="text-emerald-400">BOOLEAN</span></p>
                  <p>);</p>
                  <p className="text-slate-600">// Real-time atomic event indexing</p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center gap-3 text-xs text-emerald-300">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>
                  All custom code is owned by you. Dedicated cloud deployment, zero recurring vendor lock-in.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
