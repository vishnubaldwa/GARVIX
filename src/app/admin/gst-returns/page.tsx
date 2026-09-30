import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { Download, FileSpreadsheet, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminGstReturnsPage() {
  const [invoices, purchases] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        customer: true,
        items: true,
      },
      orderBy: { invoiceDate: "asc" },
    }),
    prisma.purchase.findMany({
      orderBy: { billDate: "asc" },
    }),
  ]);

  // Aggregate GST Figures
  const totalSalesTaxable = invoices.reduce((s, i) => s + i.subtotal, 0);
  const totalOutputCGST = invoices.reduce((s, i) => s + i.cgstAmount, 0);
  const totalOutputSGST = invoices.reduce((s, i) => s + i.sgstAmount, 0);
  const totalOutputIGST = invoices.reduce((s, i) => s + i.igstAmount, 0);
  const totalOutputTax = totalOutputCGST + totalOutputSGST + totalOutputIGST;

  const eligiblePurchases = purchases.filter((p) => p.itcEligible);
  const totalInputCGST = eligiblePurchases.reduce((s, p) => s + p.cgstAmount, 0);
  const totalInputSGST = eligiblePurchases.reduce((s, p) => s + p.sgstAmount, 0);
  const totalInputIGST = eligiblePurchases.reduce((s, p) => s + p.igstAmount, 0);
  const totalInputTax = totalInputCGST + totalInputSGST + totalInputIGST;

  const netPayableCGST = Math.max(0, totalOutputCGST - totalInputCGST);
  const netPayableSGST = Math.max(0, totalOutputSGST - totalInputSGST);
  const netPayableIGST = Math.max(0, totalOutputIGST - totalInputIGST);
  const netCashPayable = netPayableCGST + netPayableSGST + netPayableIGST;

  const b2bInvoices = invoices.filter((i) => i.customer.isB2B && i.customer.gstin);
  const b2cInvoices = invoices.filter((i) => !i.customer.isB2B || !i.customer.gstin);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-mono text-blue-700 mb-2">
            <span>State: Haryana (06) • GSTIN: 06AAACG1234F1Z5</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">One-Click GST Return Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Export standard government-ready GSTR-1 and GSTR-3B Excel workbooks for your Chartered Accountant (CA) with a single click.
          </p>
        </div>

        {/* 1-Click Export Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/admin/gst-export?type=gstr1"
            download
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Download className="h-4 w-4" /> Download GSTR-1 Excel (Multi-Sheet)
          </a>
          <a
            href="/api/admin/gst-export?type=gstr3b"
            download
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <FileSpreadsheet className="h-4 w-4" /> Download GSTR-3B Summary
          </a>
        </div>
      </div>

      {/* Tax Liability & ITC Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Output Tax (Sales) */}
        <div className="admin-card p-5">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            1. Total Output GST (Sales)
          </span>
          <p className="mt-2 text-2xl font-black text-blue-600 font-mono">
            {formatINR(totalOutputTax)}
          </p>
          <div className="mt-2 space-y-0.5 text-[11px] text-slate-600 font-mono">
            <div className="flex justify-between">
              <span>CGST (9%):</span> <span>{formatINR(totalOutputCGST)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (9%):</span> <span>{formatINR(totalOutputSGST)}</span>
            </div>
            <div className="flex justify-between">
              <span>IGST (18%):</span> <span>{formatINR(totalOutputIGST)}</span>
            </div>
          </div>
        </div>

        {/* Input Tax Credit (Purchases) */}
        <div className="admin-card p-5">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            2. Eligible Input Tax Credit (ITC)
          </span>
          <p className="mt-2 text-2xl font-black text-emerald-700 font-mono">
            {formatINR(totalInputTax)}
          </p>
          <div className="mt-2 space-y-0.5 text-[11px] text-slate-600 font-mono">
            <div className="flex justify-between">
              <span>ITC CGST:</span> <span>{formatINR(totalInputCGST)}</span>
            </div>
            <div className="flex justify-between">
              <span>ITC SGST:</span> <span>{formatINR(totalInputSGST)}</span>
            </div>
            <div className="flex justify-between">
              <span>ITC IGST:</span> <span>{formatINR(totalInputIGST)}</span>
            </div>
          </div>
        </div>

        {/* Net Cash Payable */}
        <div className="admin-card p-5">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            3. Net Cash Tax Payable
          </span>
          <p className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {formatINR(netCashPayable)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
            Net liability after adjusting available input credit from vendor hardware purchases.
          </p>
        </div>
      </div>

      {/* GSTR-1 Tables Preview */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          GSTR-1 Sheet Preview: B2B Supplies ({b2bInvoices.length} Invoices with GSTIN)
        </h3>

        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-4">Recipient GSTIN</th>
                  <th className="py-3 px-4">Receiver Name</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Place of Supply</th>
                  <th className="py-3 px-4 text-right">Taxable (₹)</th>
                  <th className="py-3 px-4 text-right">CGST</th>
                  <th className="py-3 px-4 text-right">SGST</th>
                  <th className="py-3 px-4 text-right">IGST</th>
                  <th className="py-3 px-4 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {b2bInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-blue-600">{inv.customer.gstin}</td>
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-900">{inv.customer.companyName}</td>
                    <td className="py-3.5 px-4 text-slate-700">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(inv.invoiceDate).toLocaleDateString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 font-sans font-medium">
                        {inv.customer.stateCode}-{inv.customer.state}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">{formatINR(inv.subtotal)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-600">{formatINR(inv.cgstAmount)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-600">{formatINR(inv.sgstAmount)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-600">{formatINR(inv.igstAmount)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatINR(inv.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
