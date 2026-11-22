import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { EnquireButton } from "@/components/public/EnquireButton";
import { ShowcaseVideoPlayer } from "@/components/public/ShowcaseVideoPlayer";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqSection } from "@/components/seo/FaqSection";
import {
  buildBreadcrumbSchema,
  buildSoftwareSchema,
  buildVideoSchema,
  SITE_URL,
  type FaqItem,
} from "@/lib/seo";
import { getCompanySettings } from "@/lib/settings";
import {
  ArrowLeft,
  Barcode,
  Building2,
  CalendarClock,
  FileSpreadsheet,
  FolderLock,
  Receipt,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Complete Business ERP & Android Mobile App India | GST, AMC & Vault",
  description:
    "GARVIX Complete Business ERP with official Flutter Android App: GST Quotations & Invoices with Dynamic UPI QR, Delivery Challans, Serial/IMEI tracking, AMC contracts, Expenses, 1-Click CA GSTR-1/3B export, Document Vault & Statutory Compliance Calendar.",
  keywords: [
    "Business ERP Software India",
    "GST Billing ERP Mobile App India",
    "Custom ERP Software Gurugram Haryana",
    "AMC Management Software India",
    "Serial Number IMEI Inventory ERP",
    "1 Click CA GST Return Software",
  ],
  alternates: { canonical: "/erp-software" },
  openGraph: {
    title: "GARVIX Complete Business ERP & Android Mobile App",
    description:
      "Manage quotes, GST invoices with dynamic UPI QR, challans, serials/IMEI, AMC, expenses, CA GST returns & secure company vault from Web & Android.",
    url: `${SITE_URL}/erp-software`,
    images: [
      {
        url: `${SITE_URL}/images/products/garvix-erp-poster.jpg`,
        width: 1280,
        height: 720,
        alt: "GARVIX Complete Business ERP & Android Mobile App",
      },
    ],
  },
};

export const dynamic = "force-dynamic";

const FAQS: FaqItem[] = [
  {
    question: "What modules are included in GARVIX Complete Business ERP?",
    answer:
      "GARVIX Business ERP includes Parties & Clients CRM, Online Client-Approvable Quotations, GST Tax & Proforma Invoices with dynamic NPCI UPI QR, Outstanding Payment Recovery, Delivery Challans & E-Way details, Hardware Inventory with Serial/IMEI provenance, AMC & Service Desk, Business Expenses with receipts, Vendor Purchases ITC, 1-Click CA GSTR-1/3B Excel Export, Encrypted Company Document Vault, and an Indian Pvt. Ltd. Statutory Compliance Calendar.",
  },
  {
    question: "Does GARVIX ERP include a native Android mobile app?",
    answer:
      "Yes. Every deployment comes with our official Flutter Android Mobile App offering 100% live parity with the Web Admin panel — allowing Directors, Sales Executives, Accounts Officers, and Service Engineers to create quotes, share UPI invoices, upload expense receipts, download GSTR Excel files, and access the Document Vault on the go.",
  },
  {
    question: "How does the 1-Click CA GST Return Export work?",
    answer:
      "GARVIX automatically separates intra-state (CGST + SGST) and inter-state (IGST) invoices based on party GSTIN state codes and tracks eligible vendor purchase ITC. With one click, you export multi-sheet GSTR-1 (B2B, B2C, HSN Summary) and GSTR-3B Excel (.xlsx) files ready to WhatsApp or email directly to your Chartered Accountant.",
  },
  {
    question: "How is sensitive financial and company document data protected?",
    answer:
      "GARVIX uses granular 12-permission Role-Based Access Control (Super Admin, Director, Sales, Accounts, Service, and External Banker/CA Viewer). External Banker/CA share links are PIN-protected and auto-expiring, every mutation is written to an immutable Security Audit Log, and Permanent Delete is restricted strictly to Super Admin.",
  },
  {
    question: "Can GARVIX Business ERP be white-labeled and customized for our company?",
    answer:
      "Yes. We deploy GARVIX ERP on your own domain and branding with your company logo, digital authorized signatory stamp, custom invoice/quote PDF templates, and any industry-specific fields or integrations you require.",
  },
];

