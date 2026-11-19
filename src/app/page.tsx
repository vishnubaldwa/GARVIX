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
  X,
  ChevronRight,
  TrendingUp,
  Sliders,
  BellRing,
} from "lucide-react";

export default async function HomePage() {
  const company = await getCompanySettings();

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased">
      <Navbar />

      {/* 1. Hero Section (Apple-Style Clean & Grand) */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-[#fbfbfd]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm mb-6">
            <Radio className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
            <span>GARVIX AUTOMATION ECOSYSTEM</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-medium">WPC 865–867 MHz Compliant</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto">
            Enterprise Precision.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Engineered for Speed.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From sub-second jewellery tray scanning to warehouse dock-door portals and bespoke cloud ERPs. We design, manufacture, and integrate complete RFID hardware and custom software built for Indian enterprise operations.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 hover:bg-black px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:shadow"
            >
              <span>Request On-Site Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20would%20like%20to%20schedule%20a%20live%20RFID%20and%20Software%20demonstration"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-8 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>

            <Link
              href="#solutions"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-blue-600 hover:underline"
            >
              <span>Explore Solutions</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>In-House Hardware & Software</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Haryana GST (06) Certified Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Pan-India On-Site Implementation</span>
            </div>
          </div>

          {/* Keynote Visual Mockup: JewelTrack™ Smart Scanning Tray Simulation */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] text-left">
            <div className="flex flex-wrap items-center justify-between pb-5 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
                  <Gem className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Garvix JewelTrack™ • Smart Velvet Scanning Tray
                  </h4>
                  <p className="text-xs text-slate-500">
                    Active UHF Sensor Grid (WPC 865.7 MHz) • Real-Time Inventory Telemetry
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
                  SCAN COMPLETE (0.18s)
                </span>
              </div>
            </div>

            {/* Simulated Live Scan Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
              <div className="rounded-2xl bg-[#f8fafc] p-3.5 border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Items Scanned</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">512 pcs</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% Detected</div>
              </div>

              <div className="rounded-2xl bg-[#f8fafc] p-3.5 border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Scan Latency</div>
                <div className="text-2xl font-black text-blue-600 mt-0.5">0.18 sec</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Sub-second RF burst</div>
              </div>

              <div className="rounded-2xl bg-[#f8fafc] p-3.5 border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Stock Mismatch</div>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">0 Errors</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Exact gold weight match</div>
              </div>

              <div className="rounded-2xl bg-[#f8fafc] p-3.5 border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Anti-Theft Status</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">ARMED</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Exit gates synced</div>
              </div>
            </div>

            {/* Tray Mockup Graphic Representation */}
            <div className="pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                <span>Tray Sensor #04: Active on Diamond Counter 1</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span>TX Power: 30 dBm</span>
                <span>•</span>
                <span>Antenna: Circular Polarized</span>
                <span>•</span>
                <span>ERP Synced: 2 ms ago</span>
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
                Audit Accuracy
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Zero missed items or barcode human fatigue
              </p>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                0.2<span className="text-blue-600">s</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-2">
                Tag Read Speed
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Bulk read 500+ RFID tags in a single second
              </p>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                10<span className="text-blue-600">x</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-2">
                Faster Stock Audits
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Complete 2-day store audits in under 15 minutes
              </p>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                100<span className="text-blue-600">%</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-2">
                Workflow Adaptive
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Custom software engineered to fit your business
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Solutions Showcase (Apple Bento Product Grid) */}
      <section id="solutions" className="py-24 bg-[#fbfbfd]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Complete Technology Suite
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
              Engineered for Every Operational Scale
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Explore how GARVIX integrates specialized RFID hardware, tamper-evident smart tags, and custom cloud ERP platforms to eliminate manual bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Bento Card 1: 💎 Garvix JewelTrack™ (Large 7 Cols) */}
            <div
              id="jewellery"
              className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                    <Gem className="h-3.5 w-3.5" />
                    JEWELLERY AUTOMATION
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    JewelTrack™ v3.2
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Scan 500 Gold Ornaments in Under 2 Seconds.
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Eliminate exhausting 4-hour daily manual piece counts. Place an entire velvet tray of rings, bangles, or diamond necklaces directly over the smart reader. Every tag is read simultaneously with zero surface scratches.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      Instant Missing Item Alerts
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Immediate acoustic buzzer and red screen warning if any piece is missing from the counter tray.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Anti-Theft Exit Gate Portals
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Discreet ceiling or pillar RFID antennas instantly detect unbilled items passing showroom exits.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-600" />
                      Non-Scratch Micro Tags
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Ultra-thin, residue-free UHF labels designed specifically for fine hallmarked 22K/24K gold and platinum.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-purple-600" />
                      Live Handheld Audit Gun
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Audit wall showcases, lockers, and safe vaults by simply waving the handheld RFID reader.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-slate-500 font-medium">
                  Used by premium jewelers across Haryana, Delhi NCR, and Rajasthan.
                </span>
                <a
                  href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20am%20interested%20in%20Jewellery%20RFID%20for%20my%20showroom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>Request Showroom Trial</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Bento Card 2: 🏭 Warehouse & Logistics Portals (5 Cols) */}
            <div
              id="warehouse"
              className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                    <Boxes className="h-3.5 w-3.5" />
                    SUPPLY CHAIN & LOGISTICS
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    DockShield™
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Dock Door Bulk Verification. Zero Carton Opening.
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Forklifts pass through dock door portals; all 2,000+ cartons on a pallet are verified in 3 seconds against ERP Dispatch Orders without breaking tamper seals.
                </p>

                <div className="mt-6 space-y-3.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900 font-semibold">12-Meter Long Range UHF:</strong> Fixed portal arrays read moving pallets seamlessly at forklift speeds.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900 font-semibold">Zero Wrong Dispatches:</strong> Automated green/red dock signal lights prevent loading incorrect SKU shipments.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900 font-semibold">Rugged Android Handhelds:</strong> IP65 drop-proof scanners with 2D barcode + RFID hybrid scanning.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Automated E-Way Bill integration</span>
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>Explore Warehouse Spec</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 3: 💻 Custom Enterprise Software & Cloud ERP (5 Cols) */}
            <div
              id="software"
              className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-700">
                    <Cpu className="h-3.5 w-3.5" />
                    BESPOKE ENTERPRISE SOFTWARE
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    Garvix ERP Engine
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Software That Adapts to You. Not Vice-Versa.
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Off-the-shelf software forces you to change your workflow. GARVIX crafts custom cloud applications, REST APIs, and edge middlewares tailor-made for your unique operation.
                </p>

                <div className="mt-6 space-y-3.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900 font-semibold">Native Auto GST (Haryana 06):</strong> Automatic CGST, SGST, IGST calculation and 1-click CA tax export.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900 font-semibold">Telegram & WhatsApp Push Alerts:</strong> Real-time staff notifications for invoices, receipts, and low stock.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900 font-semibold">Offline-First Local Sync:</strong> Factory floor keeps running during internet downtime; auto-syncs to cloud.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">PostgreSQL • Next.js • Python</span>
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
                >
                  <span>Build Custom App</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 4: 🏷️ Hardware & Smart Tags Ecosystem (7 Cols) */}
            <div
              id="hardware"
              className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                    <Layers className="h-3.5 w-3.5" />
                    HARDWARE & SMART TAGS
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    WPC 865–867 MHz
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Industrial-Grade Readers & Specialized Tags.
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  We supply, configure, and calibrate certified RFID hardware engineered to withstand dusty Indian factory environments, electrical noise, and high temperatures.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                    <h5 className="text-xs font-bold text-slate-900">Fixed UHF Readers</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      4-port and 8-port high-sensitivity readers compatible with Impinj Indy R2000 / E710 chips.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                    <h5 className="text-xs font-bold text-slate-900">Anti-Metal On-Metal Tags</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Shielded ceramic and ABS tags for metal racks, engines, and heavy industrial machinery.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                    <h5 className="text-xs font-bold text-slate-900">Washable Linen Tags</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Flexible fabric tags that survive 200+ industrial laundry cycles for hospitals and hotels.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  Ready stock available for readers, antennas, handheld guns, and tags.
                </span>
                <a
                  href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20need%20quotation%20for%20RFID%20hardware%20and%20tags"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  <span>Request Hardware Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Bento Card 5: 🛠️ AMC & 24/7 Enterprise Support (Full Width 12 Cols) */}
            <div
              id="amc"
              className="lg:col-span-12 rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shrink-0">
                    <Wrench className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      LIFECYCLE MANAGEMENT
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Annual Maintenance Contracts (AMC) & Pan-India Support
                    </h3>
                  </div>
                </div>

                <a
                  href="https://wa.me/919950718876?text=Hi%20Garvix,%20I%20want%20to%20discuss%20AMC%20support%20for%20our%20RFID%20installation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition shrink-0"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>Connect with Support Lead</span>
                </a>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-600">
                <div className="space-y-1.5">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" /> Guaranteed SLAs
                  </h5>
                  <p className="leading-relaxed">
                    Rapid response times with advance hardware replacement so your showroom or warehouse never halts.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-amber-600" /> On-Site Calibration
                  </h5>
                  <p className="leading-relaxed">
                    Scheduled quarterly antenna recalibration and RF signal tuning to maintain peak 99.9% read rates.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Firmware & Cloud Updates
                  </h5>
                  <p className="leading-relaxed">
                    Regular feature releases, security patches, and regulatory compliance updates included.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <BellRing className="h-4 w-4 text-purple-600" /> Dedicated Hotline
                  </h5>
                  <p className="leading-relaxed">
                    Direct access to senior hardware and software engineers via phone and WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Comparison Matrix: Legacy Barcode vs GARVIX RFID (Apple Clean Style) */}
      <section className="py-20 border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              The Technology Leap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Why Forward-Thinking Businesses Replace Barcodes
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Comparing manual 1D/2D barcode operations with GARVIX autonomous RFID precision.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
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

      {/* 5. Interactive ROI Calculator */}
      <section className="py-20 border-t border-slate-200/80 bg-[#fbfbfd]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RoiCalculator />
        </div>
      </section>

      {/* 6. Contact & Consultation Section */}
      <section className="py-20 border-t border-slate-200/80 bg-white">
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

      {/* 7. Corporate Apple-Style Footer */}
      <Footer />
    </div>
  );
}