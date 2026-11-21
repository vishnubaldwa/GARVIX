"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { GarvixLogoMark } from "@/components/brand/GarvixLogo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-black/[0.06] bg-white/85 backdrop-blur-xl"
          : "border-b border-transparent bg-white/75 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#16171a] border border-[#d8b56c]/25 shadow-xs transition-transform group-hover:scale-105">
            <GarvixLogoMark className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#1d1d1f]">
            GARVIX
          </span>
        </Link>

        {/* Clean Minimal Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#424245]">
          <Link href="/#retail-software" className="text-[#0071e3] font-semibold hover:underline transition-colors">
            Retail Software
          </Link>
          <Link href="/#products" className="hover:text-[#1d1d1f] transition-colors">
            RFID Products
          </Link>
          <Link href="/#custom-software" className="hover:text-[#1d1d1f] transition-colors">
            Custom Software
          </Link>
          <Link href="/#jewellery" className="hover:text-[#1d1d1f] transition-colors">
            Jewellery
          </Link>
          <Link href="/#apparel" className="hover:text-[#1d1d1f] transition-colors">
            Apparel
          </Link>
          <Link href="/#laundry" className="hover:text-[#1d1d1f] transition-colors">
            Laundry
          </Link>
          <Link href="/#anti-metal" className="hover:text-[#1d1d1f] transition-colors">
            Industrial
          </Link>
          <Link href="/#vehicle" className="hover:text-[#1d1d1f] transition-colors">
            Vehicle Pass
          </Link>
        </nav>

        {/* Clean CTA -> Contact Form */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="#contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-4 py-1.5 text-xs font-medium text-white transition"
          >
            <span>Get a Quote</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl p-2 text-[#1d1d1f] hover:bg-black/[0.05] lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-black/[0.06] bg-white/95 backdrop-blur-xl px-6 py-5 lg:hidden space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-medium text-[#1d1d1f]">
            <Link href="/#retail-software" onClick={() => setMobileMenuOpen(false)} className="text-[#0071e3] font-semibold">
              Retail Software
            </Link>
            <Link href="/#products" onClick={() => setMobileMenuOpen(false)}>
              RFID Products
            </Link>
            <Link href="/#custom-software" onClick={() => setMobileMenuOpen(false)}>
              Custom Software
            </Link>
            <Link href="/#jewellery" onClick={() => setMobileMenuOpen(false)}>
              Jewellery RFID
            </Link>
            <Link href="/#apparel" onClick={() => setMobileMenuOpen(false)}>
              Garment & Hard Tags
            </Link>
            <Link href="/#laundry" onClick={() => setMobileMenuOpen(false)}>
              Textile Laundry Tags
            </Link>
            <Link href="/#anti-metal" onClick={() => setMobileMenuOpen(false)}>
              Anti-Metal Industrial Tags
            </Link>
            <Link href="/#vehicle" onClick={() => setMobileMenuOpen(false)}>
              Vehicle RFID Pass
            </Link>
            <Link href="/#rolls" onClick={() => setMobileMenuOpen(false)}>
              Printable Rolls & Inlays
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-[#86868b] pt-2 border-t border-black/[0.06]"
            >
              Staff Login (/admin)
            </Link>
          </div>
          <Link
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 rounded-full bg-[#0071e3] py-2.5 text-xs font-medium text-white"
          >
            <span>Get a Quote</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </header>
  );
}