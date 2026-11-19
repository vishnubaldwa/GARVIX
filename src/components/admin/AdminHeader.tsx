"use client";

import { usePathname, useRouter } from "next/navigation";
import { AuthSession } from "@/lib/auth";
import { ExternalLink, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/documents": "Company Vault & Docs",
  "/admin/clients": "Parties & Clients",
  "/admin/quotations": "Quotations & Proposals",
  "/admin/leads": "Website Leads & CRM",
  "/admin/invoices": "Invoices & Proforma",
  "/admin/outstanding": "Outstanding & Payments",
  "/admin/challans": "Delivery Challans & E-Way",
  "/admin/inventory": "Hardware & Products",
  "/admin/inventory/serials": "Serial & IMEI Tracker",
  "/admin/amc": "AMC Support Contracts",
  "/admin/expenses": "Business Expenses",
  "/admin/gst-returns": "1-Click CA Return",
  "/admin/purchases": "Vendor Purchases & ITC",
  "/admin/team": "Team & Staff Management",
  "/admin/roles": "Roles & Permissions",
  "/admin/settings": "Settings & Profile",
  "/admin/audit": "Audit Security Logs",
};

export function AdminHeader({ session }: { session: AuthSession | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      window.location.href = "/admin/login";
    } finally {
      setLoggingOut(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    const upper = (role || "").toUpperCase();
    switch (upper) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return "bg-blue-50 text-[#0071e3] border-blue-200/80";
      case "SALES":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "ACCOUNTS":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "SERVICE":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      default:
        return "bg-[#f5f5f7] text-[#424245] border-black/[0.08]";
    }
  };

  const currentTitle =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(
      ([path]) => path !== "/admin" && pathname.startsWith(path + "/")
    )?.[1] ||
    "GARVIX ERP";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[0.06] bg-white/80 backdrop-blur-xl px-4 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm font-semibold text-[#1d1d1f] tracking-tight truncate">
          {currentTitle}
        </span>
        <span className="hidden md:inline text-black/15">•</span>
        <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] border border-black/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-[#424245]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Haryana (06) Auto GST
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white hover:bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-[#1d1d1f] transition"
        >
          <span className="hidden sm:inline">View Site</span>
          <ExternalLink className="h-3 w-3 text-[#86868b]" />
        </Link>

        {session && (
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-[#f5f5f7] hover:bg-black/[0.06] pl-2.5 pr-2 py-1 text-xs text-[#1d1d1f] transition"
              title="Account Settings"
            >
              <User className="h-3.5 w-3.5 text-[#86868b]" />
              <span className="truncate max-w-[110px] font-medium">
                {session.name || session.username}
              </span>
              <span
                className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getRoleBadge(
                  session.role
                )}`}
              >
                {session.role}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 px-3 py-1.5 text-xs font-medium text-[#424245] transition disabled:opacity-50"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}