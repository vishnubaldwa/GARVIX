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
      (await hasPermission(session.role, "CAN_MANAGE_INVOICES")) ||
      (await hasPermission(session.role, "CAN_CREATE_PRODUCT")) ||
      (await hasPermission(session.role, "CAN_VIEW_SERVICE"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const challans = await prisma.deliveryChallan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { companyName: true, phone: true, state: true },
        },
        items: true,
      },
      take: 100,
    });

    return NextResponse.json({
      challans: challans.map((c) => ({
        id: c.id,
        challanNumber: c.challanNumber,
        customerId: c.customerId,
        customerName: c.customer.companyName,
        customerPhone: c.customer.phone,
        challanType: c.challanType,
        reason: c.reason,
        transporterName: c.transporterName,
        vehicleNumber: c.vehicleNumber,
        status: c.status,
        notes: c.notes,
        dispatchDate: c.dispatchDate,
        itemCount: c.items.length,
        totalQuantity: c.items.reduce((sum, i) => sum + i.quantity, 0),
        items: c.items.map((it) => ({
          id: it.id,
          description: it.description,
          hsnCode: it.hsnCode,
          quantity: it.quantity,
          serialNumbersList: it.serialNumbersList,
        })),
        createdAt: c.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load delivery challans" },
      { status: 500 }
    );
  }
}
