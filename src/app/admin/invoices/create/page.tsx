import { prisma } from "@/lib/prisma";
import { InvoiceCreateForm } from "@/components/admin/InvoiceCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminCreateInvoicePage() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { companyName: "asc" },
      select: {
        id: true,
        companyName: true,
        state: true,
        stateCode: true,
        gstin: true,
      },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        hsnCode: true,
        sellingPrice: true,
      },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Generate Tax Invoice</h1>
        <p className="text-xs text-slate-400 mt-1">
          Issue GST-compliant tax invoices with automatic Dynamic UPI QR generation and E-Way bill recording.
        </p>
      </div>

      <InvoiceCreateForm customers={customers} products={products} />
    </div>
  );
}
