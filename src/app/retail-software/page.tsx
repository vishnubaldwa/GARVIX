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
  Check,
  Receipt,
  ScanBarcode,
  QrCode,
  Smartphone,
  ArrowLeft,
  Store,
  ShieldCheck,
  Zap,
  Cloud,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Retail POS & Store ERP Software India | GST Billing, Barcode & RFID",
  description:
    "Custom retail GST POS billing, barcode & UHF RFID inventory sync, dynamic NPCI UPI QR payments, 80mm thermal & WhatsApp receipts, and multi-store cloud ERP built in India by GARVIX.",
  keywords: [
    "Retail POS Software India",
    "Store ERP Software India",
    "GST Retail Billing Software Gurugram Haryana",
    "Barcode and RFID POS Software",
    "Multi Store Retail Billing App India",
  ],
  alternates: { canonical: "/retail-software" },
  openGraph: {
    title: "GARVIX Retail POS & Store ERP Software India",
    description:
      "Fast GST billing, barcode & UHF RFID stock sync, dynamic UPI QR payments, thermal & WhatsApp e-bills, and multi-store cloud ERP.",
    url: `${SITE_URL}/retail-software`,
    images: [
      {
        url: `${SITE_URL}/images/products/garvix-retail-pos-poster.jpg`,
        width: 1280,
        height: 720,
        alt: "GARVIX Retail POS & Store ERP Software",
      },
    ],
  },
};

const RETAIL_FAQS: FaqItem[] = [
  {
    question: "Does GARVIX Retail POS support both barcode scanners and UHF RFID readers?",
    answer:
      "Yes. You can start with standard 1D/2D barcode scanners and 80mm thermal printers today, and seamlessly connect GARVIX UHF RFID counter trays or handheld audit scanners for batch jewellery or apparel inventory anytime.",
  },
  {
    question: "How does Dynamic UPI QR billing work at the retail counter?",
    answer:
      "At checkout, GARVIX generates an exact-amount NPCI UPI QR code tied to the invoice total on the billing screen or customer display. Customers scan with GPay, PhonePe, or Paytm without typing amounts manually, eliminating short-payments and billing errors.",
  },
  {
    question: "Is GARVIX Retail POS fully GST-compliant for Indian stores?",
    answer:
      "Yes. It automatically calculates intra-state CGST + SGST and inter-state IGST with HSN/SAC codes, prints 80mm thermal and A4 tax invoices, sends instant WhatsApp e-bills, and exports 1-click GSTR-1 and GSTR-3B Excel workbooks for your CA.",
  },
  {
    question: "Can I track multiple retail branches from my phone?",
    answer:
      "Yes. GARVIX includes real-time multi-store cloud synchronization and a mobile owner app so you can view live showroom sales, branch-to-branch stock transfers, low-stock alerts, and staff discount logs from anywhere.",
  },
  {
    question: "Can the software be customized for jewellery, apparel, or electronics stores?",
    answer:
      "Yes. GARVIX engineers software in-house, so we customize gross/net weight & making charges for jewellery, size/color matrix for fashion & footwear, batch/expiry for supermarkets, and IMEI/serial warranty ledgers for electronics stores.",
  },
];

export const dynamic = "force-dynamic";

