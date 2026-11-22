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
  ChefHat,
  PackageCheck,
  QrCode,
  Receipt,
  ShieldCheck,
  Smartphone,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Restaurant & Café POS Software India | QR Table Ordering & Live KDS",
  description:
    "GARVIX Restaurant & Café Software delivers QR table self-ordering with Razorpay/UPI, dark-mode Kitchen Display System (KDS), multi-round table billing, recipe auto-inventory, vendor dues, staff shifts & Flutter mobile app across India.",
  keywords: [
    "Restaurant POS Software India",
    "Cafe POS Software India",
    "QR Table Self Ordering Software",
    "Kitchen Display System KDS India",
    "Restaurant Billing Software Gurugram Haryana",
    "Cloud Kitchen Inventory Software India",
  ],
  alternates: { canonical: "/restaurant-software" },
  openGraph: {
    title: "GARVIX Restaurant & Café Software | QR Ordering, Live KDS & POS",
    description:
      "QR table self-ordering with UPI/Razorpay, live dark-mode KDS, recipe-linked auto inventory, multi-round billing & owner mobile app built by GARVIX.",
    url: `${SITE_URL}/restaurant-software`,
    images: [
      {
        url: `${SITE_URL}/images/products/garvix-restaurant-poster.jpg`,
        width: 1280,
        height: 720,
        alt: "GARVIX Restaurant & Café POS Software Showcase",
      },
    ],
  },
};

export const dynamic = "force-dynamic";

const FAQS: FaqItem[] = [
  {
    question: "How does QR table self-ordering work in GARVIX Restaurant Software?",
    answer:
      "Each dining table gets a unique QR code. Guests scan with their phone camera (no app install needed), browse your visual menu with add-ons, and either pay upfront via Razorpay/UPI or submit their order to your 1-tap staff approval queue before it fires directly to the Kitchen Display.",
  },
  {
    question: "Does GARVIX include a Kitchen Display System (KDS) without paper KOT printers?",
    answer:
      "Yes. GARVIX includes a dedicated dark-mode Kitchen Display System (KDS) that runs on any Android tablet or monitor. Chefs see live prep timers and update items from New → Preparing → Ready with one tap, eliminating lost paper KOT slips. Traditional 80mm thermal KOT printers are also supported.",
  },
  {
    question: "How does recipe-linked auto inventory track milk, coffee beans, and raw materials?",
    answer:
      "You define the exact ingredient recipe (in grams, ml, or units) for each menu dish once. Every time a cappuccino, burger, or pasta is billed, GARVIX automatically deducts those raw ingredients from stock and sends low-stock alerts before you run out during rush hours.",
  },
  {
    question: "Can waiters, cashiers, chefs, and owners each have separate role access?",
    answer:
      "Yes. GARVIX Restaurant OS supports 5-role PIN login (Owner/Admin, Manager, Cashier, Waiter, and Kitchen Chef) along with shift attendance, daily kitchen expense logging, vendor payment ledgers, and an official Flutter mobile app for live monitoring.",
  },
  {
    question: "Is GARVIX Restaurant Software suitable for cafés, QSRs, cloud kitchens, and fine-dine chains?",
    answer:
      "Yes. Whether you run a specialty coffee bar, fine-dine restaurant with multi-round open table bills, fast-food QSR, bakery, or multi-outlet cloud kitchen across Delhi NCR, Haryana, or Pan-India, GARVIX customizes your menu, GST billing, and branding to match your outlet.",
  },
];

