import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { RoiCalculator } from "@/components/public/RoiCalculator";
import { ContactForm } from "@/components/public/ContactForm";
import {
  Radio,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  Scan,
  Database,
  Layers,
  Sparkles,
  Server,
  Smartphone,
  CheckCircle,
  Truck,
  Car,
  Laptop,
  Gem,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/10 to-transparent blur-[120px] pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>Next-Gen RFID Ecosystems & Bespoke Software Development</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Turn Physical Assets Into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 cyber-glow-cyan">
              Real-Time Intelligent Data
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            GARVIX engineers end-to-end <strong>UHF/HF RFID hardware infrastructure</strong> and creates <strong>high-performance bespoke software & ERPs</strong>. Eliminate stock discrepancies, automate dispatches, and accelerate operational velocity across India.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#contact"
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-extrabold uppercase tracking-wider text-black shadow-[0_0_35px_rgba(0,242,254,0.4)] transition hover:opacity-95"
            >
              Request Custom Quotation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="#roi-calculator"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-8 py-4 text-sm font-bold text-cyan-300 backdrop-blur-md transition hover:border-cyan-400 hover:bg-cyan-500/10"
            >
              <Zap className="h-4 w-4 text-cyan-400" />
              Calculate RFID ROI
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4 max-w-4xl mx-auto">
            <div className="rounded-xl border border-slate-800/80 bg-[#0d1320]/60 p-4 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">99.8%</div>
              <p className="text-xs text-slate-400 mt-1">Audit Accuracy</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[#0d1320]/60 p-4 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">900+</div>
              <p className="text-xs text-slate-400 mt-1">Tags Read / Second</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[#0d1320]/60 p-4 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">98%</div>
              <p className="text-xs text-slate-400 mt-1">Time Saved in Audits</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[#0d1320]/60 p-4 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">100%</div>
              <p className="text-xs text-slate-400 mt-1">GST & CA Ready (06)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: RFID Specialized Solutions */}
      <section className="py-20 border-t border-cyan-500/20 bg-[#06080d]/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Hardware & Systems Engineering
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-white">
              Specialized RFID Solutions for Any Business
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              From delicate high-value diamond jewellery trays to high-speed automated warehouse conveyor gates and FASTag parking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Jewellery */}
            <div className="cyber-card rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mb-6">
                  <Gem className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Jewellery Real-Time Stock Audit</h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  Scan entire jewellery showcase trays (200+ rings, necklaces, bracelets) in under 3 seconds without picking items up individually. Eliminate shrinkage and daily audit fatigue.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-cyan-400" /> Printable tamper-evident tail tags
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-cyan-400" /> RFID Scanning Pads & Handheld Guns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-cyan-400" /> Instant Discrepancy & Missing item alerts
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link href="/solutions/rfid#jewellery" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                  Explore Jewellery Solution <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Warehouse */}
            <div className="cyber-card rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400 mb-6">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Warehouse & Pallet Portal Dispatch</h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  Fixed RFID readers installed at loading dock doors read all carton tags simultaneously as forklifts drive through. Automatic packing slip & E-Way Bill matching.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-400" /> 4-Port Fixed UHF Readers (Impinj E710)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-400" /> 9dBi Circular IP67 Antennas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-400" /> Zero manual dispatch errors
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link href="/solutions/rfid#warehouse" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300">
                  Explore Warehouse Portal <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Asset & FASTag */}
            <div className="cyber-card rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400 mb-6">
                  <Car className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">FASTag & Parking Automation</h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  Long-range 8-12 meter RFID readers detect vehicle windshield FASTags for automated boom barrier opening in residential societies, commercial tech parks, and toll plazas.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-purple-400" /> Integrated Long-Range UHF Reader
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-purple-400" /> Wiegand & Relay Boom Barrier Controller
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-purple-400" /> Resident & visitor whitelist logs
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link href="/solutions/rfid#fastag" className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300">
                  Explore FASTag Automation <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Custom Software & Bespoke Tech */}
      <section className="py-20 border-t border-cyan-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Full-Stack Software Engineering
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black text-white">
                Bespoke Software Tailored to Your Exact Business Logic
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Off-the-shelf software forces you to change your business to match their limitations. GARVIX builds tailor-made enterprise software from scratch with modern Node.js, Next.js, and SQL backends.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Custom ERP & CRM Backends</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tailored multi-branch inventory, auto-invoicing, role-based controls, and client relationship pipelines.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Hardware-to-Cloud Middleware</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      High-throughput socket servers connecting fixed RFID readers, barcode scanners, and weighing scales to your database.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Handheld Android Gun Applications</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Native Android apps built specifically for warehouse floor workers to perform rapid cycle counting offline & online.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/solutions/software"
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-6 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
                >
                  Explore Software Capabilities <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Code / Architecture Preview Card */}
            <div className="rounded-2xl border border-cyan-500/30 bg-[#090e1a] p-6 shadow-2xl relative overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80"></span>
                  <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
                  <span className="text-slate-300 font-semibold ml-2">garvix-rfid-stream.ts</span>
                </div>
                <span className="text-cyan-400">Node.js 22 + Next.js</span>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <p className="text-slate-500">// Connect to Impinj E710 Reader TCP socket</p>
                <p><span className="text-pink-400">const</span> client = <span className="text-cyan-400">new</span> RFIDReader(<span className="text-emerald-300">&quot;192.168.1.120&quot;</span>, 5084);</p>
                <p><span className="text-pink-400">await</span> client.startInventory(&#123; powerDbm: 33, qValue: 4 &#125;);</p>
                <p>&nbsp;</p>
                <p className="text-slate-500">// Stream 900+ EPC reads/sec to SQL ledger</p>
                <p>client.on(<span className="text-emerald-300">&quot;tagRead&quot;</span>, <span className="text-pink-400">async</span> (tag) =&gt; &#123;</p>
                <p className="pl-4"><span className="text-pink-400">const</span> isAudited = <span className="text-pink-400">await</span> db.serialNumber.verify(&#123;</p>
                <p className="pl-8">epc: tag.epcHex,</p>
                <p className="pl-8">rssiDbm: tag.rssi,</p>
                <p className="pl-8">antennaPort: tag.antenna</p>
                <p className="pl-4">&#125;);</p>
                <p className="pl-4">dispatchTelegramAlertIfMissing(tag.epcHex);</p>
                <p>&#125;);</p>
              </div>

              <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-[11px] text-emerald-300 flex items-center justify-between">
                <span>Status: Reader Online • 0 dropped packets</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Interactive ROI Calculator */}
      <section className="py-20 border-t border-cyan-500/20 bg-[#06080d]/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RoiCalculator />
        </div>
      </section>

      {/* Section 4: Contact & Demo Lead Capture */}
      <section className="py-20 border-t border-cyan-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
