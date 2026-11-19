import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_CREATE_QUOTATION")) ||
      (await hasPermission(session.role, "CAN_MANAGE_INVOICES")) ||
      (await hasPermission(session.role, "CAN_VIEW_FINANCES"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const quotations = await prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { companyName: true, phone: true, email: true },
        },
      },
      take: 100,
    });

    return NextResponse.json({
      quotations: quotations.map((q) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        token: q.token,
        customerName: q.customer.companyName,
        customerPhone: q.customer.phone,
        subtotal: q.subtotal,
        totalAmount: q.totalAmount,
        status: q.status,
        validUntil: q.validUntil,
        createdAt: q.createdAt,
        portalUrl: `https://garvix.in/portal/quotation/${q.token}`,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load quotations" }, { status: 500 });
  }
}
