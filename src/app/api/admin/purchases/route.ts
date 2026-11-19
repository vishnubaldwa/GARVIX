import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function parseDateSafe(raw?: string | null): Date {
  if (!raw || !raw.trim()) return new Date();
  const trimmed = raw.trim();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? new Date(`${trimmed}T12:00:00.000Z`)
    : new Date(trimmed);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_VIEW_FINANCES"));
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
        notes: p.notes,
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

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_VIEW_FINANCES"));
    if (!allowed) {
      return NextResponse.json(
        { error: "Access denied. Finance permission required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const billNumber = String(body.billNumber || "").trim();
    const vendorName = String(body.vendorName || "").trim();
    const vendorGstin =
      typeof body.vendorGstin === "string" && body.vendorGstin.trim()
        ? body.vendorGstin.trim().toUpperCase()
        : null;
    const vendorState =
      typeof body.vendorState === "string" && body.vendorState.trim()
        ? body.vendorState.trim()
        : null;
    const billDate = parseDateSafe(body.billDate);
    const subtotal = Number(body.subtotal || 0);
    const taxRate = body.taxRate !== undefined ? Number(body.taxRate) : 18;
    const itcEligible = body.itcEligible !== false;
    const paymentStatus = String(body.paymentStatus || "PAID").trim();
    const notes =
      typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;

    if (!billNumber || !vendorName || Number.isNaN(subtotal) || subtotal <= 0) {
      return NextResponse.json(
        { error: "Bill Number, Vendor Name, and valid Taxable Subtotal are required." },
        { status: 400 }
      );
    }

    // Determine Intra-state (Haryana - 06) vs Inter-state
    let isIntra = false;
    if (body.gstType === "INTRA_STATE") {
      isIntra = true;
    } else if (body.gstType === "INTER_STATE") {
      isIntra = false;
    } else if (vendorGstin && vendorGstin.startsWith("06")) {
      isIntra = true;
    } else if (vendorState && vendorState.toLowerCase().includes("haryana")) {
      isIntra = true;
    }

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (
      body.cgstAmount !== undefined ||
      body.sgstAmount !== undefined ||
      body.igstAmount !== undefined
    ) {
      cgstAmount = Number(body.cgstAmount || 0);
      sgstAmount = Number(body.sgstAmount || 0);
      igstAmount = Number(body.igstAmount || 0);
    } else {
      const totalTax = Math.round(((subtotal * (Number.isNaN(taxRate) ? 18 : taxRate)) / 100) * 100) / 100;
      if (isIntra) {
        cgstAmount = Math.round((totalTax / 2) * 100) / 100;
        sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
      } else {
        igstAmount = totalTax;
      }
    }

    const totalAmount = Math.round((subtotal + cgstAmount + sgstAmount + igstAmount) * 100) / 100;

    const purchase = await prisma.purchase.create({
      data: {
        billNumber,
        vendorName,
        vendorGstin,
        vendorState,
        billDate,
        subtotal,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalAmount,
        itcEligible,
        itcStatus: itcEligible ? "CLAIMED" : "INELIGIBLE",
        paymentStatus,
        notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "CREATE",
        entityType: "PURCHASE",
        entityId: purchase.id,
        details: `Recorded Vendor Purchase #${billNumber} from ${vendorName} (INR ${totalAmount}, ITC: ${itcEligible ? "Eligible" : "Ineligible"})`,
      },
    });

    revalidatePath("/admin", "layout");
    return NextResponse.json({ success: true, purchase });
  } catch (err: any) {
    console.error("Purchase create error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save purchase bill." },
      { status: 500 }
    );
  }
}
