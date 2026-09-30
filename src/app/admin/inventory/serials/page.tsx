import { prisma } from "@/lib/prisma";
import { ShieldCheck } from "lucide-react";
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Serial Number & IMEI Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end hardware lifecycle: inward vendor serials, demo challan dispatches, customer invoices, and warranty status.
          </p>
        </div>

        <Link
          href="/admin/inventory"
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          ← Back to Product Catalog
        </Link>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Serial / Barcode</th>
                <th className="py-3 px-4">IMEI / Chip ID</th>
                <th className="py-3 px-4">Device Model</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Assigned Document & Client</th>
                <th className="py-3 px-4 text-right">Warranty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {serials.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-blue-600 text-sm">
                    {item.serialNumber}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {item.imei || <span className="text-slate-400 font-sans italic">None</span>}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-900 font-medium">
                    {item.product.name}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase ${
                        item.status === "IN_STOCK"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : item.status === "DISPATCHED_CHALLAN"
                          ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                          : item.status === "SOLD_INVOICE"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-xs">
                    {item.invoice ? (
                      <div>
                        <span className="text-blue-600 font-bold font-mono">
                          Inv #{item.invoice.invoiceNumber}
                        </span>
                        <div className="text-slate-600 text-[11px]">
                          {item.invoice.customer.companyName}
                        </div>
                      </div>
                    ) : item.deliveryChallan ? (
                      <div>
                        <span className="text-indigo-600 font-bold font-mono">
                          Challan #{item.deliveryChallan.challanNumber}
                        </span>
                        <div className="text-slate-600 text-[11px]">
                          {item.deliveryChallan.customer.companyName}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Available in Gurugram Warehouse</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold font-sans">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 1-Yr Active Warranty
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
