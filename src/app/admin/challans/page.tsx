import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminChallansPage() {
  const challans = await prisma.deliveryChallan.findMany({
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Delivery Challans</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch notes for demo reader kits (Returnable) and deployment installations (Non-Returnable) with serial numbers.
          </p>
        </div>

        <Link
          href="/admin/challans/create"
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <PlusCircle className="h-4 w-4" /> Issue Delivery Challan
        </Link>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Challan #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Challan Type</th>
                <th className="py-3 px-4">Dispatch Reason</th>
                <th className="py-3 px-4 font-mono">Transporter & Vehicle</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Items Dispatched</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {challans.map((ch) => (
                <tr key={ch.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-blue-600">
                    {ch.challanNumber}
                  </td>

                  <td className="py-3.5 px-4 font-sans font-medium text-slate-900">
                    {ch.customer.companyName}
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans">
                    <span
                      className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold ${
                        ch.challanType === "RETURNABLE"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {ch.challanType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-700">
                    {ch.reason.replace(/_/g, " ")}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                    <div>{ch.transporterName || "Self / Hand Delivered"}</div>
                    {ch.vehicleNumber && <div className="text-slate-500">{ch.vehicleNumber}</div>}
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans">
                    <span
                      className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase ${
                        ch.status === "RETURNED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : ch.status === "CONVERTED_TO_INVOICE"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {ch.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-sans">
                    <div className="font-bold text-slate-900 font-mono">
                      {ch.items.reduce((s, i) => s + i.quantity, 0)} Units
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                      {ch.items.map((i) => i.description).join(", ")}
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
