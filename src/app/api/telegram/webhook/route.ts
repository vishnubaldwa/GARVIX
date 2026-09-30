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

// Role-based Keyboards
function getMenuForRole(role: string) {
  if (role === "SUPER_ADMIN") {
    return {
      inline_keyboard: [
        [
          { text: "📋 Recent Quotes", callback_data: "cmd_quotes" },
          { text: "🧾 Pending Invoices", callback_data: "cmd_invoices" },
        ],
        [
          { text: "👥 Website Leads", callback_data: "cmd_leads" },
          { text: "📊 Turnover & Summary", callback_data: "cmd_summary" },
        ],
        [
          { text: "🛠️ Service Desk", callback_data: "cmd_tickets" },
          { text: "👥 Team Members", callback_data: "cmd_team" },
        ],
        [
          { text: "📦 Hardware Stock", callback_data: "cmd_stock" },
          { text: "🌐 Open Admin Portal", url: `${SITE_URL}/admin` },
        ],
      ],
    };
  }

  if (role === "SALES") {
    return {
      inline_keyboard: [
        [
          { text: "📋 Recent Quotes", callback_data: "cmd_quotes" },
          { text: "👥 Website Leads", callback_data: "cmd_leads" },
        ],
        [
          { text: "📦 Hardware Stock & Specs", callback_data: "cmd_stock" },
          { text: "🌐 Open Sales Portal", url: `${SITE_URL}/admin/quotations` },
        ],
      ],
    };
  }

  if (role === "ACCOUNTS") {
    return {
      inline_keyboard: [
        [
          { text: "🧾 Pending Invoices & Dues", callback_data: "cmd_invoices" },
          { text: "💰 Collection Summary", callback_data: "cmd_summary" },
        ],
        [
          { text: "📋 View Quotations", callback_data: "cmd_quotes" },
          { text: "🌐 Open Accounts Portal", url: `${SITE_URL}/admin/invoices` },
        ],
      ],
    };
  }

  if (role === "SERVICE") {
    return {
      inline_keyboard: [
        [
          { text: "🛠️ My Service Tickets", callback_data: "cmd_tickets" },
          { text: "📦 Hardware & Spare Stock", callback_data: "cmd_stock" },
        ],
        [
          { text: "🌐 Open Service Portal", url: `${SITE_URL}/admin/amc` },
        ],
      ],
    };
  }

  // Fallback
  return {
    inline_keyboard: [
      [{ text: "🌐 Open GARVIX Portal", url: `${SITE_URL}/admin` }],
    ],
  };
}

