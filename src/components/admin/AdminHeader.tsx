"use client";

import { usePathname, useRouter } from "next/navigation";
import { AuthSession } from "@/lib/auth";
import { ExternalLink, ShieldCheck, LogOut, User, Users, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "ADMIN":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "SALES":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ACCOUNTS":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SERVICE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono font-bold text-slate-800 tracking-tight">
          GARVIX ERP <span className="text-blue-600 font-semibold">v2.6</span>
        </span>
        <span className="hidden sm:inline text-slate-300">|</span>
        <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          State: Haryana (06) • Auto GST Engine
        </span>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:text-blue-600 hover:border-blue-300 transition"
        >
          <span>View Public Site</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {session && (
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-xs text-slate-700 transition"
              title="Account Settings"
            >
              <User className="h-3.5 w-3.5 text-slate-500" />
              <div className="flex items-center gap-1.5">
                <span className="truncate max-w-[110px] font-medium text-slate-800">
                  {session.name || session.username}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${getRoleBadge(
                    session.role
                  )}`}
                >
                  {session.role}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700 transition disabled:opacity-50"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
