import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SuperAdminDeleteButton } from "@/components/admin/SuperAdminDeleteButton";
import { SerialCreateModalButton } from "@/components/admin/SerialCreateModal";

export const dynamic = "force-dynamic";

export default async function AdminSerialsPage() {
  const [session, serials, products] = await Promise.all([
    getSession(),
    prisma.serialNumber.findMany({
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
    }),
    prisma.product.findMany({
      select: { id: true, name: true, sku: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const isSuperAdmin = isFullAdminRole(session?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Serial Number &amp; IMEI Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end hardware lifecycle: inward vendor serials, demo challan dispatches, customer invoices, and warranty status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/inventory"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            ← Back to Product Catalog
          </Link>
          <SerialCreateModalButton products={products} />
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Serial / Barcode</th>
                <th className="py-3 px-4 whitespace-nowrap">IMEI / Chip ID</th>
                <th className="py-3 px-4">Device Model</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4">Assigned Document &amp; Client</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Warranty</th>
                {isSuperAdmin && <th className="py-3 px-4 text-right whitespace-nowrap">Delete</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {serials.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 7 : 6}
                    className="py-10 text-center font-sans text-slate-400"
                  >
                    No hardware serials registered yet. Click &ldquo;Add Serial / IMEI&rdquo; above to add stock units.
                  </td>
                </tr>
              ) : (
                serials.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-blue-600 text-sm whitespace-nowrap">
                      {item.serialNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {item.imei || <span className="text-slate-400 font-sans italic">None</span>}
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-900 font-medium">
                      {item.product.name}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
                        <span className="text-slate-400 italic">Available in Warehouse</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold font-sans">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        {item.warrantyExpiry
                          ? `Till ${new Date(item.warrantyExpiry).toLocaleDateString("en-IN")}`
                          : "Active Warranty"}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="py-3.5 px-4 text-right font-sans whitespace-nowrap">
                        <SuperAdminDeleteButton
                          entity="serial"
                          id={item.id}
                          label={`serial ${item.serialNumber}`}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
