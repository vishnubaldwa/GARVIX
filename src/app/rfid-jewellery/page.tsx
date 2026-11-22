import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { EnquireButton } from "@/components/public/EnquireButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqSection } from "@/components/seo/FaqSection";
import {
  buildBreadcrumbSchema,
  buildSoftwareSchema,
  SITE_URL,
  type FaqItem,
} from "@/lib/seo";
import { getCompanySettings } from "@/lib/settings";
import {
  ArrowLeft,
  Check,
  MapPin,
  Radio,
  ScanBarcode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Jewellery RFID Tags, Tray Readers & Stock Audit Software India",
  description:
    "Count 2,000+ gold & diamond ornaments in 5 minutes with 99.9% accuracy. GARVIX supplies WPC-compliant UHF RFID jewellery tail tags, smart counter trays, handheld audit scanners & custom GST jewellery POS across Jaipur, Surat, Mumbai, Delhi NCR & Pan-India.",
  keywords: [
    "Jewellery RFID Software India",
    "RFID Jewellery Tags India",
    "Jewellery Stock Audit RFID System",
    "RFID Jewellery Tray Reader",
    "Gold Showroom RFID Billing Software",
    "Jewellery RFID Jaipur Surat Mumbai Gurugram Delhi",
  ],
  alternates: { canonical: "/rfid-jewellery" },
  openGraph: {
    title: "GARVIX Jewellery RFID Tags & 5-Minute Stock Audit Software India",
    description:
      "WPC-compliant UHF RFID jewellery tags, smart counter trays, handheld audit guns & GST jewellery billing software with 99.9% accuracy across India.",
    url: `${SITE_URL}/rfid-jewellery`,
    images: [
      {
        url: `${SITE_URL}/images/products/jewellery-rfid-tag.jpg`,
        width: 1200,
        height: 900,
        alt: "GARVIX UHF RFID Jewellery Tags & Tray Audit System",
      },
    ],
  },
};

export const dynamic = "force-dynamic";

const FAQS: FaqItem[] = [
  {
    question: "How fast can GARVIX RFID count jewellery stock in a showroom?",
    answer:
      "A GARVIX Smart Counter Tray Reader or handheld UHF RFID scanner reads 200 to 500+ rings, chains, and bangles simultaneously in under 0.5 seconds. Showrooms with 2,000 to 5,000 ornaments complete a full daily opening and closing audit in 5 to 10 minutes instead of 1–2 days.",
  },
  {
    question: "Are GARVIX Jewellery RFID tags safe for polished gold and ultrasonic cleaning?",
    answer:
      "Yes. Our slim jewellery tail tags use an adhesive-free loop tail design so no glue ever touches polished gold, platinum, or diamond settings, and they remain readable even when tightly packed inside velvet display trays.",
  },
  {
    question: "Can GARVIX Jewellery RFID integrate with HUID, gross/net weight & 3% GST billing?",
    answer:
      "Yes. Our in-house Jewellery Retail POS & ERP tracks HUID hallmark codes, gross weight, stone weight, net weight, purity (22K/18K/14K), making charges, and automatic 3% GST calculation — or integrates via API with your existing showroom software.",
  },
  {
    question: "Does GARVIX provide RFID tag printers so we can tag new stock in-house?",
    answer:
      "Yes. We supply turnkey kits including branded UHF RFID jewellery tag rolls, desktop thermal RFID printer/encoders (printing human-readable weight, purity & barcode while encoding the EPC chip), smart trays, handheld audit guns, and on-site staff training.",
  },
  {
    question: "Which cities in India does GARVIX support for Jewellery RFID installation?",
    answer:
      "GARVIX deploys and supports Jewellery RFID systems Pan-India, including Gurugram, Delhi NCR, Jaipur, Surat, Mumbai, Ahmedabad, Hyderabad, Bengaluru, Chennai, and Kolkata, with remote + on-site AMC support.",
  },
];

const HUB_CITIES = [
  "Gurugram & Delhi NCR",
  "Jaipur",
  "Surat",
  "Mumbai",
  "Ahmedabad",
  "Hyderabad",
  "Bengaluru",
  "Chennai",
  "Kolkata",
  "Chandigarh",
];

