import fs from "fs";
import path from "path";
import Link from "next/link";
import {
  Radio,
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  FolderLock,
} from "lucide-react";

export const dynamic = "force-dynamic";

function getApkMeta() {
  const candidates = [
    path.join(process.cwd(), "downloads", "garvix-erp.apk"),
    path.join(process.cwd(), "public", "downloads", "garvix-erp.apk"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      return {
        available: true,
        sizeMb: (stat.size / (1024 * 1024)).toFixed(1),
        updatedAt: stat.mtime.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    }
  }
  return { available: false, sizeMb: null, updatedAt: null };
}

export default function DownloadAppPage() {
  const apk = getApkMeta();

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col justify-center py-12 px-4 sm:px-6 antialiased">
      <div className="mx-auto w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
            <Radio className="h-8 w-8 text-[#2997ff]" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1d1d1f]">
            GARVIX ERP App
          </h1>
          <p className="mt-1.5 text-sm text-[#6e6e73]">
            Official Android App for Directors, Staff & Document Vault
          </p>
        </div>

        {/* Download Card */}
        <div className="rounded-3xl border border-black/[0.06] bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex items-center justify-between rounded-2xl bg-[#f5f5f7] px-4 py-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Smartphone className="h-4.5 w-4.5 text-[#0071e3]" />
              <div>
                <p className="font-semibold text-[#1d1d1f]">Android Release APK</p>
                <p className="text-[11px] text-[#86868b]">
                  {apk.available
                    ? `${apk.sizeMb} MB • Updated ${apk.updatedAt}`
                    : "Upload pending on server"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              v2.5
            </span>
          </div>

          {apk.available ? (
            <a
              href="/api/download/android-app"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] py-3.5 px-6 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(0,113,227,0.3)] transition"
            >
              <Download className="h-4.5 w-4.5" />
              <span>Download GARVIX ERP (.apk)</span>
            </a>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 text-center">
              APK file is being uploaded to the server. Please check back in a moment.
            </div>
          )}

          {/* Quick Install Steps */}
          <div className="space-y-3 pt-2 border-t border-black/[0.06]">
            <p className="text-xs font-semibold text-[#1d1d1f]">
              How to install on Android (30 seconds):
            </p>
            <ol className="space-y-2 text-xs text-[#6e6e73]">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[10px] font-bold text-[#1d1d1f]">
                  1
                </span>
                <span>Tap the Download button above and open the downloaded APK file.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[10px] font-bold text-[#1d1d1f]">
                  2
                </span>
                <span>
                  If prompted, enable <strong className="text-[#1d1d1f]">Allow from this source</strong> and tap <strong className="text-[#1d1d1f]">Install</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[10px] font-bold text-[#1d1d1f]">
                  3
                </span>
                <span>
                  Sign in using your <span className="font-mono text-[#1d1d1f]">@garvix.in</span> Admin, Staff, or Vault ID.
                </span>
              </li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-black/[0.06] text-[11px] text-[#86868b]">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Role-Based Security
            </span>
            <span className="inline-flex items-center gap-1">
              <FolderLock className="h-3.5 w-3.5 text-[#0071e3]" />
              Company Vault
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0071e3]" />
              Live ERP Sync
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 text-xs text-[#6e6e73]">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1 hover:text-[#1d1d1f] transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Web Admin Login</span>
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-[#1d1d1f] transition">
            garvix.in
          </Link>
        </div>
      </div>
    </div>
  );
}
