import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      (await hasPermission(session.role, "CAN_CREATE_PRODUCT")) ||
      (await hasPermission(session.role, "CAN_CREATE_QUOTATION")) ||
      (await hasPermission(session.role, "CAN_MANAGE_INVOICES")) ||
      (await hasPermission(session.role, "CAN_VIEW_SERVICE"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { serialNumbers: true } },
      },
    });

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        hsnCode: p.hsnCode,
        description: p.description,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        unit: p.unit,
        currentStock: p.currentStock,
        minStockAlert: p.minStockAlert,
        serialCount: p._count.serialNumbers,
        createdAt: p.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load products" },
      { status: 500 }
    );
  }
}
