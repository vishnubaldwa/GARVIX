import { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { getCompanySettings } from "@/lib/settings";
import Link from "next/link";
import {
  Briefcase,
  ShoppingBag,
  GraduationCap,
  Boxes,
  Factory,
  Building2,
  Truck,
  HeartPulse,
  Hotel,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Industries We Serve | GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  description:
    "Tailored RFID automation and custom software solutions engineered for Retail & Jewellery, Education, Warehouses, Manufacturing, Corporate Offices, and Healthcare across India.",
};

export default async function IndustriesPage() {
  const company = await getCompanySettings();

  const industryProfiles = [
    {
      id: "retail",
      title: "Retail & Luxury Jewellery",
      icon: ShoppingBag,
      tagline: "Instant stock audits, shrinkage elimination, and smart checkout counters.",
      challenges: "High employee labor spent manually scanning barcodes item-by-item every morning, undetected shrinkage from showcase trays, and long billing counter queues.",
      solution: "Tamper-evident printable UHF jewellery tail tags, desktop tray scanning pads reading 250 items in 3 seconds, overhead EAS exit security antennas, and instant thermal GST billing.",
      deployedHardware: "Garvix GX-400 Impinj Reader, Tamper-Evident Jewellery Tail Tags, Overhead Exit Antennas",
      deployedSoftware: "Jewellery Stock Audit System, Retail Smart POS, Missing Item Alarm Engine",
      measurableImpact: "98% Reduction in Audit Time",
    },
    {
      id: "education",
      title: "Education, Schools & Campuses",
      icon: GraduationCap,
      tagline: "Hands-free gate attendance, automated parent alerts, and campus fee ERP.",
      challenges: "Biometric fingerprint scanner bottlenecks forming lines of hundreds of students, proxy attendance, unnotified absences, and chaotic manual bus boarding verifications.",
      solution: "Overhead wide-aisle RFID gate portals capturing 1,200+ students per minute as they walk through without stopping, automated WhatsApp absence alerts to parents, and bus GPS tracking.",
      deployedHardware: "Wide-Aisle Overhead Gate Portals, Smart RFID PVC Cards, Bus RFID Readers",
      deployedSoftware: "Campus Attendance Engine, School Fee ERP, Parent WhatsApp Cloud Dispatcher",
      measurableImpact: "Zero Gate Queues • 100% Parent Transparency",
    },
    {
      id: "warehousing",
      title: "Warehousing & 3PL Logistics",
      icon: Boxes,
      tagline: "Dock door pallet verification, bin localization, and automated WMS.",
      challenges: "Carton mispicks during truck loading leading to expensive customer disputes, lost pallets in multi-story high bay racks, and manual cycle counts taking days.",
      solution: "Fixed 4-port readers installed at loading dock doors verifying carton contents against E-Way Bills automatically as forklifts pass, handheld Android guns with audio Geiger search.",
      deployedHardware: "4-Port Fixed Dock Door Readers, IP67 Circular Antennas, Rugged Handheld Guns",
      deployedSoftware: "Garvix WMS Engine, Pallet Manifest Verifier, E-Way Bill Auto-Matcher",
      measurableImpact: "100% Dispatch Accuracy • Zero Mispicks",
    },
    {
      id: "manufacturing",
      title: "Manufacturing & Automotive Assembly",
      icon: Factory,
      tagline: "Work-in-progress (WIP) tracking, conveyor gates, and tool monitoring.",
      challenges: "Paper job travelers getting lost or damaged on grease/oil floors, unverified assembly stages, and misplaced high-value calibration dies.",
      solution: "Heat-resistant ceramic tags attached to components, conveyor tunnel RFID readers logging each workstation completion, and PLC relay stops on incomplete assemblies.",
      deployedHardware: "High-Temperature Ceramic Tags, Conveyor Tunnel Readers, Industrial Relays",
      deployedSoftware: "Production WIP Tracking Ledger, Quality Inspection Gateway, Tool Asset Tracker",
      measurableImpact: "Sub-Second Station-to-Station Traceability",
    },
    {
      id: "corporate",
      title: "Corporate Campuses & IT Tech Parks",
      icon: Building2,
      tagline: "Turnstile access control, visitor automation, and IT laptop provenance.",
      challenges: "Unrecorded laptop movements between floors, slow visitor badge registration desks, and morning vehicle parking gate tailbacks.",
      solution: "Touchless smart badge turnstile integration, self-service visitor kiosks, on-metal server/laptop tracking tags, and long-range 8-12 meter FASTag parking boom barriers.",
      deployedHardware: "Turnstile Wiegand Controllers, On-Metal Server Tags, Long-Range FASTag Readers",
      deployedSoftware: "Corporate Access Suite, Visitor Management Portal, IT Asset Lifecycle Ledger",
      measurableImpact: "Seamless Access & 100% Asset Provenance",
    },
    {
      id: "healthcare",
      title: "Healthcare, Hospitals & Pathology Labs",
      icon: HeartPulse,
      tagline: "Medical device lifecycle, surgical tray audits, and specimen tracking.",
      challenges: "Misplaced mobile diagnostic machines (infusion pumps, ultrasound carts), lost surgical instruments, and chain-of-custody gaps for laboratory samples.",
      solution: "Autoclavable RFID tags attached to surgical trays, room-level portal tracking for mobile equipment, and digital specimen timestamp verification.",
      deployedHardware: "Autoclavable Medical Inlays, Smart Surgical Cabinets, Room Entry Antennas",
      deployedSoftware: "Medical Equipment Asset Tracker, Specimen Chain-of-Custody Portal",
      measurableImpact: "100% Critical Equipment Availability",
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
            <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
            <span>Vertical Industry Architectures</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Industries We <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Empower</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Every sector faces distinct operational physics, read distances, and software workflows. Here is how GARVIX designs specialized systems tailored to your specific industry environment.
          </p>
        </div>
      </section>

      {/* Industry Breakdown */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {industryProfiles.map((ind, index) => {
            const Icon = ind.icon;

            return (
              <div
                key={ind.id}
                id={ind.id}
                className="rounded-3xl border border-slate-800 bg-[#090e1c] p-6 sm:p-10 hover:border-cyan-500/30 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 shrink-0">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                          SECTOR 0{index + 1}
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          {ind.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-slate-200">
                      {ind.tagline}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-4">
                        <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block mb-1">
                          Industry Bottlenecks:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ind.challenges}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-4">
                        <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-1">
                          GARVIX Engineered Solution:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ind.solution}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 text-xs space-y-1.5 font-mono">
                      <div>
                        <span className="text-slate-500">Hardware Deployed:</span>{" "}
                        <span className="text-slate-300">{ind.deployedHardware}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Software Suite:</span>{" "}
                        <span className="text-slate-300">{ind.deployedSoftware}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0a1224] to-[#070b16] p-6 text-center space-y-4">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      MEASURABLE OUTCOME
                    </span>
                    <div className="text-2xl font-black text-cyan-300 font-mono">
                      {ind.measurableImpact}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Custom tailored deployment schedule: 14 business days from hardware delivery to live operations.
                    </p>
                    <Link
                      href="#contact"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-extrabold uppercase tracking-wider text-black shadow-lg hover:opacity-90 transition"
                    >
                      <span>Consult on This Sector</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
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