export default async function RetailSoftwarePage() {
  const company = await getCompanySettings();

  const capabilities = [
    {
      icon: Receipt,
      title: "Fast GST & POS Billing",
      desc: "Automated CGST+SGST & IGST calculation, HSN codes, 80mm thermal receipts, and instant WhatsApp e-bills.",
    },
    {
      icon: ScanBarcode,
      title: "Barcode & UHF RFID Sync",
      desc: "Scan barcodes or batch-read 200+ RFID-tagged jewellery trays and garment racks in seconds with 99.9% accuracy.",
    },
    {
      icon: QrCode,
      title: "Instant UPI QR Payments",
      desc: "Dynamic exact-amount NPCI UPI QR displayed at the billing counter with instant payment verification.",
    },
    {
      icon: Smartphone,
      title: "Multi-Store Owner App",
      desc: "Monitor live daily showroom sales, branch transfers, low-stock alerts, and mobile RFID audits from anywhere.",
    },
  ];

  const industries = [
    {
      name: "Jewellery Showrooms",
      desc: "UHF RFID tray batch billing, gross/net weight, making charges & hallmarking.",
    },
    {
      name: "Apparel & Fashion Stores",
      desc: "Size/color matrix, branded RFID hang tags, quick exchanges & seasonal offers.",
    },
    {
      name: "Footwear & Lifestyle Outlets",
      desc: "Fast barcode billing, multi-branch stock lookup & instant customer loyalty points.",
    },
    {
      name: "Supermarkets & Retail Marts",
      desc: "Queue-free multi-counter POS, weighing-scale integration, batch & expiry tracking.",
    },
    {
      name: "Electronics & Mobile Stores",
      desc: "IMEI & serial-number warranty tracking, GST B2B/B2C invoicing & exchange ledgers.",
    },
    {
      name: "Multi-Branch Retail Chains",
      desc: "Centralized catalog pricing, inter-branch stock transfers & real-time cloud analytics.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] selection:bg-[#0071e3] selection:text-white antialiased">
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Retail POS & Store ERP", path: "/retail-software" },
          ]),
          buildSoftwareSchema({
            name: "GARVIX Retail POS & Store ERP",
            description:
              "Fast Indian Retail GST POS billing, barcode & UHF RFID inventory sync, dynamic NPCI UPI QR payments, 80mm thermal & WhatsApp bills, and multi-store cloud ERP.",
            path: "/retail-software",
            imagePath: "/images/products/garvix-retail-pos-poster.jpg",
            featureList: [
              "Fast GST POS Billing (CGST/SGST & IGST)",
              "Barcode & UHF RFID Batch Inventory Sync",
              "Dynamic Exact-Amount NPCI UPI QR Payments",
              "80mm Thermal Receipts & WhatsApp E-Bills",
              "Multi-Store Cloud Sync & Owner Mobile App",
            ],
          }),
          buildVideoSchema({
            name: "GARVIX Retail POS & Store ERP — 15s Showcase Video",
            description:
              "Product walkthrough of GARVIX Retail POS & Store ERP with GST billing, barcode & RFID sync, dynamic UPI QR, and multi-store cloud reports.",
            videoPath: "/videos/garvix-retail-pos-showcase.mp4",
            thumbnailPath: "/images/products/garvix-retail-pos-poster.jpg",
            pagePath: "/retail-software",
          }),
        ]}
      />
      <Navbar />

      {/* 1. Flagship Video Hero */}
      <section className="pt-8 pb-14 sm:pt-12 sm:pb-20 bg-white border-b border-black/[0.06]">
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
              Flagship Retail Suite &bull; Built by GARVIX
            </p>
            <h1 className="mt-2.5 text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] leading-[1.08]">
              Retail POS &amp;{" "}
              <span className="text-[#0071e3]">Store ERP.</span>
            </h1>
            <p className="mt-3.5 text-sm sm:text-lg text-[#6e6e73] max-w-2xl mx-auto leading-relaxed">
              Lightning-fast GST billing, barcode &amp; UHF RFID inventory sync, instant UPI QR payments, and live multi-store cloud control &mdash; engineered in-house by GARVIX.
            </p>
          </div>

          {/* 15s Full HD Autoplay Showcase Video Card */}
          <div className="rounded-[1.75rem] sm:rounded-[2rem] border border-black/[0.06] bg-[#f5f5f7] overflow-hidden shadow-[0_18px_54px_rgba(0,0,0,0.08)]">
            <ShowcaseVideoPlayer
              src="/videos/garvix-retail-pos-showcase.mp4"
              poster="/images/products/garvix-retail-pos-poster.jpg"
              label="GARVIX Retail POS & Store ERP — 15 Second Product Showcase Video"
            />
            <div className="bg-white border-t border-black/[0.05] px-5 py-4 sm:px-8 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#424245]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0071e3]">
                  Built by GARVIX
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#0071e3]" />
                  <span>Offline-Capable POS</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Cloud className="h-3.5 w-3.5 text-[#0071e3]" />
                  <span>Real-Time Multi-Store Cloud Sync</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>100% Customizable to Your Showroom</span>
                </span>
              </div>
              <div className="shrink-0">
                <EnquireButton
                  solution="Retail POS & Store ERP"
                  label="Book Live Demo"
                  variant="primary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Retail POS Capabilities */}
      <section className="py-16 sm:py-20 bg-[#fbfbfd] border-b border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
              Counter to Cloud
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
              Everything your retail counter needs.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Ideal Retail Industries */}
      <section className="py-16 sm:py-20 bg-white border-b border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
              Ideal For Modern Retail
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
              One Retail ERP. Every Counter.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6e6e73]">
              Works with your existing thermal printers, barcode scanners, UHF RFID trays, and handheld audit guns.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {industries.map((ind) => (
              <div
                key={ind.name}
                className="rounded-3xl border border-black/[0.06] bg-[#fbfbfd] p-6 flex items-start gap-3.5"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[#0071e3] text-white shrink-0">
                  <Store className="h-4 w-4" />
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

          {/* Static High-Res Overview Strip */}
          <div className="mt-12 rounded-3xl border border-black/[0.06] bg-[#f5f5f7] p-5 sm:p-8 flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
              <img
                src="/images/products/garvix-retail-software.jpg?v=2"
                alt="GARVIX Retail POS & Store ERP Overview"
                className="w-full h-auto block"
              />
            </div>
            <div className="lg:w-1/2 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
                Turnkey Hardware + Software
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
                Deployed with your branding &amp; workflow.
              </h3>
              <ul className="space-y-2.5 text-sm text-[#424245]">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#0071e3] shrink-0" />
                  <span>Custom invoice &amp; thermal receipt templates with your logo</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#0071e3] shrink-0" />
                  <span>Direct integration with GARVIX UHF RFID hang tags, jewellery tags &amp; scanners</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#0071e3] shrink-0" />
                  <span>Staff roles, discount limits, audit logs &amp; 1-click CA GST Excel reports</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#0071e3] shrink-0" />
                  <span>On-site installation, staff training &amp; Pan-India AMC support</span>
                </li>
              </ul>
              <div className="pt-2">
                <EnquireButton
                  solution="Retail POS & Store ERP"
                  label="Schedule a Live Demo"
                  variant="primary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5. Retail POS FAQs */}
      <FaqSection
        eyebrow="Retail POS FAQs"
        heading="Common questions from retail store owners."
        faqs={RETAIL_FAQS}
        bgClass="bg-[#fbfbfd]"
      />

      {/* 4. Book Demo Contact Form (Pre-selected to Retail POS & Store ERP) */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ContactForm
            defaultRequirement="Retail POS & Store ERP"
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
