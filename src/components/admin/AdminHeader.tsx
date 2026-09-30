"use client";

import { usePathname } from "next/navigation";
import { AuthSession } from "@/lib/auth";
import { Radio, ExternalLink, ShieldCheck, Bell } from "lucide-react";
import Link from "next/link";

export function AdminHeader({ session }: { session: AuthSession | null }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-cyan-500/20 bg-[#07090e]/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono font-semibold text-slate-400">
          GARVIX OS <span className="text-cyan-400">v2.6</span>
        </span>
        <span className="hidden sm:inline text-slate-700">|</span>
        <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          State: Haryana (Code 06) • CGST/SGST Auto-Rule
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition"
        >
          <span>View Public Site</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-2.5 py-1 text-xs font-mono text-cyan-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="truncate max-w-[120px]">{session?.email || "admin@garvix.in"}</span>
        </div>
      </div>
    </header>
  );
}
