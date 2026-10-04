import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { HeroFlowAnimation } from "@/components/public/HeroFlowAnimation";
import { TechnologyEcosystem } from "@/components/public/TechnologyEcosystem";
import { CoreSolutionsSection } from "@/components/public/CoreSolutionsSection";
import { SoftwareShowcase } from "@/components/public/SoftwareShowcase";
import { RfidWorkflowSection } from "@/components/public/RfidWorkflowSection";
import { RfidApplicationsMatrix } from "@/components/public/RfidApplicationsMatrix";
import { ProcessTimeline } from "@/components/public/ProcessTimeline";
import { WhyGarvix } from "@/components/public/WhyGarvix";
import { IndustriesGrid } from "@/components/public/IndustriesGrid";
import { RealTimeSimulator } from "@/components/public/RealTimeSimulator";
import { TechCapabilitiesSection } from "@/components/public/TechCapabilitiesSection";
import { CompleteSolutionSection } from "@/components/public/CompleteSolutionSection";
import { CallToActionBanner } from "@/components/public/CallToActionBanner";
import { RoiCalculator } from "@/components/public/RoiCalculator";
import { ContactForm } from "@/components/public/ContactForm";
import { getCompanySettings } from "@/lib/settings";
import {
  Radio,
  Cpu,
  ArrowRight,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default async function HomePage() {
  const company = await getCompanySettings();

  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-cyan-500/15 blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Column: Headline & Value Prop */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,242,254,0.2)]">
                <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span>Custom Software • Intelligent RFID • Complete Automation</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
                Custom Software.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                  Intelligent RFID.
                </span>{" "}
                Complete Automation.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                GARVIX Software Solutions builds customized software and complete RFID automation solutions that connect people, products, assets and business operations in real time.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/solutions"
                  className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-xs font-extrabold uppercase tracking-wider text-black shadow-[0_0_35px_rgba(0,242,254,0.4)] transition hover:opacity-95"
                >
                  <span>Explore Our Solutions</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="#contact"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-8 py-4 text-xs font-bold text-cyan-300 backdrop-blur-md transition hover:border-cyan-400 hover:bg-cyan-500/10"
                >
                  <PhoneCall className="h-4 w-4 text-cyan-400" />
                  <span>Talk to Our Experts</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Hardware + Software In-House</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>WPC Indian RFID Band (865-867 MHz)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Haryana GST (06) Compliant</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive Animated Telemetry */}
            <div className="lg:col-span-6">
              <HeroFlowAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* 3. GARVIX Technology Ecosystem */}
      <TechnologyEcosystem />

      {/* 4. Core Solutions Section */}
      <CoreSolutionsSection />

      {/* 5. Custom Software Development Dedicated Section */}
      <SoftwareShowcase />

      {/* 6. RFID Automation Section (Tag to Action) */}
      <RfidWorkflowSection />

      {/* 7. RFID Applications by Industry */}
      <RfidApplicationsMatrix />

      {/* 8. How GARVIX Works (Process Timeline) */}
      <ProcessTimeline />

      {/* 9. Why GARVIX (One Partner. Complete Technology Solution) */}
      <WhyGarvix />

      {/* 10. Interactive ROI Calculator */}
      <section id="roi-calculator" className="py-24 border-t border-cyan-500/20 bg-[#06080e] relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>Financial Justification Tool</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Interactive RFID <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ROI Calculator</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Calculate exactly how many labor hours and lakhs in stock shrinkage your business will save every year by upgrading from manual barcode auditing to GARVIX RFID.
            </p>
          </div>

          <RoiCalculator />
        </div>
      </section>

      {/* 11. Industries We Serve */}
      <IndustriesGrid />

      {/* 12. Real-Time Automation Event Simulator */}
      <RealTimeSimulator />

      {/* 13. Technology Capabilities Section */}
      <TechCapabilitiesSection />

      {/* 14. Complete Solution Section (From Hardware to Software) */}
      <CompleteSolutionSection />

      {/* 15. Call To Action Banner */}
      <CallToActionBanner phone={company.phone} />

      {/* 16. Contact Form & Lead Generation */}
      <section className="py-24 border-t border-cyan-500/20 bg-[#05070c] relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <ContactForm
            companyInfo={{
              phone: company.phone,
              email: company.email,
              state: company.state,
            }}
          />
        </div>
      </section>

      {/* 17. Corporate Footer */}
      <Footer />
    </div>
  );
}
