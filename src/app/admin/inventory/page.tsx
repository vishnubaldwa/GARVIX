import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { AlertTriangle, Barcode } from "lucide-react";
import Link from "next/link";
import { ProductCreateModal } from "@/components/admin/ProductCreateModal";

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hardware & Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            RFID readers, antennas, tags, and software development service masters with HSN codes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory/serials"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
          >
            <Barcode className="h-4 w-4 text-blue-600" /> Serial / IMEI Tracker
          </Link>
          <ProductCreateModal />
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
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
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const isLowStock =
                  product.category.startsWith("HARDWARE") &&
                  product.currentStock <= product.minStockAlert;

                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {product.sku}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{product.name}</div>
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600 mt-0.5">
                        {product.category.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                      {product.hsnCode}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {formatINR(product.purchasePrice)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatINR(product.sellingPrice)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono font-bold text-xs">
                        <span className={isLowStock ? "text-amber-700" : "text-emerald-700"}>
                          {product.currentStock} {product.unit}
                        </span>
                        {isLowStock && (
                          <span title="Low stock">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] text-blue-700 font-bold">
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
