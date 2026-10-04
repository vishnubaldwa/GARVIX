"use client";

import Link from "next/link";
import {
  Radio,
  Cpu,
  Cloud,
  Layers,
  Wrench,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Plus,
  Equal,
} from "lucide-react";

export function CompleteSolutionSection() {
  const components = [
    { name: "RFID Hardware", desc: "Readers, Antennas, Tags & Gates", icon: Radio, color: "text-cyan-400" },
    { name: "Custom Software", desc: "ERP, Mobile Apps & Web Portals", icon: Cpu, color: "text-blue-400" },
    { name: "Cloud Infrastructure", desc: "Secure PostgreSQL & VPS Hosting", icon: Cloud, color: "text-purple-400" },
    { name: "System Integration", desc: "Middleware Sockets & REST APIs", icon: Layers, color: "text-cyan-300" },
    { name: "On-Site Installation", desc: "Antenna Tuning & Tag Commissioning", icon: Wrench, color: "text-emerald-400" },
    { name: "24/7 SLA & Support", desc: "1-Yr Warranty & Dedicated AMC", icon: Headphones, color: "text-amber-400" },
  ];

  return (
    <section className="py-24 border-t border-cyan-500/20 bg-gradient-to-b from-[#06080e] via-[#090e1c] to-[#06080e] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <span>Turnkey Delivery Standard</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            From Hardware to Software —{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              GARVIX Handles Everything
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Stop wasting time managing multiple vendors who blame each other when something breaks. We take single-source responsibility for your physical infrastructure and software intelligence.
          </p>
        </div>

        {/* Visual Formula Grid */}
        <div className="rounded-3xl border border-cyan-500/30 bg-[#070b16]/90 p-6 sm:p-10 shadow-[0_0_60px_rgba(0,242,254,0.12)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {components.map((c, idx) => {
              const Icon = c.icon;

              return (
                <div key={c.name} className="relative flex flex-col items-center text-center">
                  <div className="w-full rounded-2xl border border-slate-800 bg-[#090e1c] p-5 flex flex-col items-center justify-center min-h-[170px] hover:border-cyan-500/40 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 mb-3 shadow-md">
                      <Icon className={`h-6 w-6 ${c.color}`} />
                    </div>
                    <h4 className="text-xs font-bold text-white tracking-tight mb-1">
                      {c.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {c.desc}
                    </p>
                  </div>

                  {idx < components.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-bold">
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Equal Result Banner */}
          <div className="rounded-2xl border border-cyan-400 bg-gradient-to-r from-cyan-950/80 via-[#0a1428] to-blue-950/80 p-6 sm:p-8 text-center flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(0,242,254,0.2)]">
            <div className="flex items-center gap-4 text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-black font-black text-2xl shrink-0 shadow-lg">
                =
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  THE GARVIX PROMISE
                </span>
                <h3 className="text-2xl font-black text-white">
                  Complete End-to-End Automation
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  One agreement. One deployment team. One support phone number. 100% operational peace of mind.
                </p>
              </div>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black shadow-lg transition shrink-0"
            >
              <span>Get Complete Turnkey Quote</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
