import { prisma } from "@/lib/prisma";
import { QuotationCreateForm } from "@/components/admin/QuotationCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminCreateQuotationPage() {
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
        <h1 className="text-2xl font-black text-white tracking-tight">Create Quotation / Proposal</h1>
        <p className="text-xs text-slate-400 mt-1">
          Auto-applies Haryana intra-state (CGST+SGST) vs inter-state (IGST) tax schedules.
        </p>
      </div>

      <QuotationCreateForm customers={customers} products={products} />
    </div>
  );
}
