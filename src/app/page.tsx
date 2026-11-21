import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { EnquireButton } from "@/components/public/EnquireButton";
import { ShowcaseVideoPlayer } from "@/components/public/ShowcaseVideoPlayer";
import { getCompanySettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import {
  Check,
  Cpu,
  Smartphone,
  FileSpreadsheet,
  Workflow,
  Layers,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Play,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [company, websiteClients] = await Promise.all([
    getCompanySettings(),
    prisma.websiteClient
      .findMany({
        where: { isVisible: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      })
      .catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] selection:bg-[#0071e3] selection:text-white antialiased">
      <Navbar />

      {/* 0. First-Fold Flagship Showcase — GARVIX Retail POS & Store ERP */}
      <section
        id="retail-software"
        className="pt-8 pb-12 sm:pt-11 sm:pb-16 bg-white border-b border-black/[0.06] scroll-mt-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
              Flagship Software &bull; Built by GARVIX
            </p>
            <h1 className="mt-2.5 text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] leading-[1.08]">
              Built for Modern Retail.{" "}
              <span className="text-[#86868b]">Engineered by GARVIX.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#6e6e73] max-w-2xl mx-auto leading-relaxed">
              Complete GST POS billing, barcode &amp; RFID stock sync, instant UPI QR payments, and multi-store cloud ERP &mdash; developed in-house by our team.
            </p>
          </div>

          <div className="rounded-[1.75rem] sm:rounded-[2rem] border border-black/[0.06] bg-[#f5f5f7] overflow-hidden shadow-[0_14px_44px_rgba(0,0,0,0.06)]">
            <Link
              href="/retail-software"
              className="group relative block overflow-hidden"
              aria-label="Watch GARVIX Retail POS & Store ERP product video"
            >
              <img
                src="/images/products/garvix-retail-software.jpg?v=2"
                alt="GARVIX Retail POS & Store ERP — Custom Retail Billing, Inventory & Multi-Store Software built by GARVIX"
                fetchPriority="high"
                className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <span className="absolute bottom-3.5 right-3.5 sm:bottom-6 sm:right-6 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f]/85 group-hover:bg-[#0071e3] text-white backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-semibold shadow-lg transition-colors">
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Watch 15s Product Video</span>
              </span>
            </Link>
            <div className="bg-white border-t border-black/[0.05] px-5 py-4 sm:px-8 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3.5">
                <span className="inline-flex w-fit items-center rounded-full bg-[#0071e3]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0071e3] shrink-0">
                  Built by GARVIX
                </span>
                <p className="text-sm text-[#424245] leading-snug">
                  <span className="font-semibold text-[#1d1d1f]">
                    GARVIX Retail POS &amp; Store ERP
                  </span>{" "}
                  &mdash; in-house retail billing, barcode &amp; RFID stock sync, and multi-store cloud software.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <EnquireButton
                  solution="Retail POS & Store ERP"
                  label="Request Live Demo"
                  variant="primary"
                />
                <Link
                  href="/retail-software"
                  className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-medium text-[#0071e3] hover:underline transition"
                >
                  <span>Watch Demo Video</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Hero Section — Pure Apple Simplicity */}
      <section className="pt-14 pb-20 sm:pt-20 sm:pb-24 bg-[#fbfbfd]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
            GARVIX Smart Retail & Software
          </p>

          <h2 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight text-[#1d1d1f] leading-[1.08] max-w-3xl mx-auto">
            Smart RFID Tags.{" "}
            <span className="text-[#86868b]">Custom Software.</span>
          </h2>

          <p className="mt-5 text-base sm:text-xl text-[#6e6e73] max-w-2xl mx-auto leading-relaxed">
            Branded UHF RFID tags paired with tailor-made software for jewellery, apparel, laundry, factories, vehicles — and any custom software your business needs.
          </p>

          {/* Clean CTAs -> Contact Form */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <EnquireButton
              solution="Complete Hardware + Software"
              label="Get a Quote"
              variant="primary"
            />
            <Link
              href="#products"
              className="inline-flex items-center gap-1 rounded-full px-6 py-3 text-sm font-medium text-[#0071e3] hover:underline transition"
            >
              <span>Explore Products</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Real Product Preview Strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="#jewellery"
              className="group rounded-3xl border border-black/[0.06] bg-white p-3 text-left shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#f5f5f7]">
                <img
                  src="/images/products/jewellery-rfid-tag.jpg"
                  alt="GARVIX Jewellery RFID Tags"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="pt-3 px-1">
                <p className="text-sm font-semibold text-[#1d1d1f]">Jewellery RFID</p>
                <p className="text-xs text-[#86868b] mt-0.5">Tags & Tray Software</p>
              </div>
            </Link>

            <Link
              href="#apparel"
              className="group rounded-3xl border border-black/[0.06] bg-white p-3 text-left shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#f5f5f7]">
                <img
                  src="/images/products/garment-tag.jpg"
                  alt="GARVIX Garment RFID Hang Tags"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="pt-3 px-1">
                <p className="text-sm font-semibold text-[#1d1d1f]">Apparel & Hard Tags</p>
                <p className="text-xs text-[#86868b] mt-0.5">Smart Retail POS</p>
              </div>
            </Link>

            <Link
              href="#laundry"
              className="group rounded-3xl border border-black/[0.06] bg-white p-3 text-left shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#f5f5f7]">
                <img
                  src="/images/products/laundry-textile-tag.jpg"
                  alt="GARVIX Textile Laundry RFID Tags"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="pt-3 px-1">
                <p className="text-sm font-semibold text-[#1d1d1f]">Laundry Tags</p>
                <p className="text-xs text-[#86868b] mt-0.5">Hospital & Hotel ERP</p>
              </div>
            </Link>

            <Link
              href="#anti-metal"
              className="group rounded-3xl border border-black/[0.06] bg-white p-3 text-left shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#f5f5f7]">
                <img
                  src="/images/products/anti-metal-tag.jpg"
                  alt="GARVIX Anti-Metal RFID Tags"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="pt-3 px-1">
                <p className="text-sm font-semibold text-[#1d1d1f]">Anti-Metal Tags</p>
                <p className="text-xs text-[#86868b] mt-0.5">Machinery & Assets</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Clean 4-Metric Strip */}
      <section className="py-12 border-y border-black/[0.06] bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] tracking-tight">99.9%</p>
              <p className="text-xs text-[#86868b] mt-1">Stock Audit Accuracy</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] tracking-tight">0.2s</p>
              <p className="text-xs text-[#86868b] mt-1">500+ Bulk Tag Read</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] tracking-tight">100%</p>
              <p className="text-xs text-[#86868b] mt-1">Custom-Built Software</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] tracking-tight">Pan-India</p>
              <p className="text-xs text-[#86868b] mt-1">Setup & Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RFID Products + Dedicated Software (Clean, Short & Visual) */}
      <section id="products" className="py-20 sm:py-24 bg-[#f5f5f7]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
              RFID Hardware + Software
            </p>
            <h2 className="mt-2 text-3xl sm:text-5xl font-bold text-[#1d1d1f] tracking-tight">
              Our Smart Products.
            </h2>
            <p className="mt-3 text-base text-[#6e6e73]">
              Every tag comes with custom software built by our team to automate your daily workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Jewellery RFID */}
            <div
              id="jewellery"
              className="rounded-3xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col scroll-mt-24"
            >
              <div className="aspect-[16/10] bg-[#f5f5f7] overflow-hidden">
                <img
                  src="/images/products/jewellery-rfid-tag.jpg"
                  alt="GARVIX Jewellery RFID Tags"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                    Jewellery Showrooms
                  </p>
                  <h3 className="mt-1.5 text-2xl font-bold text-[#1d1d1f] tracking-tight">
                    Jewellery RFID Tags & Software
                  </h3>
                  <p className="mt-2 text-sm text-[#6e6e73]">
                    Non-scratch loop & tail tags for gold rings, bangles, and diamond pendants.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#424245]">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Scan 500 ornaments on a velvet tray in under 1 second</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Instant missing-piece alarm & exit gate anti-theft alert</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Custom stock, gold weight & hallmark ERP software</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.05]">
                  <EnquireButton solution="Jewellery RFID" label="Enquire for Jewellery RFID" />
                </div>
              </div>
            </div>

            {/* 2. Garment Hang Tags & Hard Tags */}
            <div
              id="apparel"
              className="rounded-3xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col scroll-mt-24"
            >
              <div className="aspect-[16/10] bg-[#f5f5f7] grid grid-cols-2 gap-0.5 overflow-hidden">
                <img
                  src="/images/products/garment-tag.jpg"
                  alt="GARVIX Garment Hang Tag"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
                <img
                  src="/images/products/hard-security-tag.jpg"
                  alt="GARVIX Hard Security Tag"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0071e3]">
                    Apparel & Fashion Retail
                  </p>
                  <h3 className="mt-1.5 text-2xl font-bold text-[#1d1d1f] tracking-tight">
                    Garment Hang Tags, Hard Tags & POS
                  </h3>
                  <p className="mt-2 text-sm text-[#6e6e73]">
                    Premium branded UHF hang tags and reusable magnetic anti-theft hard tags.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#424245]">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>1-second basket checkout — bill 10+ garments together</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Walk-through handheld rack audit in minutes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Custom retail POS, size/color matrix & anti-theft gate sync</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.05]">
                  <EnquireButton solution="Garment RFID" label="Enquire for Apparel & POS" />
                </div>
              </div>
            </div>

            {/* 3. Textile Laundry RFID Tags */}
            <div
              id="laundry"
              className="rounded-3xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col scroll-mt-24"
            >
              <div className="aspect-[16/10] bg-[#f5f5f7] overflow-hidden">
                <img
                  src="/images/products/laundry-textile-tag.jpg"
                  alt="GARVIX Textile RFID Laundry Tag"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-700">
                    Hotels & Hospitals
                  </p>
                  <h3 className="mt-1.5 text-2xl font-bold text-[#1d1d1f] tracking-tight">
                    Textile Laundry Tags & Linen ERP
                  </h3>
                  <p className="mt-2 text-sm text-[#6e6e73]">
                    Washable fabric & button tags built for 200+ industrial laundry cycles.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#424245]">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Count full laundry bags instantly without unpacking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Track wash cycles per towel, bedsheet & uniform</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Custom linen issue, return & billing software</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.05]">
                  <EnquireButton solution="Laundry RFID" label="Enquire for Laundry RFID" />
                </div>
              </div>
            </div>

            {/* 4. Anti-Metal Industrial Tags */}
            <div
              id="anti-metal"
              className="rounded-3xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col scroll-mt-24"
            >
              <div className="aspect-[16/10] bg-[#f5f5f7] overflow-hidden">
                <img
                  src="/images/products/anti-metal-tag.jpg"
                  alt="GARVIX Anti-Metal RFID Tag"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#424245]">
                    Factories & IT Assets
                  </p>
                  <h3 className="mt-1.5 text-2xl font-bold text-[#1d1d1f] tracking-tight">
                    Anti-Metal Tags & Asset Software
                  </h3>
                  <p className="mt-2 text-sm text-[#6e6e73]">
                    Rugged IP68 screw-mount tags engineered to read cleanly on metal surfaces.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#424245]">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Track factory machinery, tools, pallets & server racks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Heatproof, waterproof & oil-resistant construction</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Custom fixed-asset & preventive maintenance software</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.05]">
                  <EnquireButton solution="Anti-Metal RFID" label="Enquire for Anti-Metal Tags" />
                </div>
              </div>
            </div>

            {/* 5. Vehicle Windshield RFID Pass */}
            <div
              id="vehicle"
              className="rounded-3xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col scroll-mt-24"
            >
              <div className="aspect-[16/10] bg-[#f5f5f7] overflow-hidden">
                <img
                  src="/images/products/vehicle-rfid-pass.jpg"
                  alt="GARVIX Vehicle RFID Windshield Pass"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                    Parking & Gate Automation
                  </p>
                  <h3 className="mt-1.5 text-2xl font-bold text-[#1d1d1f] tracking-tight">
                    Vehicle RFID Pass & Gate Software
                  </h3>
                  <p className="mt-2 text-sm text-[#6e6e73]">
                    Transparent tamper-proof windshield stickers for hands-free vehicle access.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#424245]">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Automatic boom barrier opening up to 8 meters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Tamper-evident — cannot be peeled and reused</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Custom society, corporate parking & fleet entry software</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.05]">
                  <EnquireButton solution="Vehicle RFID" label="Enquire for Vehicle RFID" />
                </div>
              </div>
            </div>

            {/* 6. Printable RFID Rolls & Clear Inlays */}
            <div
              id="rolls"
              className="rounded-3xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col scroll-mt-24"
            >
              <div className="aspect-[16/10] bg-[#f5f5f7] grid grid-cols-2 gap-0.5 overflow-hidden">
                <img
                  src="/images/products/rfid-label-roll.jpg"
                  alt="GARVIX Printable RFID Label Roll"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
                <img
                  src="/images/products/rfid-inlay.jpg"
                  alt="GARVIX Clear UHF RFID Inlay"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
                    Packaging & Warehousing
                  </p>
                  <h3 className="mt-1.5 text-2xl font-bold text-[#1d1d1f] tracking-tight">
                    Printable Rolls, Inlays & Encoding
                  </h3>
                  <p className="mt-2 text-sm text-[#6e6e73]">
                    Thermal printable barcode+RFID rolls and peel-and-stick UHF inlays.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#424245]">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Print barcode & encode RFID chip in one single pass</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Works with Zebra, TSC & standard RFID printers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#0071e3] shrink-0" />
                      <span>Custom label printing & ERP serialization software</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.05]">
                  <EnquireButton
                    solution="Printable Rolls & Inlays"
                    label="Enquire for Rolls & Inlays"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5. Dynamic Our Clients Section (Controlled live from Admin Panel) */}
      {websiteClients.length > 0 && (
        <section
          id="our-clients"
          className="py-16 sm:py-20 bg-white border-t border-black/[0.05] scroll-mt-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
                Our Clients
              </p>
              <h2 className="mt-2.5 text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
                Trusted by growing businesses.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#6e6e73]">
                Retail brands, manufacturers, and enterprises running on GARVIX RFID &amp; custom software.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-stretch justify-center gap-4 sm:gap-5">
              {websiteClients.map((client) => {
                const initials = client.name
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                const cardInner = (
                  <div className="group h-full rounded-2xl border border-black/[0.06] bg-[#fbfbfd] hover:bg-white hover:border-black/[0.12] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 px-5 py-6 flex flex-col items-center justify-center text-center">
                    {client.logoFile ? (
                      <div className="h-14 w-full flex items-center justify-center mb-3.5">
                        <img
                          src={`/api/public/client-logo/${client.id}?v=${client.updatedAt.getTime()}`}
                          alt={client.name}
                          className="max-h-12 max-w-[150px] w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center text-sm font-bold tracking-wide mb-3.5 shadow-xs">
                        {initials || "G"}
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-bold text-[#1d1d1f] tracking-tight leading-snug">
                        {client.name}
                      </span>
                      {client.websiteUrl && (
                        <ExternalLink className="h-3 w-3 text-[#86868b] group-hover:text-[#0071e3] transition shrink-0" />
                      )}
                    </div>

                    {client.industry && (
                      <span className="mt-1.5 inline-block rounded-full bg-black/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-[#6e6e73]">
                        {client.industry}
                      </span>
                    )}
                  </div>
                );

                return client.websiteUrl ? (
                  <a
                    key={client.id}
                    href={client.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[calc(50%-0.5rem)] sm:w-52 md:w-56 block"
                  >
                    {cardInner}
                  </a>
                ) : (
                  <div key={client.id} className="w-[calc(50%-0.5rem)] sm:w-52 md:w-56">
                    {cardInner}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. Dedicated Custom Software Section */}
      <section id="custom-software" className="py-20 sm:py-24 bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-[#1d1d1f] text-white p-8 sm:p-14 shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2997ff]">
                Custom Software Engineering
              </p>
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                Custom software built exactly for your business.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#a1a1a6] leading-relaxed">
                We build dedicated software for every RFID hardware product above — and we also design completely custom software tailored to your unique business requirements, regardless of industry.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 space-y-2.5">
                <Cpu className="h-5 w-5 text-[#2997ff]" />
                <h4 className="text-sm font-semibold text-white">RFID Hardware Software</h4>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Custom dashboards for readers, smart trays, handheld guns, gates & printers.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 space-y-2.5">
                <Layers className="h-5 w-5 text-[#2997ff]" />
                <h4 className="text-sm font-semibold text-white">Custom ERP & CRM</h4>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Inventory, sales, multi-branch operations, staff roles & real-time reports.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 space-y-2.5">
                <Smartphone className="h-5 w-5 text-[#2997ff]" />
                <h4 className="text-sm font-semibold text-white">Web & Mobile Apps</h4>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Custom web portals, Android/iOS apps for field teams, warehouses & clients.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 space-y-2.5">
                <Workflow className="h-5 w-5 text-[#2997ff]" />
                <h4 className="text-sm font-semibold text-white">Billing & Integrations</h4>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Auto GST billing, Tally/SAP sync, real-time email &amp; mobile alerts, and custom APIs.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 border-t border-white/[0.1]">
              <div className="flex items-center gap-2.5 text-xs text-[#a1a1a6]">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>You describe the workflow — we build the software to match it 100%.</span>
              </div>
              <EnquireButton
                solution="Custom Software"
                label="Discuss Your Custom Software"
                variant="primary"
              />
            </div>
          </div>

          {/* 4.5. GARVIX Business ERP & Android Mobile App — Video Showcase */}
          <div
            id="business-erp"
            className="mt-10 rounded-[2rem] border border-black/[0.06] bg-white overflow-hidden shadow-[0_14px_44px_rgba(0,0,0,0.05)] scroll-mt-24"
          >
            <div className="px-6 py-7 sm:px-10 sm:py-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
                  Flagship ERP + Android App &bull; Built by GARVIX
                </p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                  Complete Business ERP &amp; Mobile App.
                </h3>
                <p className="mt-2 text-sm sm:text-base text-[#6e6e73] leading-relaxed">
                  Manage your entire company from Web &amp; Android &mdash; GST Quotations &amp; Tax Invoices with dynamic UPI QR, Delivery Challans, Serial/IMEI tracking, AMC &amp; Service Tickets, Business Expenses, 1-Click CA GST Return, and Secure Document Vault.
                </p>
              </div>
              <div className="shrink-0">
                <EnquireButton
                  solution="Business ERP & Mobile App"
                  label="Request ERP Demo"
                  variant="primary"
                />
              </div>
            </div>

            <div className="border-y border-black/[0.05]">
              <ShowcaseVideoPlayer
                src="/videos/garvix-erp-showcase.mp4"
                poster="/images/products/garvix-erp-poster.jpg"
                label="GARVIX Business ERP & Flutter Android Mobile App Showcase"
              />
            </div>

            <div className="px-6 py-5 sm:px-10 bg-[#fbfbfd] flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868b] shrink-0">
                Ideal For
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "CCTV, RFID & IT Dealers",
                  "Solar, HVAC & Lift EPC",
                  "Wholesale & B2B Distributors",
                  "Machinery & Medical Suppliers",
                  "SME Factories & Manufacturers",
                  "B2B Service Agencies",
                ].map((industry) => (
                  <span
                    key={industry}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1 text-xs font-medium text-[#1d1d1f] shadow-2xs"
                  >
                    <Check className="h-3 w-3 text-[#0071e3] shrink-0" />
                    <span>{industry}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Simple 3-Step Process */}
      <section className="py-16 border-t border-black/[0.06] bg-[#fbfbfd]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
              One partner from tag to software.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-black/[0.06] bg-white p-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-xs font-bold text-[#1d1d1f]">
                1
              </span>
              <h4 className="mt-4 text-base font-semibold text-[#1d1d1f]">
                Share Your Requirement
              </h4>
              <p className="mt-1.5 text-xs text-[#6e6e73] leading-relaxed">
                Tell us whether you need RFID tags, readers, custom software, or a complete setup.
              </p>
            </div>

            <div className="rounded-3xl border border-black/[0.06] bg-white p-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-xs font-bold text-[#1d1d1f]">
                2
              </span>
              <h4 className="mt-4 text-base font-semibold text-[#1d1d1f]">
                Custom Tag & Software Build
              </h4>
              <p className="mt-1.5 text-xs text-[#6e6e73] leading-relaxed">
                We supply branded RFID hardware and engineer software matched to your exact workflow.
              </p>
            </div>

            <div className="rounded-3xl border border-black/[0.06] bg-white p-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-xs font-bold text-[#1d1d1f]">
                3
              </span>
              <h4 className="mt-4 text-base font-semibold text-[#1d1d1f]">
                On-Site Setup & Support
              </h4>
              <p className="mt-1.5 text-xs text-[#6e6e73] leading-relaxed">
                Full installation, staff training, and ongoing AMC support across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact Form -> Sends directly to Official Company Email */}
      <section className="py-20 sm:py-24 border-t border-black/[0.06] bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ContactForm
            companyInfo={{
              phone: company.phone,
              email: company.email,
              state: company.state,
            }}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}