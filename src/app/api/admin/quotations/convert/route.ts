import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUpiUri } from "@/lib/upi";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { quotationId } = await request.json();
    if (!quotationId) {
      return NextResponse.json({ error: "Quotation ID required." }, { status: 400 });
    }

    const session = await getSession();

    const quote = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true, customer: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
    }

    // Generate sequence number
    const count = await prisma.invoice.count();
    const nextSeq = String(count + 1).padStart(3, "0");
    const invoiceNumber = `GARVIX/26-27/${nextSeq}`;

    // UPI QR URI
    const upiUri = buildUpiUri({
      upiId: process.env.NEXT_PUBLIC_UPI_ID || "garvix@upi",
      payeeName: process.env.NEXT_PUBLIC_UPI_NAME || "GARVIX TECHNOLOGIES",
      amount: quote.totalAmount,
      transactionRef: invoiceNumber.replace(/[^a-zA-Z0-9]/g, ""),
      note: `Invoice ${invoiceNumber}`,
    });

    // Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        invoiceType: "TAX_INVOICE",
        customerId: quote.customerId,
        quotationId: quote.id,
        invoiceDate: new Date(),
        subtotal: quote.subtotal,
        taxType: quote.taxType,
        cgstRate: quote.taxType === "INTRA_STATE" ? 9 : 0,
        cgstAmount: quote.cgstAmount,
        sgstRate: quote.taxType === "INTRA_STATE" ? 9 : 0,
        sgstAmount: quote.sgstAmount,
        igstRate: quote.taxType === "INTER_STATE" ? 18 : 0,
        igstAmount: quote.igstAmount,
        totalAmount: quote.totalAmount,
        balanceDue: quote.totalAmount,
        paymentStatus: "UNPAID",
        upiQrString: upiUri,
        terms: quote.terms,
        items: {
          create: quote.items.map((item) => ({
            productId: item.productId,
            description: item.description,
            hsnCode: item.hsnCode,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            totalAmount: item.totalAmount,
          })),
        },
      },
    });

    // Update Quotation status
    await prisma.quotation.update({
      where: { id: quote.id },
      data: { status: "CONVERTED" },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        username: session?.email || "admin@garvix.in",
        action: "CONVERT",
        entityType: "QUOTATION",
        entityId: quote.id,
        details: `Converted Quotation ${quote.quoteNumber} to Tax Invoice ${invoice.invoiceNumber} for ${quote.customer.companyName}`,
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (err: any) {
    console.error("Convert quotation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
