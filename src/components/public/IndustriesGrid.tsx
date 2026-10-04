"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  GraduationCap,
  Boxes,
  Factory,
  Building2,
  Truck,
  HeartPulse,
  Hotel,
  Network,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function IndustriesGrid() {
  const [selectedIndustry, setSelectedIndustry] = useState<number | null>(0);

  const industries = [
    {
      id: "retail",
      name: "Retail & Luxury",
      icon: ShoppingBag,
      sub: "Jewellery, Apparel & Malls",
      headline: "Instant stock audits, shrinkage elimination, and checkout automation.",
      challenges: "Shrinkage from unrecorded theft, painful multi-hour physical barcode audits, and checkout line dropouts.",
      solution: "Tamper-evident UHF jewellery tags, scanning trays reading 250 items in 3 seconds, and anti-theft gate sensors.",
      stats: "98% Faster Inventory Counting",
    },
    {
      id: "education",
      name: "Education & Schools",
      icon: GraduationCap,
      sub: "K-12, Colleges & Universities",
      headline: "Automatic walk-through attendance, bus tracking, and campus ERP.",
      challenges: "Fingerprint scanner bottlenecks, proxy attendance, unnotified absences, and chaotic bus boarding verifications.",
      solution: "Hands-free overhead RFID gate portals, automated WhatsApp parent alerts, driver GPS tracking, and fee ERP.",
      stats: "1,200 Students/Minute Walk-Through",
    },
    {
      id: "warehousing",
      name: "Warehousing & 3PL",
      icon: Boxes,
      sub: "Fulfillment Centers & Storage",
      headline: "Pallet portal dispatching, automated bin put-away, and real-time WMS.",
      challenges: "Incorrect cartons loaded onto trucks, lost pallets in high-bay racks, and delayed dispatch reconciliation.",
      solution: "Fixed dock door RFID reader portals verifying pallets as forklifts pass, handheld Android Geiger scanning guns.",
      stats: "100% Dispatch Accuracy",
    },
    {
      id: "manufacturing",
      name: "Manufacturing & WIP",
      icon: Factory,
      sub: "Automotive, Parts & Electronics",
      headline: "Work-in-progress tracking, component verification, and quality gates.",
      challenges: "Paper traveler loss, missing components during assembly, and untracked high-value production dies.",
      solution: "Conveyor tunnel RFID readers, ceramic heat-resistant tags, and automated PLC assembly stop relays.",
      stats: "Sub-Second Production Visibility",
    },
    {
      id: "corporate",
      name: "Corporate Offices",
      icon: Building2,
      sub: "Tech Parks & Head Offices",
      headline: "Turnstile access control, visitor kiosks, and IT asset provenance.",
      challenges: "Unrecorded laptop movements, manual visitor logbooks, and slow parking boom barrier gates.",
      solution: "RFID smart badge turnstile integration, self-service visitor kiosks, and long-range FASTag parking barrier automation.",
      stats: "Touchless Access & FASTag Entry",
    },
    {
      id: "logistics",
      name: "Logistics & Fleet",
      icon: Truck,
      sub: "Cross-Docking & Distribution",
      headline: "End-to-end container tracking, E-Way Bill matching, and yard control.",
      challenges: "Container turnaround delays, driver paperwork verification queues, and lost roll cages.",
      solution: "Yard management RFID antennas, serialized container tracking, and automated gate pass generation.",
      stats: "4x Faster Gate Clearance",
    },
    {
      id: "healthcare",
      name: "Healthcare & Labs",
      icon: HeartPulse,
      sub: "Hospitals, Clinics & Pathology",
      headline: "Medical asset tracking, specimen chain-of-custody, and linen management.",
      challenges: "Misplaced infusion pumps, lost surgical trays, unmonitored temperature-sensitive specimen vials.",
      solution: "Autoclavable RFID tags, real-time medical device asset tracking, and smart surgical cabinet audits.",
      stats: "100% Critical Asset Traceability",
    },
    {
      id: "hospitality",
      name: "Hospitality & Hotels",
      icon: Hotel,
      sub: "Luxury Resorts & Venues",
      headline: "High-volume uniform & linen tracking, keyless access, and banquet asset control.",
      challenges: "Massive annual linen shrinkage, laundry vendor billing disputes, and slow banquet asset setup audits.",
      solution: "Flexible laundry RFID buttons surviving 200+ commercial wash cycles, uniform issue lockers.",
      stats: "90% Reduction in Linen Loss",
    },
    {
      id: "distribution",
      name: "Wholesale & Distribution",
      icon: Network,
      sub: "FMCG, Hardware & Spares",
      headline: "Serialized master carton tracking and credit term sales management.",
      challenges: "Secondary sales leakage, counterfeit goods, and complex return credit calculations.",
      solution: "Serialized carton tags matching warranty certificates, dealer ERP portal with dynamic GST invoicing.",
      stats: "Zero Unauthorized Stock Diversion",
    },
    {
      id: "enterprise",
      name: "Enterprise Operations",
      icon: Briefcase,
      sub: "Conglomerates & Utilities",
      headline: "Multi-branch synchronization, centralized audit trails, and ERP APIs.",
      challenges: "Siloed regional branches, delayed consolidated financial reporting, and non-standard hardware setups.",
      solution: "Custom multi-branch ERP backend, central PostgreSQL ledger, and unified hardware procurement.",
      stats: "Real-Time Centralized Ledger",
    },
  ];

  return (
    <section className="py-24 border-t border-cyan-500/20 bg-[#06080e] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <span>Specialized Vertical Architectures</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Industries We <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Transform</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            From high-value diamond jewellery trays to high-throughput automotive assembly lines and multi-campus schools, GARVIX tailors technology to your sector.
          </p>
        </div>

        {/* 10-Item Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-10">
          {industries.map((ind, index) => {
            const Icon = ind.icon;
            const isSelected = selectedIndustry === index;

            return (
              <div
                key={ind.id}
                onClick={() => setSelectedIndustry(index)}
                className={`cursor-pointer rounded-2xl border p-4 text-center transition-all duration-300 flex flex-col items-center justify-center ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-950/70 shadow-[0_0_25px_rgba(0,242,254,0.3)] scale-[1.03]"
                    : "border-slate-800 bg-[#090e1c]/60 hover:border-slate-700 hover:bg-[#0c1324]"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border mb-3 transition-colors ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.4)]"
                      : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-white tracking-tight">
                  {ind.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-full">
                  {ind.sub}
                </p>
              </div>
            );
          })}
        </div>

        {/* Detailed Selected Industry Card */}
        {selectedIndustry !== null && (
          <div className="rounded-3xl border border-cyan-500/30 bg-[#090e1c] p-6 sm:p-10 shadow-[0_0_60px_rgba(0,242,254,0.12)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3 py-1 text-[11px] font-mono font-bold text-cyan-300">
                  {industries[selectedIndustry].name.toUpperCase()} SECTOR ARCHITECTURE
                </div>
                <h3 className="text-2xl font-black text-white">
                  {industries[selectedIndustry].headline}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-4">
                    <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block mb-1">
                      Operational Pain Point:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {industries[selectedIndustry].challenges}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-4">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-1">
                      GARVIX Solution:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {industries[selectedIndustry].solution}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:opacity-90 transition"
                  >
                    <span>Consult on {industries[selectedIndustry].name}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/industries"
                    className="text-xs text-slate-400 hover:text-cyan-300 transition"
                  >
                    View all sector case studies &rarr;
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0a1224] to-[#070b16] p-6 text-center space-y-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                  Documented Impact
                </span>
                <div className="text-2xl font-black text-cyan-300 font-mono">
                  {industries[selectedIndustry].stats}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Turnkey hardware deployment + custom software integration deployed in 14 business days.
                </p>
                <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Backed by GARVIX 1-Year SLA</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
