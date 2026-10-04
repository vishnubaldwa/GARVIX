import { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { getCompanySettings } from "@/lib/settings";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  description:
    "Privacy Policy for GARVIX Software Solutions Private Limited — outlining how we handle client data, intellectual property, and enterprise telemetry.",
};

export default async function PrivacyPage() {
  const company = await getCompanySettings();

  return (
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <section className="pt-20 pb-20 border-b border-slate-900 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Corporate Governance & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Privacy Policy
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-400">
            Last Updated: January 2026 • GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="rounded-2xl border border-slate-800 bg-[#090e1c] p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">1. Scope and Commitment</h2>
            <p>
              GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED (&quot;GARVIX&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to safeguarding the confidentiality, security, and integrity of corporate client data, proprietary inventory ledgers, and visitor information across our web portals and on-premise hardware installations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#090e1c] p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">2. Enterprise Data Ownership</h2>
            <p>
              When a client deploys custom software or RFID solutions developed by GARVIX:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>All inventory serial numbers, EPC tags, customer records, and transaction ledgers remain the exclusive property of the client.</li>
              <li>GARVIX does not sell, license, or monetize client operational telemetry or merchandise pricing data to any third parties.</li>
              <li>Database records stored in self-hosted or dedicated cloud VPS instances are encrypted using industry-standard AES-256 and SSL/TLS cryptographic protocols.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#090e1c] p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">3. Information Collected via Website</h2>
            <p>
              When submitting an enquiry through garvix.in (e.g. via our contact form), we collect your Name, Company Name, Email Address, Phone Number, and Project Requirements. This information is utilized solely to contact you regarding the requested technology consultation and to formulate system architecture proposals.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#090e1c] p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">4. Contacting the Compliance Officer</h2>
            <p>
              For questions regarding our privacy practices or data governance, contact our compliance desk at:
            </p>
            <p className="font-mono text-cyan-300">
              Email: {company.email}<br />
              Registered Office: {company.address}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
