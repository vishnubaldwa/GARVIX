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
  Gem,
  Boxes,
  Layers,
  Wrench,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.04)]"
          : "border-b border-slate-100 bg-white/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <Radio className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <div className="leading-tight">
            <span className="text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
              GARVIX
            </span>
            <span className="block text-[10px] font-medium tracking-tight text-slate-500">
              Precision RFID & Custom Software
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-slate-600">
          <Link
            href="/"
            className="hover:text-slate-950 transition-colors"
          >
            Overview
          </Link>

          {/* Products & Software Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSolutionsDropdownOpen(true)}
            onMouseLeave={() => setSolutionsDropdownOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-slate-950 transition-colors py-2"
            >
              <span>Products & Software</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  solutionsDropdownOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>

            {solutionsDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-88 z-50">
                <div className="rounded-2xl border border-slate-200 bg-white/98 p-2.5 shadow-xl backdrop-blur-xl space-y-1 w-80">
                  <Link
                    href="/#jewellery"
                    className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-slate-50 group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                      <Gem className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                        Jewellery RFID & JewelTrack™
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        500 items in 0.18s, missing item buzzer, velvet tray counter.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/#apparel"
                    className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-slate-50 group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Boxes className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                        Garment Hang Tags & Hard Tags
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Apparel POS, basket checkout, rack audit, anti-theft pin tags.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/#laundry"
                    className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-slate-50 group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                      <Radio className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                        Textile & Laundry RFID Tags
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Washable linen tags (200+ cycles) for hospitals & hotels.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/#anti-metal"
                    className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-slate-50 group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                        Anti-Metal Industrial Tags
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Rugged screw-mount tags for plant machinery & IT assets.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/#vehicle"
                    className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-slate-50 group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                        Vehicle Windshield RFID Passes
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Automated boom barrier & parking access management.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/#jewellery"
            className="hover:text-slate-950 transition-colors"
          >
            Jewellery Tags
          </Link>

          <Link
            href="/#apparel"
            className="hover:text-slate-950 transition-colors"
          >
            Garment & Fashion
          </Link>

          <Link
            href="/#laundry"
            className="hover:text-slate-950 transition-colors"
          >
            Laundry Tags
          </Link>

          <Link
            href="/#anti-metal"
            className="hover:text-slate-950 transition-colors"
          >
            Anti-Metal
          </Link>

          <Link
            href="/#vehicle"
            className="hover:text-slate-950 transition-colors"
          >
            Vehicle Pass
          </Link>

          <Link
            href="/#rolls"
            className="hover:text-slate-950 transition-colors"
          >
            Printable Rolls
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20would%20like%20to%20know%20more%20about%20your%20RFID%20and%20Software%20solutions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <Link
            href="#contact"
            className="flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-black px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow"
          >
            <span>Request Demo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-6 py-6 lg:hidden space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3 pb-4 border-b border-slate-100 text-sm font-medium text-slate-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-blue-600"
            >
              Overview
            </Link>
            <Link
              href="/#jewellery"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Gem className="h-4 w-4 text-amber-500" />
              <span>Jewellery RFID (JewelTrack™)</span>
            </Link>
            <Link
              href="/#apparel"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Boxes className="h-4 w-4 text-blue-500" />
              <span>Garment Hang Tags & Hard Tags</span>
            </Link>
            <Link
              href="/#laundry"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Radio className="h-4 w-4 text-cyan-600" />
              <span>Textile Laundry RFID Tags</span>
            </Link>
            <Link
              href="/#anti-metal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Wrench className="h-4 w-4 text-slate-700" />
              <span>Anti-Metal Industrial Tags</span>
            </Link>
            <Link
              href="/#vehicle"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Layers className="h-4 w-4 text-emerald-600" />
              <span>Vehicle Windshield Passes</span>
            </Link>
            <Link
              href="/#rolls"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Radio className="h-4 w-4 text-purple-600" />
              <span>Printable RFID Rolls & Inlays</span>
            </Link>
            <Link
              href="/#roi-calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-blue-600"
            >
              Interactive ROI Calculator
            </Link>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-blue-600"
            >
              Contact & Location
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs pt-2"
            >
              Staff ERP Login (/admin)
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <a
              href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20would%20like%20to%20know%20more%20about%20your%20RFID%20and%20Software%20solutions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-800 shadow-sm"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-slate-900 py-2.5 text-xs font-semibold text-white shadow"
            >
              <span>Request On-Site Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
