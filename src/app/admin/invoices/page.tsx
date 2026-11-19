import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";
import { getCompanySettings } from "@/lib/settings";
import Link from "next/link";
import { PlusCircle, ExternalLink } from "lucide-react";
import { CopyPortalLinkButton } from "@/components/admin/CopyPortalLinkButton";
import { RecordPaymentModal } from "@/components/admin/RecordPaymentModal";
import { WhatsAppShareButton } from "@/components/admin/WhatsAppShareButton";
import { SuperAdminDeleteButton } from "@/components/admin/SuperAdminDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const [session, company, invoices] = await Promise.all([
    getSession(),
    getCompanySettings(),
    prisma.invoice.findMany({
      include: {
        customer: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const isSuperAdmin = isFullAdminRole(session?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tax Invoices & Billing</h1>
          <p className="text-xs text-slate-500 mt-1">
            GST Tax Invoices with Dynamic NPCI UPI QR code, E-Way Bill tracking, and payment reconciliation.
          </p>
        </div>

        <Link
          href="/admin/invoices/create"
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <PlusCircle className="h-4 w-4" /> Create Tax Invoice
        </Link>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Invoice #</th>
                <th className="py-3 px-4">Customer &amp; State</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Tax Type</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Taxable</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Total</th>
                <th className="py-3 px-4 text-right text-emerald-700 whitespace-nowrap">Paid</th>
                <th className="py-3 px-4 text-right text-amber-700 whitespace-nowrap">Balance</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-blue-600 whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>

                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-bold text-slate-900 text-sm">{inv.customer.companyName}</div>
                    <div className="text-[11px] text-slate-500">
                      {inv.customer.state} ({inv.customer.stateCode}) {inv.customer.gstin ? `• ${inv.customer.gstin}` : ""}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        inv.taxType === "INTRA_STATE"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}
                    >
                      {inv.taxType === "INTRA_STATE" ? "CGST+SGST" : "IGST"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-600 whitespace-nowrap">
                    {formatINR(inv.subtotal)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                    {formatINR(inv.totalAmount)}
                  </td>

                  <td className="py-3.5 px-4 text-right text-emerald-700 font-semibold whitespace-nowrap">
                    {formatINR(inv.amountPaid)}
                  </td>

                  <td className="py-3.5 px-4 text-right text-amber-700 font-bold whitespace-nowrap">
                    {formatINR(inv.balanceDue)}
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                    <span
                      className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase ${
                        inv.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : inv.paymentStatus === "PARTIAL"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-sans whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <WhatsAppShareButton
                        phone={inv.customer.phone}
                        clientName={inv.customer.companyName}
                        documentType={inv.invoiceType === "PROFORMA_INVOICE" ? "Proforma Invoice" : "Tax Invoice"}
                        documentNumber={inv.invoiceNumber}
                        amount={inv.totalAmount}
                        portalUrl={`https://garvix.in/portal/invoice/${inv.token}`}
                        companyName={company.name}
                        iconOnly
                      />

                      <RecordPaymentModal invoice={inv} iconOnly />

                      <CopyPortalLinkButton token={inv.token} type="invoice" iconOnly />

                      <Link
                        href={`/portal/invoice/${inv.token}`}
                        target="_blank"
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                        title="View Tax Invoice & Dynamic UPI QR"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      {isSuperAdmin && (
                        <SuperAdminDeleteButton
                          entity="invoice"
                          id={inv.id}
                          label={`invoice ${inv.invoiceNumber}`}
                        />
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
