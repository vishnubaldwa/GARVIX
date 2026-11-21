"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Barcode,
  FileSpreadsheet,
  Truck,
  Receipt,
  ShoppingCart,
  Wallet,
  Clock,
  Download,
  ShieldCheck,
  LogOut,
  X,
  Menu,
  Building2,
  Settings,
  UserCog,
  Shield,
  FolderLock,
  Smartphone,
  Globe,
  CalendarClock,
} from "lucide-react";
import { useState } from "react";
import { GarvixLogoMark } from "@/components/brand/GarvixLogo";
import { AuthSession } from "@/lib/auth";
import { PermissionCode } from "@/lib/permissions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  adminOnly?: boolean;
  hideForViewer?: boolean;
  requiredPermission?: PermissionCode;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, hideForViewer: true },
      { href: "/admin/documents", label: "Company Vault & Docs", icon: FolderLock, requiredPermission: "CAN_VIEW_DOCUMENTS" },
    ],
  },
  {
    title: "Sales & Clients",
    items: [
      { href: "/admin/clients", label: "Parties & Clients", icon: Building2, requiredPermission: "CAN_CREATE_CLIENT" },
      { href: "/admin/quotations", label: "Quotations & Proposals", icon: FileSpreadsheet, requiredPermission: "CAN_CREATE_QUOTATION" },
      { href: "/admin/leads", label: "Website Leads & CRM", icon: Users, requiredPermission: "CAN_VIEW_LEADS" },
      { href: "/admin/website-clients", label: "Website Clients", icon: Globe, requiredPermission: "CAN_CREATE_CLIENT" },
    ],
  },
  {
    title: "Billing & Dispatch",
    items: [
      { href: "/admin/invoices", label: "Invoices & Proforma (PI)", icon: Receipt, requiredPermission: "CAN_MANAGE_INVOICES" },
      { href: "/admin/outstanding", label: "Outstanding & Payments", icon: Clock, requiredPermission: "CAN_MANAGE_INVOICES" },
      { href: "/admin/challans", label: "Delivery Challans & E-Way", icon: Truck, requiredPermission: "CAN_MANAGE_INVOICES" },
    ],
  },
  {
    title: "Catalog & Contracts",
    items: [
      { href: "/admin/inventory", label: "Hardware & Products", icon: Package, requiredPermission: "CAN_CREATE_PRODUCT" },
      { href: "/admin/inventory/serials", label: "Serial & IMEI Tracker", icon: Barcode, requiredPermission: "CAN_CREATE_PRODUCT" },
      { href: "/admin/amc", label: "AMC Support Contracts", icon: ShieldCheck, requiredPermission: "CAN_VIEW_SERVICE" },
    ],
  },
  {
    title: "Accounts & Finance",
    items: [
      { href: "/admin/expenses", label: "Business Expenses", icon: Wallet, requiredPermission: "CAN_VIEW_FINANCES" },
      { href: "/admin/gst-returns", label: "1-Click CA Return", icon: Download, highlight: true, requiredPermission: "CAN_VIEW_FINANCES" },
      { href: "/admin/important-dates", label: "Important Dates", icon: CalendarClock, requiredPermission: "CAN_VIEW_FINANCES" },
      { href: "/admin/purchases", label: "Vendor Purchases & ITC", icon: ShoppingCart, requiredPermission: "CAN_VIEW_FINANCES" },
    ],
  },
  {
    title: "System & Staff",
    items: [
      { href: "/admin/team", label: "Team & Staff", icon: UserCog, requiredPermission: "CAN_MANAGE_TEAM" },
      { href: "/admin/roles", label: "Roles & Permissions", icon: Shield, requiredPermission: "CAN_MANAGE_ROLES" },
      { href: "/admin/settings", label: "Settings & Profile", icon: Settings, hideForViewer: true },
      { href: "/admin/audit", label: "Audit Security Logs", icon: ShieldCheck, adminOnly: true },
    ],
  },
];

