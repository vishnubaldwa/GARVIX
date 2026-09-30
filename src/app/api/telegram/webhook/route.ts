import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  escapeHtml,
  sendTelegramReply,
  answerTelegramCallback,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://garvix.in";

const MAIN_MENU_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "📋 Recent Quotes", callback_data: "cmd_quotes" },
      { text: "🧾 Pending Invoices", callback_data: "cmd_invoices" },
    ],
    [
      { text: "👥 Website Leads", callback_data: "cmd_leads" },
      { text: "📊 Business Summary", callback_data: "cmd_summary" },
    ],
    [
      { text: "🛠️ Service RMA", callback_data: "cmd_tickets" },
      { text: "📦 Low Stock Items", callback_data: "cmd_stock" },
    ],
    [{ text: "🌐 Open Admin Portal", url: `${SITE_URL}/admin` }],
  ],
};

function getSubMenuKeyboard(refreshCmd: string) {
  return {
    inline_keyboard: [
      [
        { text: "🔄 Refresh", callback_data: refreshCmd },
        { text: "🔙 Main Menu", callback_data: "cmd_menu" },
      ],
      [{ text: "🌐 Open Admin Portal", url: `${SITE_URL}/admin` }],
    ],
  };
}

// GET: Health Check
export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "GARVIX Telegram Webhook",
    timestamp: new Date().toISOString(),
  });
}

