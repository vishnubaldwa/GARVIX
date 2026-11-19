import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://garvix.in"),
  title: {
    default: "GARVIX Software Solutions | Custom Software, Intelligent RFID & Complete Automation",
    template: "%s | GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
  },
  description:
    "GARVIX Software Solutions Private Limited engineers bespoke enterprise software, custom ERPs, and end-to-end RFID automation ecosystems that connect people, assets, and business operations in real time.",
  keywords: [
    "GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
    "Custom Software Development",
    "RFID Solutions India",
    "RFID Automation",
    "Jewellery RFID Stock Audit",
    "Warehouse Pallet RFID",
    "School RFID Attendance",
    "FASTag Parking Automation",
    "Enterprise ERP Haryana",
    "Bespoke Software Engineering",
  ],
  authors: [{ name: "GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED" }],
  openGraph: {
    title: "GARVIX Software Solutions | Custom Software, Intelligent RFID & Complete Automation",
    description:
      "We don't force businesses to adapt to software. We build software that adapts to the business. Complete RFID hardware and bespoke software engineering.",
    url: "https://garvix.in",
    siteName: "GARVIX Software Solutions",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GARVIX Software Solutions | Custom Software & RFID Automation",
    description:
      "Enterprise RFID hardware infrastructure and bespoke high-concurrency software architectures across India.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white">
        {children}
      </body>
    </html>
  );
}
