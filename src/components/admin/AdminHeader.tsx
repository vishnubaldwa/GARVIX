"use client";

import { usePathname } from "next/navigation";
import { AuthSession } from "@/lib/auth";
import { ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function AdminHeader({ session }: { session: AuthSession | null }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono font-bold text-slate-700">
          GARVIX ERP <span className="text-blue-600 font-semibold">v2.6</span>
        </span>
        <span className="hidden sm:inline text-slate-300">|</span>
        <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          State: Haryana (06) • Auto GST Engine
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:text-blue-600 hover:border-blue-300 transition"
        >
          <span>View Public Site</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span className="truncate max-w-[140px] font-mono text-[11px] font-medium">
            {session?.email || "admin@garvix.in"}
          </span>
        </div>
      </div>
    </header>
  );
}
