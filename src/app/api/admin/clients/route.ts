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
      (await hasPermission(session.role, "CAN_CREATE_CLIENT")) ||
      (await hasPermission(session.role, "CAN_CREATE_QUOTATION")) ||
      (await hasPermission(session.role, "CAN_MANAGE_INVOICES"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        invoices: {
          select: { totalAmount: true, balanceDue: true },
        },
        _count: {
          select: { invoices: true, quotations: true },
        },
      },
    });

    return NextResponse.json({
      clients: customers.map((c) => ({
        id: c.id,
        companyName: c.companyName,
        contactPerson: c.contactPerson,
        email: c.email,
        phone: c.phone,
        gstin: c.gstin,
        state: c.state,
        stateCode: c.stateCode,
        billingAddress: c.billingAddress,
        isB2B: c.isB2B,
        invoiceCount: c._count.invoices,
        quotationCount: c._count.quotations,
        totalBilled: c.invoices.reduce((sum, i) => sum + i.totalAmount, 0),
        totalDue: c.invoices.reduce((sum, i) => sum + i.balanceDue, 0),
        createdAt: c.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load clients" }, { status: 500 });
  }
}