export default async function RfidJewelleryPage() {
  const company = await getCompanySettings();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "GARVIX UHF RFID Jewellery Tags & Smart Tray Stock Audit System",
    image: `${SITE_URL}/images/products/jewellery-rfid-tag.jpg`,
    description:
      "WPC 865-867 MHz UHF RFID jewellery tags, smart velvet counter trays, handheld audit scanners, and custom GST jewellery stock audit software with 99.9% accuracy.",
    brand: {
      "@type": "Brand",
      name: "GARVIX",
    },
    category: "RFID Hardware & Jewellery Software",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      areaServed: { "@type": "Country", name: "India" },
    },
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] selection:bg-[#0071e3] selection:text-white antialiased">
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "RFID Solutions", path: "/rfid" },
            { name: "Jewellery RFID System", path: "/rfid-jewellery" },
          ]),
          productSchema,
          buildSoftwareSchema({
            name: "GARVIX Jewellery RFID Stock Audit & Billing Software",
            description:
              "Dedicated Indian jewellery showroom software for UHF RFID tray counting, handheld missing-piece locator, HUID tracking, gross/net weight & 3% GST POS billing.",
            path: "/rfid-jewellery",
            imagePath: "/images/products/jewellery-rfid-tag.jpg",
            featureList: [
              "5-Minute Full Showroom UHF RFID Stock Audit",
              "Smart Counter Tray Batch Billing & Tally",
              "Handheld Geiger-Mode Missing Ornament Locator",
              "HUID, Gross/Net/Stone Weight & 3% GST Billing",
              "On-Site Thermal RFID Tag Encoding",
            ],
          }),
        ]}
      />

      <Navbar />

      {/* 1. Hero Section */}
      <section className="pt-8 pb-16 sm:pt-12 sm:pb-20 bg-white border-b border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/rfid"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All RFID Solutions</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                <Sparkles className="h-3.5 w-3.5" />
                <span>WPC 865–867 MHz &bull; Built for Indian Jewellers</span>
              </p>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] leading-[1.08]">
                Jewellery RFID{" "}
                <span className="text-[#0071e3]">Tags &amp; Audit Software.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed">
                Count 2,000+ gold, diamond, and hallmark ornaments in under 5 minutes with <strong>99.9% accuracy</strong>. Adhesive-free UHF RFID jewellery tags paired with smart counter trays, handheld audit guns, and custom GST billing software built in-house by GARVIX.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="rounded-2xl bg-[#f5f5f7] p-3.5 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-[#1d1d1f]">99.9%</p>
                  <p className="text-[11px] text-[#6e6e73] mt-0.5">Audit Accuracy</p>
                </div>
                <div className="rounded-2xl bg-[#f5f5f7] p-3.5 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-[#0071e3]">0.2s</p>
                  <p className="text-[11px] text-[#6e6e73] mt-0.5">Full Tray Scan</p>
                </div>
                <div className="rounded-2xl bg-[#f5f5f7] p-3.5 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-[#1d1d1f]">5 Min</p>
                  <p className="text-[11px] text-[#6e6e73] mt-0.5">Daily Stock Tally</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <EnquireButton
                  solution="RFID Jewellery"
                  label="Book Live Jewellery RFID Demo"
                  variant="primary"
                />
                <Link
                  href="/blog/jewellery-rfid-stock-audit-guide-india"
                  className="text-xs font-semibold text-[#0071e3] hover:underline px-2 py-2"
                >
                  Read Complete Audit Guide →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-[2rem] border border-black/[0.06] bg-[#f5f5f7] p-3 shadow-[0_18px_54px_rgba(0,0,0,0.08)]">
                <img
                  src="/images/products/jewellery-rfid-tag.jpg"
                  alt="GARVIX Branded UHF RFID Jewellery Tail Tags for Gold & Diamond Showrooms"
                  className="w-full h-auto rounded-[1.5rem] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Complete Turnkey Kit */}
      <section className="py-16 sm:py-20 bg-[#fbfbfd] border-b border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
              Turnkey Hardware + Software
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
              Everything your showroom needs from day one.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Radio,
                title: "Adhesive-Free Tail Tags",
                desc: "Slim UHF RFID jewellery tags with zero glue on gold polish, printable HUID & weight labels.",
              },
              {
                icon: Zap,
                title: "Smart Velvet Counter Trays",
                desc: "Place a full ring or bangle tray on the counter to read 150+ pieces instantly during billing & closing.",
              },
              {
                icon: ScanBarcode,
                title: "Handheld Audit Gun",
                desc: "Walk along display showcases and safe vaults to reconcile thousands of SKUs + beep-locate missing items.",
              },
              {
                icon: Smartphone,
                title: "Jewellery POS & Owner App",
                desc: "Gross/net/stone weight, making charges, 3% GST bills, karigar ledger & instant variance alerts on mobile.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-black/[0.06] bg-white p-6 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.025)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pan-India Jewellery Hubs Strip */}
          <div className="mt-12 rounded-3xl border border-black/[0.06] bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                <span>On-Site Showroom Setup &amp; Pan-India AMC</span>
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">
                Deployed across India&rsquo;s leading jewellery hubs.
              </h3>
              <ul className="space-y-1.5 text-xs text-[#6e6e73]">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#0071e3]" />
                  <span>RFID tag sample kit &amp; live tray demo available before purchase</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#0071e3]" />
                  <span>Works standalone or integrates with existing showroom billing software</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2 max-w-md">
              {HUB_CITIES.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f7] border border-black/[0.05] px-3 py-1.5 text-[11px] font-semibold text-[#424245]"
                >
                  <MapPin className="h-3 w-3 text-[#0071e3]" />
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FAQs */}
      <FaqSection
        eyebrow="Jewellery RFID FAQs"
        heading="Common questions from jewellery showroom owners."
        faqs={FAQS}
        bgClass="bg-white"
      />

      {/* 4. Contact Form */}
      <section className="py-20 bg-[#fbfbfd] border-t border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ContactForm
            defaultRequirement="RFID Jewellery"
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
