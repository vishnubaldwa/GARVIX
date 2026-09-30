import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { Cpu, Database, Server, Smartphone, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SoftwareSolutionsPage() {
  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100">
      <Navbar />

      {/* Header */}
      <section className="pt-20 pb-16 border-b border-cyan-500/20 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-300 mb-6">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>High-Concurrency Modern Software Engineering</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Bespoke Enterprise Software, Custom ERPs & IoT Middleware
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            We build lightning-fast web, cloud, and mobile architectures in Node.js, Next.js, and SQL that bridge complex hardware streams with elegant business workflows.
          </p>
        </div>
      </section>

      {/* Software Pillars */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1: Custom ERP */}
            <div id="erp" className="cyber-card rounded-2xl p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mb-6">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Custom ERP & Inventory Systems</h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Stop juggling rigid, expensive SaaS platforms. We engineer tailored ERP systems matching your exact warehouse workflows, vendor credit terms, multi-branch serial tracking, and GST reporting.
              </p>
              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Auto GST calculation (State Code matching, CGST+SGST vs IGST)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> 1-Click CA Return Export (GSTR-1, GSTR-3B Excel)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Delivery Challans & Dynamic UPI QR Invoices
                </div>
              </div>
            </div>

            {/* Pillar 2: Hardware Middleware */}
            <div id="iot" className="cyber-card rounded-2xl p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400 mb-6">
                <Server className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">IoT Hardware & Reader Middleware</h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Fixed RFID readers, handheld guns, weighing bridges, and barcode scanners produce thousands of raw signals. Our Node.js middleware filters noise, deduplicates tag reads, and commits clean records to SQL.
              </p>
              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" /> LLRP & Low-level TCP socket connectors
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" /> Webhook and REST API dispatcher
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" /> Offline cache & retry queue for zero data loss
                </div>
              </div>
            </div>

            {/* Pillar 3: Handheld Android Apps */}
            <div id="mobile" className="cyber-card rounded-2xl p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400 mb-6">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Android Handheld Scanner Apps</h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                High-contrast, rugged mobile apps designed specifically for warehouse staff with gloves. Large tap targets, audio beepers on tag locate, and full offline cycle-counting capabilities.
              </p>
              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" /> Geigercounter style audio tag locate finder
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" /> Offline SQLite caching with background sync
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" /> Instant Bluetooth & OTG thermal printer support
                </div>
              </div>
            </div>

            {/* Pillar 4: Web Applications */}
            <div id="web" className="cyber-card rounded-2xl p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 mb-6">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Full-Stack Cloud SaaS & Portals</h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Customer-facing self-service portals, quotation approval systems, partner directories, and live analytics dashboards built with Next.js 15, React 19, and Tailwind CSS.
              </p>
              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Instant Client Portal (View & Sign Quotations)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Dynamic UPI Payment QR Code embedding
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Telegram & WhatsApp automated webhooks
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 border-t border-cyan-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
