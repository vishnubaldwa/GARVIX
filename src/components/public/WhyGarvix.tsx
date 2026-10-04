"use client";

import {
  Layers,
  Cpu,
  Radio,
  TrendingUp,
  Zap,
  Lock,
  Headphones,
  CheckCircle2,
  Award,
} from "lucide-react";

export function WhyGarvix() {
  const differentiators = [
    {
      title: "One Partner. Complete Solution.",
      desc: "Zero finger-pointing between software developers and hardware vendors. GARVIX handles tags, antennas, fixed readers, cloud APIs, and ERP UI under one roof.",
      icon: Award,
      badge: "Single Accountability",
    },
    {
      title: "Custom Built — Not Generic SaaS",
      desc: "We don't force you into rigid recurring software constraints. We build code that maps 100% to your warehouse aisles, sales processes, and tax rules.",
      icon: Cpu,
      badge: "Workflow Tailored",
    },
    {
      title: "RF Physics + Modern Software Mastery",
      desc: "Our engineers understand both microwave physics (far-field backscatter, multipath nulls) and high-concurrency Node.js WebSocket stream architectures.",
      icon: Radio,
      badge: "Deep Expertise",
    },
    {
      title: "Sub-Second Real-Time Automation",
      desc: "From RFID tag excitation to database ledger commits and physical boom barrier actuation in under 5 milliseconds with zero data loss.",
      icon: Zap,
      badge: "Ultra-Low Latency",
    },
    {
      title: "Scalable Enterprise Cloud & Edge",
      desc: "Architected to scale seamlessly from a single boutique store to hundreds of distribution warehouses and high-footfall campuses across India.",
      icon: TrendingUp,
      badge: "PAN-India Scalable",
    },
    {
      title: "Bank-Grade Security & Audit Trails",
      desc: "Immutable database audit trails, role-based granular permissions (RBAC), and SSL/TLS encrypted socket channels protect your enterprise data.",
      icon: Lock,
      badge: "Enterprise Security",
    },
    {
      title: "Comprehensive Long-Term Support",
      desc: "Guaranteed 1-Year hardware replacement warranty, preventative AMC checkups, and dedicated Telegram/Phone engineering desks.",
      icon: Headphones,
      badge: "Continuous SLA",
    },
    {
      title: "Haryana State (06) GST Automation",
      desc: "Built-in intelligence automatically computes CGST+SGST for intra-state sales, IGST for interstate, and exports 1-click GSTR-1 & GSTR-3B multi-sheet workbooks.",
      icon: Layers,
      badge: "100% Tax Compliant",
    },
  ];

  return (
    <section id="why-garvix" className="py-24 border-t border-cyan-500/20 bg-[#07090e] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <span>Enterprise Advantage</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            One Partner.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Complete Technology Solution.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminate the frustration of coordinating between hardware suppliers, barcode tag vendors, and remote software freelancers. GARVIX is your unified technology powerhouse.
          </p>
        </div>

        {/* Counter Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="rounded-2xl border border-cyan-500/30 bg-[#090e1c] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
              99.8%
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Audit Accuracy Rate</p>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-[#090e1c] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              900+
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Tags Scanned / Second</p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-[#090e1c] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-purple-400 font-mono">
              &lt; 5ms
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">End-to-End Latency</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-[#090e1c] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
              100%
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Direct In-House Support</p>
          </div>
        </div>

        {/* 8 Differentiator Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {differentiators.map((diff) => {
            const Icon = diff.icon;

            return (
              <div
                key={diff.title}
                className="group rounded-3xl border border-slate-800 bg-[#090e1c]/70 p-6 hover:border-cyan-500/40 hover:bg-[#0c1324] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {diff.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {diff.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {diff.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verified Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
