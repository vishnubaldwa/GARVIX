import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { computeGst } from "@/lib/gst";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_CREATE_QUOTATION"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied. Quotation permission required." }, { status: 403 });
    }

    const { customerId, validUntilDays, terms, items } = await request.json();

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Safe sequence calculation (never collides even after deletions)
    const prefix = "GARVIX/QT/26-27/";
    const existingQuotes = await prisma.quotation.findMany({
      where: { quoteNumber: { startsWith: prefix } },
      select: { quoteNumber: true },
    });
    let maxSeq = 0;
    for (const q of existingQuotes) {
      const n = parseInt(q.quoteNumber.slice(prefix.length), 10);
      if (!Number.isNaN(n) && n > maxSeq) maxSeq = n;
    }
    const nextSeq = String(maxSeq + 1).padStart(3, "0");
    const quoteNumber = `${prefix}${nextSeq}`;

    // Subtotal and tax
    let subtotal = 0;
    const itemsData = items.map((it: any) => {
      const taxable = it.quantity * it.unitPrice;
      subtotal += taxable;
      const taxAmount = Math.round(((taxable * 18) / 100) * 100) / 100;
      return {
        productId: it.productId || null,
        description: it.description,
        hsnCode: it.hsnCode,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        taxRate: 18,
        taxAmount,
        totalAmount: taxable + taxAmount,
      };
    });

    const taxDetails = computeGst(subtotal, customer.stateCode, 18);
    const grandTotal = subtotal + taxDetails.totalTax;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (Number(validUntilDays) || 15));

    const quotation = await prisma.quotation.create({
      data: {
        quoteNumber,
        customerId,
        subtotal,
        taxType: taxDetails.taxType,
        cgstAmount: taxDetails.cgstAmount,
        sgstAmount: taxDetails.sgstAmount,
        igstAmount: taxDetails.igstAmount,
        totalAmount: grandTotal,
        status: "SENT",
        validUntil,
        terms,
        items: {
          create: itemsData,
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        username: session?.email || "admin@garvix.in",
        action: "CREATE",
        entityType: "QUOTATION",
        entityId: quotation.id,
        details: `Created Quotation ${quoteNumber} for ${customer.companyName} (INR ${grandTotal})`,
      },
    });

    revalidatePath("/admin", "layout");

    return NextResponse.json({ success: true, quotation });
  } catch (err: any) {
    console.error("Create quotation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
