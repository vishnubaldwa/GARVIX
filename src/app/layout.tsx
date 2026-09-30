import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GARVIX | Next-Gen RFID Systems & Bespoke Software Development",
  description:
    "GARVIX delivers enterprise RFID hardware solutions, warehouse & jewellery stock audit systems, FASTag automation, and bespoke software engineering.",
  keywords: [
    "RFID Solutions",
    "Jewellery RFID Audit",
    "Warehouse Pallet RFID",
    "Custom Software Development",
    "FASTag Parking Automation",
    "ERP Software",
    "GARVIX",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
