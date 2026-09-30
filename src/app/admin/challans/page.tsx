import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Truck, PlusCircle, CheckCircle2, RotateCcw } from "lucide-react";

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
          <h1 className="text-2xl font-black text-white tracking-tight">Delivery Challans</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch documents for demo reader kits (Returnable) and deployment installations (Non-Returnable) with serial numbers.
          </p>
        </div>

        <Link
          href="/admin/challans/create"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-xs font-bold text-black shadow-md hover:opacity-90 transition"
        >
          <PlusCircle className="h-4 w-4" /> Issue Delivery Challan
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d18] text-slate-400 font-semibold border-b border-slate-800 uppercase">
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
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {challans.map((ch) => (
                <tr key={ch.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-cyan-400">
                    {ch.challanNumber}
                  </td>

                  <td className="py-3.5 px-4 font-sans font-medium text-white">
                    {ch.customer.companyName}
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        ch.challanType === "RETURNABLE"
                          ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                          : "bg-blue-950 text-blue-300 border border-blue-500/40"
                      }`}
                    >
                      {ch.challanType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-300">
                    {ch.reason.replace(/_/g, " ")}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                    <div>{ch.transporterName || "Self / Hand Delivered"}</div>
                    {ch.vehicleNumber && <div className="text-slate-400">{ch.vehicleNumber}</div>}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block rounded px-2.5 py-1 text-[10px] font-bold uppercase ${
                        ch.status === "RETURNED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                          : ch.status === "CONVERTED_TO_INVOICE"
                          ? "bg-purple-950 text-purple-300 border border-purple-500/40"
                          : "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                      }`}
                    >
                      {ch.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-sans">
                    <div className="font-bold text-white font-mono">
                      {ch.items.reduce((s, i) => s + i.quantity, 0)} Units
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {ch.items.map((i) => i.description).join(", ").slice(0, 40)}...
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
