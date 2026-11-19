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
      (await hasPermission(session.role, "CAN_VIEW_SERVICE"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const serials = await prisma.serialNumber.findMany({
      include: {
        product: { select: { name: true, sku: true } },
        deliveryChallan: {
          select: {
            challanNumber: true,
            customer: { select: { companyName: true } },
          },
        },
        invoice: {
          select: {
            invoiceNumber: true,
            customer: { select: { companyName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({
      serials: serials.map((s) => ({
        id: s.id,
        serialNumber: s.serialNumber,
        imei: s.imei,
        productName: s.product.name,
        productSku: s.product.sku,
        status: s.status,
        assignedDoc: s.invoice
          ? `Inv #${s.invoice.invoiceNumber}`
          : s.deliveryChallan
          ? `Challan #${s.deliveryChallan.challanNumber}`
          : null,
        assignedClient: s.invoice
          ? s.invoice.customer.companyName
          : s.deliveryChallan
          ? s.deliveryChallan.customer.companyName
          : null,
        warrantyExpiry: s.warrantyExpiry,
        notes: s.notes,
        createdAt: s.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load serials" },
      { status: 500 }
    );
  }
}
