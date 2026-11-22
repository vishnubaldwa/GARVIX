import type { CompanySettingsData } from "@/lib/settings";

export const SITE_URL = "https://garvix.in";
export const COMPANY_LEGAL_NAME = "GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED";
export const COMPANY_SHORT_NAME = "GARVIX";
export const COMPANY_CIN = "U62011HR2026PTC152223";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/products/garvix-retail-pos-poster.jpg`;

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildOrganizationSchema(company: CompanySettingsData) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: COMPANY_LEGAL_NAME,
    alternateName: ["GARVIX", "GARVIX Software Solutions", "GARVIX Technologies"],
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    image: DEFAULT_OG_IMAGE,
    description:
      "GARVIX Software Solutions Private Limited builds Retail POS & Store ERP, Restaurant & Café QR POS with Live KDS, Complete Business ERP with Flutter Android App, and turnkey UHF RFID Hardware + Software ecosystems across India.",
    email: company.email || "info@garvix.in",
    telephone: company.phone || "+91 98765 43210",
    taxID: company.gstin || undefined,
    identifier: {
      "@type": "PropertyValue",
      name: "CIN",
      value: COMPANY_CIN,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressRegion: company.state || "Haryana",
      addressCountry: "IN",
    },
    areaServed: [
      { "@type": "Country", name: "India" },
      { "@type": "State", name: "Haryana" },
      { "@type": "City", name: "Gurugram" },
      { "@type": "City", name: "New Delhi" },
      { "@type": "City", name: "Jaipur" },
      { "@type": "City", name: "Surat" },
      { "@type": "City", name: "Mumbai" },
      { "@type": "City", name: "Ahmedabad" },
      { "@type": "City", name: "Bengaluru" },
      { "@type": "City", name: "Hyderabad" },
    ],
    knowsAbout: [
      "Retail POS Software India",
      "Restaurant and Cafe POS Software",
      "Kitchen Display System (KDS)",
      "QR Table Self-Ordering Software",
      "UHF RFID Jewellery Stock Audit",
      "Garment and Apparel RFID Tags",
      "Industrial Laundry RFID Tracking",
      "Custom Business ERP Software",
      "Indian GST Billing and CA Return Automation",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "GARVIX Software & RFID Solutions",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "SoftwareApplication",
            name: "GARVIX Retail POS & Store ERP",
            url: `${SITE_URL}/retail-software`,
            applicationCategory: "BusinessApplication",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "SoftwareApplication",
            name: "GARVIX Restaurant & Café Software (POS + QR + KDS)",
            url: `${SITE_URL}/restaurant-software`,
            applicationCategory: "BusinessApplication",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "SoftwareApplication",
            name: "GARVIX Complete Business ERP & Android App",
            url: `${SITE_URL}/erp-software`,
            applicationCategory: "BusinessApplication",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "GARVIX Jewellery UHF RFID Tags & Tray Audit System",
            url: `${SITE_URL}/rfid-jewellery`,
          },
        },
      ],
    },
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "GARVIX Software Solutions",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: "en-IN",
  };
}

export function buildSoftwareSchema(opts: {
  name: string;
  description: string;
  path: string;
  imagePath: string;
  featureList: string[];
  operatingSystem?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    image: `${SITE_URL}${opts.imagePath}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: opts.operatingSystem || "Web, Android, Windows, macOS",
    featureList: opts.featureList,
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      areaServed: {
        "@type": "Country",
        name: "India",
      },
    },
  };
}

export function buildVideoSchema(opts: {
  name: string;
  description: string;
  videoPath: string;
  thumbnailPath: string;
  pagePath: string;
  uploadDate?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: opts.name,
    description: opts.description,
    thumbnailUrl: [`${SITE_URL}${opts.thumbnailPath}`],
    contentUrl: `${SITE_URL}${opts.videoPath}`,
    embedUrl: `${SITE_URL}${opts.pagePath}`,
    uploadDate: opts.uploadDate || "2026-11-21T00:00:00+05:30",
    duration: "PT15S",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
