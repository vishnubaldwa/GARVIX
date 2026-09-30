import { prisma } from "@/lib/prisma";
import { Barcode, Search, CheckCircle2, Truck, Receipt, Wrench, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSerialsPage() {
  const serials = await prisma.serialNumber.findMany({
    include: {
      product: true,
      deliveryChallan: {
        include: { customer: true },
      },
      invoice: {
        include: { customer: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Serial Number & IMEI Tracking</h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end hardware lifecycle: inward vendor serials, demo challan dispatches, customer invoices, and warranty status.
          </p>
        </div>

        <Link
          href="/admin/inventory"
          className="text-xs text-cyan-400 hover:underline"
        >
          ← Back to Product Catalog
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d18] text-slate-400 font-semibold border-b border-slate-800 uppercase">
              <tr>
                <th className="py-3 px-4">Serial / Barcode</th>
                <th className="py-3 px-4">IMEI / Chip ID</th>
                <th className="py-3 px-4">Device Model</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Assigned Document & Client</th>
                <th className="py-3 px-4 text-right">Warranty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {serials.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-cyan-400 text-sm">
                    {item.serialNumber}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {item.imei || <span className="text-slate-500 font-sans italic">None</span>}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-white font-medium">
                    {item.product.name}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block rounded px-2.5 py-1 text-[10px] font-bold uppercase ${
                        item.status === "IN_STOCK"
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                          : item.status === "DISPATCHED_CHALLAN"
                          ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/30"
                          : item.status === "SOLD_INVOICE"
                          ? "bg-blue-950/80 text-blue-300 border border-blue-500/30"
                          : "bg-amber-950/80 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-xs">
                    {item.invoice ? (
                      <div>
                        <span className="text-blue-400 font-bold font-mono">
                          Inv #{item.invoice.invoiceNumber}
                        </span>
                        <div className="text-slate-300 text-[11px]">
                          {item.invoice.customer.companyName}
                        </div>
                      </div>
                    ) : item.deliveryChallan ? (
                      <div>
                        <span className="text-cyan-400 font-bold font-mono">
                          Challan #{item.deliveryChallan.challanNumber}
                        </span>
                        <div className="text-slate-300 text-[11px]">
                          {item.deliveryChallan.customer.companyName}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Available in Gurugram Warehouse</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" /> 1-Yr Active Warranty
                    </span>
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