function getSubMenuKeyboard(refreshCmd: string, role: string) {
  return {
    inline_keyboard: [
      [
        { text: "🔄 Refresh", callback_data: refreshCmd },
        { text: "🔙 Main Menu", callback_data: "cmd_menu" },
      ],
      [{ text: "🌐 Open Portal", url: `${SITE_URL}/admin` }],
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
    let contactPhone = "";

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
      if (update.message.contact?.phone_number) {
        contactPhone = update.message.contact.phone_number;
      }
    }

    if (!chatId) {
      return NextResponse.json({ ok: true, note: "No chat ID found" });
    }

    // 1. Check if user is already linked in ERP
    let user = await prisma.user.findFirst({
      where: { telegramChatId: String(chatId) },
    });

    // 2. Auto-link Master Admin if matching TELEGRAM_CHAT_ID from .env
    const masterChatId = process.env.TELEGRAM_CHAT_ID || "8543269562";
    if (!user && String(chatId) === masterChatId) {
      const masterAdmin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
      });
      if (masterAdmin) {
        user = await prisma.user.update({
          where: { id: masterAdmin.id },
          data: { telegramChatId: String(chatId) },
        });
      }
    }

    // 3. Handle Phone Number verification / auto-linking
    const cleanDigits = (contactPhone || userText).replace(/\D/g, "");
    if (!user && cleanDigits.length >= 10) {
      const last10Digits = cleanDigits.slice(-10);
      const matchedEmployee = await prisma.user.findFirst({
        where: {
          phone: { contains: last10Digits },
          isActive: true,
        },
      });

      if (matchedEmployee) {
        user = await prisma.user.update({
          where: { id: matchedEmployee.id },
          data: { telegramChatId: String(chatId) },
        });

        const welcomeLinked = `
🎉 <b>Account Linked Successfully!</b>
━━━━━━━━━━━━━━━━━━━━
Namaste <b>${escapeHtml(user.name)}</b> ji!
🏢 Department: <b>${user.role}</b>
📞 Mobile: <code>${escapeHtml(user.phone || last10Digits)}</code>

Aapka Telegram account ab <b>GARVIX ERP</b> se 100% connect ho gaya hai. Aapke role ke hisaab se aapka command menu neeche diya gaya hai:
━━━━━━━━━━━━━━━━━━━━
        `.trim();

        await sendTelegramReply(chatId, welcomeLinked, getMenuForRole(user.role));
        return NextResponse.json({ ok: true });
      } else {
        const notFoundText = `
❌ <b>Mobile Number Not Registered:</b>
━━━━━━━━━━━━━━━━━━━━
Mobile number <code>${last10Digits}</code> GARVIX ERP ke kisi active staff record me nahi mila.

Kripya apne Admin (Vishnu ji) se sampark karein taaki wo <b>/admin/team</b> me aapka number register kar sakein.
        `.trim();

        await sendTelegramReply(chatId, notFoundText, {
          keyboard: [
            [{ text: "📱 Share Mobile Number to Retry", request_contact: true }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        });
        return NextResponse.json({ ok: true });
      }
    }

    // 4. If user is STILL unlinked, prompt them to share phone number
    if (!user) {
      const promptText = `
👋 <b>Namaste! Welcome to GARVIX Enterprise Bot.</b>
━━━━━━━━━━━━━━━━━━━━
GARVIX ERP access karne ke liye apna employee account verify karein.

Neeche diye gaye button par click karke apna <b>Verified Mobile Number share karein</b> ya apna <b>10-digit registered number yahan type karein</b>:
━━━━━━━━━━━━━━━━━━━━
      `.trim();

      await sendTelegramReply(chatId, promptText, {
        keyboard: [
          [{ text: "📱 Share My Mobile Number to Link Account", request_contact: true }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      });
      return NextResponse.json({ ok: true, note: "Awaiting phone verification" });
    }

    // 5. Check if employee account is active
    if (!user.isActive) {
      await sendTelegramReply(
        chatId,
        `⛔ <b>Account Deactivated</b>\nNamaste ${escapeHtml(user.name)}, aapka employee account deactivate kar diya gaya hai.\nKripya administrator se sampark karein.`
      );
      return NextResponse.json({ ok: true, note: "User inactive" });
    }

    const cleanInput = userText.trim().toLowerCase();
    const role = user.role;

    // ----------------------------------------------------
    // ROLE-BASED COMMAND DISPATCH
    // ----------------------------------------------------

    // 1. Quotations (Allowed: SUPER_ADMIN, SALES, ACCOUNTS)
    if (
      cleanInput === "cmd_quotes" ||
      cleanInput.includes("quot") ||
      cleanInput.includes("quote")
    ) {
      if (role === "SERVICE") {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Service Engineers cannot view commercial quotations.`,
          getMenuForRole(role)
        );
        return NextResponse.json({ ok: true });
      }

      const quotes = await prisma.quotation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true, items: true },
      });

      if (quotes.length === 0) {
        await sendTelegramReply(
          chatId,
          `📋 <b>Quotations:</b>\nKoi quotation abhi create nahi hua hai.`,
          getSubMenuKeyboard("cmd_quotes", role)
        );
        return NextResponse.json({ ok: true });
      }

      let text = `📋 <b>Latest Quotations (${role}):</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
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

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_quotes", role));
      return NextResponse.json({ ok: true });
    }

    // 2. Invoices & Receivables (Allowed: SUPER_ADMIN, ACCOUNTS)
    if (
      cleanInput === "cmd_invoices" ||
      cleanInput.includes("inv") ||
      cleanInput.includes("bill") ||
      cleanInput.includes("payment")
    ) {
      if (role !== "SUPER_ADMIN" && role !== "ACCOUNTS") {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Invoices and payment dues are only accessible to Accounts and Super Admin.`,
          getMenuForRole(role)
        );
        return NextResponse.json({ ok: true });
      }

      const invoices = await prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      });

      if (invoices.length === 0) {
        await sendTelegramReply(
          chatId,
          `🧾 <b>Invoices:</b>\nKoi invoice record nahi mila.`,
          getSubMenuKeyboard("cmd_invoices", role)
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

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_invoices", role));
      return NextResponse.json({ ok: true });
    }

    // 3. Website Leads & Enquiries (Allowed: SUPER_ADMIN, SALES)
    if (
      cleanInput === "cmd_leads" ||
      cleanInput.includes("lead") ||
      cleanInput.includes("enquir")
    ) {
      if (role !== "SUPER_ADMIN" && role !== "SALES") {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Website leads are only accessible to Sales Team and Super Admin.`,
          getMenuForRole(role)
        );
        return NextResponse.json({ ok: true });
      }

      const leads = await prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      if (leads.length === 0) {
        await sendTelegramReply(
          chatId,
          `👥 <b>Website Leads:</b>\nAbhi koi lead nahi aayi hai.`,
          getSubMenuKeyboard("cmd_leads", role)
        );
        return NextResponse.json({ ok: true });
      }

      let text = `👥 <b>Recent Website Leads (Sales CRM):</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
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

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_leads", role));
      return NextResponse.json({ ok: true });
    }

    // 4. Financial & Turnover Summary (Allowed: SUPER_ADMIN, ACCOUNTS)
    if (
      cleanInput === "cmd_summary" ||
      cleanInput.includes("sum") ||
      cleanInput.includes("report") ||
      cleanInput.includes("turnover")
    ) {
      if (role !== "SUPER_ADMIN" && role !== "ACCOUNTS") {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Financial turnover and collections are restricted to Accounts and Management.`,
          getMenuForRole(role)
        );
        return NextResponse.json({ ok: true });
      }

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

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_summary", role));
      return NextResponse.json({ ok: true });
    }

    // 5. Service & RMA Tickets (Allowed: SUPER_ADMIN, SERVICE)
    if (
      cleanInput === "cmd_tickets" ||
      cleanInput.includes("ticket") ||
      cleanInput.includes("service") ||
      cleanInput.includes("complain") ||
      cleanInput.includes("rma")
    ) {
      if (role !== "SUPER_ADMIN" && role !== "SERVICE") {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Service and RMA tickets are handled by Field & Service Engineers.`,
          getMenuForRole(role)
        );
        return NextResponse.json({ ok: true });
      }

      const tickets = await prisma.serviceTicket.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      });

      if (tickets.length === 0) {
        await sendTelegramReply(
          chatId,
          `🛠️ <b>Service Tickets:</b>\nKoi open complaint nahi hai. All systems running smooth! ✅`,
          getSubMenuKeyboard("cmd_tickets", role)
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

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_tickets", role));
      return NextResponse.json({ ok: true });
    }

    // 6. Stock & Inventory Overview (Allowed: ALL ROLES)
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
          text += `   Stock: <b>${p.currentStock} ${p.unit}</b> [${alert}] (Alert: ${p.minStockAlert})\n`;
          if (role === "SUPER_ADMIN" || role === "SALES") {
            text += `   💰 Price: ₹${p.sellingPrice.toLocaleString("en-IN")}\n`;
          }
          text += `\n`;
        });
      }
      text += `━━━━━━━━━━━━━━━━━━━━`;

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_stock", role));
      return NextResponse.json({ ok: true });
    }

    // 7. Team Overview (Allowed: SUPER_ADMIN ONLY)
    if (
      cleanInput === "cmd_team" ||
      cleanInput.includes("team") ||
      cleanInput.includes("employee") ||
      cleanInput.includes("staff")
    ) {
      if (role !== "SUPER_ADMIN") {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Staff and team management is restricted to Super Admin.`,
          getMenuForRole(role)
        );
        return NextResponse.json({ ok: true });
      }

      const team = await prisma.user.findMany({
        orderBy: { role: "asc" },
        select: { name: true, role: true, phone: true, telegramChatId: true, isActive: true },
      });

      let text = `👥 <b>GARVIX Staff & Telegram Link Status:</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      team.forEach((m, idx) => {
        const linkBadge = m.telegramChatId ? "🟢 Linked" : "⚪ Unlinked";
        const statusBadge = m.isActive ? "Active" : "🔴 Inactive";
        text += `<b>${idx + 1}. ${escapeHtml(m.name)}</b> [${m.role}]\n`;
        text += `   📞 ${m.phone || "No phone"} | Telegram: ${linkBadge}\n`;
        text += `   Status: <b>${statusBadge}</b>\n\n`;
      });
      text += `━━━━━━━━━━━━━━━━━━━━\n🔗 <a href="${SITE_URL}/admin/team">Manage Team on Admin Web</a>`;

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_team", role));
      return NextResponse.json({ ok: true });
    }

    // 8. Main Menu / Start / Greetings / Fallback
    const welcomeText = `
👋 <b>Namaste ${escapeHtml(user.name)} ji!</b>
GARVIX ERP Assistant active hai.

🏢 <b>Your Assigned Role:</b> <code>${role}</code>
Aapke department ke anusar aapke commands neeche ready hain:
    `.trim();

    await sendTelegramReply(chatId, welcomeText, getMenuForRole(role));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Telegram Webhook Error]:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
