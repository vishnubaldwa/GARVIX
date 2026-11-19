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
    const allowed = await hasPermission(session.role, "CAN_VIEW_FINANCES");
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const purchases = await prisma.purchase.findMany({
      include: { items: true },
      orderBy: { billDate: "desc" },
      take: 150,
    });

    const totalPurchases = purchases.reduce((s, p) => s + p.totalAmount, 0);
    const totalItc = purchases
      .filter((p) => p.itcEligible)
      .reduce((s, p) => s + p.cgstAmount + p.sgstAmount + p.igstAmount, 0);

    return NextResponse.json({
      totalPurchases,
      totalItc,
      purchases: purchases.map((p) => ({
        id: p.id,
        billNumber: p.billNumber,
        vendorName: p.vendorName,
        vendorGstin: p.vendorGstin,
        vendorState: p.vendorState,
        billDate: p.billDate,
        subtotal: p.subtotal,
        cgstAmount: p.cgstAmount,
        sgstAmount: p.sgstAmount,
        igstAmount: p.igstAmount,
        totalTax: p.cgstAmount + p.sgstAmount + p.igstAmount,
        totalAmount: p.totalAmount,
        itcEligible: p.itcEligible,
        itcStatus: p.itcStatus,
        paymentStatus: p.paymentStatus,
        itemCount: p.items.length,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load purchases" },
      { status: 500 }
    );
  }
}
