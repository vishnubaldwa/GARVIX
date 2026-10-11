import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUpiUri } from "@/lib/upi";
import { sendTelegramQuotationAcceptedAlert } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const { token, signature } = await request.json();

    if (!token || !signature) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { token },
      include: {
        customer: true,
        items: true,
        invoices: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
    }

    // 1. Mark Quotation as ACCEPTED
    const updated = await prisma.quotation.update({
      where: { token },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        acceptedSignature: signature.trim(),
      },
    });

    // 2. Check if a Proforma Invoice already exists for this quotation
    let proformaInvoice = quotation.invoices.find((i) => i.invoiceType === "PROFORMA_INVOICE");

    if (!proformaInvoice) {
      // Generate next PI sequence
      const piCount = await prisma.invoice.count({
        where: { invoiceType: "PROFORMA_INVOICE" },
      });
      const nextSeq = String(piCount + 1).padStart(3, "0");
      const invoiceNumber = `GARVIX/PI/26-27/${nextSeq}`;

      // Build UPI payment link
      const upiUri = buildUpiUri({
        upiId: process.env.NEXT_PUBLIC_UPI_ID || "garvix@upi",
        payeeName: process.env.NEXT_PUBLIC_UPI_NAME || "GARVIX SOFTWARE SOLUTIONS",
        amount: quotation.totalAmount,
        transactionRef: invoiceNumber.replace(/[^a-zA-Z0-9]/g, ""),
        note: `Advance for PI ${invoiceNumber}`,
      });

      proformaInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          invoiceType: "PROFORMA_INVOICE",
          customerId: quotation.customerId,
          quotationId: quotation.id,
          invoiceDate: new Date(),
          subtotal: quotation.subtotal,
          taxType: quotation.taxType,
          cgstRate: quotation.taxType === "INTRA_STATE" ? 9 : 0,
          cgstAmount: quotation.cgstAmount,
          sgstRate: quotation.taxType === "INTRA_STATE" ? 9 : 0,
          sgstAmount: quotation.sgstAmount,
          igstRate: quotation.taxType === "INTER_STATE" ? 18 : 0,
          igstAmount: quotation.igstAmount,
          totalAmount: quotation.totalAmount,
          balanceDue: quotation.totalAmount,
          paymentStatus: "UNPAID",
          upiQrString: upiUri,
          terms: quotation.terms,
          items: {
            create: quotation.items.map((item) => ({
              productId: item.productId,
              description: item.description,
              hsnCode: item.hsnCode,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              totalAmount: item.totalAmount,
            })),
          },
        },
      });
    }

    // 3. Record Audit Log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "QUOTATION",
        entityId: quotation.id,
        details: `Quotation ${quotation.quoteNumber} approved by ${signature.trim()} (${quotation.customer.companyName}). Auto Proforma Invoice ${proformaInvoice.invoiceNumber} created.`,
      },
    });

    const SITE_URL = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://garvix.in";
    const piUrl = `${SITE_URL}/portal/invoice/${proformaInvoice.token}`;

    // 4. Push Telegram Alert with instant PI link and WhatsApp action
    sendTelegramQuotationAcceptedAlert({
      quoteNumber: quotation.quoteNumber,
      customerName: quotation.customer.companyName,
      totalAmount: quotation.totalAmount,
      signature: signature.trim(),
      piNumber: proformaInvoice.invoiceNumber,
      piUrl,
      customerPhone: quotation.customer.phone,
    }).catch((e) => console.error("Telegram quote accepted alert failed:", e));

    return NextResponse.json({
      success: true,
      quotation: updated,
      proformaInvoice,
      piToken: proformaInvoice.token,
    });
  } catch (err: any) {
    console.error("Accept quotation error:", err);
    return NextResponse.json({ error: "Failed to record approval." }, { status: 500 });
  }
}
