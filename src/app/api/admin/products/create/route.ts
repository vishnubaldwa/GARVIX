import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const {
      name,
      sku,
      category,
      hsnCode,
      description,
      purchasePrice,
      sellingPrice,
      unit,
      currentStock,
      minStockAlert,
    } = await request.json();

    if (!name?.trim() || !sku?.trim() || !category || !hsnCode?.trim()) {
      return NextResponse.json(
        { error: "Item Name, SKU, Category, and HSN/SAC Code are required." },
        { status: 400 }
      );
    }

    const session = await getSession();

    // Check SKU unique
    const existing = await prisma.product.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `SKU code '${sku.trim().toUpperCase()}' is already assigned to another item.` },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        hsnCode: hsnCode.trim(),
        description: description?.trim() || null,
        purchasePrice: Number(purchasePrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        unit: unit?.trim() || "PCS",
        currentStock: Number(currentStock) || 0,
        minStockAlert: Number(minStockAlert) || 5,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        username: session?.email || "admin@garvix.in",
        action: "CREATE",
        entityType: "PRODUCT",
        entityId: product.id,
        details: `Created new item: ${product.name} (SKU: ${product.sku}, HSN: ${product.hsnCode})`,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: err.message || "Failed to create product." }, { status: 500 });
  }
}
