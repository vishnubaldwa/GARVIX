import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeGst, HARYANA_STATE_CODE } from "@/lib/gst";
import { getSession } from "@/lib/auth";
import { sendTelegramQuotationAlert } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const { customerId, validUntilDays, terms, items } = await request.json();

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const session = await getSession();

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Sequence calculation
    const count = await prisma.quotation.count();
    const nextSeq = String(count + 1).padStart(3, "0");
    const quoteNumber = `GARVIX/QT/26-27/${nextSeq}`;

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

    // Telegram Push Alert
    sendTelegramQuotationAlert({
      quoteNumber,
      customerName: customer.companyName,
      totalAmount: grandTotal,
      itemCount: itemsData.length,
      portalUrl: `https://garvix.in/portal/quotation/${quotation.token}`,
    }).catch((e) => console.error("Telegram quotation alert failed:", e));

    return NextResponse.json({ success: true, quotation });
  } catch (err: any) {
    console.error("Create quotation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
