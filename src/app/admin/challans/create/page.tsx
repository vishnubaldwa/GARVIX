import { prisma } from "@/lib/prisma";
import { ChallanCreateForm } from "@/components/admin/ChallanCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminCreateChallanPage() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { companyName: "asc" },
      select: {
        id: true,
        companyName: true,
        state: true,
        stateCode: true,
      },
    }),
    prisma.product.findMany({
      where: {
        category: { startsWith: "HARDWARE" },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        hsnCode: true,
        currentStock: true,
      },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Issue Delivery Challan</h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate Returnable (demo kit) or Non-Returnable (deployment) dispatch note with serial numbers.
        </p>
      </div>

      <ChallanCreateForm customers={customers} products={products} />
    </div>
  );
}
