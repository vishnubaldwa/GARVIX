import { getSession } from "@/lib/auth";
import { AdminSettingsView } from "@/components/admin/AdminSettingsView";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();

  const companyInfo = {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "GARVIX TECHNOLOGIES",
    tagline: process.env.NEXT_PUBLIC_COMPANY_TAGLINE || "Next-Gen RFID Ecosystems & Bespoke Software",
    state: process.env.NEXT_PUBLIC_COMPANY_STATE || "Haryana",
    stateCode: process.env.NEXT_PUBLIC_COMPANY_STATE_CODE || "06",
    gstin: process.env.NEXT_PUBLIC_COMPANY_GSTIN || "06AAACG1234F1Z5",
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "contact@garvix.in",
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+91 98765 43210",
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Cyber Hub, Sector 24, Gurugram, Haryana - 122002",
    upiId: process.env.NEXT_PUBLIC_UPI_ID || "garvix@upi",
    upiName: process.env.NEXT_PUBLIC_UPI_NAME || "GARVIX TECHNOLOGIES",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business & System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account security, Telegram bot push alerts, company profile, and dynamic UPI QR settings.
        </p>
      </div>

      <AdminSettingsView
        sessionEmail={session?.email || "admin@garvix.in"}
        sessionUsername={session?.username || "admin"}
        companyInfo={companyInfo}
      />
    </div>
  );
}
