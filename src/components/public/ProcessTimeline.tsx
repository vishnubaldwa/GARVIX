"use client";

import {
  Search,
  Compass,
  Code2,
  Cpu,
  Rocket,
  Headphones,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export function ProcessTimeline() {
  const steps = [
    {
      num: "01",
      title: "Understand",
      icon: Search,
      tagline: "We understand the client's real operational workflow.",
      description:
        "We visit your physical facility, warehouse floor, or retail branch. We analyze item geometries, read distances, RF interference zones, human workflows, and software pain points before writing a single line of code.",
      deliverables: ["On-site RF survey", "Process bottleneck audit", "Hardware feasibility trial"],
    },
    {
      num: "02",
      title: "Design",
      icon: Compass,
      tagline: "We design the complete hardware and software architecture.",
      description:
        "Our engineering desk crafts an end-to-end blueprint: specifying antenna gain/polarization, tag chip inlay types, reader antenna port layouts, database schemas, and API integration points with existing systems.",
      deliverables: ["Hardware topology diagram", "Database schema specification", "Milestone timeline & quote"],
    },
    {
      num: "03",
      title: "Develop",
      icon: Code2,
      tagline: "Custom software and integration are developed.",
      description:
        "We develop your tailored web portal, mobile Android scanner apps, and cloud ERP modules in Node.js, Next.js, and SQL with rigorous automated testing and Haryana GST compliance built-in.",
      deliverables: ["Clean, proprietary codebase", "Mobile scanner Android APKs", "Role-based user permissions"],
    },
    {
      num: "04",
      title: "Integrate",
      icon: Cpu,
      tagline: "Hardware, software and APIs are connected.",
      description:
        "We bridge fixed RFID readers, gate antennas, barrier controllers, barcode scanners, and weighing scales to the software layer using our proprietary low-latency socket middleware.",
      deliverables: ["Sub-second de-duplication engine", "Physical relay actuators", "Offline edge data cache"],
    },
    {
      num: "05",
      title: "Deploy",
      icon: Rocket,
      tagline: "The complete solution is deployed.",
      description:
        "Our field team mounts antennas, aligns RF power levels to prevent stray reads, prints and tags initial inventory batches, and conducts hands-on floor training for your staff and operators.",
      deliverables: ["Turnkey hardware installation", "Inventory tagging & commissioning", "Operator training sessions"],
    },
    {
      num: "06",
      title: "Support",
      icon: Headphones,
      tagline: "Monitoring, upgrades and technical support continue after deployment.",
      description:
        "Long-term partnership backed by comprehensive Annual Maintenance Contracts (AMC), hardware warranty replacements, remote diagnostics, and continual software feature upgrades.",
      deliverables: ["1-Year comprehensive hardware warranty", "Dedicated Telegram/Phone support desk", "Quarterly preventative maintenance"],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-cyan-500/20 bg-[#06080e] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <span>Rigorous Engineering Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How GARVIX <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Delivers Results</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            From initial operational inspection to post-deployment 24/7 monitoring, our six-stage methodology guarantees zero disruption to your daily operations.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.num}
                className="group rounded-3xl border border-slate-800 bg-[#090e1c]/80 p-7 hover:border-cyan-500/40 hover:bg-[#0c1324] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-2xl font-black text-cyan-400/80 group-hover:text-cyan-300 transition-colors">
                      {step.num}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-cyan-400 mb-3">
                    {step.tagline}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Key Deliverables:
                  </span>
                  {step.deliverables.map((d) => (
                    <div key={d} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-14 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-[#0a1020] to-blue-950/40 p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold text-white">
              Ready to automate your operations with a proven methodology?
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Talk directly with a GARVIX systems architect. No generic sales pitches.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-black shadow-lg hover:opacity-90 transition shrink-0"
          >
            <span>Start Stage 01 Analysis</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
