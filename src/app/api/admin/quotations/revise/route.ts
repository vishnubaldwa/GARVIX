import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { HARYANA_STATE_CODE } from "@/lib/gst";
import { sendTelegramReply } from "@/lib/telegram";
import { buildWhatsAppLink, getQuotationWhatsAppText } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const { quotationId, items, reason } = await request.json();

    if (!quotationId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Quotation ID and at least one item required." }, { status: 400 });
    }

    const session = await getSession();

    const quote = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
    }

    if (quote.status === "CONVERTED") {
      return NextResponse.json(
        { error: "Cannot revise a quotation that has already been converted to an invoice." },
        { status: 400 }
      );
    }

    // 1. Calculate new totals
    let subtotal = 0;
    const isIntraState = (quote.customer.stateCode || HARYANA_STATE_CODE) === HARYANA_STATE_CODE;

    const validatedItems = items.map((it: any) => {
      const qty = Number(it.quantity) || 1;
      const price = Number(it.unitPrice) || 0;
      const lineTotal = qty * price;
      subtotal += lineTotal;
      return {
        productId: it.productId || null,
        description: it.description || "Item",
        hsnCode: it.hsnCode || "8471",
        quantity: qty,
        unitPrice: price,
        discountPercent: Number(it.discountPercent) || 0,
        taxRate: 18,
        taxAmount: lineTotal * 0.18,
        totalAmount: lineTotal * 1.18,
      };
    });

    const taxAmount = subtotal * 0.18;
    const cgstAmount = isIntraState ? taxAmount / 2 : 0;
    const sgstAmount = isIntraState ? taxAmount / 2 : 0;
    const igstAmount = isIntraState ? 0 : taxAmount;
    const totalAmount = subtotal + taxAmount;

    // 2. Parse existing revision history from quote.notes
    let existingMeta: any = { rev: 1, history: [] };
    try {
      if (quote.notes && quote.notes.startsWith("{")) {
        existingMeta = JSON.parse(quote.notes);
      }
    } catch {}

    const currentRev = Number(existingMeta.rev) || 1;
    const newRev = currentRev + 1;

    const historyEntry = {
      rev: currentRev,
      subtotal: quote.subtotal,
      totalAmount: quote.totalAmount,
      date: new Date().toISOString(),
      revisedBy: session?.email || "admin@garvix.in",
      reason: reason?.trim() || "Rate revision requested by client",
    };

    const updatedMeta = {
      rev: newRev,
      history: [...(existingMeta.history || []), historyEntry],
    };

    // 3. Delete old items and re-create updated items in transaction
    await prisma.$transaction(async (tx) => {
      await tx.quotationItem.deleteMany({
        where: { quotationId: quote.id },
      });

      await tx.quotation.update({
        where: { id: quote.id },
        data: {
          subtotal,
          cgstAmount,
          sgstAmount,
          igstAmount,
          totalAmount,
          notes: JSON.stringify(updatedMeta),
          items: {
            create: validatedItems,
          },
        },
      });
    });

    // 4. Record Audit Log
    await prisma.auditLog.create({
      data: {
        username: session?.email || "admin@garvix.in",
        action: "UPDATE",
        entityType: "QUOTATION",
        entityId: quote.id,
        details: `Quotation ${quote.quoteNumber} rate revised from INR ${quote.totalAmount} to INR ${totalAmount} (Rev ${newRev}): ${reason || "Negotiation"}`,
      },
    });

    // 5. Send Telegram Notification
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const SITE_URL = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://garvix.in";
    const portalUrl = `${SITE_URL}/portal/quotation/${quote.token}`;

    if (token && chatId) {
      const waText = getQuotationWhatsAppText({
        customerName: quote.customer.companyName,
        contactPerson: quote.customer.contactPerson,
        quoteNumber: `${quote.quoteNumber} (Rev ${newRev})`,
        totalAmount,
        itemSummary: validatedItems.map((i) => i.description).join(", "),
        portalUrl,
      });

      const text = `
🔄 <b>QUOTATION RATE REVISED (Rev ${newRev})</b>
━━━━━━━━━━━━━━━━━━━━
🔢 <b>Quote #:</b> <code>${quote.quoteNumber}</code> (Rev ${newRev})
🏢 <b>Client:</b> ${quote.customer.companyName}
💰 <b>New Total:</b> ₹${totalAmount.toLocaleString("en-IN")}
📉 <b>Previous Total:</b> ₹${quote.totalAmount.toLocaleString("en-IN")}
📝 <b>Reason:</b> ${reason || "Client negotiation"}
━━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</i>
      `.trim();

      sendTelegramReply(chatId, text, {
        inline_keyboard: [
          [
            { text: "📄 Open Revised Quote", url: portalUrl },
            { text: "💬 WhatsApp Client", url: buildWhatsAppLink(quote.customer.phone, waText) },
          ],
        ],
      }).catch((e) => console.error("Telegram revise quote alert failed:", e));
    }

    return NextResponse.json({
      success: true,
      revision: newRev,
      totalAmount,
    });
  } catch (err: any) {
    console.error("Quotation revision error:", err);
    return NextResponse.json({ error: err.message || "Failed to revise quotation." }, { status: 500 });
  }
}
