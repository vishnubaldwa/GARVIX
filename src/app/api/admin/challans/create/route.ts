import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const {
      customerId,
      challanType,
      reason,
      transporterName,
      vehicleNumber,
      notes,
      items,
    } = await request.json();

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const session = await getSession();

    const count = await prisma.deliveryChallan.count();
    const nextSeq = String(count + 1).padStart(3, "0");
    const challanNumber = `GARVIX/DC/26-27/${nextSeq}`;

    const challan = await prisma.deliveryChallan.create({
      data: {
        challanNumber,
        customerId,
        challanType,
        reason,
        transporterName,
        vehicleNumber,
        notes,
        status: "OPEN",
        items: {
          create: items.map((it: any) => ({
            productId: it.productId || null,
            description: it.description,
            hsnCode: it.hsnCode || "8471",
            quantity: Number(it.quantity) || 1,
            serialNumbersList: it.serialNumbersList || null,
          })),
        },
      },
      include: { customer: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        username: session?.email || "admin@garvix.in",
        action: "CREATE",
        entityType: "CHALLAN",
        entityId: challan.id,
        details: `Issued Delivery Challan ${challanNumber} (${challanType}) to ${challan.customer.companyName}`,
      },
    });

    return NextResponse.json({ success: true, challan });
  } catch (err: any) {
    console.error("Create challan error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
