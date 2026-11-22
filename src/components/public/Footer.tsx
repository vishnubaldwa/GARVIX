import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { GarvixLogoMark } from "@/components/brand/GarvixLogo";
import { getCompanySettings } from "@/lib/settings";
import { COMPANY_CIN } from "@/lib/seo";

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
              In-house Retail POS, Restaurant &amp; Caf&eacute; Software, Complete Business ERP + Android App, and turnkey UHF RFID Hardware + Software across India.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] hover:bg-black px-4 py-2 text-xs font-medium text-white transition"
            >
              <span>Start an Enquiry</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Software Suites */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold text-[#1d1d1f] mb-3.5">
              Software Suites
            </h4>
            <ul className="space-y-2.5 text-[#6e6e73]">
              <li>
                <Link href="/retail-software" className="hover:text-[#1d1d1f] transition">
                  Retail POS &amp; Store ERP
                </Link>
              </li>
              <li>
                <Link href="/erp-software" className="hover:text-[#1d1d1f] transition">
                  Business ERP &amp; Mobile App
                </Link>
              </li>
              <li>
                <Link href="/restaurant-software" className="hover:text-[#1d1d1f] transition">
                  Restaurant &amp; Caf&eacute; Software
                </Link>
              </li>
              <li>
                <Link href="/software" className="hover:text-[#1d1d1f] transition">
                  Custom Software Engineering
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#1d1d1f] transition">
                  Guides &amp; Insights (Blog)
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

          {/* RFID Products */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold text-[#1d1d1f] mb-3.5">
              RFID &amp; Company
            </h4>
            <ul className="space-y-2.5 text-[#6e6e73]">
              <li>
                <Link href="/rfid-jewellery" className="hover:text-[#1d1d1f] transition">
                  Jewellery RFID System
                </Link>
              </li>
              <li>
                <Link href="/rfid" className="hover:text-[#1d1d1f] transition">
                  All RFID Hardware &amp; Tags
                </Link>
              </li>
              <li>
                <Link href="/industries" className="hover:text-[#1d1d1f] transition">
                  Industries Served
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#1d1d1f] transition">
                  About GARVIX
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#1d1d1f] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#1d1d1f] transition">
                  Terms of Service
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
              <div className="pt-1 text-[11px] font-mono text-[#86868b] space-y-0.5">
                <div>
                  CIN: <span className="text-[#424245]">{COMPANY_CIN}</span>
                </div>
                {company.gstin && (
                  <div>
                    GSTIN: <span className="text-[#424245]">{company.gstin}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  {company.state} ({company.stateCode}) &bull; Pan-India Support
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 border-t border-black/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#86868b]">
          <p>&copy; {new Date().getFullYear()} {company.name}.</p>
          <div className="flex items-center gap-5">
            <Link href="/blog" className="hover:text-[#1d1d1f] transition">
              Guides &amp; Blog
            </Link>
            <Link href="/contact" className="hover:text-[#1d1d1f] transition">
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
