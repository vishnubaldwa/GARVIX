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

  // Eligible ITC from purchases
  const totalItc = purchases
    .filter((p) => p.itcEligible)
    .reduce((sum, p) => sum + p.cgstAmount + p.sgstAmount + p.igstAmount, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time operations, inventory velocity, and Haryana GST financial ledger.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/quotations/create"
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" /> New Quote
          </Link>
          <Link
            href="/admin/challans/create"
            className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-950/40 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition"
          >
            <Truck className="h-3.5 w-3.5" /> New Challan
          </Link>
          <Link
            href="/admin/invoices/create"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-bold text-black hover:opacity-90 transition shadow-[0_0_15px_rgba(0,242,254,0.3)]"
          >
            <Receipt className="h-3.5 w-3.5" /> Create Invoice
          </Link>
          <Link
            href="/admin/gst-returns"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-950/60 transition"
          >
            <Download className="h-3.5 w-3.5" /> 1-Click CA Return
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Invoiced (Sales)</span>
            <Receipt className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white font-mono">{formatINR(totalInvoiced)}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Collected: {formatINR(totalCollected)}</span>
            <span className="text-cyan-400">{invoices.length} Invoices</span>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Receivables</span>
            <Wallet className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-400 font-mono">{formatINR(totalReceivables)}</p>
          <p className="mt-2 text-[11px] text-slate-400">
            Awaiting client settlement via Dynamic UPI / NEFT
          </p>
        </div>

        {/* Input Tax Credit (ITC) */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Eligible Input Tax Credit (ITC)</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400 font-mono">{formatINR(totalItc)}</p>
          <p className="mt-2 text-[11px] text-slate-400">
            From {purchases.length} vendor hardware purchases
          </p>
        </div>

        {/* Net Profit Margin */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Operating Margin</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <p className={`mt-2 text-2xl font-black font-mono ${netProfit >= 0 ? "text-purple-300" : "text-rose-400"}`}>
            {formatINR(netProfit)}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Sales minus Purchases & Expenses
          </p>
        </div>
      </div>

      {/* Operational Warnings / Alert Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Stock Alert */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-slate-300 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-300">
              Low Stock Alert ({lowStockProducts.length} Hardware items below threshold)
            </span>
            <p className="text-slate-400 mt-0.5">
              {lowStockProducts.length > 0
                ? lowStockProducts.map((p) => `${p.name} (${p.currentStock} ${p.unit})`).join(", ")
                : "All hardware reader and antenna stocks are at healthy inventory levels."}
            </p>
          </div>
          <Link
            href="/admin/inventory"
            className="text-amber-400 hover:underline shrink-0 font-semibold"
          >
            View Stock →
          </Link>
        </div>

        {/* AMC Reminder */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs text-slate-300 flex items-start gap-3">
          <Clock className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-cyan-300">
              Active Annual Maintenance Contracts ({amcContracts.length} Clients)
            </span>
            <p className="text-slate-400 mt-0.5">
              Automated reminders track upcoming hardware calibration and software renewals.
            </p>
          </div>
          <Link
            href="/admin/amc"
            className="text-cyan-400 hover:underline shrink-0 font-semibold"
          >
            Manage AMC →
          </Link>
        </div>
      </div>

      {/* Tables Section: Recent Invoices & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Invoices (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Recent Tax Invoices</h3>
              <p className="text-xs text-slate-400">Latest outward supply documents</p>
            </div>
            <Link href="/admin/invoices" className="text-xs font-semibold text-cyan-400 hover:underline">
              All Invoices →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 font-semibold border-b border-slate-800 pb-2">
                <tr>
                  <th className="py-2.5">Invoice #</th>
                  <th className="py-2.5">Buyer</th>
                  <th className="py-2.5 text-right">Amount</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/40">
                    <td className="py-3 text-cyan-400 font-bold">{inv.invoiceNumber}</td>
                    <td className="py-3 font-sans text-slate-200 truncate max-w-[140px]">
                      {inv.customer.companyName}
                    </td>
                    <td className="py-3 text-right text-white font-bold">{formatINR(inv.totalAmount)}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                          inv.paymentStatus === "PAID"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            : inv.paymentStatus === "PARTIAL"
                            ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                            : "bg-rose-950 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right font-sans">
                      <Link
                        href={`/portal/invoice/${inv.token}`}
                        target="_blank"
                        className="text-[11px] text-slate-400 hover:text-cyan-400"
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
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Live Website Enquiries</h3>
              <p className="text-xs text-slate-400">Telegram Bot alert stream</p>
            </div>
            <Link href="/admin/leads" className="text-xs font-semibold text-cyan-400 hover:underline">
              All Leads →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-xl border border-slate-800/80 bg-[#090e18] p-3 text-xs space-y-1 hover:border-cyan-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{lead.name}</span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded">
                    {lead.solution.replace("RFID_", "")}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{lead.company || "Individual / Unregistered"}</p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-mono">
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
