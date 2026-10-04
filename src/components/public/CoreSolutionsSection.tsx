"use client";

import Link from "next/link";
import {
  Cpu,
  Radio,
  Zap,
  Cloud,
  Network,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function CoreSolutionsSection() {
  const solutions = [
    {
      title: "Custom Software Development",
      description: "Software designed specifically around your exact business workflow — not generic SaaS that forces you into awkward workarounds.",
      icon: Cpu,
      href: "/software",
      accent: "from-blue-500/20 to-cyan-500/20",
      border: "hover:border-blue-400",
      features: ["Custom ERP & SCM Engines", "Tailored Billing & Haryana GST", "Web & Mobile Android Scanners"],
    },
    {
      title: "Complete RFID Automation",
      description: "End-to-end RFID ecosystems: WPC-compliant UHF readers, specialized inlays, antennas, gate portals, and sub-second inventory auditing.",
      icon: Radio,
      href: "/rfid",
      accent: "from-cyan-500/20 to-teal-500/20",
      border: "hover:border-cyan-400",
      features: ["Jewellery 3-Second Tray Audits", "Overhead Door Gate Portals", "FASTag Vehicle Boom Barriers"],
    },
    {
      title: "Enterprise Process Automation",
      description: "Automate repetitive physical operations, gate entries, forklift loading verification, and multi-branch inventory transfers.",
      icon: Zap,
      href: "/solutions",
      accent: "from-purple-500/20 to-blue-500/20",
      border: "hover:border-purple-400",
      features: ["Automated Dispatch Matching", "Touchless Walk-Through Attendance", "Physical GPIO Siren & Barrier Triggers"],
    },
    {
      title: "Secure Cloud Solutions",
      description: "Scalable, high-concurrency cloud deployments on Linux VPS and AWS with daily encrypted database backups and zero downtime.",
      icon: Cloud,
      href: "/software#cloud",
      accent: "from-blue-600/20 to-indigo-500/20",
      border: "hover:border-blue-400",
      features: ["PostgreSQL ACID Ledgers", "Automated Off-Site Backups", "Sub-10ms Global Query Latency"],
    },
    {
      title: "API & Hardware Integration",
      description: "Bridge legacy ERPs, SAP, Tally, weighing scales, laser barcode guns, and third-party accounting services via clean REST APIs & WebSockets.",
      icon: Network,
      href: "/software#middleware",
      accent: "from-cyan-400/20 to-sky-500/20",
      border: "hover:border-cyan-400",
      features: ["LLRP & Socket Reader Drivers", "Two-Way Telegram & WhatsApp Bots", "Tally / Legacy ERP Connectors"],
    },
    {
      title: "Real-Time Analytics & BI",
      description: "Executive visibility into daily shrinkage rates, missing inventory heatmaps, gate throughput telemetry, and 1-click CA tax return exports.",
      icon: BarChart3,
      href: "/solutions#analytics",
      accent: "from-emerald-500/20 to-cyan-500/20",
      border: "hover:border-emerald-400",
      features: ["Live Showcase Tray Heatmaps", "Discrepancy Exception Alerts", "1-Click GSTR-1 & 3B Excel Workbooks"],
    },
  ];

  return (
    <section className="py-24 border-t border-cyan-500/20 bg-[#06080e] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <span>Unified Engineering Competencies</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Technology Solutions</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Enterprise grade technology engineered to eliminate manual errors, accelerate physical velocity, and give business owners 100% operational transparency.
          </p>
        </div>

        {/* 6 Core Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((sol) => {
            const Icon = sol.icon;

            return (
              <div
                key={sol.title}
                className={`group rounded-3xl border border-slate-800 bg-[#090e1c]/80 p-7 transition-all duration-300 ${sol.border} hover:bg-[#0c1324] hover:shadow-[0_0_40px_rgba(0,242,254,0.1)] flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {sol.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {sol.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  {sol.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Link
                      href={sol.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                    >
                      <span>Explore capabilities</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
