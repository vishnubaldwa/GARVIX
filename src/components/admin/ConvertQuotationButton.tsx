"use client";

import { useState } from "react";
import { ArrowRight, Receipt, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ConvertQuotationButton({ quotationId }: { quotationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConvert = async () => {
    if (!confirm("Are you sure you want to convert this quotation into a formal Tax Invoice?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/quotations/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationId }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/invoices");
        router.refresh();
      } else {
        alert(data.error || "Failed to convert quotation.");
      }
    } catch {
      alert("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConvert}
      disabled={loading}
      className="flex items-center gap-1 rounded bg-cyan-950/80 border border-cyan-500/40 px-2 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition disabled:opacity-50"
      title="Convert to Tax Invoice"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <>
          <Receipt className="h-3 w-3 text-cyan-400" />
          <span>To Invoice</span>
        </>
      )}
    </button>
  );
}
