import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { GarvixLogoMark } from "@/components/brand/GarvixLogo";
import { getCompanySettings } from "@/lib/settings";

export async function Footer() {
  const company = await getCompanySettings();
  const cleanPhone = company.phone ? company.phone.replace(/[^0-9+]/g, "") : "";

  return (
    <footer className="border-t border-black/[0.06] bg-[#f5f5f7] text-[#424245] text-xs">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16171a] border border-[#d8b56c]/25 shadow-xs">
                <GarvixLogoMark className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-[#1d1d1f] block leading-none">
                  GARVIX
                </span>
                <span className="text-[11px] text-[#86868b]">
                  Software Solutions Pvt. Ltd.
                </span>
              </div>
            </div>
            <p className="text-xs text-[#6e6e73] leading-relaxed max-w-xs">
              Smart RFID tags, hardware, and custom software built around your exact business workflow.
            </p>
            <Link
              href="#contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] hover:bg-black px-4 py-2 text-xs font-medium text-white transition"
            >
              <span>Start an Enquiry</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* RFID Products */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold text-[#1d1d1f] mb-3.5">
              RFID Products
            </h4>
            <ul className="space-y-2.5 text-[#6e6e73]">
              <li>
                <Link href="/#jewellery" className="hover:text-[#1d1d1f] transition">
                  Jewellery RFID Tags
                </Link>
              </li>
              <li>
                <Link href="/#apparel" className="hover:text-[#1d1d1f] transition">
                  Garment Hang Tags & Hard Tags
                </Link>
              </li>
              <li>
                <Link href="/#laundry" className="hover:text-[#1d1d1f] transition">
                  Textile Laundry RFID Tags
                </Link>
              </li>
              <li>
                <Link href="/#anti-metal" className="hover:text-[#1d1d1f] transition">
                  Anti-Metal Industrial Tags
                </Link>
              </li>
              <li>
                <Link href="/#vehicle" className="hover:text-[#1d1d1f] transition">
                  Vehicle RFID Windshield Pass
                </Link>
              </li>
              <li>
                <Link href="/#rolls" className="hover:text-[#1d1d1f] transition">
                  Printable Rolls & Clear Inlays
                </Link>
              </li>
            </ul>
          </div>

          {/* Software & Access */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold text-[#1d1d1f] mb-3.5">
              Software
            </h4>
            <ul className="space-y-2.5 text-[#6e6e73]">
              <li>
                <Link href="/#custom-software" className="hover:text-[#1d1d1f] transition">
                  Custom ERP & CRM
                </Link>
              </li>
              <li>
                <Link href="/#custom-software" className="hover:text-[#1d1d1f] transition">
                  RFID Automation Apps
                </Link>
              </li>
              <li>
                <Link href="/#custom-software" className="hover:text-[#1d1d1f] transition">
                  Web & Mobile Apps
                </Link>
              </li>
              <li>
                <Link href="/#custom-software" className="hover:text-[#1d1d1f] transition">
                  GST Billing & Automation
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-[#86868b] hover:text-[#0071e3] transition"
                >
                  Staff Login (/admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold text-[#1d1d1f] mb-3.5">
              Contact
            </h4>
            <div className="space-y-2.5 text-[#6e6e73]">
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#1d1d1f] mt-0.5" />
                <span className="leading-relaxed">{company.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#1d1d1f]" />
                <a
                  href={`mailto:${company.email}`}
                  className="hover:text-[#0071e3] transition font-medium text-[#1d1d1f]"
                >
                  {company.email}
                </a>
              </div>
              {company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[#1d1d1f]" />
                  <a
                    href={`tel:${cleanPhone}`}
                    className="hover:text-[#1d1d1f] transition font-mono"
                  >
                    {company.phone}
                  </a>
                </div>
              )}
              {company.gstin && (
                <div className="pt-1 text-[11px] font-mono text-[#86868b]">
                  GSTIN: <span className="text-[#424245]">{company.gstin}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  {company.state} ({company.stateCode})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 border-t border-black/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#86868b]">
          <p>© {new Date().getFullYear()} {company.name}.</p>
          <div className="flex items-center gap-5">
            <Link href="#contact" className="hover:text-[#1d1d1f] transition">
              Enquiry Desk
            </Link>
            <a href={`mailto:${company.email}`} className="hover:text-[#1d1d1f] transition">
              {company.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}