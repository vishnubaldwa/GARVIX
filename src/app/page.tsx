import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { RoiCalculator } from "@/components/public/RoiCalculator";
import { ContactForm } from "@/components/public/ContactForm";
import { getCompanySettings } from "@/lib/settings";
import {
  Radio,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Gem,
  Boxes,
  Layers,
  Wrench,
  Clock,
  Sparkles,
  Barcode,
  Scan,
  MessageCircle,
  Truck,
  Check,
  ChevronRight,
  TrendingUp,
  Sliders,
  BellRing,
  PackageCheck,
  Car,
  Shirt,
} from "lucide-react";

export default async function HomePage() {
  const company = await getCompanySettings();

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased">
      <Navbar />

      {/* 1. Hero Section (Apple-Style Clean with Real Product Showcase) */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-[#fbfbfd]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm mb-6">
            <Radio className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
            <span>GARVIX SMART RETAIL & RFID HARDWARE</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-medium">Bespoke Enterprise Software</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto">
            Real Hardware.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Intelligent Software.
            </span>{" "}
            Engineered as One.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            We manufacture certified UHF RFID tags, inlays, and hard security tags — and engineer the bespoke cloud ERPs, smart counters, and handheld scanner apps that power them across retail, manufacturing, logistics, and healthcare.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 hover:bg-black px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:shadow"
            >
              <span>Request Product Sample Kit</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20would%20like%20to%20discuss%20RFID%20tags%20and%20custom%20software"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-8 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>

            <Link
              href="#products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-blue-600 hover:underline"
            >
              <span>Explore Products & Software</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Direct Manufacturer & Software Author</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>WPC Indian Band (865–867 MHz) Certified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Haryana GST (06) Auto Tax Compliance</span>
            </div>
          </div>

          {/* Floating Product Collage Preview */}
          <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="group rounded-3xl border border-slate-200/90 bg-white p-3 shadow-sm hover:shadow-lg transition-all">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50">
                <img
                  src="/images/products/jewellery-rfid-tag.jpg"
                  alt="Garvix Jewellery RFID Tags"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Jewellery RFID
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5">JewelTrack™ Smart Tags</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">500 items in 0.18s</p>
              </div>
            </div>

            <div className="group rounded-3xl border border-slate-200/90 bg-white p-3 shadow-sm hover:shadow-lg transition-all">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50">
                <img
                  src="/images/products/garment-tag.jpg"
                  alt="Garvix Garment RFID Hang Tags"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  Apparel Retail
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5">Fashion Hang Tags</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Instant basket checkout</p>
              </div>
            </div>

            <div className="group rounded-3xl border border-slate-200/90 bg-white p-3 shadow-sm hover:shadow-lg transition-all">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50">
                <img
                  src="/images/products/laundry-textile-tag.jpg"
                  alt="Garvix Textile RFID Laundry Tags"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                  Hospital & Hotel
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5">Textile Laundry Tags</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">200+ wash cycles</p>
              </div>
            </div>

            <div className="group rounded-3xl border border-slate-200/90 bg-white p-3 shadow-sm hover:shadow-lg transition-all">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50">
                <img
                  src="/images/products/anti-metal-tag.jpg"
                  alt="Garvix Anti-Metal RFID Tags"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                  Machinery & Plant
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5">Anti-Metal Tags</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">IP68 rugged mount</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Apple Keynote Specs Bar (4-Column Metrics Grid) */}
      <section className="py-14 border-y border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                99.9<span className="text-blue-600">%</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-2">
                Scan Accuracy Rate
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Zero missed items or manual human fatigue
              </p>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                0.18<span className="text-blue-600">s</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-2">
                Sub-Second Read Latency
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Bulk read 500+ tags on a single tray
              </p>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                12<span className="text-blue-600">m</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-2">
                Long-Range Portals
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Dock door reading without opening cartons
              </p>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                200<span className="text-blue-600">+</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-2">
                Wash Cycles Guaranteed
              </div>
              <p className="text-xs text-slate-500 mt-1">
                High-temperature industrial laundry ready
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Solutions: Real Products + Dedicated Software Pairings */}
      <section id="products" className="py-24 bg-[#fbfbfd]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              The Product & Software Ecosystem
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
              Every Smart Tag Powered by Custom Software
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              We do not just sell tags. We manufacture the physical RFID hardware and develop the complete custom software applications that run your daily operations.
            </p>
          </div>

          {/* PAIR 1: 💎 Jewellery RFID Smart Tags + JewelTrack™ ERP */}
          <div
            id="jewellery"
            className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                <Gem className="h-3.5 w-3.5" />
                <span>JEWELLERY RFID HARDWARE & SOFTWARE</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                GARVIX JewelTrack™ Tags & Smart Velvet Tray ERP
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Replace 4-hour manual piece counts with sub-second automation. Our custom-manufactured non-scratch loop & dumbbell tags attach securely to 22K/24K gold rings, diamond pendants, bangles, and chains with zero surface damage.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    500 Items in 0.18s
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Place an entire velvet tray on the counter reader; all pieces are counted instantly.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Missing Piece Acoustic Buzzer
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Instant red alert on screen and buzzer if an ornament is swapped or removed from the tray.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-600" />
                    Anti-Theft Exit Gate Portals
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Discreet ceiling or pillar antennas sound an alarm within 0.1s if an unbilled item passes exits.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-purple-600" />
                    Hallmark & Gold Weight Sync
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Direct sync with custom Garvix Cloud ERP for gross/net weight and HUID verification.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20am%20interested%20in%20JewelTrack%20RFID%20tags%20and%20software%20for%20my%20showroom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-black px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition"
                >
                  <span>Request Jewellery Sample Kit</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-lg bg-white">
                <img
                  src="/images/products/jewellery-rfid-tag.jpg"
                  alt="Garvix Smart Retail Jewellery RFID Tags"
                  className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                />
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Product: GARVIX Smart Retail Jewellery Tags
                  </span>
                  <span className="font-mono text-blue-600">GVX-JWL-001 / 002</span>
                </div>
              </div>
            </div>
          </div>

          {/* PAIR 2: 👕 Garment Hang Tags & Hard Tags + FashionFlow™ POS */}
          <div
            id="apparel"
            className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm bg-white">
                  <img
                    src="/images/products/garment-tag.jpg"
                    alt="Garvix UHF RFID Garment Hang Tag"
                    className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                  />
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <span className="text-[11px] font-bold text-slate-800">
                      UHF Garment Hang Tag
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm bg-white">
                  <img
                    src="/images/products/hard-security-tag.jpg"
                    alt="Garvix Anti-Theft EAS Hard Tag"
                    className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                  />
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <span className="text-[11px] font-bold text-slate-800">
                      EAS + RFID Hard Tag
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-800">
                <Shirt className="h-3.5 w-3.5" />
                <span>APPAREL & FASHION RETAIL ECOSYSTEM</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Garment Hang Tags, Hard Tags & FashionFlow™ POS
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Transform apparel retail from slow single-barcode scanning to instant bulk billing and anti-shoplifting security. Designed with premium black matte cardstock, gold foil logo, and embedded high-sensitivity UHF RFID inlays.
              </p>

              <div className="space-y-3 text-xs text-slate-600 pt-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Instant Basket Checkout:</strong> Drop a shopping basket with 10 garments onto the POS reader; all items are billed simultaneously in 1 second.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Whole-Rack Stocktaking:</strong> Staff walks along clothing aisles with a handheld RFID reader; 1,000 garments are audited in 30 seconds.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Dual Anti-Theft Security:</strong> Reusable magnetic hard tags with high-strength pins protect against store shoplifting at overhead gate portals.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Custom In-House Tag Branding:</strong> Available with your company logo, custom MRP barcode formatting, and encoded EPC chips.
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20need%20Garment%20RFID%20tags%20and%20Apparel%20POS%20software"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-black px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition"
                >
                  <span>Inquire for Apparel Brand</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* PAIR 3: 🧺 Textile RFID Laundry Tags + LinenTrack™ ERP */}
          <div
            id="laundry"
            className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-xs font-bold text-cyan-800">
                <Radio className="h-3.5 w-3.5" />
                <span>HOSPITAL & HOTEL LAUNDRY AUTOMATION</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Textile Laundry Tags & LinenTrack™ Cloud ERP
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Engineered specifically for commercial laundry operations in hospitals, luxury hotels, and railway linens. Flexible fabric and silicone tags withstand 200+ high-temperature washing cycles, 60-bar water extraction presses, and 200°C ironing.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                    Bulk Laundry Bag Scan
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Scan 500 soiled towels or sheets through an RFID portal without opening bags.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Wash Life Cycle Counter
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    ERP automatically tracks wash counts and alerts when linen quality nears end-of-life.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-600" />
                    Ward & Room Dispatch
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Exact dispatch tracking per hospital ward or hotel floor eliminates linen shrinkage.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-blue-600" />
                    Sew-In or Heat-Seal Tags
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Soft, skin-safe edges that do not irritate patients or hotel guests.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20am%20interested%20in%20Textile%20Laundry%20RFID%20tags%20and%20LinenTrack%20software"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-black px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition"
                >
                  <span>Request Laundry Tag Samples</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-lg bg-white">
                <img
                  src="/images/products/laundry-textile-tag.jpg"
                  alt="Garvix Textile RFID Laundry Tag"
                  className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                />
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Product: Textile RFID Laundry Tags
                  </span>
                  <span className="font-mono text-cyan-600">Washable • 200+ Cycles</span>
                </div>
              </div>
            </div>
          </div>

          {/* PAIR 4: ⚙️ Anti-Metal Industrial RFID Tags + AssetCore™ ERP */}
          <div
            id="anti-metal"
            className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-lg bg-white">
                <img
                  src="/images/products/anti-metal-tag.jpg"
                  alt="Garvix Anti-Metal Industrial RFID Tag"
                  className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                />
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Product: Heavy-Duty Anti-Metal Tags
                  </span>
                  <span className="font-mono text-slate-800">IP68 Rugged • Metal Shielded</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-xs font-bold text-slate-800">
                <Wrench className="h-3.5 w-3.5" />
                <span>HEAVY MACHINERY & ASSET TRACKING</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Anti-Metal Tags & AssetCore™ Enterprise ERP
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Standard RFID tags fail when mounted on metal due to radio signal interference. GARVIX Anti-Metal tags feature specialized internal RF shielding, high-impact ABS encapsulation, and screw or rivet holes for permanent mounting on machinery, IT racks, and tools.
              </p>

              <div className="space-y-3 text-xs text-slate-600 pt-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">10-Meter Read Range on Metal:</strong> Reads through metal racks, steel pallets, and industrial engines effortlessly.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Plant Maintenance Logging:</strong> Field engineers scan tags with handheld guns to log oil changes, calibration, and repair tickets.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">IT Server Room Audits:</strong> Complete physical audit of 500 server blades and switches in minutes without human error.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">IP68 Weatherproof & Heatproof:</strong> Withstands heavy oil, grease, outdoor rain, and high ambient factory temperatures.
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20need%20Anti-Metal%20RFID%20tags%20and%20AssetCore%20software"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-black px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition"
                >
                  <span>Inquire for Plant Machinery</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* PAIR 5: 🚗 Vehicle RFID Passes + ParkGuard™ Boom Barrier */}
          <div
            id="vehicle"
            className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                <Car className="h-3.5 w-3.5" />
                <span>VEHICLE AUTOMATION & PARKING BOOM BARRIERS</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Vehicle Windshield Passes & ParkGuard™ Access System
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Seamless, hands-free vehicle entry for residential societies, corporate IT parks, toll plazas, and logistics hubs. Transparent tamper-evident windshield stickers permanently self-destruct if peeled, preventing tag transfer between vehicles.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    8-Meter Hands-Free Opening
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Overhead directional antenna reads the moving vehicle tag and lifts the boom barrier automatically.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Tamper-Evident Security
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Tag antenna breaks if peeled off glass, eliminating tag sharing and unauthorized entry.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-600" />
                    Fleet Logistics In-Out Time
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Automated vehicle timestamp logging with linked driver details and electronic challans.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-purple-600" />
                    Telegram & WhatsApp Alerts
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Residents or plant managers receive instant push alerts whenever their vehicle enters or exits.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20need%20Vehicle%20RFID%20passes%20and%20Boom%20Barrier%20automation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-black px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition"
                >
                  <span>Request Vehicle Pass Samples</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-lg bg-white">
                <img
                  src="/images/products/vehicle-rfid-pass.jpg"
                  alt="Garvix Vehicle RFID Pass Windshield Sticker"
                  className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                />
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Product: Vehicle RFID Windshield Pass
                  </span>
                  <span className="font-mono text-emerald-600">Tamper-Proof • 8m Range</span>
                </div>
              </div>
            </div>
          </div>

          {/* PAIR 6: 🧻 Printable RFID Label Rolls & Clear Inlays + TagMaster™ */}
          <div
            id="rolls"
            className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm bg-white">
                  <img
                    src="/images/products/rfid-label-roll.jpg"
                    alt="Garvix Printable Roll of UHF RFID Barcode Labels"
                    className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                  />
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <span className="text-[11px] font-bold text-slate-800">
                      Printable RFID Label Rolls
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm bg-white">
                  <img
                    src="/images/products/rfid-inlay.jpg"
                    alt="Garvix UHF RFID Inlays"
                    className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                  />
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <span className="text-[11px] font-bold text-slate-800">
                      Clear UHF RFID Inlays
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-800">
                <Barcode className="h-3.5 w-3.5" />
                <span>HIGH-SPEED ENCODING & PRINTING MIDDLEWARE</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Printable RFID Rolls, Inlays & TagMaster™
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Direct thermal and thermal-transfer printable adhesive rolls with integrated UHF RFID inlays. Encode memory and print high-resolution barcodes simultaneously using Zebra, TSC, or Postek RFID printer encoders.
              </p>

              <div className="space-y-3 text-xs text-slate-600 pt-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">1-Click Bulk Serialization:</strong> Automatically generate GS1-compliant serialized EPC codes directly from your ERP invoice or packing list.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Pre-Printed or Blank Rolls:</strong> Order blank rolls for on-demand printing or pre-printed, pre-encoded tags with your company logo.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Adhesive Wet Inlays:</strong> Peel-and-stick clear inlays to embed RFID intelligence into your own carton boxes, plastic containers, or brand tags.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Direct Integration with Tally & SAP:</strong> Our TagMaster™ middleware bridges your existing accounting database with RFID encoding hardware.
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20need%20RFID%20Label%20Rolls%20and%20TagMaster%20middleware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-black px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition"
                >
                  <span>Order Label Rolls & Inlays</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Complete Turnkey Solution (The 4 Pillars) */}
      <section className="py-20 border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Turnkey Accountability
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Hardware + Software + On-Site Execution
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Most vendors sell hardware and blame software, or sell software and blame hardware. At GARVIX, you have a single partner for the entire lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl border border-slate-200/80 bg-[#fbfbfd] p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 font-bold">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900">Custom Smart Tags</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Jewellery loop tags, garment hang tags, washable linen tags, and anti-metal tags custom manufactured with your brand identity.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-[#fbfbfd] p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-bold">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900">Enterprise Readers</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                4-port / 8-port fixed readers, circular polarized antennas, and rugged IP65 Android handheld guns compliant with Indian WPC frequencies.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-[#fbfbfd] p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 font-bold">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900">Bespoke Cloud ERP</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Custom software engineered to fit your exact workflow with native Auto GST (Haryana 06), Telegram push bots, and offline edge sync.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-[#fbfbfd] p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-bold">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900">Pan-India AMC & SLAs</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                On-site engineering installation, quarterly antenna recalibration, advance hardware replacement, and 24/7 dedicated support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Apple-Style Comparison Matrix */}
      <section className="py-20 border-t border-slate-200/80 bg-[#fbfbfd]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              The Technology Leap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Why Forward-Thinking Businesses Replace Barcodes
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Comparing manual barcode scanning with GARVIX autonomous RFID precision.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            <div className="grid grid-cols-12 bg-slate-900 text-white text-xs font-bold p-4 sm:p-5">
              <div className="col-span-5 sm:col-span-4 uppercase tracking-wider text-slate-400">
                Operational Metric
              </div>
              <div className="col-span-3 sm:col-span-4 uppercase tracking-wider text-rose-300">
                Traditional Barcode
              </div>
              <div className="col-span-4 uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5" />
                <span>GARVIX RFID</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-slate-50/60 transition">
                <div className="col-span-5 sm:col-span-4 font-semibold text-slate-900">
                  Scanning Speed
                </div>
                <div className="col-span-3 sm:col-span-4 text-slate-500">
                  1 item every 3–5 seconds
                </div>
                <div className="col-span-4 font-bold text-emerald-700 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>500+ items / second</span>
                </div>
              </div>

              <div className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-slate-50/60 transition">
                <div className="col-span-5 sm:col-span-4 font-semibold text-slate-900">
                  Line of Sight
                </div>
                <div className="col-span-3 sm:col-span-4 text-slate-500">
                  Must align laser with label
                </div>
                <div className="col-span-4 font-bold text-emerald-700 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Reads through boxes, bags & trays</span>
                </div>
              </div>

              <div className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-slate-50/60 transition">
                <div className="col-span-5 sm:col-span-4 font-semibold text-slate-900">
                  Daily Store Piece Audit
                </div>
                <div className="col-span-3 sm:col-span-4 text-slate-500">
                  3–5 hours of manual fatigue
                </div>
                <div className="col-span-4 font-bold text-emerald-700 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Under 15 minutes complete</span>
                </div>
              </div>

              <div className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-slate-50/60 transition">
                <div className="col-span-5 sm:col-span-4 font-semibold text-slate-900">
                  Anti-Theft Detection
                </div>
                <div className="col-span-3 sm:col-span-4 text-rose-500 font-medium">
                  None (Passive printed paper)
                </div>
                <div className="col-span-4 font-bold text-emerald-700 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Instant exit gate alarms (0.1s)</span>
                </div>
              </div>

              <div className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-slate-50/60 transition">
                <div className="col-span-5 sm:col-span-4 font-semibold text-slate-900">
                  Human Error Rate
                </div>
                <div className="col-span-3 sm:col-span-4 text-rose-500 font-medium">
                  5–12% missed/duplicate scans
                </div>
                <div className="col-span-4 font-bold text-emerald-700 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>99.9% sensor accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive ROI Calculator */}
      <section className="py-20 border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RoiCalculator />
        </div>
      </section>

      {/* 7. Contact & Product Inquiry Section */}
      <section className="py-20 border-t border-slate-200/80 bg-[#fbfbfd]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactForm
            companyInfo={{
              phone: company.phone,
              email: company.email,
              state: company.state,
            }}
          />
        </div>
      </section>

      {/* 8. Corporate Apple-Style Footer */}
      <Footer />
    </div>
  );
}