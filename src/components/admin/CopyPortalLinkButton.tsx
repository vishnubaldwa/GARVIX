"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function CopyPortalLinkButton({
  token,
  type = "quotation",
  iconOnly = false,
}: {
  token: string;
  type?: "quotation" | "invoice";
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const origin = window.location.origin;
    const url = `${origin}/portal/${type}/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        iconOnly
          ? `inline-flex items-center justify-center rounded-lg border p-1.5 transition ${
              copied
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            }`
          : "flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
      }
      title={copied ? "Portal Link Copied!" : "Copy Client Portal Link"}
    >
      {copied ? (
        <>
          <Check className={iconOnly ? "h-3.5 w-3.5 text-emerald-600" : "h-3 w-3 text-emerald-600"} />
          {!iconOnly && <span className="text-emerald-700 font-bold">Copied!</span>}
        </>
      ) : (
        <>
          <Link2 className={iconOnly ? "h-3.5 w-3.5" : "h-3 w-3 text-slate-500"} />
          {!iconOnly && <span>Copy Link</span>}
        </>
      )}
    </button>
  );
}