export default async function ErpSoftwarePage() {
  const company = await getCompanySettings();

  const modules = [
    {
      icon: Receipt,
      title: "Quotations & GST Invoices",
      desc: "Client-approvable quote portals, 1-click convert to Tax/Proforma Invoice & exact-amount Dynamic UPI QR.",
    },
    {
      icon: Truck,
      title: "Delivery Challans & E-Way",
      desc: "Returnable demo dispatches, non-returnable deployments, transporter LR & vehicle tracking.",
    },
    {
      icon: Barcode,
      title: "Serial & IMEI Provenance",
      desc: "Track every hardware device by serial number or IMEI from vendor purchase to client invoice & warranty.",
    },
    {
      icon: ShieldCheck,
      title: "AMC & Service Desk",
      desc: "Annual Maintenance Contracts with expiry countdown alerts and customer RMA support tickets.",
    },
    {
      icon: FileSpreadsheet,
      title: "1-Click CA GST Return",
      desc: "Auto CGST/SGST vs IGST billing, vendor purchase ITC & instant GSTR-1 / GSTR-3B Excel downloads.",
    },
    {
      icon: Wallet,
      title: "Expenses & Reimbursements",
      desc: "Log travel, R&D, cloud & office bills with photo/PDF receipts and staff reimbursement tracking.",
    },
    {
      icon: FolderLock,
      title: "Company Document Vault",
      desc: "Encrypted storage for COI, MOA/AOA, PAN & Director KYC with PIN-protected expiring Banker/CA links.",
    },
    {
      icon: CalendarClock,
      title: "Important Dates Calendar",
      desc: "Auto-calculated Indian Pvt. Ltd. deadlines for INC-20A, MCA/ROC, Monthly/QRMP GST, TDS & ITR-6.",
    },
  ];

  const industries = [
    {
      name: "CCTV, RFID & IT Dealers",
      desc: "Quotations, Serial/IMEI warranty tracking, Delivery Challans, AMC contracts & support tickets.",
    },
    {
      name: "Solar, HVAC & Lift EPC",
      desc: "Site proposals, Proforma invoices, project expenses, staff reimbursements & yearly AMC alerts.",
    },
    {
      name: "Wholesale & B2B Distributors",
      desc: "GSTIN party ledgers, auto CGST/SGST vs IGST billing, outstanding recovery & 1-Click CA return.",
    },
    {
      name: "Machinery & Medical Suppliers",
      desc: "Returnable demo challans, serialized unit provenance, vendor ITC & digital signatory invoices.",
    },
    {
      name: "SME Factories & Manufacturers",
      desc: "Vendor purchase ITC, inventory tracking, E-Way/LR dispatch challans & full staff audit logs.",
    },
    {
      name: "B2B Service Agencies",
      desc: "Online client-approvable quotes, milestone invoices with UPI QR & password-protected Document Vault.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] selection:bg-[#0071e3] selection:text-white antialiased">
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Business ERP & Mobile App", path: "/erp-software" },
          ]),
          buildSoftwareSchema({
            name: "GARVIX Complete Business ERP & Android Mobile App",
            description:
              "All-in-one Indian Business Management ERP with Web Admin and Flutter Android Mobile App for GST invoicing, UPI QR, delivery challans, Serial/IMEI tracking, AMC contracts, 1-click CA GSTR exports, Company Vault, and statutory compliance tracking.",
            path: "/erp-software",
            imagePath: "/images/products/garvix-erp-poster.jpg",
            featureList: [
              "GST Quotations, Proforma & Tax Invoices with Dynamic UPI QR",
              "Delivery Challans & Serial/IMEI Hardware Tracking",
              "AMC Support Contracts & RMA Service Desk",
              "Business Expenses, Vendor ITC & 1-Click CA GSTR-1/3B Export",
              "PIN-Protected Company Document Vault for Bankers & CAs",
              "100% Web & Flutter Android App Parity",
            ],
          }),
          buildVideoSchema({
            name: "GARVIX Business ERP & Flutter Android App — 15s Showcase Video",
            description:
              "Showcase of GARVIX Complete Business ERP and Flutter Android Mobile App built for Indian B2B companies.",
            videoPath: "/videos/garvix-erp-showcase.mp4",
            thumbnailPath: "/images/products/garvix-erp-poster.jpg",
            pagePath: "/erp-software",
          }),
        ]}
      />

      <Navbar />

      {/* 1. Flagship Video Hero */}
      <section className="pt-8 pb-14 sm:pt-12 sm:pb-20 bg-[#fbfbfd] border-b border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
              Management Software &bull; Web ERP + Android App
            </p>
            <h1 className="mt-2.5 text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] leading-[1.08]">
              Complete Business ERP &amp;{" "}
              <span className="text-[#0071e3]">Mobile App.</span>
            </h1>
            <p className="mt-3.5 text-sm sm:text-lg text-[#6e6e73] max-w-2xl mx-auto leading-relaxed">
              Manage your entire Indian B2B company from Web &amp; Android &mdash; GST Quotations &amp; Tax Invoices with dynamic UPI QR, Delivery Challans, Serial/IMEI tracking, AMC &amp; Service Tickets, Business Expenses, 1-Click CA GST Return, Company Vault &amp; Compliance Calendar.
            </p>
          </div>

          <div className="rounded-[1.75rem] sm:rounded-[2rem] border border-black/[0.06] bg-white overflow-hidden shadow-[0_18px_54px_rgba(0,0,0,0.08)]">
            <ShowcaseVideoPlayer
              src="/videos/garvix-erp-showcase.mp4"
              poster="/images/products/garvix-erp-poster.jpg"
              label="GARVIX Business ERP & Flutter Android Mobile App Showcase"
            />
            <div className="bg-white border-t border-black/[0.05] px-5 py-4 sm:px-8 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#424245]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0071e3]">
                  Built by GARVIX
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-[#0071e3]" />
                  <span>100% Web + Android Parity</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-[#0071e3]" />
                  <span>1-Click CA GST Return</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FolderLock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Secure Company Vault</span>
                </span>
              </div>
              <div className="shrink-0">
                <EnquireButton
                  solution="Business ERP & Mobile App"
                  label="Request ERP Demo"
                  variant="primary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 8 Core ERP Modules */}
      <section className="py-16 sm:py-20 bg-white border-b border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
              End-to-End Business Control
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
              8 Integrated Modules. Zero Per-Seat Bloat.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.title}
                  className="rounded-3xl border border-black/[0.06] bg-[#fbfbfd] p-6 space-y-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight">
                    {mod.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Ideal Industries */}
      <section className="py-16 sm:py-20 bg-[#fbfbfd] border-b border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
              Ideal For B2B &amp; Service Companies
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
              One ERP. Built for Your Industry.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {industries.map((ind) => (
              <div
                key={ind.name}
                className="rounded-3xl border border-black/[0.06] bg-white p-6 flex items-start gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.025)]"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[#0071e3] text-white shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight">
                    {ind.name}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                    {ind.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQs */}
      <FaqSection
        eyebrow="Business ERP FAQs"
        heading="Everything directors ask before deploying GARVIX ERP."
        faqs={FAQS}
        bgClass="bg-white"
      />

      {/* 5. Contact Form */}
      <section className="py-20 bg-[#fbfbfd] border-t border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ContactForm
            defaultRequirement="Business ERP & Mobile App"
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
