import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import Link from "next/link";
import { PlusCircle, FileSpreadsheet, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import { ConvertQuotationButton } from "@/components/admin/ConvertQuotationButton";
import { CopyPortalLinkButton } from "@/components/admin/CopyPortalLinkButton";

export const dynamic = "force-dynamic";

export default async function AdminQuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Quotations & Estimations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Client proposals with automated Haryana GST calculations, live client portal links, and 1-click invoice conversion.
          </p>
        </div>

        <Link
          href="/admin/quotations/create"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-black shadow-md hover:opacity-90 transition"
        >
          <PlusCircle className="h-4 w-4" /> Create Quotation
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d18] text-slate-400 font-semibold border-b border-slate-800 uppercase">
              <tr>
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Customer & State</th>
                <th className="py-3 px-4">Tax Type</th>
                <th className="py-3 px-4 text-right">Taxable Amount</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {quotations.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-cyan-400">
                    {quote.quoteNumber}
                  </td>

                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-bold text-white text-sm">{quote.customer.companyName}</div>
                    <div className="text-[11px] text-slate-400">
                      {quote.customer.state} ({quote.customer.stateCode})
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        quote.taxType === "INTRA_STATE"
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                          : "bg-blue-950 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {quote.taxType === "INTRA_STATE" ? "CGST + SGST (9%+9%)" : "IGST (18%)"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-300">
                    {formatINR(quote.subtotal)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                    {formatINR(quote.totalAmount)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block rounded px-2.5 py-1 text-[10px] font-bold uppercase ${
                        quote.status === "ACCEPTED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                          : quote.status === "CONVERTED"
                          ? "bg-purple-950 text-purple-300 border border-purple-500/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-sans">
                    <div className="flex items-center justify-end gap-2">
                      <CopyPortalLinkButton token={quote.token} type="quotation" />

                      <Link
                        href={`/portal/quotation/${quote.token}`}
                        target="_blank"
                        className="rounded p-1 text-slate-400 hover:text-cyan-400 transition"
                        title="Open Client Portal View"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>

                      {quote.status !== "CONVERTED" && (
                        <ConvertQuotationButton quotationId={quote.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
