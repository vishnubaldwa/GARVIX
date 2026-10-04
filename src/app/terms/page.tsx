import { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { getCompanySettings } from "@/lib/settings";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  description:
    "Terms & Conditions governing custom software engineering, RFID hardware warranties, and support agreements with GARVIX Software Solutions Private Limited.",
};

export default async function TermsPage() {
  const company = await getCompanySettings();

  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <section className="pt-20 pb-20 border-b border-slate-900 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Commercial Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-400">
            Governing Software Licensing, Hardware Procurement & Support • GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="rounded-2xl border border-slate-800 bg-[#090e1c] p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">1. Contractual Framework</h2>
            <p>
              All hardware purchase orders, custom software development contracts, and annual maintenance agreements issued by GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED are governed by these Terms & Conditions, supplemented by formal scope-of-work documents and approved digital quotations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#090e1c] p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">2. Hardware Warranty & Replacement Policy</h2>
            <p>
              All fixed UHF readers, gate portals, and handheld scanner guns delivered by GARVIX include a comprehensive 1-Year Comprehensive Replacement Warranty against manufacturer defects. Physical drops, electrical surges without certified surge protection, or water immersion on non-IP67 rated components are excluded.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#090e1c] p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">3. Custom Software Delivery & Intellectual Property</h2>
            <p>
              Custom software solutions built specifically for client operational workflows are delivered with client-specific database ownership and perpetual deployment licenses upon full commercial settlement.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#090e1c] p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">4. Jurisdiction & Governing Law</h2>
            <p>
              All transactions and disputes are strictly subject to the legal jurisdiction of the courts of {company.state}, India.
            </p>
            <p className="font-mono text-cyan-300">
              Corporate Office: {company.address}<br />
              GSTIN: {company.gstin} • State: {company.state} (Code: {company.stateCode})
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
