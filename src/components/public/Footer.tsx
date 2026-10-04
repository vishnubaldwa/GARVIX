import Link from "next/link";
import { Radio, Mail, Phone, MapPin, ShieldCheck, ArrowUpRight, Cpu, Layers } from "lucide-react";
import { getCompanySettings } from "@/lib/settings";

export async function Footer() {
  const company = await getCompanySettings();
  const cleanPhone = company.phone ? company.phone.replace(/[^0-9+]/g, "") : "";

  return (
    <footer className="border-t border-cyan-500/20 bg-[#04060a] text-slate-400 text-xs">
      {/* Top Banner / Positioning statement */}
      <div className="border-b border-slate-900/80 bg-[#06080e] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shrink-0">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">
                GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                “We don&apos;t force businesses to adapt to software. We build software that adapts to the business.”
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black shadow-lg hover:opacity-90 transition"
            >
              <span>Schedule Architecture Call</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Column 1: Company */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="hover:text-cyan-400 transition">
                  About GARVIX
                </Link>
              </li>
              <li>
                <Link href="/#why-garvix" className="hover:text-cyan-400 transition">
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-cyan-400 transition">
                  How We Work
                </Link>
              </li>
              <li>
                <Link href="/industries" className="hover:text-cyan-400 transition">
                  Industries We Serve
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cyan-400 transition">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-500 hover:text-cyan-400 transition">
                  Staff Admin (/admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-4">
              Solutions
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/solutions" className="hover:text-cyan-400 transition">
                  All Solutions
                </Link>
              </li>
              <li>
                <Link href="/software#erp" className="hover:text-cyan-400 transition">
                  Enterprise ERP & SCM
                </Link>
              </li>
              <li>
                <Link href="/rfid#jewellery" className="hover:text-cyan-400 transition">
                  Jewellery RFID Audit
                </Link>
              </li>
              <li>
                <Link href="/solutions#retail" className="hover:text-cyan-400 transition">
                  Retail & Smart POS
                </Link>
              </li>
              <li>
                <Link href="/solutions#school" className="hover:text-cyan-400 transition">
                  School RFID Attendance
                </Link>
              </li>
              <li>
                <Link href="/solutions#warehouse" className="hover:text-cyan-400 transition">
                  Warehouse Pallet Portals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: RFID Automation */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-4">
              RFID Automation
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/rfid#readers" className="hover:text-cyan-400 transition">
                  Fixed UHF 4-Port Readers
                </Link>
              </li>
              <li>
                <Link href="/rfid#handheld" className="hover:text-cyan-400 transition">
                  Handheld RFID Guns
                </Link>
              </li>
              <li>
                <Link href="/rfid#gates" className="hover:text-cyan-400 transition">
                  Overhead Gate Portals
                </Link>
              </li>
              <li>
                <Link href="/rfid#tags" className="hover:text-cyan-400 transition">
                  Specialized RFID Tags
                </Link>
              </li>
              <li>
                <Link href="/rfid#antennas" className="hover:text-cyan-400 transition">
                  Circular Polarized Antennas
                </Link>
              </li>
              <li>
                <Link href="/rfid#fastag" className="hover:text-cyan-400 transition">
                  FASTag Boom Barrier Gates
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Custom Software */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-4">
              Custom Software
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/software#workflow" className="hover:text-cyan-400 transition">
                  Workflow-Adaptive Software
                </Link>
              </li>
              <li>
                <Link href="/software#erp" className="hover:text-cyan-400 transition">
                  Custom ERP & CRM
                </Link>
              </li>
              <li>
                <Link href="/software#middleware" className="hover:text-cyan-400 transition">
                  RFID Hardware Middleware
                </Link>
              </li>
              <li>
                <Link href="/software#mobile" className="hover:text-cyan-400 transition">
                  Android Handheld Apps
                </Link>
              </li>
              <li>
                <Link href="/software#cloud" className="hover:text-cyan-400 transition">
                  Cloud Dashboards & APIs
                </Link>
              </li>
              <li>
                <Link href="/software#billing" className="hover:text-cyan-400 transition">
                  Automated GST Billing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Industries */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-4">
              Industries
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/industries#retail" className="hover:text-cyan-400 transition">
                  Retail & Jewellery
                </Link>
              </li>
              <li>
                <Link href="/industries#education" className="hover:text-cyan-400 transition">
                  Education & Colleges
                </Link>
              </li>
              <li>
                <Link href="/industries#warehousing" className="hover:text-cyan-400 transition">
                  Logistics & Warehouses
                </Link>
              </li>
              <li>
                <Link href="/industries#manufacturing" className="hover:text-cyan-400 transition">
                  Manufacturing & WIP
                </Link>
              </li>
              <li>
                <Link href="/industries#corporate" className="hover:text-cyan-400 transition">
                  Corporate Campuses
                </Link>
              </li>
              <li>
                <Link href="/industries#healthcare" className="hover:text-cyan-400 transition">
                  Healthcare & Labs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 6: Contact & Registered Office */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-4">
              Registered Office
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs">
                <MapPin className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                <span className="leading-relaxed text-slate-300">{company.address}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <Phone className="h-4 w-4 shrink-0 text-cyan-400" />
                <a href={`tel:${cleanPhone}`} className="hover:text-cyan-400 transition font-mono text-slate-300">
                  {company.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <Mail className="h-4 w-4 shrink-0 text-cyan-400" />
                <a href={`mailto:${company.email}`} className="hover:text-cyan-400 transition font-mono text-slate-300">
                  {company.email}
                </a>
              </div>
              <div className="pt-2 text-[11px] text-slate-400 font-mono">
                GSTIN: <span className="text-white">{company.gstin}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>State Code: {company.stateCode} ({company.state})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-14 border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition">
              Terms & Conditions
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition">
              Consultation Desk
            </Link>
            <Link href="/admin/login" className="text-cyan-400/80 hover:text-cyan-300 transition">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
