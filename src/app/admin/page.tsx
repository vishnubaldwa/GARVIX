import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import Link from "next/link";
import {
  TrendingUp,
  Receipt,
  Wallet,
  Users,
  AlertTriangle,
  ArrowRight,
  Package,
  PlusCircle,
  FileSpreadsheet,
  Truck,
  Download,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [invoices, purchases, expenses, leads, lowStockProducts, amcContracts] = await Promise.all([
    prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchase.findMany(),
    prisma.expense.findMany(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.product.findMany({
      where: {
        category: { startsWith: "HARDWARE" },
        currentStock: { lte: 5 },
      },
    }),
    prisma.aMCContract.findMany({
      include: { customer: true },
      where: { status: "ACTIVE" },
    }),
  ]);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalReceivables = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalInvoiced - (totalPurchases + totalExpenses);

  const totalItc = purchases
    .filter((p) => p.itcEligible)
    .reduce((sum, p) => sum + p.cgstAmount + p.sgstAmount + p.igstAmount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operations, hardware velocity, and Haryana GST accounting ledger.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/quotations/create"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
          >
            <PlusCircle className="h-3.5 w-3.5 text-blue-600" /> New Quote
          </Link>
          <Link
            href="/admin/challans/create"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
          >
            <Truck className="h-3.5 w-3.5 text-slate-600" /> New Challan
          </Link>
          <Link
            href="/admin/invoices/create"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Receipt className="h-3.5 w-3.5" /> Create Invoice
          </Link>
          <Link
            href="/admin/gst-returns"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-100 transition"
          >
            <Download className="h-3.5 w-3.5 text-emerald-700" /> 1-Click CA Return
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Invoiced (Sales)</span>
            <Receipt className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 font-mono">{formatINR(totalInvoiced)}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Collected: {formatINR(totalCollected)}</span>
            <span className="font-semibold text-blue-600">{invoices.length} Invoices</span>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Pending Receivables</span>
            <Wallet className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 font-mono">{formatINR(totalReceivables)}</p>
          <p className="mt-2 text-[11px] text-slate-500">
            Awaiting client settlement via Dynamic UPI / NEFT
          </p>
        </div>

        {/* Input Tax Credit (ITC) */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Input Tax Credit (ITC)</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700 font-mono">{formatINR(totalItc)}</p>
          <p className="mt-2 text-[11px] text-slate-500">
            From {purchases.length} vendor hardware purchases
          </p>
        </div>

        {/* Net Profit Margin */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Net Operating Margin</span>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <p className={`mt-2 text-2xl font-black font-mono ${netProfit >= 0 ? "text-slate-900" : "text-rose-600"}`}>
            {formatINR(netProfit)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            Sales minus Purchases & Expenses
          </p>
        </div>
      </div>

      {/* Operational Warnings / Alert Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Stock Alert */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-900">
              Low Stock Alert ({lowStockProducts.length} Hardware items below threshold)
            </span>
            <p className="text-amber-800/90 mt-0.5">
              {lowStockProducts.length > 0
                ? lowStockProducts.map((p) => `${p.name} (${p.currentStock} ${p.unit})`).join(", ")
                : "All hardware reader and antenna stocks are at healthy inventory levels."}
            </p>
          </div>
          <Link
            href="/admin/inventory"
            className="text-amber-900 font-bold hover:underline shrink-0"
          >
            View Stock →
          </Link>
        </div>

        {/* AMC Reminder */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900 flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-blue-900">
              Active Annual Maintenance Contracts ({amcContracts.length} Clients)
            </span>
            <p className="text-blue-800/90 mt-0.5">
              Automated reminders track upcoming hardware calibration and software renewals.
            </p>
          </div>
          <Link
            href="/admin/amc"
            className="text-blue-900 font-bold hover:underline shrink-0"
          >
            Manage AMC →
          </Link>
        </div>
      </div>

      {/* Tables Section: Recent Invoices & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Invoices (7 cols) */}
        <div className="lg:col-span-7 admin-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Tax Invoices</h3>
              <p className="text-xs text-slate-500">Latest outward supply documents</p>
            </div>
            <Link href="/admin/invoices" className="text-xs font-semibold text-blue-600 hover:underline">
              All Invoices →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 font-semibold border-b border-slate-200 pb-2">
                <tr>
                  <th className="py-2.5">Invoice #</th>
                  <th className="py-2.5">Buyer</th>
                  <th className="py-2.5 text-right">Amount</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 text-blue-600 font-bold">{inv.invoiceNumber}</td>
                    <td className="py-3 font-sans text-slate-800 font-medium truncate max-w-[140px]">
                      {inv.customer.companyName}
                    </td>
                    <td className="py-3 text-right text-slate-900 font-bold">{formatINR(inv.totalAmount)}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
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
                    <td className="py-3 text-right font-sans">
                      <Link
                        href={`/portal/invoice/${inv.token}`}
                        target="_blank"
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        View / UPI →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leads (5 cols) */}
        <div className="lg:col-span-5 admin-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Website Enquiries</h3>
              <p className="text-xs text-slate-500">Telegram Bot alert stream</p>
            </div>
            <Link href="/admin/leads" className="text-xs font-semibold text-blue-600 hover:underline">
              All Leads →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs space-y-1 hover:border-slate-200 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{lead.name}</span>
                  <span className="text-[10px] font-mono text-blue-700 uppercase bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {lead.solution.replace("RFID_", "")}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{lead.company || "Individual / Unregistered"}</p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
                  <span>{lead.phone}</span>
                  <span>{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
