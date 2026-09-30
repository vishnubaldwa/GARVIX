import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { Package, AlertTriangle, Plus, Barcode, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      serialNumbers: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Hardware & Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            RFID readers, antennas, tags, and custom software service masters with HSN codes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory/serials"
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
          >
            <Barcode className="h-4 w-4" /> Serial / IMEI Tracker
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d18] text-slate-400 font-semibold border-b border-slate-800 uppercase">
              <tr>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Item Name & Category</th>
                <th className="py-3 px-4 text-center">HSN Code</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Stock In Hand</th>
                <th className="py-3 px-4 text-center">Serial Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {products.map((product) => {
                const isLowStock =
                  product.category.startsWith("HARDWARE") &&
                  product.currentStock <= product.minStockAlert;

                return (
                  <tr key={product.id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {product.sku}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{product.name}</div>
                      <span className="inline-block rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-400 mt-0.5">
                        {product.category.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-300">
                      {product.hsnCode}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                      {formatINR(product.purchasePrice)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatINR(product.sellingPrice)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono font-bold text-xs">
                        <span className={isLowStock ? "text-amber-400" : "text-emerald-400"}>
                          {product.currentStock} {product.unit}
                        </span>
                        {isLowStock && (
                          <span title="Low stock">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="rounded bg-cyan-950/60 border border-cyan-500/20 px-2.5 py-1 text-[11px] text-cyan-300 font-bold">
                        {product.serialNumbers.length} Tagged
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