function isFullAdmin(role?: string | null): boolean {
  if (!role) return false;
  const upper = role.toUpperCase();
  return upper === "SUPER_ADMIN" || upper === "ADMIN";
}

export function AdminSidebar({
  session,
  permissions = [],
}: {
  session: AuthSession | null;
  permissions?: PermissionCode[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const fullAccess = isFullAdmin(session?.role);
  const isViewerOnly = session?.role?.toUpperCase() === "DOCUMENT_VIEWER";

  const initials = (session?.name || session?.username || "G")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile Top Bar with Hamburger (Apple Frosted Glass) */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-black/[0.06] bg-white/85 backdrop-blur-xl px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#16171a] border border-[#d8b56c]/25 shadow-sm">
            <GarvixLogoMark className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-[#1d1d1f] text-sm tracking-tight block leading-none">
              GARVIX
            </span>
            <span className="text-[10px] font-medium text-[#86868b]">Enterprise ERP</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl border border-black/[0.08] bg-[#f5f5f7] p-2 text-[#1d1d1f] hover:bg-black/[0.06] transition"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Apple macOS-Style Light Frosted Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-68 md:w-64 transform border-r border-black/[0.06] bg-[#fbfbfd]/95 backdrop-blur-2xl px-3.5 py-4 transition-transform duration-200 md:static md:translate-x-0 flex flex-col justify-between overflow-y-auto ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2 pb-4 border-b border-black/[0.06]">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16171a] border border-[#d8b56c]/25 shadow-sm group-hover:scale-105 transition-transform">
                <GarvixLogoMark className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <span className="text-base font-bold tracking-tight text-[#1d1d1f]">GARVIX</span>
                <span className="block text-[10px] font-medium text-[#86868b]">
                  Business ERP • HR (06)
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden rounded-lg p-1.5 text-[#86868b] hover:bg-black/[0.05] hover:text-[#1d1d1f]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="mt-4 space-y-4">
            {navSections.map((section, sIdx) => {
              const visibleItems = section.items.filter((item) => {
                if (fullAccess) return true;
                if (isViewerOnly && item.hideForViewer) return false;
                if (item.adminOnly) return false;
                if (item.requiredPermission) {
                  return permissions.includes(item.requiredPermission);
                }
                return true;
              });

              if (visibleItems.length === 0) return null;

              return (
                <div key={sIdx} className="space-y-0.5">
                  {section.title && (
                    <div className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                      {section.title}
                    </div>
                  )}

                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin" &&
                        item.href !== "/admin/inventory" &&
                        pathname.startsWith(item.href + "/"));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all ${
                          isActive
                            ? "bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.28)]"
                            : item.highlight
                            ? "text-emerald-700 hover:bg-emerald-50"
                            : "text-[#424245] hover:bg-black/[0.045] hover:text-[#1d1d1f]"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? "text-white"
                              : item.highlight
                              ? "text-emerald-600"
                              : "text-[#86868b]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card & Logout */}
        <div className="mt-6 pt-4 border-t border-black/[0.06] shrink-0 space-y-2.5">
          <div className="flex items-center gap-2.5 rounded-2xl bg-white border border-black/[0.06] p-2.5 shadow-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-white text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1d1d1f] truncate">
                {session?.name || "Staff Member"}
              </p>
              <p className="text-[10px] text-[#86868b] truncate">
                {session?.email || session?.username || "Authenticated"}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold shrink-0 uppercase ${
                fullAccess
                  ? "bg-blue-50 text-[#0071e3] border border-blue-200/80"
                  : session?.role === "SALES"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                  : session?.role === "ACCOUNTS"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {session?.role || "USER"}
            </span>
          </div>

          <Link
            href="/download-app"
            target="_blank"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/70 py-2 text-xs font-medium text-[#0071e3] transition"
          >
            <Smartphone className="h-3.5 w-3.5" /> Android App (.apk)
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.06] bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 py-2 text-xs font-medium text-[#424245] transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}