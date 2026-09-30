import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { ShoppingCart, ShieldCheck, Plus, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPurchasesPage() {
  const purchases = await prisma.purchase.findMany({
    include: { items: true },
    orderBy: { billDate: "desc" },
  });

  const totalPurchases = purchases.reduce((s, p) => s + p.totalAmount, 0);
  const totalItc = purchases
    .filter((p) => p.itcEligible)
    .reduce((s, p) => s + p.cgstAmount + p.sgstAmount + p.igstAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Purchases & Input Tax Credit (ITC)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Vendor hardware procurement bills and eligible ITC claimable against output GST liabilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-mono text-emerald-300">
            Eligible ITC: <span className="font-bold">{formatINR(totalItc)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d18] text-slate-400 font-semibold border-b border-slate-800 uppercase">
              <tr>
                <th className="py-3 px-4">Bill #</th>
                <th className="py-3 px-4">Vendor Name</th>
                <th className="py-3 px-4 font-mono">Vendor GSTIN & State</th>
                <th className="py-3 px-4 text-right">Taxable</th>
                <th className="py-3 px-4 text-right">Tax (GST)</th>
                <th className="py-3 px-4 text-right">Bill Total</th>
                <th className="py-3 px-4 text-center">ITC Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {purchases.map((p) => {
                const totalTax = p.cgstAmount + p.sgstAmount + p.igstAmount;
                return (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-cyan-400">{p.billNumber}</td>
                    <td className="py-3.5 px-4 font-sans font-medium text-white">{p.vendorName}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{p.vendorGstin || "Unregistered"}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{p.vendorState || "State not noted"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">{formatINR(p.subtotal)}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">{formatINR(totalTax)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white text-sm">{formatINR(p.totalAmount)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase">
                        <ShieldCheck className="h-3 w-3" /> Eligible ITC
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
