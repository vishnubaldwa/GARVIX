import { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { getCompanySettings } from "@/lib/settings";
import Link from "next/link";
import {
  Cpu,
  Database,
  Server,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  ShoppingBag,
  Boxes,
  Users,
  LayoutDashboard,
  Zap,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Software Development | GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  description:
    "Tailor-made enterprise software, bespoke ERP systems, school management engines, POS billing, and handheld Android scanner applications built around your exact business workflow.",
};

export default async function SoftwarePage() {
  const company = await getCompanySettings();

  const solutionsList = [
    {
      id: "erp",
      title: "Enterprise ERP & Supply Chain",
      icon: Database,
      tagline: "Tailored to your procurement, warehousing, assembly, and invoicing lifecycle.",
      description:
        "Forget the limitations and per-user subscription fees of generic ERPs. GARVIX builds tailor-made enterprise ERP solutions that map to your physical locations, multi-branch warehouses, vendor credit cycles, delivery challans, and Indian tax compliance.",
      highlights: [
        "Haryana State Code (06) automated CGST+SGST vs IGST calculation",
        "E-Way Bill generation, Transporter ID, and LR tracking",
        "1-Click CA Return multi-sheet Excel export (GSTR-1 & GSTR-3B)",
        "Returnable vs Non-Returnable delivery challan generation",
      ],
    },
    {
      id: "school",
      title: "School Management & Campus ERP",
      icon: GraduationCap,
      tagline: "Student life-cycle, fee installments, bus tracking, and RFID gate attendance.",
      description:
        "A unified institutional platform managing admissions, grade reports, staff bio/RFID clock-ins, fee collections with dynamic UPI QR receipts, library book management, and hands-free gate portals that dispatch instant WhatsApp alerts to parents.",
      highlights: [
        "High-throughput RFID gate portal attendance (1,200+ students/min)",
        "Instant automated WhatsApp and SMS alerts dispatched to parents",
        "Fee installment tracking with automated overdue penalty reminders",
        "Driver GPS route tracking and campus security visitor logs",
      ],
    },
    {
      id: "pos",
      title: "Retail & Smart POS Billing",
      icon: ShoppingBag,
      tagline: "Lightning-fast billing with barcode, RFID tray scanning, and UPI QR payments.",
      description:
        "Built for jewellery boutiques, multi-counter retail showrooms, and wholesale distribution counters. Batch-read merchandise trays in seconds, print thermal GST invoices, manage credit balances, and generate dynamic NPCI UPI payment QR codes directly on customer displays.",
      highlights: [
        "Showcase tray batch billing reading 200+ tagged items in 3 seconds",
        "Dynamic NPCI UPI QR code generation on counter display screens",
        "Multi-store live inventory reservation and inter-branch transfers",
        "Offline-capable billing with background cloud synchronization",
      ],
    },
    {
      id: "warehouse",
      title: "Warehouse & WMS Automation",
      icon: Boxes,
      tagline: "Real-time bin locations, pallet dispatch verification, and cycle counting.",
      description:
        "Warehouse Management Systems that bridge directly with dock door RFID reader portals and handheld Android guns. Track pallets from inward receipt to high-bay rack storage, wave picking, and automated vehicle dispatch loading checks.",
      highlights: [
        "Forklift dock portal auto-verification matching packing slips",
        "Real-time bin localization with handheld audio Geiger counter search",
        "First-In, First-Out (FIFO) batch tracking with expiry monitors",
        "Serialized item tracking ensuring warranty provenance from inward to sale",
      ],
    },
    {
      id: "hrms",
      title: "Employee Management & Attendance",
      icon: Users,
      tagline: "Shift scheduling, biometric/RFID sync, leave approvals, and payroll.",
      description:
        "Eliminate attendance fraud and proxy punch-ins. Our employee management system integrates with RFID turnstiles, biometric scanners, and mobile GPS check-ins, syncing hours directly into overtime and payroll calculations.",
      highlights: [
        "Turnstile RFID badge sync with instant shift clock-in",
        "Department-level leave request and approval workflows",
        "Automated overtime calculation and payroll ledger sync",
        "Granular Role-Based Access Control (RBAC) permissions matrix",
      ],
    },
    {
      id: "mobile",
      title: "Handheld Industrial Android Apps",
      icon: Smartphone,
      tagline: "Native Android applications built for rugged industrial scanner guns.",
      description:
        "We build ergonomic native Android apps tailored for Zebra, Chainway, and Honeywell industrial handheld computers. Floor operators perform cycle counts, verify stock, and audit aisles even in disconnected dead zones.",
      highlights: [
        "Direct C/Java SDK integration with hardware laser & RFID modules",
        "Offline-first architecture with local SQLite cache and auto-sync",
        "Audible Geiger-counter tracking for locating missing inventory items",
        "Rugged, high-contrast dark UI designed for warehouse lighting",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden pt-20 pb-20 border-b border-cyan-500/20 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[650px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none"></div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-4 py-1.5 text-xs font-semibold text-blue-300 mb-6 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>Full-Stack Enterprise Engineering</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Custom Software <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-cyan-500">Built Around Your Business</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            “We don&apos;t force businesses to adapt to software. We build software that adapts to the business.” We engineer modern, scalable ERPs, web portals, mobile Android scanner apps, and cloud architectures tailored precisely to your operational workflow.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {solutionsList.map((sol, index) => {
            const Icon = sol.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={sol.id}
                id={sol.id}
                className="rounded-3xl border border-slate-800 bg-[#090e1c] p-6 sm:p-10 hover:border-cyan-500/30 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 shrink-0">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                          MODULE 0{index + 1}
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          {sol.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-slate-200">
                      {sol.tagline}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {sol.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {sol.highlights.map((hl) => (
                        <div
                          key={hl}
                          className="flex items-start gap-2 rounded-xl border border-slate-800/80 bg-[#060a14] p-3 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                          <span className="leading-snug">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0a1224] to-[#070b16] p-6 text-center space-y-4">
                    <div className="text-xs font-mono uppercase text-slate-400">
                      ENGINEERING SPECIFICATION
                    </div>
                    <div className="text-2xl font-black text-white font-mono">
                      100% Tailored
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Designed to seamlessly interface with your existing barcode hardware, fixed RFID readers, or third-party accounting APIs.
                    </p>
                    <Link
                      href="#contact"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-extrabold uppercase tracking-wider text-black shadow-lg hover:opacity-90 transition"
                    >
                      <span>Request Module Architecture</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Bar */}
      <section className="py-16 border-t border-b border-slate-900 bg-[#05070c]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-4">
            BATTLE-TESTED ENTERPRISE STACK
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300 font-mono">
            <span className="rounded-xl border border-slate-800 bg-[#090e1c] px-4 py-2">Node.js 22 LTS</span>
            <span className="rounded-xl border border-slate-800 bg-[#090e1c] px-4 py-2">Next.js 15 App Router</span>
            <span className="rounded-xl border border-slate-800 bg-[#090e1c] px-4 py-2">TypeScript 5.7</span>
            <span className="rounded-xl border border-slate-800 bg-[#090e1c] px-4 py-2">PostgreSQL 16 ACID</span>
            <span className="rounded-xl border border-slate-800 bg-[#090e1c] px-4 py-2">Prisma 5.22 ORM</span>
            <span className="rounded-xl border border-slate-800 bg-[#090e1c] px-4 py-2">Tailwind CSS</span>
            <span className="rounded-xl border border-slate-800 bg-[#090e1c] px-4 py-2">Native Android Java/Kotlin</span>
          </div>
        </div>
      </section>

      {/* Contact Consultation */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactForm
            companyInfo={{
              phone: company.phone,
              email: company.email,
              state: company.state,
            }}
            defaultRequirement="Custom Software"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
