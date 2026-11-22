import type { Metadata } from "next";
import "./globals.css";
import { getCompanySettings } from "@/lib/settings";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  DEFAULT_OG_IMAGE,
  SITE_URL,
} from "@/lib/seo";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "GARVIX | Retail POS, Restaurant Software, Business ERP & RFID Solutions India",
    template: "%s | GARVIX Software Solutions",
  },
  description:
    "GARVIX Software Solutions Private Limited builds Retail POS & Store ERP, Restaurant & Café QR Ordering with Live KDS, Complete Business ERP with Android App, and turnkey UHF RFID Hardware + Software for Jewellery, Apparel, Laundry & Factories across India.",
  keywords: [
    "GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
    "Retail POS Software India",
    "Restaurant POS Software India",
    "Cafe QR Ordering & KDS Software",
    "Business ERP Software India",
    "Jewellery RFID Software & Tags India",
    "UHF RFID Solutions India",
    "Apparel Garment RFID Tags",
    "Laundry RFID Tracking India",
    "GST Billing Software Haryana Gurugram",
    "Custom Software Development India",
  ],
  authors: [{ name: "GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED", url: SITE_URL }],
  creator: "GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  publisher: "GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
  openGraph: {
    title:
      "GARVIX | Retail POS, Restaurant Software, Business ERP & RFID Solutions India",
    description:
      "In-house Retail POS, Restaurant & Café QR OS with Live KDS, Complete Business ERP + Android App, and Branded UHF RFID Hardware + Software engineered across India.",
    url: SITE_URL,
    siteName: "GARVIX Software Solutions",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1280,
        height: 720,
        alt: "GARVIX Retail POS, Business ERP, Restaurant Software & RFID Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "GARVIX | Retail POS, Restaurant Software, Business ERP & RFID India",
    description:
      "Retail POS & Store ERP, Café QR Ordering + KDS, Complete Business ERP + Android App, and UHF RFID ecosystems across India.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const company = await getCompanySettings();

  return (
    <html lang="en-IN" className="scroll-smooth">
      <body className="min-h-screen bg-white text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white">
        <JsonLd data={buildOrganizationSchema(company)} />
        <JsonLd data={buildWebSiteSchema()} />
        {children}
      </body>
    </html>
  );
}
