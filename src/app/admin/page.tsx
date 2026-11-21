import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { getSession } from "@/lib/auth";
import { getCompanySettings } from "@/lib/settings";
import { isFullAdminRole, hasPermission } from "@/lib/permissions";
import { getUpcomingComplianceAlerts } from "@/lib/compliance-engine";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Receipt,
  Wallet,
  AlertTriangle,
  PlusCircle,
  Truck,
  Download,
  Clock,
  ShieldCheck,
  ChevronRight,
  CalendarClock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  // External document viewers (e.g. Bankers / CA Guests) go directly to the Document Vault
  if (
    !isFullAdminRole(session.role) &&
    session.role === "DOCUMENT_VIEWER"
  ) {
    redirect("/admin/documents");
  }

  // Also if user only has vault viewing permission and no finance/sales permissions, route to vault
  const canViewDocs = await hasPermission(session.role, "CAN_VIEW_DOCUMENTS");
  const canViewFinances = await hasPermission(session.role, "CAN_VIEW_FINANCES");
  const canCreateClient = await hasPermission(session.role, "CAN_CREATE_CLIENT");
  const canManageInvoices = await hasPermission(session.role, "CAN_MANAGE_INVOICES");
  if (
    !isFullAdminRole(session.role) &&
    canViewDocs &&
    !canViewFinances &&
    !canCreateClient &&
    !canManageInvoices
  ) {
    redirect("/admin/documents");
  }

  const canManageSettings = await hasPermission(session.role, "CAN_MANAGE_SETTINGS");
  const canViewCompliance =
    isFullAdminRole(session.role) || canViewFinances || canManageSettings;

  const [
    invoices,
    purchases,
    expenses,
    leads,
    lowStockProducts,
    amcContracts,
    company,
    complianceAlerts,
  ] = await Promise.all([
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
    getCompanySettings(),
    canViewCompliance ? getUpcomingComplianceAlerts() : Promise.resolve(null),
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
      {/* Greeting & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#86868b]">
            Welcome back, {session.name || session.username}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight mt-0.5">
            Executive Overview
          </h1>
        </div>

        {/* Apple-Style Pill Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/quotations/create"
            className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-4 py-2 text-xs font-medium text-[#1d1d1f] shadow-xs hover:bg-[#fbfbfd] transition"
          >
            <PlusCircle className="h-3.5 w-3.5 text-[#0071e3]" /> New Quote
          </Link>
          <Link
            href="/admin/challans/create"
            className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-4 py-2 text-xs font-medium text-[#1d1d1f] shadow-xs hover:bg-[#fbfbfd] transition"
          >
            <Truck className="h-3.5 w-3.5 text-[#86868b]" /> New Challan
          </Link>
          <Link
            href="/admin/gst-returns"
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition"
          >
            <Download className="h-3.5 w-3.5 text-emerald-700" /> CA Return
          </Link>
          {canViewCompliance && (
            <Link
              href="/admin/important-dates"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium text-[#0071e3] hover:bg-blue-100 transition"
            >
              <CalendarClock className="h-3.5 w-3.5" /> Important Dates
            </Link>
          )}
          <Link
            href="/admin/invoices/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-4 py-2 text-xs font-medium text-white shadow-sm transition"
          >
            <Receipt className="h-3.5 w-3.5" /> Create Invoice
          </Link>
        </div>
      </div>

      {/* Statutory Compliance Alert Banner */}
      {complianceAlerts &&
        (!complianceAlerts.incorporationDateSet ||
          complianceAlerts.overdueCount > 0 ||
          complianceAlerts.dueSoonCount > 0) && (
          <div
            className={`rounded-3xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${
              complianceAlerts.overdueCount > 0
                ? "border-rose-200 bg-gradient-to-r from-rose-50/90 via-white to-amber-50/40"
                : complianceAlerts.dueSoonCount > 0
                ? "border-amber-200 bg-gradient-to-r from-amber-50/90 via-white to-white"
                : "border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-white"
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  complianceAlerts.overdueCount > 0
                    ? "bg-rose-100 text-rose-600"
                    : complianceAlerts.dueSoonCount > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-[#0071e3]"
                }`}
              >
                <CalendarClock className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[#1d1d1f]">
                    {!complianceAlerts.incorporationDateSet
                      ? "Set Company Incorporation Date for Auto-Compliance Calendar"
                      : complianceAlerts.overdueCount > 0
                      ? `${complianceAlerts.overdueCount} Overdue${
                          complianceAlerts.dueSoonCount > 0
                            ? ` & ${complianceAlerts.dueSoonCount} Due Soon`
                            : ""
                        } Statutory Compliances`
                      : `${complianceAlerts.dueSoonCount} Statutory Compliance${
                          complianceAlerts.dueSoonCount === 1 ? "" : "s"
                        } Due Within 15 Days`}
                  </span>
                </div>
                {!complianceAlerts.incorporationDateSet ? (
                  <p className="text-xs text-[#6e6e73]">
                    Enter your Incorporation Date &amp; GST scheme once to automatically track INC-20A, MCA/ROC, GST returns, TDS, and ITR-6 deadlines.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#424245]">
                    {complianceAlerts.topItems.slice(0, 3).map((item) => (
                      <span
                        key={item.key}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-black/[0.06] px-2.5 py-0.5 text-[11px]"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.urgency === "OVERDUE" ? "bg-rose-500" : "bg-amber-500"
                          }`}
                        />
                        <span className="font-semibold text-[#1d1d1f] truncate max-w-[190px]">
                          {item.title}
                        </span>
                        <span
                          className={`font-bold ${
                            item.urgency === "OVERDUE" ? "text-rose-600" : "text-amber-700"
                          }`}
                        >
                          {item.daysRemaining < 0
                            ? `${Math.abs(item.daysRemaining)}d overdue`
                            : item.daysRemaining === 0
                            ? "Today"
                            : `${item.daysRemaining}d left`}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/admin/important-dates"
              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shrink-0 transition ${
                complianceAlerts.overdueCount > 0
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : complianceAlerts.dueSoonCount > 0
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-[#0071e3] hover:bg-[#0077ed] text-white"
              }`}
            >
              <span>
                {complianceAlerts.incorporationDateSet
                  ? "Open Compliance Calendar"
                  : "Configure Now"}
              </span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

      {/* Apple-Style KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-xs text-[#86868b] font-medium">
            <span>Total Sales</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#0071e3]">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
            {formatINR(totalInvoiced)}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#86868b]">
            <span>Collected: {formatINR(totalCollected)}</span>
            <span className="font-semibold text-[#0071e3]">{invoices.length} Invoices</span>
          </div>
        </div>

        <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-xs text-[#86868b] font-medium">
            <span>Receivables</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-bold text-amber-600 tracking-tight">
            {formatINR(totalReceivables)}
          </p>
          <p className="mt-3 text-[11px] text-[#86868b]">
            Pending client UPI / NEFT settlements
          </p>
        </div>

        <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-xs text-[#86868b] font-medium">
            <span>GST ITC Available</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-700 tracking-tight">
            {formatINR(totalItc)}
          </p>
          <p className="mt-3 text-[11px] text-[#86868b]">
            From {purchases.length} vendor purchases
          </p>
        </div>

        <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-xs text-[#86868b] font-medium">
            <span>Net Margin</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`mt-3 text-2xl sm:text-3xl font-bold tracking-tight ${
              netProfit >= 0 ? "text-[#1d1d1f]" : "text-rose-600"
            }`}
          >
            {formatINR(netProfit)}
          </p>
          <p className="mt-3 text-[11px] text-[#86868b]">
            Sales minus purchases & expenses
          </p>
        </div>
      </div>

      {/* Status Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-4 text-xs flex items-center gap-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-[#1d1d1f] block">
              Low Stock ({lowStockProducts.length} items)
            </span>
            <p className="text-[#86868b] truncate mt-0.5">
              {lowStockProducts.length > 0
                ? lowStockProducts.map((p) => `${p.name} (${p.currentStock})`).join(", ")
                : "All hardware and tag stocks are healthy."}
            </p>
          </div>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-0.5 text-xs font-medium text-[#0071e3] hover:underline shrink-0"
          >
            <span>Stock</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-white p-4 text-xs flex items-center gap-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0071e3]">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-[#1d1d1f] block">
              Active AMC Contracts ({amcContracts.length})
            </span>
            <p className="text-[#86868b] truncate mt-0.5">
              Automated maintenance & renewal tracking active.
            </p>
          </div>
          <Link
            href="/admin/amc"
            className="inline-flex items-center gap-0.5 text-xs font-medium text-[#0071e3] hover:underline shrink-0"
          >
            <span>Manage</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Tables: Recent Invoices & Live Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Invoices */}
        <div className="lg:col-span-7 rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
            <div>
              <h3 className="text-base font-semibold text-[#1d1d1f]">Recent Tax Invoices</h3>
              <p className="text-xs text-[#86868b]">Latest outward GST billing</p>
            </div>
            <Link
              href="/admin/invoices"
              className="inline-flex items-center gap-0.5 text-xs font-medium text-[#0071e3] hover:underline"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-3 overflow-x-auto">
            {invoices.length === 0 ? (
              <p className="py-10 text-center text-xs text-[#86868b]">No invoices issued yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-[#86868b] font-medium border-b border-black/[0.06]">
                  <tr>
                    <th className="py-2.5">Invoice #</th>
                    <th className="py-2.5">Client</th>
                    <th className="py-2.5 text-right">Amount</th>
                    <th className="py-2.5 text-center">Status</th>
                    <th className="py-2.5 text-right">Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#f5f5f7]/60 transition">
                      <td className="py-3 font-mono font-semibold text-[#0071e3]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 text-[#1d1d1f] font-medium truncate max-w-[150px]">
                        {inv.customer.companyName}
                      </td>
                      <td className="py-3 text-right font-semibold text-[#1d1d1f]">
                        {formatINR(inv.totalAmount)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            inv.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700"
                              : inv.paymentStatus === "PARTIAL"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/portal/invoice/${inv.token}`}
                          target="_blank"
                          className="text-[11px] font-medium text-[#0071e3] hover:underline"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Live Website Enquiries */}
        <div className="lg:col-span-5 rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
            <div>
              <h3 className="text-base font-semibold text-[#1d1d1f]">Website Enquiries</h3>
              <p className="text-xs text-[#86868b]">Synced with {company.email} &amp; ERP App</p>
            </div>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-0.5 text-xs font-medium text-[#0071e3] hover:underline"
            >
              <span>All leads</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {leads.length === 0 ? (
              <p className="py-10 text-center text-xs text-[#86868b]">No enquiries received yet.</p>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-black/[0.05] bg-[#f5f5f7]/60 p-3.5 text-xs space-y-1 hover:bg-[#f5f5f7] transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#1d1d1f] truncate">{lead.name}</span>
                    <span className="text-[10px] font-medium text-[#0071e3] bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                      {lead.solution.replace("RFID_", "")}
                    </span>
                  </div>
                  <p className="text-[#424245] text-[11px] truncate">
                    {lead.company || lead.email}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#86868b] font-mono">
                    <span>{lead.phone}</span>
                    <span>{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}