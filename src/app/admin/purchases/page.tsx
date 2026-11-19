import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";
import { ShieldCheck } from "lucide-react";
import { SuperAdminDeleteButton } from "@/components/admin/SuperAdminDeleteButton";
import { PurchaseCreateModalButton } from "@/components/admin/PurchaseCreateModal";

export const dynamic = "force-dynamic";

export default async function AdminPurchasesPage() {
  const [session, purchases] = await Promise.all([
    getSession(),
    prisma.purchase.findMany({
      include: { items: true },
      orderBy: { billDate: "desc" },
    }),
  ]);
  const isSuperAdmin = isFullAdminRole(session?.role);

  const totalPurchases = purchases.reduce((s, p) => s + p.totalAmount, 0);
  const totalItc = purchases
    .filter((p) => p.itcEligible)
    .reduce((s, p) => s + p.cgstAmount + p.sgstAmount + p.igstAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchases &amp; Input Tax Credit (ITC)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Vendor hardware procurement bills and eligible ITC claimable against output GST liabilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-mono text-slate-800">
            Total: <span className="font-bold">{formatINR(totalPurchases)}</span>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-mono text-emerald-800">
            Eligible ITC: <span className="font-bold">{formatINR(totalItc)}</span>
          </div>
          <PurchaseCreateModalButton />
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Bill # &amp; Date</th>
                <th className="py-3 px-4">Vendor Name</th>
                <th className="py-3 px-4 font-mono">Vendor GSTIN &amp; State</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Taxable</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Tax (GST)</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Bill Total</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">ITC Status</th>
                {isSuperAdmin && <th className="py-3 px-4 text-right whitespace-nowrap">Delete</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 8 : 7}
                    className="py-10 text-center font-sans text-slate-400"
                  >
                    No vendor purchase bills recorded yet. Click &ldquo;Add Purchase Bill&rdquo; above to log one.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => {
                  const totalTax = p.cgstAmount + p.sgstAmount + p.igstAmount;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-blue-600">{p.billNumber}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(p.billDate).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-900">{p.vendorName}</div>
                        {p.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{p.notes}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div>{p.vendorGstin || "Unregistered"}</div>
                        <div className="text-[11px] text-slate-500 font-sans">
                          {p.vendorState || "State not noted"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 whitespace-nowrap">
                        {formatINR(p.subtotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-700 font-bold whitespace-nowrap">
                        {formatINR(totalTax)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                        {formatINR(p.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {p.itcEligible ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                            <ShieldCheck className="h-3 w-3" /> Eligible ITC
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                            Ineligible
                          </span>
                        )}
                      </td>
                      {isSuperAdmin && (
                        <td className="py-3.5 px-4 text-right font-sans whitespace-nowrap">
                          <SuperAdminDeleteButton
                            entity="purchase"
                            id={p.id}
                            label={`purchase bill #${p.billNumber}`}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
