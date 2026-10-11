import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { Clock, AlertCircle, ArrowUpRight, MessageSquare, CheckCircle2, Building2 } from "lucide-react";
import Link from "next/link";
import { RecordPaymentModal } from "@/components/admin/RecordPaymentModal";
import { buildWhatsAppLink, getPaymentReminderWhatsAppText } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://garvix.in";

export default async function OutstandingPaymentsPage() {
  const pendingInvoices = await prisma.invoice.findMany({
    where: {
      paymentStatus: { in: ["UNPAID", "PARTIAL"] },
    },
    include: {
      customer: true,
      payments: true,
    },
    orderBy: {
      invoiceDate: "desc",
    },
  });

  const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalBilled = pendingInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = pendingInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Outstanding Payments & Follow-ups</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track unpaid & partial invoices, monitor aging receivables, and send 1-click WhatsApp payment reminders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/invoices/create"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold uppercase text-white shadow-sm hover:bg-blue-700 transition"
          >
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Outstanding</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {formatINR(totalOutstanding)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Pending across {pendingInvoices.length} invoices / PI
          </p>
        </div>

        <div className="admin-card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Invoices</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {pendingInvoices.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Awaiting full settlement
          </p>
        </div>

        <div className="admin-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Partial Receipts</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {formatINR(totalCollected)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Advance received on active dues
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Pending Accounts Receivable ({pendingInvoices.length})
          </h2>
        </div>

        {pendingInvoices.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">All Invoices Settled!</p>
            <p className="text-xs text-slate-400 mt-1">There are no outstanding balances or pending payments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-4">Party / Customer</th>
                  <th className="py-3 px-4">Invoice / PI</th>
                  <th className="py-3 px-4">Date & Age</th>
                  <th className="py-3 px-4 text-right">Total Bill</th>
                  <th className="py-3 px-4 text-right">Received</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">1-Click Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingInvoices.map((inv) => {
                  const daysOld = Math.floor(
                    (now.getTime() - new Date(inv.invoiceDate).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const portalUrl = `${SITE_URL}/portal/invoice/${inv.token}`;
                  const waText = getPaymentReminderWhatsAppText({
                    customerName: inv.customer.companyName,
                    contactPerson: inv.customer.contactPerson,
                    invoiceNumber: inv.invoiceNumber,
                    balanceDue: inv.balanceDue,
                    daysPending: daysOld,
                    portalUrl,
                  });
                  const waLink = buildWhatsAppLink(inv.customer.phone, waText);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inv.customer.companyName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {inv.customer.contactPerson || "Accounts"} • {inv.customer.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        <Link href={portalUrl} target="_blank" className="hover:underline flex items-center gap-1">
                          <span>{inv.invoiceNumber}</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                        <span className="text-[10px] text-slate-400 font-sans block">
                          {inv.invoiceType === "PROFORMA_INVOICE" ? "Proforma (PI)" : "Tax Invoice"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div>{new Date(inv.invoiceDate).toLocaleDateString("en-IN")}</div>
                        <div className="text-[10px] font-medium text-amber-600 font-mono">
                          {daysOld === 0 ? "Today" : `${daysOld} days pending`}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                        {formatINR(inv.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-medium">
                        {formatINR(inv.amountPaid)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                        {formatINR(inv.balanceDue)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                            inv.paymentStatus === "PARTIAL"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {inv.paymentStatus === "PARTIAL" ? "Partially Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1-Click WhatsApp Reminder */}
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                            title="Send WhatsApp payment reminder to customer"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>

                          {/* Record Payment Modal */}
                          <RecordPaymentModal invoice={inv} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
