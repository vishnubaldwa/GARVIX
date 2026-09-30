"use client";

import Link from "next/link";
import { useState } from "react";
import { Cpu, Radio, Shield, Menu, X, ArrowRight, Lock } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-[#07090e]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-transform duration-300 group-hover:scale-105">
            <Radio className="h-5 w-5 animate-pulse text-cyan-300" />
            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400"></div>
          </div>
          <div>
            <span className="text-xl font-black tracking-widest text-white group-hover:text-cyan-400 transition-colors">
              GARVIX
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80">
              RFID & Software Lab
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/solutions/rfid"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 transition hover:text-cyan-400"
          >
            <Radio className="h-4 w-4 text-cyan-400" />
            RFID Solutions
          </Link>
          <Link
            href="/solutions/software"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 transition hover:text-cyan-400"
          >
            <Cpu className="h-4 w-4 text-blue-400" />
            Custom Software
          </Link>
          <Link
            href="/#roi-calculator"
            className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
          >
            ROI Calculator
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
          >
            Contact & Demo
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin/login"
            className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20"
          >
            <Lock className="h-3.5 w-3.5" />
            Admin Portal
          </Link>
          <Link
            href="/#contact"
            className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all hover:opacity-90"
          >
            Request Quotation
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-cyan-500/20 bg-[#07090e]/95 px-4 py-5 md:hidden space-y-4">
          <Link
            href="/solutions/rfid"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-slate-200 hover:text-cyan-400"
          >
            <Radio className="h-4 w-4 text-cyan-400" /> RFID Solutions
          </Link>
          <Link
            href="/solutions/software"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-slate-200 hover:text-cyan-400"
          >
            <Cpu className="h-4 w-4 text-blue-400" /> Custom Software
          </Link>
          <Link
            href="/#roi-calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-cyan-400"
          >
            RFID ROI Calculator
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-cyan-400"
          >
            Book Free Demo
          </Link>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 py-2 text-xs font-semibold text-cyan-300"
            >
              <Lock className="h-3.5 w-3.5" /> Staff Admin Login
            </Link>
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-lg bg-cyan-400 py-2.5 text-xs font-bold uppercase text-black"
            >
              Request Quotation
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
