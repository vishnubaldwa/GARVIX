"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function CopyPortalLinkButton({
  token,
  type = "quotation",
}: {
  token: string;
  type?: "quotation" | "invoice";
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
      onClick={handleCopy}
      className="flex items-center gap-1 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition"
      title="Copy Link for Client"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400 font-bold">Copied!</span>
        </>
      ) : (
        <>
          <Link2 className="h-3 w-3" />
          <span>Copy Link</span>
        </>
      )}
    </button>
  );
}
