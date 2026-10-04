import { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { getCompanySettings } from "@/lib/settings";
import Link from "next/link";
import {
  Radio,
  Scan,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Activity,
  Boxes,
  BellRing,
  Wifi,
  Disc,
  FileCheck,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Complete RFID Automation Solutions | GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  description:
    "End-to-end RFID ecosystems across India: WPC-compliant UHF fixed readers, handheld scanners, gate portals, specialized tags, and high-throughput middleware for jewellery, warehousing, and schools.",
};

export default async function RfidPage() {
  const company = await getCompanySettings();

  const hardwareLineup = [
    {
      name: "Fixed 4-Port & 8-Port UHF Readers",
      sub: "Impinj E710 Core • 33dBm Output Power",
      desc: "Industrial-grade fixed readers reading up to 900+ tags/second. Designed for automated conveyor lines, dock doors, and high-volume packing stations.",
      hsn: "8471",
      specs: "TCP/IP, RS232, GPIO relay ports, WPC Indian frequency (865-867 MHz).",
    },
    {
      name: "Overhead RFID Gate Portals",
      sub: "Wide-Aisle Touchless Entry & Exit",
      desc: "High-sensitivity gate portals designed for retail anti-theft, school campus walk-through attendance, and warehouse portal doorways without corridor choke points.",
      hsn: "8471",
      specs: "Read range up to 4.5 meters, bidirectional motion detection, optical beam sensors.",
    },
    {
      name: "Handheld Industrial RFID Guns",
      sub: "Ergonomic Android 13 Handheld Terminals",
      desc: "Rugged mobile computers with integrated circular polarized antennas and 2D zebra barcode engines. Built for rapid cycle counting and inventory audits.",
      hsn: "8471",
      specs: "IP65 water/dust resistance, 15-meter read distance, hot-swappable 9000mAh battery.",
    },
    {
      name: "Desktop USB Reader / Writers",
      sub: "Point of Sale & Enrollment Stations",
      desc: "Compact desktop pads for retail checkout counters, jewellery showcase trays, student ID card encoding, and IT asset tag commissioning.",
      hsn: "8471",
      specs: "USB HID / Virtual COM plug-and-play, near-field antenna to prevent stray reads.",
    },
    {
      name: "Circular Polarized Antennas (9dBi & 12dBi)",
      sub: "IP67 Weatherproof Outdoor & Indoor",
      desc: "Engineered to eliminate tag orientation sensitivity. High axial ratio ensures tags are captured whether positioned vertically, horizontally, or at an angle.",
      hsn: "8523",
      specs: "RP-TNC Female connector, UV-resistant ABS radome, mast/wall mounting brackets.",
    },
    {
      name: "Specialized RFID Inlays, Tags & Labels",
      sub: "On-Metal, Jewellery Tail & Windshield Tags",
      desc: "Custom printed and encoded RFID labels engineered for challenging RF environments — diamond rings, metallic server blades, corrugated cartons, and vehicle windshields.",
      hsn: "8523",
      specs: "Impinj Monza R6-P / Alien Higgs-EC chips, 96-496 bit EPC, tamper-evident adhesive.",
    },
  ];

  const softwareCapabilities = [
    {
      name: "RFID Socket Middleware",
      desc: "Sub-millisecond packet de-duplication and event filtering engine bridging readers to your cloud or local database.",
    },
    {
      name: "Real-Time Tag Management",
      desc: "Track every EPC inlay from factory encoding to warranty expiration with complete digital provenance.",
    },
    {
      name: "Asset & Tool Tracking Software",
      desc: "Live visibility over IT laptops, medical tools, and manufacturing dies with audio Geiger-counter search modes.",
    },
    {
      name: "Warehouse WMS Pallet Verification",
      desc: "Automated carton manifest matching against packing slips as forklifts drive through dock doors.",
    },
    {
      name: "Automated Walk-Through Attendance",
      desc: "Hands-free gate tracking marking rolls and dispatching instant WhatsApp notifications to parents or HRMS.",
    },
    {
      name: "Retail Anti-Theft & Smart POS",
      desc: "Instant tray billing at the counter and 40-millisecond GPIO strobe sirens upon unauthorized exit attempts.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden pt-20 pb-20 border-b border-cyan-500/20 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[650px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none"></div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 mb-6 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span>Turnkey Physical-to-Digital Automation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">RFID Automation Ecosystem</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            GARVIX is not merely an RFID hardware reseller. We engineer the complete ecosystem: <strong>Hardware + Software + Installation + Integration + Automation + Long-Term Support</strong>.
          </p>
        </div>
      </section>

      {/* The GARVIX Positioning Formula */}
      <section className="py-16 border-b border-slate-900 bg-[#050810]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-cyan-500/30 bg-[#090e1c] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                OUR TURNKEY MANDATE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Hardware + Software + Commissioning + Support
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                We take 100% accountability for RF performance on your physical premises. If a tag doesn&apos;t read, our engineers tune the power and antenna angles until it reads 100% of the time.
              </p>
            </div>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-black hover:bg-cyan-400 transition shadow-lg shrink-0"
            >
              <span>Request On-Site Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Hardware Lineup */}
      <section className="py-24 border-b border-cyan-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Industrial Grade RFID Hardware
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              WPC-compliant Indian frequency (865-867 MHz) readers, antennas, and specialized tags backed by GARVIX 1-Year Comprehensive Warranty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hardwareLineup.map((hw) => (
              <div
                key={hw.name}
                className="rounded-3xl border border-slate-800 bg-[#090e1c] p-7 hover:border-cyan-500/40 hover:bg-[#0c1324] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                      HSN: {hw.hsn}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      1-Yr Warranty
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">
                    {hw.name}
                  </h3>
                  <p className="text-xs font-semibold text-cyan-400 mb-3">
                    {hw.sub}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {hw.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-300 font-mono">
                  <span className="text-slate-500 block text-[10px] uppercase">Specifications:</span>
                  <p className="mt-0.5 leading-snug">{hw.specs}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RFID Software Capabilities */}
      <section className="py-24 bg-[#05080e]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              The RFID Software & Intelligence Layer
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Hardware without intelligent software is just expensive plastic and copper. Here is how GARVIX turns raw RF packets into automated business actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwareCapabilities.map((sw) => (
              <div
                key={sw.name}
                className="rounded-3xl border border-slate-800 bg-[#090e1c]/80 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 mb-4">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">
                    {sw.name}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {sw.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Consultation */}
      <section className="py-24 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactForm
            companyInfo={{
              phone: company.phone,
              email: company.email,
              state: company.state,
            }}
            defaultRequirement="RFID Automation"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
