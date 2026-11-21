"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { EnquireButton } from "@/components/public/EnquireButton";

interface ProductSlide {
  id: string;
  tabLabel: string;
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  bullets: string[];
  images: { src: string; alt: string }[];
  solution: string;
  ctaLabel: string;
}

const SMART_PRODUCTS: ProductSlide[] = [
  {
    id: "jewellery",
    tabLabel: "Jewellery",
    category: "Jewellery Showrooms",
    categoryColor: "text-amber-700",
    title: "Jewellery RFID Tags & Software",
    description:
      "Non-scratch loop & tail tags for gold rings, bangles, and diamond pendants.",
    bullets: [
      "Scan 500 ornaments on a velvet tray in under 1 second",
      "Instant missing-piece alarm & exit gate anti-theft alert",
      "Custom stock, gold weight & hallmark ERP software",
    ],
    images: [
      {
        src: "/images/products/jewellery-rfid-tag.jpg",
        alt: "GARVIX Jewellery RFID Tags",
      },
    ],
    solution: "Jewellery RFID",
    ctaLabel: "Enquire for Jewellery RFID",
  },
  {
    id: "apparel",
    tabLabel: "Apparel",
    category: "Apparel & Fashion Retail",
    categoryColor: "text-[#0071e3]",
    title: "Garment Hang Tags, Hard Tags & POS",
    description:
      "Premium branded UHF hang tags and reusable magnetic anti-theft hard tags.",
    bullets: [
      "1-second basket checkout — bill 10+ garments together",
      "Walk-through handheld rack audit in minutes",
      "Custom retail POS, size/color matrix & anti-theft gate sync",
    ],
    images: [
      {
        src: "/images/products/garment-tag.jpg",
        alt: "GARVIX Garment Hang Tag",
      },
      {
        src: "/images/products/hard-security-tag.jpg",
        alt: "GARVIX Hard Security Tag",
      },
    ],
    solution: "Garment RFID",
    ctaLabel: "Enquire for Apparel & POS",
  },
  {
    id: "laundry",
    tabLabel: "Laundry",
    category: "Hotels & Hospitals",
    categoryColor: "text-cyan-700",
    title: "Textile Laundry Tags & Linen ERP",
    description:
      "Washable fabric & button tags built for 200+ industrial laundry cycles.",
    bullets: [
      "Count full laundry bags instantly without unpacking",
      "Track wash cycles per towel, bedsheet & uniform",
      "Custom linen issue, return & billing software",
    ],
    images: [
      {
        src: "/images/products/laundry-textile-tag.jpg",
        alt: "GARVIX Textile RFID Laundry Tag",
      },
    ],
    solution: "Laundry RFID",
    ctaLabel: "Enquire for Laundry RFID",
  },
  {
    id: "anti-metal",
    tabLabel: "Anti-Metal",
    category: "Factories & IT Assets",
    categoryColor: "text-[#424245]",
    title: "Anti-Metal Tags & Asset Software",
    description:
      "Rugged IP68 screw-mount tags engineered to read cleanly on metal surfaces.",
    bullets: [
      "Track factory machinery, tools, pallets & server racks",
      "Heatproof, waterproof & oil-resistant construction",
      "Custom fixed-asset & preventive maintenance software",
    ],
    images: [
      {
        src: "/images/products/anti-metal-tag.jpg",
        alt: "GARVIX Anti-Metal RFID Tag",
      },
    ],
    solution: "Anti-Metal RFID",
    ctaLabel: "Enquire for Anti-Metal Tags",
  },
  {
    id: "vehicle",
    tabLabel: "Vehicle Pass",
    category: "Parking & Gate Automation",
    categoryColor: "text-emerald-700",
    title: "Vehicle RFID Pass & Gate Software",
    description:
      "Transparent tamper-proof windshield stickers for hands-free vehicle access.",
    bullets: [
      "Automatic boom barrier opening up to 8 meters",
      "Tamper-evident — cannot be peeled and reused",
      "Custom society, corporate parking & fleet entry software",
    ],
    images: [
      {
        src: "/images/products/vehicle-rfid-pass.jpg",
        alt: "GARVIX Vehicle RFID Windshield Pass",
      },
    ],
    solution: "Vehicle RFID",
    ctaLabel: "Enquire for Vehicle RFID",
  },
  {
    id: "rolls",
    tabLabel: "Rolls & Inlays",
    category: "Packaging & Warehousing",
    categoryColor: "text-purple-700",
    title: "Printable Rolls, Inlays & Encoding",
    description:
      "Thermal printable barcode+RFID rolls and peel-and-stick UHF inlays.",
    bullets: [
      "Print barcode & encode RFID chip in one single pass",
      "Works with Zebra, TSC & standard RFID printers",
      "Custom label printing & ERP serialization software",
    ],
    images: [
      {
        src: "/images/products/rfid-label-roll.jpg",
        alt: "GARVIX Printable RFID Label Roll",
      },
      {
        src: "/images/products/rfid-inlay.jpg",
        alt: "GARVIX Clear UHF RFID Inlay",
      },
    ],
    solution: "Printable Rolls & Inlays",
    ctaLabel: "Enquire for Rolls & Inlays",
  },
];

