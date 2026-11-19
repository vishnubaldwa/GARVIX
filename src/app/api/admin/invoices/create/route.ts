import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { computeGst } from "@/lib/gst";
import { buildUpiUri } from "@/lib/upi";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";
import { getCompanySettings } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_MANAGE_INVOICES"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied. Invoice management permission required." }, { status: 403 });
    }

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

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Safe sequence number generation (never collides after deletions)
    const isProforma = invoiceType === "PROFORMA_INVOICE";
    const prefix = isProforma ? "GARVIX/PI/26-27/" : "GARVIX/26-27/";
    const existingInvoices = await prisma.invoice.findMany({
      where: { invoiceNumber: { startsWith: prefix } },
      select: { invoiceNumber: true },
    });
    let maxSeq = 0;
    for (const inv of existingInvoices) {
      const n = parseInt(inv.invoiceNumber.slice(prefix.length), 10);
      if (!Number.isNaN(n) && n > maxSeq) maxSeq = n;
    }
    const nextSeq = String(maxSeq + 1).padStart(3, "0");
    const invoiceNumber = `${prefix}${nextSeq}`;

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

    // Dynamic UPI QR URI from live Company Settings
    const companySettings = await getCompanySettings();
    const upiUri = buildUpiUri({
      upiId: companySettings.upiId || process.env.NEXT_PUBLIC_UPI_ID || "garvix@upi",
      payeeName: companySettings.upiName || companySettings.name || "GARVIX TECHNOLOGIES",
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

    revalidatePath("/admin", "layout");

    return NextResponse.json({ success: true, invoice });
  } catch (err: any) {
    console.error("Create invoice error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
