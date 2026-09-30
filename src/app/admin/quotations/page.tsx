import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import Link from "next/link";
import { PlusCircle, ExternalLink } from "lucide-react";
import { ConvertQuotationButton } from "@/components/admin/ConvertQuotationButton";
import { CopyPortalLinkButton } from "@/components/admin/CopyPortalLinkButton";
import { WhatsAppShareButton } from "@/components/admin/WhatsAppShareButton";

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quotations & Estimations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Client proposals with automated Haryana GST calculations, live client portal links, and 1-click invoice conversion.
          </p>
        </div>

        <Link
          href="/admin/quotations/create"
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <PlusCircle className="h-4 w-4" /> Create Quotation
        </Link>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
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
            <tbody className="divide-y divide-slate-100 font-mono">
              {quotations.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-blue-600">
                    {quote.quoteNumber}
                  </td>

                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-bold text-slate-900 text-sm">{quote.customer.companyName}</div>
                    <div className="text-[11px] text-slate-500">
                      {quote.customer.state} ({quote.customer.stateCode})
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold ${
                        quote.taxType === "INTRA_STATE"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}
                    >
                      {quote.taxType === "INTRA_STATE" ? "CGST + SGST (9%+9%)" : "IGST (18%)"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-600">
                    {formatINR(quote.subtotal)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                    {formatINR(quote.totalAmount)}
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans">
                    <span
                      className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase ${
                        quote.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : quote.status === "CONVERTED"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-sans">
                    <div className="flex items-center justify-end gap-2">
                      <WhatsAppShareButton
                        phone={quote.customer.phone}
                        clientName={quote.customer.companyName}
                        documentType="Quotation"
                        documentNumber={quote.quoteNumber}
                        amount={quote.totalAmount}
                        portalUrl={`https://garvix.in/portal/quotation/${quote.token}`}
                      />

                      <CopyPortalLinkButton token={quote.token} type="quotation" />

                      <Link
                        href={`/portal/quotation/${quote.token}`}
                        target="_blank"
                        className="rounded p-1 text-slate-500 hover:text-blue-600 transition"
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
