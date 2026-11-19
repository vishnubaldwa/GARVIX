import Link from "next/link";
import { Radio, Mail, Phone, MapPin, ShieldCheck, ArrowUpRight, MessageCircle } from "lucide-react";
import { getCompanySettings } from "@/lib/settings";

export async function Footer() {
  const company = await getCompanySettings();
  const cleanPhone = company.phone ? company.phone.replace(/[^0-9+]/g, "") : "";

  return (
    <footer className="border-t border-slate-200 bg-[#f5f5f7] text-slate-600 text-xs">
      {/* Top Banner / Positioning statement */}
      <div className="border-b border-slate-200/80 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shrink-0 shadow-sm">
              <Radio className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                “We don&apos;t force businesses to adapt to software. We engineer software & RFID hardware that adapt to the business.”
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20would%20like%20to%20consult%20with%20your%20team"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>WhatsApp Architect</span>
            </a>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-black px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition"
            >
              <span>Schedule On-Site Audit</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Column 1: Company */}
          <div>
            <h4 className="text-[12px] font-bold text-slate-900 mb-4 tracking-tight">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="hover:text-slate-900 transition">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/#jewellery" className="hover:text-slate-900 transition">
                  Jewellery RFID
                </Link>
              </li>
              <li>
                <Link href="/#warehouse" className="hover:text-slate-900 transition">
                  Warehouse Portals
                </Link>
              </li>
              <li>
                <Link href="/#software" className="hover:text-slate-900 transition">
                  Custom Software
                </Link>
              </li>
              <li>
                <Link href="/#amc" className="hover:text-slate-900 transition">
                  AMC & Support
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-400 hover:text-blue-600 transition font-mono">
                  Staff Admin (/admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h4 className="text-[12px] font-bold text-slate-900 mb-4 tracking-tight">
              Solutions
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#jewellery" className="hover:text-slate-900 transition">
                  JewelTrack™ Tray Audit
                </Link>
              </li>
              <li>
                <Link href="/#jewellery" className="hover:text-slate-900 transition">
                  Anti-Theft Detection
                </Link>
              </li>
              <li>
                <Link href="/#warehouse" className="hover:text-slate-900 transition">
                  Dock Door Gate Readers
                </Link>
              </li>
              <li>
                <Link href="/#warehouse" className="hover:text-slate-900 transition">
                  Handheld PDA RFID Guns
                </Link>
              </li>
              <li>
                <Link href="/#software" className="hover:text-slate-900 transition">
                  Bespoke Cloud ERP
                </Link>
              </li>
              <li>
                <Link href="/#hardware" className="hover:text-slate-900 transition">
                  On-Metal & Fabric Tags
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: RFID Hardware */}
          <div>
            <h4 className="text-[12px] font-bold text-slate-900 mb-4 tracking-tight">
              Hardware
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#hardware" className="hover:text-slate-900 transition">
                  Fixed 4-Port UHF Readers
                </Link>
              </li>
              <li>
                <Link href="/#hardware" className="hover:text-slate-900 transition">
                  Circular Polarized Antennas
                </Link>
              </li>
              <li>
                <Link href="/#hardware" className="hover:text-slate-900 transition">
                  Rugged Android RFID Handhelds
                </Link>
              </li>
              <li>
                <Link href="/#hardware" className="hover:text-slate-900 transition">
                  Tamper-Evident Jewellery Tags
                </Link>
              </li>
              <li>
                <Link href="/#hardware" className="hover:text-slate-900 transition">
                  High-Temp Industrial Tags
                </Link>
              </li>
              <li>
                <span className="text-slate-400">
                  WPC 865–867 MHz Compliant
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Software & ERP */}
          <div>
            <h4 className="text-[12px] font-bold text-slate-900 mb-4 tracking-tight">
              Enterprise Software
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#software" className="hover:text-slate-900 transition">
                  Workflow-Adaptive Architecture
                </Link>
              </li>
              <li>
                <Link href="/#software" className="hover:text-slate-900 transition">
                  Automated GST Engine (06)
                </Link>
              </li>
              <li>
                <Link href="/#software" className="hover:text-slate-900 transition">
                  Telegram Bot Notification Suite
                </Link>
              </li>
              <li>
                <Link href="/#software" className="hover:text-slate-900 transition">
                  Offline-First Local Edge Sync
                </Link>
              </li>
              <li>
                <Link href="/#software" className="hover:text-slate-900 transition">
                  RESTful Hardware Middleware
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Registered Office */}
          <div>
            <h4 className="text-[12px] font-bold text-slate-900 mb-4 tracking-tight">
              Corporate Office
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <MapPin className="h-4 w-4 shrink-0 text-slate-900 mt-0.5" />
                <span className="leading-relaxed">{company.address}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Phone className="h-4 w-4 shrink-0 text-slate-900" />
                <a href={`tel:${cleanPhone}`} className="hover:text-slate-900 transition font-mono">
                  {company.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Mail className="h-4 w-4 shrink-0 text-slate-900" />
                <a href={`mailto:${company.email}`} className="hover:text-slate-900 transition font-mono">
                  {company.email}
                </a>
              </div>
              <div className="pt-2 text-[11px] text-slate-500 font-mono">
                GSTIN: <span className="text-slate-800 font-semibold">{company.gstin}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>State Code: {company.stateCode} ({company.state})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-14 border-t border-slate-200/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-slate-400">Palam Vihar, Gurugram, Haryana</span>
            <span>•</span>
            <Link href="#contact" className="hover:text-slate-800 transition">
              Contact Sales
            </Link>
            <span>•</span>
            <a
              href="https://wa.me/919950718876"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 transition"
            >
              Direct WhatsApp (+91 99507 18876)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
