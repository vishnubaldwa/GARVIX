"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Radio,
  Cpu,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Lock,
  Layers,
  Sparkles,
  ShoppingBag,
  GraduationCap,
  Boxes,
  Building2,
  Phone,
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-cyan-500/20 bg-[#07090e]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
          : "border-b border-cyan-500/10 bg-[#07090e]/80 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-purple-600/10 text-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400">
            <Radio className="h-5 w-5 animate-pulse text-cyan-300" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400"></span>
          </div>
          <div>
            <span className="text-xl font-black tracking-widest text-white transition-colors group-hover:text-cyan-400">
              GARVIX
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-cyan-300 transition-colors">
              Software Solutions Pvt. Ltd.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:text-cyan-400"
          >
            Home
          </Link>

          {/* Solutions Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSolutionsDropdownOpen(true)}
            onMouseLeave={() => setSolutionsDropdownOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:text-cyan-400 py-2"
            >
              <span>Solutions</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${solutionsDropdownOpen ? "rotate-180 text-cyan-400" : ""}`} />
            </button>

            {solutionsDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-80">
                <div className="rounded-2xl border border-cyan-500/30 bg-[#090e1a]/95 p-3 shadow-2xl backdrop-blur-2xl space-y-1">
                  <Link
                    href="/software"
                    className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-cyan-950/40 group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-950/40 text-blue-400 group-hover:text-cyan-300">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                        Custom Software Development
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Bespoke ERPs, Web/Mobile Apps & APIs tailored to your workflow.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/rfid"
                    className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-cyan-950/40 group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 group-hover:text-cyan-300">
                      <Radio className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                        RFID Automation Ecosystem
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Hardware + Software + Tag tracking for sub-second audits.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/solutions"
                    className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-cyan-950/40 group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-950/40 text-purple-400 group-hover:text-purple-300">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-300">
                        All Enterprise Solutions
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Retail, Schools, Warehouses & Asset Tracking systems.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/software"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:text-cyan-400"
          >
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>Software</span>
          </Link>

          <Link
            href="/rfid"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:text-cyan-400"
          >
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span>RFID Automation</span>
          </Link>

          <Link
            href="/industries"
            className="text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:text-cyan-400"
          >
            Industries
          </Link>

          <Link
            href="/about"
            className="text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:text-cyan-400"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:text-cyan-400"
          >
            Contact
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-[11px] font-medium text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
            title="Internal Staff & Administration Portal"
          >
            <Lock className="h-3 w-3" />
            <span>Admin</span>
          </Link>

          <Link
            href="/contact"
            className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black shadow-[0_0_25px_rgba(0,242,254,0.35)] transition-all hover:opacity-95 hover:shadow-[0_0_35px_rgba(0,242,254,0.5)]"
          >
            <span>Get a Solution</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-2 text-slate-300 hover:bg-cyan-950/60 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5 text-cyan-400" /> : <Menu className="h-5 w-5 text-cyan-400" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-cyan-500/20 bg-[#07090e]/98 px-6 py-6 lg:hidden space-y-4 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col space-y-3 pb-4 border-b border-slate-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-200 hover:text-cyan-400"
            >
              Home
            </Link>
            <Link
              href="/software"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-cyan-400"
            >
              <Cpu className="h-4 w-4 text-blue-400" />
              <span>Custom Software Development</span>
            </Link>
            <Link
              href="/rfid"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-cyan-400"
            >
              <Radio className="h-4 w-4 text-cyan-400" />
              <span>Complete RFID Automation</span>
            </Link>
            <Link
              href="/solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-cyan-400"
            >
              <Layers className="h-4 w-4 text-purple-400" />
              <span>All Solutions (Retail, Schools, SCM)</span>
            </Link>
            <Link
              href="/industries"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-200 hover:text-cyan-400"
            >
              Industries We Serve
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-200 hover:text-cyan-400"
            >
              About GARVIX
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-200 hover:text-cyan-400"
            >
              Contact & Consultation
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg"
            >
              <span>Get a Solution</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 text-xs font-medium text-slate-400"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Admin Staff Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
