import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import Link from "next/link";
import { Radio, ArrowRight, CheckCircle2, Shield, Zap, Sparkles, Cpu, Layers, Disc } from "lucide-react";

export default function RfidSolutionsPage() {
  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100">
      <Navbar />

      {/* Header */}
      <section className="pt-20 pb-16 border-b border-cyan-500/20 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-6">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span>Industrial & Commercial Grade RFID Systems</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Enterprise RFID Solutions & Hardware Engineered for India
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            WPC-compliant Indian frequency (865-867 MHz) readers, specialized tags for metal/liquids/jewellery, and sub-second tag counting algorithms.
          </p>
        </div>
      </section>

      {/* Hardware Lineup */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl font-black text-white">Hardware Ecosystem & Specifications</h2>
            <p className="text-xs text-slate-400 mt-1">Direct deployment-ready hardware backed by GARVIX 1-Year Comprehensive Warranty.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* HW 1 */}
            <div className="cyber-card rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">Fixed Reader</span>
                <h3 className="text-base font-bold text-white mt-1">Garvix GX-400 4-Port Reader</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Powered by Impinj E710 chip. 33dBm output power, reads up to 900+ tags/sec. Ideal for warehouse portal gates and automated conveyor lines.
                </p>
                <div className="mt-4 space-y-1.5 text-[11px] text-slate-300 font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Ports:</span> <span>4 x RP-TNC Female</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Interface:</span> <span>TCP/IP, RS232, GPIO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">HSN Code:</span> <span>8471</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HW 2 */}
            <div className="cyber-card rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">Handheld Gun</span>
                <h3 className="text-base font-bold text-white mt-1">Garvix GX-HH90 Android Terminal</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Ergonomic pistol grip with Android 13, 9000mAh swappable battery, 5.5-inch gorilla glass screen, and 1D/2D zebra barcode imager.
                </p>
                <div className="mt-4 space-y-1.5 text-[11px] text-slate-300 font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Read Range:</span> <span>Up to 15 meters</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Drop Spec:</span> <span>1.8m to concrete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">HSN Code:</span> <span>8471</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HW 3 */}
            <div className="cyber-card rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">RFID Antenna</span>
                <h3 className="text-base font-bold text-white mt-1">9dBi Circular Polarized Panel</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Heavy-duty IP67 weatherproof antenna designed for high-density scanning environments regardless of tag orientation.
                </p>
                <div className="mt-4 space-y-1.5 text-[11px] text-slate-300 font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Frequency:</span> <span>865-868 MHz (India)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Gain:</span> <span>9.0 dBi Circular</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">HSN Code:</span> <span>8523</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HW 4 */}
            <div className="cyber-card rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">Specialized Tags</span>
                <h3 className="text-base font-bold text-white mt-1">Custom Engineered Tags</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Jewellery tail tags, On-Metal PCB tags, Laundry silicone tags, and Thermal printable logistics labels.
                </p>
                <div className="mt-4 space-y-1.5 text-[11px] text-slate-300 font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Chips:</span> <span>Impinj Monza R6-P / NXP</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Formats:</span> <span>Rolls of 1k / 5k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">HSN Code:</span> <span>8523</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-16 border-t border-cyan-500/20 bg-[#06080e]/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Jewellery */}
          <div id="jewellery" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase text-cyan-400">Vertical Focus</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Jewellery Showroom Stock Audit in Under 3 Seconds
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Traditional jewellery audits force staff to manually count gold chains, diamond rings, and necklaces barcode-by-barcode after store closure, leading to hours of overtime and high shrinkage.
              </p>
              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Place entire showcase tray on GARVIX Desktop RFID Pad to count 200 items in 2 seconds.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Flag missing pieces immediately before client or staff leaves the counter.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Export daily closing reports directly to your ERP or accounting software.</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-500/30 bg-[#0c1220] p-6 text-xs font-mono space-y-3">
              <div className="text-cyan-400 font-bold">GARVIX JEWELLERY AUDIT METRICS</div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Time per 10,000 items:</span>
                <span className="text-white font-bold">12 Minutes (vs 6 Hours manual)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Tag Longevity:</span>
                <span className="text-white font-bold">10+ Years (No battery required)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Shrinkage Reduction:</span>
                <span className="text-emerald-400 font-bold">Over 99.4%</span>
              </div>
            </div>
          </div>

          {/* Warehouse */}
          <div id="warehouse" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1 rounded-2xl border border-blue-500/30 bg-[#0c1220] p-6 text-xs font-mono space-y-3">
              <div className="text-blue-400 font-bold">GARVIX PALLET PORTAL DISPATCH</div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Forklift Pass-Through Speed:</span>
                <span className="text-white font-bold">Up to 15 km/h</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Cartons per Pallet Read:</span>
                <span className="text-white font-bold">150+ Cartons in 1 Pass</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Dispatch Verification:</span>
                <span className="text-emerald-400 font-bold">100% Match with E-Way Bill</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold uppercase text-blue-400">Vertical Focus</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Automated Warehouse & Pallet Dock Door Portals
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                When pallets are loaded into delivery trucks, manual barcode scanning bottlenecks operations and leads to mis-shipments. GARVIX RFID Dock Portals automatically verify carton counts as forklifts drive through.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
