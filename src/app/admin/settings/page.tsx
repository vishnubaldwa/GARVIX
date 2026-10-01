import { getSession } from "@/lib/auth";
import { getCompanySettings } from "@/lib/settings";
import { AdminSettingsView } from "@/components/admin/AdminSettingsView";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  const companyInfo = await getCompanySettings();

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