// POST: Telegram Webhook updates
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    let chatId: string | number | undefined;
    let userText = "";
    let callbackQueryId: string | undefined;

    if (update.callback_query) {
      callbackQueryId = update.callback_query.id;
      chatId = update.callback_query.message?.chat?.id;
      userText = update.callback_query.data || "";
      if (callbackQueryId) {
        await answerTelegramCallback(callbackQueryId);
      }
    } else if (update.message) {
      chatId = update.message.chat?.id;
      userText = update.message.text || "";
    }

    if (!chatId) {
      return NextResponse.json({ ok: true, note: "No chat ID found" });
    }

    // Security Authorization
    const envChatId = process.env.TELEGRAM_CHAT_ID || "8543269562";
    const allowedChatIds = envChatId
      .split(",")
      .map((id) => id.trim())
      .concat(["8543269562"]);

    if (!allowedChatIds.includes(String(chatId))) {
      await sendTelegramReply(
        chatId,
        `⛔ <b>Access Restricted</b>\nYour Chat ID (<code>${chatId}</code>) is not authorized to query GARVIX ERP records.\nContact administrator.`
      );
      return NextResponse.json({ ok: true, note: "Unauthorized chat ID" });
    }

    const cleanInput = userText.trim().toLowerCase();

    // 1. Quotations
    if (
      cleanInput === "cmd_quotes" ||
      cleanInput.includes("quot") ||
      cleanInput.includes("quote")
    ) {
      const quotes = await prisma.quotation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true, items: true },
      });

      if (quotes.length === 0) {
        await sendTelegramReply(
          chatId,
          `📋 <b>Quotations:</b>\nKoi quotation abhi create nahi hua hai.\nAdmin panel se pehla quotation create karein: <a href="${SITE_URL}/admin/quotations/create">Create Quote</a>`,
          getSubMenuKeyboard("cmd_quotes")
        );
        return NextResponse.json({ ok: true });
      }

      let text = `📋 <b>Latest Quotations (GARVIX ERP):</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      quotes.forEach((q, idx) => {
        const date = q.createdAt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const statusBadge =
          q.status === "ACCEPTED"
            ? "✅ ACCEPTED"
            : q.status === "CONVERTED"
            ? "💜 CONVERTED TO INVOICE"
            : `🟡 ${q.status}`;

        text += `<b>${idx + 1}. ${escapeHtml(q.quoteNumber)}</b>\n`;
        text += `🏢 <b>Client:</b> ${escapeHtml(q.customer.companyName)}\n`;
        text += `💰 <b>Amount:</b> ₹${q.totalAmount.toLocaleString("en-IN")}\n`;
        text += `🏷️ <b>Status:</b> ${statusBadge}\n`;
        text += `📦 <b>Items:</b> ${q.items.length} line items | 📅 ${date}\n`;
        text += `🔗 <a href="${SITE_URL}/portal/quotation/${q.token}">Open Quotation Portal</a>\n\n`;
      });
      text += `━━━━━━━━━━━━━━━━━━━━\n<i>Showing last ${quotes.length} quotations</i>`;

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_quotes"));
      return NextResponse.json({ ok: true });
    }

    // 2. Invoices & Receivables
    if (
      cleanInput === "cmd_invoices" ||
      cleanInput.includes("inv") ||
      cleanInput.includes("bill") ||
      cleanInput.includes("payment")
    ) {
      const invoices = await prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      });

      if (invoices.length === 0) {
        await sendTelegramReply(
          chatId,
          `🧾 <b>Invoices:</b>\nKoi invoice record nahi mila.`,
          getSubMenuKeyboard("cmd_invoices")
        );
        return NextResponse.json({ ok: true });
      }

      let text = `🧾 <b>Invoices & Collections (GARVIX ERP):</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      invoices.forEach((inv, idx) => {
        const date = inv.invoiceDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const statusBadge =
          inv.paymentStatus === "PAID"
            ? "✅ PAID"
            : inv.paymentStatus === "PARTIAL"
            ? "🟡 PARTIAL"
            : "🔴 UNPAID";

        text += `<b>${idx + 1}. ${escapeHtml(inv.invoiceNumber)}</b>\n`;
        text += `🏢 <b>Client:</b> ${escapeHtml(inv.customer.companyName)}\n`;
        text += `💵 <b>Total:</b> ₹${inv.totalAmount.toLocaleString("en-IN")}\n`;
        text += `⚖️ <b>Balance Due:</b> ₹${inv.balanceDue.toLocaleString("en-IN")} [${statusBadge}]\n`;
        text += `📅 <b>Date:</b> ${date}\n`;
        text += `🔗 <a href="${SITE_URL}/portal/invoice/${inv.token}">View Bill & Pay UPI</a>\n\n`;
      });
      text += `━━━━━━━━━━━━━━━━━━━━\n<i>Tap link to open instant UPI QR</i>`;

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_invoices"));
      return NextResponse.json({ ok: true });
    }

    // 3. Website Leads & Enquiries
    if (
      cleanInput === "cmd_leads" ||
      cleanInput.includes("lead") ||
      cleanInput.includes("enquir")
    ) {
      const leads = await prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      if (leads.length === 0) {
        await sendTelegramReply(
          chatId,
          `👥 <b>Website Leads:</b>\nAbhi koi lead nahi aayi hai.`,
          getSubMenuKeyboard("cmd_leads")
        );
        return NextResponse.json({ ok: true });
      }

      let text = `👥 <b>Recent Website Leads:</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      leads.forEach((l, idx) => {
        const date = l.createdAt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        });
        text += `<b>${idx + 1}. ${escapeHtml(l.name)}</b> ${l.company ? `(${escapeHtml(l.company)})` : ""}\n`;
        text += `📞 <code>${escapeHtml(l.phone)}</code> | ✉️ ${escapeHtml(l.email)}\n`;
        text += `🎯 <b>Solution:</b> ${escapeHtml(l.solution)}\n`;
        text += `💬 <i>"${escapeHtml(l.message.slice(0, 80))}${l.message.length > 80 ? "..." : ""}"</i>\n`;
        text += `🕒 <i>${date}</i>\n\n`;
      });
      text += `━━━━━━━━━━━━━━━━━━━━`;

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_leads"));
      return NextResponse.json({ ok: true });
    }

    // 4. Overall Business Summary
    if (
      cleanInput === "cmd_summary" ||
      cleanInput.includes("sum") ||
      cleanInput.includes("report") ||
      cleanInput.includes("metric")
    ) {
      const [
        clientCount,
        quoteCount,
        invoices,
        leadsCount,
        openTickets,
        lowStockItems,
      ] = await Promise.all([
        prisma.customer.count(),
        prisma.quotation.count(),
        prisma.invoice.findMany({
          select: { totalAmount: true, amountPaid: true, balanceDue: true },
        }),
        prisma.lead.count(),
        prisma.serviceTicket.count({
          where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
        }),
        prisma.product.count({
          where: {
            category: { notIn: ["SOFTWARE_SERVICE", "AMC_SUPPORT"] },
            currentStock: { lte: 5 },
          },
        }),
      ]);

      const totalBilled = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
      const totalCollected = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
      const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

      const text = `
📊 <b>GARVIX Command Center Summary</b>
━━━━━━━━━━━━━━━━━━━━
🏢 Registered Clients: <b>${clientCount}</b>
👥 Website Inquiries: <b>${leadsCount}</b>
📄 Total Quotations: <b>${quoteCount}</b>
🧾 Invoices Issued: <b>${invoices.length}</b>

💰 <b>Finance & Cashflow:</b>
• Total Invoiced: <b>₹${totalBilled.toLocaleString("en-IN")}</b>
• Total Collections: <b>₹${totalCollected.toLocaleString("en-IN")}</b>
• Pending Receivables: <b>₹${totalOutstanding.toLocaleString("en-IN")}</b>

📦 Low Stock Hardware Items: <b>${lowStockItems}</b>
🛠️ Open Service Tickets: <b>${openTickets}</b>
━━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</i>
      `.trim();

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_summary"));
      return NextResponse.json({ ok: true });
    }

    // 5. Service & RMA Tickets
    if (
      cleanInput === "cmd_tickets" ||
      cleanInput.includes("ticket") ||
      cleanInput.includes("service") ||
      cleanInput.includes("complain")
    ) {
      const tickets = await prisma.serviceTicket.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      });

      if (tickets.length === 0) {
        await sendTelegramReply(
          chatId,
          `🛠️ <b>Service Tickets:</b>\nKoi open complaint nahi hai. All systems running smooth! ✅`,
          getSubMenuKeyboard("cmd_tickets")
        );
        return NextResponse.json({ ok: true });
      }

      let text = `🛠️ <b>Hardware Service & RMA Tickets:</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      tickets.forEach((t, idx) => {
        const priorityIcon =
          t.priority === "CRITICAL"
            ? "🔴"
            : t.priority === "HIGH"
            ? "🟠"
            : "🟡";
        text += `<b>${idx + 1}. ${escapeHtml(t.ticketNumber)}</b> [${priorityIcon} ${t.priority}]\n`;
        text += `🏢 <b>Client:</b> ${escapeHtml(t.customer.companyName)}\n`;
        text += `📋 <b>Issue:</b> ${escapeHtml(t.issueTitle)}\n`;
        text += `⚙️ <b>Status:</b> ${t.status} | 👷 ${escapeHtml(t.assignedTo || "Unassigned")}\n\n`;
      });
      text += `━━━━━━━━━━━━━━━━━━━━`;

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_tickets"));
      return NextResponse.json({ ok: true });
    }

    // 6. Stock & Inventory Overview
    if (
      cleanInput === "cmd_stock" ||
      cleanInput.includes("stock") ||
      cleanInput.includes("item") ||
      cleanInput.includes("inventor")
    ) {
      const products = await prisma.product.findMany({
        where: {
          category: { notIn: ["SOFTWARE_SERVICE", "AMC_SUPPORT"] },
        },
        take: 8,
        orderBy: { currentStock: "asc" },
      });

      let text = `📦 <b>Hardware Stock Overview:</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      if (products.length === 0) {
        text += `<i>Koi hardware product nahi mila.</i>\n`;
      } else {
        products.forEach((p, idx) => {
          const alert =
            p.currentStock <= p.minStockAlert ? "⚠️ LOW STOCK" : "✅ OK";
          text += `<b>${idx + 1}. ${escapeHtml(p.name)}</b> (<code>${escapeHtml(p.sku)}</code>)\n`;
          text += `   Current Stock: <b>${p.currentStock} ${p.unit}</b> [${alert}] (Alert: ${p.minStockAlert})\n\n`;
        });
      }
      text += `━━━━━━━━━━━━━━━━━━━━`;

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_stock"));
      return NextResponse.json({ ok: true });
    }

    // 7. Menu / Start / Greetings / Fallback
    const isStartOrGreeting =
      cleanInput === "cmd_menu" ||
      cleanInput === "/start" ||
      cleanInput === "start" ||
      cleanInput === "menu" ||
      cleanInput === "hi" ||
      cleanInput === "hello" ||
      cleanInput === "help";

    const greetingHeader = isStartOrGreeting
      ? `👋 <b>Namaste Vishnu ji!</b>\nGARVIX Intelligent Bot active hai.`
      : `🤖 <b>GARVIX Bot Command Center:</b>\nAapka sandesh mila: <i>"${escapeHtml(userText)}"</i>`;

    const welcomeText = `
${greetingHeader}

Neeche diye gaye buttons click karein ya directly keywords type karein:
• <b>quotation</b> - Latest quotes & approvals dekhne ke liye
• <b>invoice</b> - Bills & pending dues dekhne ke liye
• <b>leads</b> - Website inquiries dekhne ke liye
• <b>summary</b> - Total business turnover & financial health
• <b>stock</b> - Hardware inventory & low stock items
    `.trim();

    await sendTelegramReply(chatId, welcomeText, MAIN_MENU_KEYBOARD);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Telegram Webhook Error]:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
