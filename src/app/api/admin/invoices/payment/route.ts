import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendTelegramPaymentAlert } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const { invoiceId, amount, paymentMode, referenceNumber, notes } = await request.json();

    if (!invoiceId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment parameters." }, { status: 400 });
    }

    const session = await getSession();

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    const paymentAmount = Number(amount);
    const newAmountPaid = invoice.amountPaid + paymentAmount;
    const newBalanceDue = Math.max(0, invoice.totalAmount - newAmountPaid);
    const newStatus = newBalanceDue <= 0 ? "PAID" : "PARTIAL";

    // Create payment entry
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: paymentAmount,
        paymentMode,
        referenceNumber,
        notes,
      },
    });

    // Update invoice
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        paymentStatus: newStatus,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        username: session?.email || "admin@garvix.in",
        action: "UPDATE",
        entityType: "PAYMENT",
        entityId: payment.id,
        details: `Recorded ${paymentMode} payment of INR ${paymentAmount} for Invoice ${invoice.invoiceNumber}. New Status: ${newStatus}`,
      },
    });

    // Telegram Push Alert
    sendTelegramPaymentAlert({
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customer.companyName,
      amountReceived: paymentAmount,
      paymentMode,
      referenceNumber,
      balanceDue: newBalanceDue,
    }).catch((e) => console.error("Telegram payment alert failed:", e));

    return NextResponse.json({ success: true, payment });
  } catch (err: any) {
    console.error("Payment recording error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
