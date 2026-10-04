import { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { getCompanySettings } from "@/lib/settings";
import Link from "next/link";
import {
  Layers,
  Cpu,
  Radio,
  ShoppingBag,
  GraduationCap,
  Boxes,
  Car,
  Database,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise Solutions | GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  description:
    "Explore our complete range of technology solutions: Custom ERPs, Retail POS, School Automation, Warehouse Portals, FASTag boom barriers, and bespoke software engineering.",
};

export default async function SolutionsIndexPage() {
  const company = await getCompanySettings();

  const verticals = [
    {
      title: "Custom Software Development",
      category: "Software",
      icon: Cpu,
      href: "/software",
      desc: "Bespoke ERPs, Web/Mobile Apps, and Cloud backends designed specifically around your company's operational workflow.",
      bullets: ["Haryana GST (06) auto-split", "Delivery challans & dynamic UPI QR", "1-Click CA Return exports"],
    },
    {
      title: "Complete RFID Automation",
      category: "Hardware + Software",
      icon: Radio,
      href: "/rfid",
      desc: "Turnkey RFID ecosystems: WPC-compliant UHF readers, antennas, specialized tags, and high-throughput socket middleware.",
      bullets: ["Sub-second 900+ reads/sec", "Jewellery showcase tray audits", "Overhead dock & gate portals"],
    },
    {
      title: "Jewellery & Retail Automation",
      category: "Retail Vertical",
      icon: ShoppingBag,
      href: "/rfid#jewellery",
      desc: "Scan entire showcase trays in under 3 seconds without barcode line-of-sight. Eliminate inventory shrinkage and human audit fatigue.",
      bullets: ["Tamper-evident tail tags", "Counter batch billing", "Exit door anti-theft sirens"],
    },
    {
      title: "School & Campus Management ERP",
      category: "Education Vertical",
      icon: GraduationCap,
      href: "/software#school",
      desc: "Walk-through overhead RFID gate attendance (1,200+ students/min), automated WhatsApp parent alerts, fee installments, and bus route tracking.",
      bullets: ["Hands-free gate attendance", "Instant WhatsApp alerts", "All-in-one fee & academic ERP"],
    },
    {
      title: "Warehouse WMS & Pallet Tracking",
      category: "Logistics Vertical",
      icon: Boxes,
      href: "/rfid#warehouse",
      desc: "Automated loading dock doors verifying carton tags against E-Way Bills as forklifts pass through. Zero dispatch errors.",
      bullets: ["Automated packing slip match", "Handheld Geiger counter search", "Real-time bin localization"],
    },
    {
      title: "FASTag & Parking Barrier Automation",
      category: "Access & Infrastructure",
      icon: Car,
      href: "/rfid#fastag",
      desc: "Long-range 8-12 meter RFID readers detecting vehicle windshield FASTags for automated boom barrier opening in tech parks and societies.",
      bullets: ["Wiegand relay boom controllers", "Resident & visitor whitelist logs", "Zero traffic queue bottlenecks"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden pt-20 pb-20 border-b border-cyan-500/20 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[650px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none"></div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-4 py-1.5 text-xs font-semibold text-purple-300 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Layers className="h-3.5 w-3.5 text-purple-400" />
            <span>Integrated Solutions Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Complete Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-500">Solutions Portfolio</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            From single boutique RFID installations to comprehensive multi-location enterprise ERPs, discover how GARVIX technology solves real-world operational challenges.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verticals.map((v) => {
              const Icon = v.icon;

              return (
                <div
                  key={v.title}
                  className="rounded-3xl border border-slate-800 bg-[#090e1c] p-7 hover:border-cyan-500/40 hover:bg-[#0c1324] transition-all duration-300 flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {v.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {v.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      {v.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-2">
                    {v.bullets.map((b) => (
                      <div key={b} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                    <div className="pt-3">
                      <Link
                        href={v.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                      >
                        <span>View Detailed Architecture</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 border-t border-slate-900 bg-[#05070c]">
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

      <Footer />
    </div>
  );
}
