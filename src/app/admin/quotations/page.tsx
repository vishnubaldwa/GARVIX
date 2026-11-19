import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";
import { getCompanySettings } from "@/lib/settings";
import Link from "next/link";
import { PlusCircle, ExternalLink } from "lucide-react";
import { ConvertQuotationButton } from "@/components/admin/ConvertQuotationButton";
import { CopyPortalLinkButton } from "@/components/admin/CopyPortalLinkButton";
import { WhatsAppShareButton } from "@/components/admin/WhatsAppShareButton";
import { QuotationReviseModal } from "@/components/admin/QuotationReviseModal";
import { SuperAdminDeleteButton } from "@/components/admin/SuperAdminDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminQuotationsPage() {
  const [session, company, quotations] = await Promise.all([
    getSession(),
    getCompanySettings(),
    prisma.quotation.findMany({
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const isSuperAdmin = isFullAdminRole(session?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quotations &amp; Estimations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Client proposals with automated Haryana GST calculations, live client portal links, and 1-click invoice conversion.
          </p>
        </div>

        <Link
          href="/admin/quotations/create"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" /> Create Quotation
        </Link>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Quote #</th>
                <th className="py-3 px-4">Customer &amp; State</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Tax Type</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Taxable</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Grand Total</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center font-sans text-slate-400">
                    No quotations created yet. Click &ldquo;Create Quotation&rdquo; to generate one.
                  </td>
                </tr>
              ) : (
                quotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-blue-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{quote.quoteNumber}</span>
                        {(() => {
                          try {
                            if (quote.notes?.startsWith("{")) {
                              const parsed = JSON.parse(quote.notes);
                              if (parsed.rev && parsed.rev > 1) {
                                return (
                                  <span
                                    className="rounded bg-amber-100 border border-amber-300 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 font-sans"
                                    title={`Revision ${parsed.rev}`}
                                  >
                                    Rev {parsed.rev}
                                  </span>
                                );
                              }
                            }
                          } catch {}
                          return null;
                        })()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-slate-900 text-sm">{quote.customer.companyName}</div>
                      <div className="text-[11px] text-slate-500">
                        {quote.customer.state} ({quote.customer.stateCode})
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          quote.taxType === "INTRA_STATE"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                        title={quote.taxType === "INTRA_STATE" ? "CGST 9% + SGST 9%" : "IGST 18%"}
                      >
                        {quote.taxType === "INTRA_STATE" ? "CGST+SGST" : "IGST 18%"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-600 whitespace-nowrap">
                      {formatINR(quote.subtotal)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                      {formatINR(quote.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
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

                    <td className="py-3.5 px-4 text-right font-sans whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <QuotationReviseModal quote={quote} iconOnly />

                        <WhatsAppShareButton
                          phone={quote.customer.phone}
                          clientName={quote.customer.companyName}
                          documentType="Quotation"
                          documentNumber={quote.quoteNumber}
                          amount={quote.totalAmount}
                          portalUrl={`https://garvix.in/portal/quotation/${quote.token}`}
                          companyName={company.name}
                          iconOnly
                        />

                        <CopyPortalLinkButton token={quote.token} type="quotation" iconOnly />

                        <Link
                          href={`/portal/quotation/${quote.token}`}
                          target="_blank"
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                          title="Open Client Portal View"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>

                        {quote.status !== "CONVERTED" && (
                          <ConvertQuotationButton quotationId={quote.id} iconOnly />
                        )}

                        {isSuperAdmin && (
                          <SuperAdminDeleteButton
                            entity="quotation"
                            id={quote.id}
                            label={`quotation ${quote.quoteNumber}`}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
