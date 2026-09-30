import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeGst } from "@/lib/gst";
import { buildUpiUri } from "@/lib/upi";
import { getSession } from "@/lib/auth";
import { sendTelegramInvoiceAlert } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const {
      customerId,
      invoiceType,
      ewayBillNo,
      transporterId,
      transporterName,
      vehicleNo,
      lrNo,
      terms,
      items,
    } = await request.json();

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const session = await getSession();

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Generate sequence number
    const count = await prisma.invoice.count();
    const nextSeq = String(count + 1).padStart(3, "0");
    const invoiceNumber = `GARVIX/26-27/${nextSeq}`;

    // Line items and subtotal
    let subtotal = 0;
    const itemsData = items.map((it: any) => {
      const taxable = Number(it.quantity) * Number(it.unitPrice);
      subtotal += taxable;
      const taxAmount = Math.round(((taxable * 18) / 100) * 100) / 100;
      return {
        productId: it.productId || null,
        description: it.description,
        hsnCode: it.hsnCode || "8471",
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        taxRate: 18,
        taxAmount,
        totalAmount: taxable + taxAmount,
        serialNumbersList: it.serialNumbersList || null,
      };
    });

    const taxDetails = computeGst(subtotal, customer.stateCode, 18);
    const grandTotal = subtotal + taxDetails.totalTax;

    // Dynamic UPI QR URI
    const upiUri = buildUpiUri({
      upiId: process.env.NEXT_PUBLIC_UPI_ID || "garvix@upi",
      payeeName: process.env.NEXT_PUBLIC_UPI_NAME || "GARVIX TECHNOLOGIES",
      amount: grandTotal,
      transactionRef: invoiceNumber.replace(/[^a-zA-Z0-9]/g, ""),
      note: `Invoice ${invoiceNumber}`,
    });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        invoiceType: invoiceType || "TAX_INVOICE",
        customerId,
        invoiceDate: new Date(),
        subtotal,
        taxType: taxDetails.taxType,
        cgstRate: taxDetails.cgstRate,
        cgstAmount: taxDetails.cgstAmount,
        sgstRate: taxDetails.sgstRate,
        sgstAmount: taxDetails.sgstAmount,
        igstRate: taxDetails.igstRate,
        igstAmount: taxDetails.igstAmount,
        totalAmount: grandTotal,
        amountPaid: 0,
        balanceDue: grandTotal,
        paymentStatus: "UNPAID",
        upiQrString: upiUri,
        ewayBillNo: ewayBillNo?.trim() || null,
        transporterId: transporterId?.trim() || null,
        transporterName: transporterName?.trim() || null,
        vehicleNo: vehicleNo?.trim() || null,
        lrNo: lrNo?.trim() || null,
        terms: terms?.trim() || null,
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
        entityType: "INVOICE",
        entityId: invoice.id,
        details: `Issued Tax Invoice ${invoiceNumber} to ${customer.companyName} (INR ${grandTotal})`,
      },
    });

    // Telegram Push Alert
    sendTelegramInvoiceAlert({
      invoiceNumber,
      customerName: customer.companyName,
      subtotal,
      taxAmount: taxDetails.totalTax,
      totalAmount: grandTotal,
      portalUrl: `https://garvix.in/portal/invoice/${invoice.token}`,
    }).catch((e) => console.error("Telegram invoice alert failed:", e));

    return NextResponse.json({ success: true, invoice });
  } catch (err: any) {
    console.error("Create invoice error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
