import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import Link from "next/link";
import { PlusCircle, ExternalLink } from "lucide-react";
import { CopyPortalLinkButton } from "@/components/admin/CopyPortalLinkButton";
import { RecordPaymentModal } from "@/components/admin/RecordPaymentModal";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      customer: true,
      items: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

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
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & State</th>
                <th className="py-3 px-4 text-center">Tax Type</th>
                <th className="py-3 px-4 text-right">Taxable</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-right text-emerald-700">Paid</th>
                <th className="py-3 px-4 text-right text-amber-700">Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-blue-600">
                    {inv.invoiceNumber}
                  </td>

                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-bold text-slate-900 text-sm">{inv.customer.companyName}</div>
                    <div className="text-[11px] text-slate-500">
                      {inv.customer.state} ({inv.customer.stateCode}) {inv.customer.gstin ? `• ${inv.customer.gstin}` : ""}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans">
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

                  <td className="py-3.5 px-4 text-right text-slate-600">
                    {formatINR(inv.subtotal)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                    {formatINR(inv.totalAmount)}
                  </td>

                  <td className="py-3.5 px-4 text-right text-emerald-700 font-semibold">
                    {formatINR(inv.amountPaid)}
                  </td>

                  <td className="py-3.5 px-4 text-right text-amber-700 font-bold">
                    {formatINR(inv.balanceDue)}
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans">
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

                  <td className="py-3.5 px-4 text-right font-sans">
                    <div className="flex items-center justify-end gap-2">
                      <RecordPaymentModal invoice={inv} />

                      <CopyPortalLinkButton token={inv.token} type="invoice" />

                      <Link
                        href={`/portal/invoice/${inv.token}`}
                        target="_blank"
                        className="rounded p-1 text-slate-500 hover:text-blue-600 transition"
                        title="View Tax Invoice & Dynamic UPI QR"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
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
