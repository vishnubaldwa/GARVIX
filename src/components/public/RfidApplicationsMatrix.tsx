"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  GraduationCap,
  Boxes,
  Building2,
  Factory,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function RfidApplicationsMatrix() {
  const [selectedIndustry, setSelectedIndustry] = useState(0);

  const applications = [
    {
      id: "retail",
      title: "Retail & Jewellery",
      icon: ShoppingBag,
      tagline: "Instant showcase audits, automated anti-theft, and queue-less smart POS.",
      overview:
        "High-value luxury jewellery boutiques, apparel stores, and retail chains use GARVIX RFID solutions to eliminate stock shrinkage, audit thousands of pieces in seconds, and detect unauthorized item movement across doors without line-of-sight.",
      useCases: [
        { name: "RFID Inventory Audit", desc: "Scan 300+ jewellery pieces on trays in under 3 seconds with 99.8% precision." },
        { name: "Smart POS Integration", desc: "Batch billing counter reads all items in customer basket simultaneously." },
        { name: "Anti-Theft EAS Security", desc: "Overhead antennas detect unbilled merchandise passing store exit gates." },
        { name: "Automatic Stock Detection", desc: "Live tray sensors monitor which items are removed and returned by customers." },
        { name: "Quick Thermal Billing", desc: "GST invoice printout and dynamic UPI payment QR code generated instantly." },
      ],
      hardwareDeployed: ["Impinj E710 Fixed Readers", "Jewellery Tamper-Evident Tail Tags", "Overhead Door Portals"],
      impact: "98% Faster Audits",
    },
    {
      id: "education",
      title: "Education & Schools",
      icon: GraduationCap,
      tagline: "Hands-free gate attendance, automated parent alerts, and library book issue.",
      overview:
        "Campuses, universities, and K-12 schools replace slow biometric fingerprint queues with high-speed RFID gate portals. Students and staff simply walk through main gates wearing smart ID cards, while our software updates rolls and dispatches WhatsApp messages to parents.",
      useCases: [
        { name: "Automatic Student Attendance", desc: "1,200+ students walk through gate portals per minute without slowing down." },
        { name: "Employee Clock-In", desc: "Teaching & non-teaching staff attendance logged directly to HRMS payroll." },
        { name: "Gate & Bus Tracking", desc: "RFID readers on school buses verify students boarding and deboarding at stops." },
        { name: "Library Automation", desc: "Self-checkout kiosk scans multiple books and updates student account in 2 seconds." },
        { name: "Campus Asset Tracking", desc: "Projectors, laptops, laboratory microscopes, and sports equipment tracking." },
      ],
      hardwareDeployed: ["Long-Range Gate Antennas", "Smart RFID PVC Cards", "Desktop Library Readers"],
      impact: "Zero Gate Congestion",
    },
    {
      id: "warehouse",
      title: "Warehouse & Logistics",
      icon: Boxes,
      tagline: "Dock door pallet portals, bin localization, and automated dispatch matching.",
      overview:
        "Modern fulfillment hubs and 3PL distribution centers eliminate human mispicks and dispatch disputes. Fixed readers installed at loading dock doors verify carton contents against E-Way Bills automatically as forklifts drive into freight containers.",
      useCases: [
        { name: "Real-Time Inventory Ledger", desc: "Continuous live counts across high-bay racks, floor bins, and cold rooms." },
        { name: "Automated Goods Movement", desc: "Pallet tags update location status as they transition from receiving to staging." },
        { name: "Serialized Asset Tracking", desc: "Pallets, plastic totes, roll cages, and high-value equipment lifecycle tracking." },
        { name: "Dispatch Verification", desc: "Instant matching of loaded cartons against customer purchase orders & E-Way Bills." },
        { name: "Rapid Stock Audit", desc: "Floor teams conduct full warehouse cycle counts in 1 hour instead of 2 full days." },
      ],
      hardwareDeployed: ["4-Port Dock Door Readers", "IP67 Circular Antennas", "Rugged Handheld Android Guns"],
      impact: "Zero Dispatch Errors",
    },
    {
      id: "corporate",
      title: "Corporate Offices & IT",
      icon: Building2,
      tagline: "Turnstile access control, server room audit, and visitor automation.",
      overview:
        "High-security IT tech parks and enterprise corporate headquarters automate employee turnstile entry, visitor badge provisioning, meeting room scheduling, and IT asset provenance from laptop issue to return.",
      useCases: [
        { name: "Employee Tracking & Access", desc: "Touchless turnstile entry with integration into payroll and shift schedulers." },
        { name: "Access Management", desc: "Restricted role-based clearance for server rooms, executive suites, and R&D labs." },
        { name: "IT Asset Management", desc: "Laptops, monitors, server blades, and network switches tracked by serial number." },
        { name: "Visitor Automation", desc: "Self-service kiosk generates temporary RFID visitor cards with auto-expiry." },
        { name: "Automated Parking Gates", desc: "FASTag readers open commercial parking boom barriers for employee vehicles." },
      ],
      hardwareDeployed: ["Turnstile Wiegand Controllers", "On-Metal Server Asset Tags", "Visitor Kiosks"],
      impact: "100% Asset Provenance",
    },
    {
      id: "manufacturing",
      title: "Manufacturing & Assembly",
      icon: Factory,
      tagline: "Work-in-progress (WIP) tracking, conveyor line gates, and tool monitoring.",
      overview:
        "Automotive, electronics, and heavy equipment manufacturers track products through stamping, assembly, painting, and quality control test cells. Eliminate paper travelers and identify production bottlenecks in real time.",
      useCases: [
        { name: "Production WIP Tracking", desc: "Follow chassis and assemblies as they pass sequential conveyor RFID stations." },
        { name: "Material Movement", desc: "Raw material coils and sub-assemblies tracked from staging to assembly bays." },
        { name: "Critical Asset Monitoring", desc: "Specialized dies, molds, and calibration tools logged with maintenance cycles." },
        { name: "Assembly Quality Gates", desc: "Automated confirmation that all required sub-components are attached before next stage." },
        { name: "Finished Goods Inward", desc: "Instant transition from factory floor to warehouse inventory upon final inspection." },
      ],
      hardwareDeployed: ["Conveyor Tunnel Readers", "Heat-Resistant Ceramic RFID Tags", "Industrial PLC Relays"],
      impact: "Sub-Second WIP Visibility",
    },
  ];

  return (
    <section className="py-24 border-t border-cyan-500/20 bg-[#07090e] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Multi-Sector Deployment Expertise</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            RFID Automation <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Engineered by Sector</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Every industry has unique physical challenges — metal interference, high read densities, humidity, or rapid conveyor speeds. Discover how GARVIX engineers tailored RFID architectures for your environment.
          </p>
        </div>

        {/* Industry Pill Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {applications.map((app, idx) => {
            const Icon = app.icon;
            const isSelected = selectedIndustry === idx;

            return (
              <button
                key={app.id}
                type="button"
                onClick={() => setSelectedIndustry(idx)}
                className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition-all duration-300 ${
                  isSelected
                    ? "border border-cyan-400 bg-cyan-950/70 text-cyan-300 shadow-[0_0_25px_rgba(0,242,254,0.3)] scale-[1.02]"
                    : "border border-slate-800 bg-[#0c1220]/70 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{app.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Application Card */}
        <div className="rounded-3xl border border-cyan-500/30 bg-[#090e1c] p-6 sm:p-10 shadow-[0_0_60px_rgba(0,242,254,0.12)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/50 text-cyan-400 shrink-0">
                {(() => {
                  const CurrentIcon = applications[selectedIndustry].icon;
                  return <CurrentIcon className="h-6 w-6" />;
                })()}
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">
                  {applications[selectedIndustry].title} Automation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {applications[selectedIndustry].tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-2 text-xs font-mono text-emerald-300">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>Proven Impact: <strong className="text-white">{applications[selectedIndustry].impact}</strong></span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8">
            {applications[selectedIndustry].overview}
          </p>

          {/* 5 Specific Use-Cases */}
          <div className="mb-8">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-4">
              Integrated Capabilities & Workflows:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {applications[selectedIndustry].useCases.map((uc) => (
                <div
                  key={uc.name}
                  className="rounded-2xl border border-slate-800/80 bg-[#060a14] p-4 text-xs space-y-1.5 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                    <span className="font-bold text-white">{uc.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                    {uc.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Hardware & CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold">Typical Hardware:</span>
              {applications[selectedIndustry].hardwareDeployed.map((hw) => (
                <span
                  key={hw}
                  className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-[11px] font-mono text-slate-300"
                >
                  {hw}
                </span>
              ))}
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-cyan-400 transition shrink-0"
            >
              <span>Request Solution Consultation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