export function SmartProductsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Sync active slide with URL hash (#jewellery, #apparel, #laundry, #anti-metal, #vehicle, #rolls)
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      const idx = SMART_PRODUCTS.findIndex((p) => p.id === hash);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    // Also intercept in-page anchor clicks (Next.js <Link href="/#apparel"> may not fire hashchange on same hash)
    const handleDocClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      const hashPart = href.includes("#") ? href.split("#")[1] : "";
      if (!hashPart) return;
      const idx = SMART_PRODUCTS.findIndex((p) => p.id === hashPart);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    };

    document.addEventListener("click", handleDocClick);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      document.removeEventListener("click", handleDocClick);
    };
  }, []);

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? SMART_PRODUCTS.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === SMART_PRODUCTS.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - endX;
    touchStartX.current = null;
    if (Math.abs(delta) > 45) {
      if (delta > 0) goNext();
      else goPrev();
    }
  };

  return (
    <div className="relative">
      {/* Anchor targets so Navbar & Hero links (#jewellery, #apparel, etc.) scroll straight here */}
      {SMART_PRODUCTS.map((p) => (
        <span
          key={p.id}
          id={p.id}
          aria-hidden="true"
          className="block h-0 w-0 scroll-mt-28 pointer-events-none"
        />
      ))}

      {/* Flagship Carousel Window (Matches Video Showcase Window Style) */}
      <div
        className="relative rounded-[1.75rem] sm:rounded-[2rem] border border-black/[0.06] bg-white overflow-hidden shadow-[0_18px_54px_rgba(0,0,0,0.07)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding Horizontal Track */}
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {SMART_PRODUCTS.map((product, idx) => (
            <div
              key={product.id}
              className="w-full shrink-0 grid grid-cols-1 lg:grid-cols-12 items-stretch"
            >
              {/* Product Studio Visual (Left 7 Cols on Desktop) */}
              <div
                className={`lg:col-span-7 bg-[#f5f5f7] overflow-hidden relative min-h-[260px] sm:min-h-[380px] lg:min-h-[470px] ${
                  product.images.length > 1 ? "grid grid-cols-2 gap-0.5" : ""
                }`}
              >
                {product.images.map((img) => (
                  <img
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                ))}
              </div>

              {/* Product Details Panel (Right 5 Cols on Desktop) */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 bg-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-black/[0.05]">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-widest ${product.categoryColor}`}
                    >
                      {product.category}
                    </p>
                    <span className="rounded-full bg-[#f5f5f7] px-2.5 py-0.5 text-[11px] font-semibold text-[#6e6e73] tabular-nums">
                      0{idx + 1} / 0{SMART_PRODUCTS.length}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight leading-snug">
                    {product.title}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-[#6e6e73] leading-relaxed">
                    {product.description}
                  </p>

                  <ul className="mt-6 space-y-3 text-xs sm:text-sm text-[#424245]">
                    {product.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-[#0071e3] shrink-0 mt-0.5" />
                        <span className="leading-snug">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-5 border-t border-black/[0.06] flex items-center justify-between gap-3">
                  <EnquireButton
                    solution={product.solution}
                    label={product.ctaLabel}
                    variant="primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prev / Next Frosted Arrows */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous product"
          className="absolute left-3 top-[130px] sm:top-[190px] lg:top-1/2 lg:-translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#1d1d1f] border border-black/[0.08] shadow-md backdrop-blur-md transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next product"
          className="absolute right-3 lg:right-[calc(41.666%+12px)] top-[130px] sm:top-[190px] lg:top-1/2 lg:-translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#1d1d1f] border border-black/[0.08] shadow-md backdrop-blur-md transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Product Name Selector Tabs Directly Below Window */}
      <div
        role="tablist"
        aria-label="Select GARVIX Smart RFID Product"
        className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
      >
        {SMART_PRODUCTS.map((product, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={product.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIndex(idx)}
              className={`inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#1d1d1f] text-white shadow-[0_6px_20px_rgba(0,0,0,0.16)] scale-[1.02]"
                  : "bg-white text-[#424245] border border-black/[0.08] hover:border-black/20 hover:text-[#1d1d1f] shadow-2xs"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  isActive ? "bg-[#2997ff]" : "bg-black/20"
                }`}
              />
              <span>{product.tabLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
