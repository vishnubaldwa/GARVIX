"use client";

import { useState } from "react";
import { Receipt, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ConvertQuotationButton({
  quotationId,
  iconOnly = false,
}: {
  quotationId: string;
  iconOnly?: boolean;
}) {
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
      type="button"
      onClick={handleConvert}
      disabled={loading}
      className={
        iconOnly
          ? "inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
          : "flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
      }
      title="Convert Quotation to Tax Invoice"
    >
      {loading ? (
        <Loader2 className={iconOnly ? "h-3.5 w-3.5 animate-spin" : "h-3 w-3 animate-spin"} />
      ) : (
        <>
          <Receipt className={iconOnly ? "h-3.5 w-3.5 text-blue-600" : "h-3 w-3 text-blue-600"} />
          {!iconOnly && <span>To Invoice</span>}
        </>
      )}
    </button>
  );
}
