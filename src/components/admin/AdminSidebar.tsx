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
  Radio,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { AuthSession } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads & CRM", icon: Users },
  { href: "/admin/inventory", label: "Hardware Products", icon: Package },
  { href: "/admin/inventory/serials", label: "Serial & IMEI Tracker", icon: Barcode },
  { href: "/admin/quotations", label: "Quotations", icon: FileSpreadsheet },
  { href: "/admin/challans", label: "Delivery Challans", icon: Truck },
  { href: "/admin/invoices", label: "Tax Invoices", icon: Receipt },
  { href: "/admin/purchases", label: "Purchases & ITC", icon: ShoppingCart },
  { href: "/admin/expenses", label: "Expense Tracker", icon: Wallet },
  { href: "/admin/amc", label: "AMC & Service", icon: Clock },
  { href: "/admin/gst-returns", label: "1-Click CA Return", icon: Download, highlight: true },
  { href: "/admin/audit", label: "Audit Logs", icon: ShieldCheck },
];

export function AdminSidebar({ session }: { session: AuthSession | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't render sidebar on login page
  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Mobile Top Bar with Hamburger */}
      <div className="md:hidden flex items-center justify-between border-b border-cyan-500/20 bg-[#07090e] px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            <Radio className="h-4 w-4" />
          </div>
          <span className="font-black text-white text-base">GARVIX ERP</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-800"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-cyan-500/20 bg-[#07090e] p-4 transition-transform duration-200 md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-widest text-white">GARVIX</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                    Enterprise ERP • HR (06)
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="mt-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)]"
                        : item.highlight
                        ? "text-emerald-400 hover:bg-emerald-950/30 border border-emerald-500/20"
                        : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : item.highlight ? "text-emerald-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile & Logout */}
          <div className="border-t border-slate-800 pt-4 mt-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <p className="text-xs font-bold text-white truncate max-w-[130px]">
                  {session?.name || "Vishnu Baldwa"}
                </p>
                <p className="text-[10px] text-cyan-400 font-mono">
                  {session?.email || "admin@garvix.in"}
                </p>
              </div>
              <span className="rounded bg-cyan-950 border border-cyan-500/30 px-1.5 py-0.5 text-[9px] font-mono font-bold text-cyan-300">
                {session?.role || "ADMIN"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
