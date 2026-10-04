"use client";

import Link from "next/link";
import { ArrowRight, PhoneCall, Sparkles, ShieldCheck } from "lucide-react";

export function CallToActionBanner({ phone }: { phone?: string }) {
  const cleanPhone = phone ? phone.replace(/[^0-9+]/g, "") : "+919876543210";

  return (
    <section className="py-24 border-t border-cyan-500/20 bg-[#07090e] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-transparent blur-[140px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-[#091124] via-[#080d1c] to-[#050812] p-8 sm:p-14 text-center shadow-[0_0_80px_rgba(0,242,254,0.18)] backdrop-blur-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-4 py-1.5 text-xs font-semibold text-cyan-300 mb-6 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Turnkey Engineering Consultation</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Have a Process That{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Should Be Automated?
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tell us how your business works. We&apos;ll design the technology around it — from custom ERP workflows to sub-second RFID scanning portals.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#contact"
              className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-extrabold uppercase tracking-wider text-black shadow-[0_0_35px_rgba(0,242,254,0.4)] transition hover:opacity-95"
            >
              <span>Discuss Your Requirement</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={`tel:${cleanPhone}`}
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-8 py-4 text-sm font-bold text-cyan-300 backdrop-blur-md transition hover:border-cyan-400 hover:bg-cyan-500/10"
            >
              <PhoneCall className="h-4 w-4 text-cyan-400" />
              <span>Contact GARVIX: {phone || "+91 98765 43210"}</span>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Zero Obligation Architecture Call</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>PAN-India On-Site Deployment</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Direct In-House Engineering Desk</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
