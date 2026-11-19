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
      (await hasPermission(session.role, "CAN_VIEW_FINANCES"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { companyName: true, phone: true, email: true, gstin: true },
        },
      },
      take: 100,
    });

    return NextResponse.json({
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        token: inv.token,
        type: inv.invoiceType,
        customerName: inv.customer.companyName,
        customerPhone: inv.customer.phone,
        subtotal: inv.subtotal,
        cgstAmount: inv.cgstAmount,
        sgstAmount: inv.sgstAmount,
        igstAmount: inv.igstAmount,
        totalAmount: inv.totalAmount,
        amountPaid: inv.amountPaid,
        balanceDue: inv.balanceDue,
        paymentStatus: inv.paymentStatus,
        createdAt: inv.createdAt,
        portalUrl: `https://garvix.in/portal/invoice/${inv.token}`,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load invoices" }, { status: 500 });
  }
}