export default async function RestaurantSoftwarePage() {
  const company = await getCompanySettings();

  const capabilities = [
    {
      icon: QrCode,
      title: "QR Table Self-Ordering",
      desc: "Unique table QR menus with prepaid Razorpay/UPI checkout and 1-tap staff approval queue.",
    },
    {
      icon: ChefHat,
      title: "Live Kitchen Display (KDS)",
      desc: "Dark-mode chef screen with live prep timers, New → Preparing → Ready workflow & zero lost paper KOTs.",
    },
    {
      icon: PackageCheck,
      title: "Recipe Auto-Inventory",
      desc: "Link raw ingredients to every dish so milk, beans, cheese & bread auto-deduct with low-stock alerts.",
    },
    {
      icon: Receipt,
      title: "Multi-Round Table Billing",
      desc: "Open table tabs across multiple courses, split Cash/UPI/Card settlement, and instant GST receipts.",
    },
    {
      icon: Wallet,
      title: "Vendors, Expenses & P&L",
      desc: "Track supplier bills, pending vendor dues, daily petty kitchen expenses & real-time net profit.",
    },
    {
      icon: Smartphone,
      title: "5-Role PIN & Mobile App",
      desc: "Owner, Manager, Cashier, Waiter & Chef PIN logins, shift attendance & Flutter owner mobile app.",
    },
  ];

  const formats = [
    {
      name: "Cafés & Coffee Bars",
      desc: "Table QR self-menus, rapid chai/coffee KOTs, milk & bean recipe tracking.",
    },
    {
      name: "Fine-Dine Restaurants",
      desc: "Multi-round open table bills, tableside waiter ordering & live kitchen display.",
    },
    {
      name: "QSR & Fast-Food Outlets",
      desc: "High-speed counter POS billing, kitchen tokens & instant Cash/UPI/Card settle.",
    },
    {
      name: "Cloud Kitchens",
      desc: "Dark-mode chef KDS queue, raw ingredient auto-deduct & supplier vendor ledgers.",
    },
    {
      name: "Bakeries & Dessert Lounges",
      desc: "Daily kitchen expense logging, low-stock ingredient alerts & shift attendance.",
    },
    {
      name: "Multi-Outlet Food Chains",
      desc: "Central menu control, role-based PIN access, live P&L analytics & mobile app.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#1f1915] selection:bg-[#15803d] selection:text-white antialiased">
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Restaurant & Café Software", path: "/restaurant-software" },
          ]),
          buildSoftwareSchema({
            name: "GARVIX Restaurant & Café Software (POS + QR + KDS)",
            description:
              "All-in-one Indian Restaurant & Café OS featuring QR table self-ordering with UPI/Razorpay, dark-mode Kitchen Display System (KDS), multi-round GST billing, recipe auto-inventory, vendor dues & Flutter mobile app.",
            path: "/restaurant-software",
            imagePath: "/images/products/garvix-restaurant-poster.jpg",
            featureList: [
              "QR Table Self-Ordering with Razorpay & UPI",
              "Dark-Mode Kitchen Display System (KDS)",
              "Recipe-Linked Raw Ingredient Auto Inventory",
              "Multi-Round Open Table GST Billing",
              "5-Role PIN Login & Shift Attendance",
              "Vendor Dues, Daily Expenses & Owner Mobile App",
            ],
          }),
          buildVideoSchema({
            name: "GARVIX Restaurant & Café Software — 15s Showcase Video",
            description:
              "Product walkthrough of GARVIX Restaurant & Café POS showing QR table self-ordering, live dark-mode KDS, recipe auto-inventory, and Flutter mobile app.",
            videoPath: "/videos/garvix-restaurant-showcase.mp4",
            thumbnailPath: "/images/products/garvix-restaurant-poster.jpg",
            pagePath: "/restaurant-software",
          }),
        ]}
      />

      <Navbar />

      {/* 1. Flagship Video Hero */}
      <section className="pt-8 pb-14 sm:pt-12 sm:pb-20 bg-[#fbfaf7] border-b border-[#eae3d8]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#786d63] hover:text-[#1f1915] transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#15803d]">
              Hospitality Suite &bull; Web POS + Live KDS + Mobile App
            </p>
            <h1 className="mt-2.5 text-3xl sm:text-5xl font-bold tracking-tight text-[#1f1915] leading-[1.08]">
              Restaurant &amp;{" "}
              <span className="text-[#15803d]">Caf&eacute; Software.</span>
            </h1>
            <p className="mt-3.5 text-sm sm:text-lg text-[#786d63] max-w-2xl mx-auto leading-relaxed">
              QR table self-ordering with UPI/Razorpay, dark-mode Kitchen Display (KDS), multi-round table billing, recipe-linked auto inventory, vendor dues, daily expenses, staff shifts &amp; Flutter mobile app.
            </p>
          </div>

          <div className="rounded-[1.75rem] sm:rounded-[2rem] border border-[#eae3d8] bg-white overflow-hidden shadow-[0_18px_54px_rgba(31,25,21,0.08)]">
            <ShowcaseVideoPlayer
              src="/videos/garvix-restaurant-showcase.mp4"
              poster="/images/products/garvix-restaurant-poster.jpg"
              label="GARVIX Restaurant & Café Software — 15 Second Product Showcase Video"
            />
            <div className="bg-white border-t border-[#eae3d8] px-5 py-4 sm:px-8 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#4a423b]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#15803d]">
                  Built by GARVIX
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-[#15803d]" />
                  <span>QR Table Self-Ordering</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ChefHat className="h-3.5 w-3.5 text-[#d97706]" />
                  <span>Live Kitchen Display (KDS)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#15803d]" />
                  <span>Zero Third-Party Commission</span>
                </span>
              </div>
              <div className="shrink-0">
                <EnquireButton
                  solution="Restaurant & Café Software"
                  label="Book Live Café Demo"
                  variant="primary"
                  className="!bg-[#15803d] hover:!bg-[#166534]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Hospitality Capabilities */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#eae3d8]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#15803d]">
              Table to Kitchen to Accounts
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-[#1f1915]">
              Everything your restaurant needs in sync.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="rounded-3xl border border-[#eae3d8] bg-[#fbfaf7] p-6 space-y-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#15803d]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1f1915] tracking-tight">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#786d63] leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Ideal Food Formats */}
      <section className="py-16 sm:py-20 bg-[#fbfaf7] border-b border-[#eae3d8]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#15803d]">
              Ideal For Food &amp; Hospitality
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-[#1f1915]">
              One Caf&eacute; OS. Every Kitchen.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {formats.map((ind) => (
              <div
                key={ind.name}
                className="rounded-3xl border border-[#eae3d8] bg-white p-6 flex items-start gap-3.5 shadow-[0_4px_20px_rgba(31,25,21,0.025)]"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[#15803d] text-white shrink-0">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1f1915] tracking-tight">
                    {ind.name}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#786d63] leading-relaxed">
                    {ind.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQs (with FAQPage JSON-LD) */}
      <FaqSection
        eyebrow="Restaurant POS FAQs"
        heading="Questions from café & restaurant owners."
        faqs={FAQS}
        accentColor="emerald"
        bgClass="bg-white"
      />

      {/* 5. Contact Form */}
      <section className="py-20 bg-[#fbfaf7] border-t border-[#eae3d8]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ContactForm
            defaultRequirement="Restaurant & Café Software"
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
