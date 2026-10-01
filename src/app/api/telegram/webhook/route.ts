import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  escapeHtml,
  sendTelegramReply,
  answerTelegramCallback,
} from "@/lib/telegram";
import {
  hasPermission,
  PERMISSIONS,
  ensureDefaultRoles,
} from "@/lib/permissions";
import {
  getActiveSession,
  clearSession,
  setSession,
  buildDynamicMenu,
  startWizard,
  handleWizardStep,
  showSettingsMenu,
  promptEditField,
  showRolesList,
  showRolePermissionsEditor,
  toggleRolePermission,
  convertQuotationFromTelegram,
} from "@/lib/telegram-wizard";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://garvix.in";

function getSubMenuKeyboard(refreshCmd: string) {
  return {
    inline_keyboard: [
      [
        { text: "🔄 Refresh", callback_data: refreshCmd },
        { text: "🔙 Main Menu", callback_data: "cmd_menu" },
      ],
      [{ text: "🌐 Open Web ERP", url: `${SITE_URL}/admin` }],
    ],
  };
}

// GET: Health Check
export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "GARVIX Telegram ERP Terminal",
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
    let callbackData = "";
    let contactPhone = "";

    if (update.callback_query) {
      callbackQueryId = update.callback_query.id;
      chatId = update.callback_query.message?.chat?.id;
      callbackData = update.callback_query.data || "";
      userText = callbackData;
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
🏢 Role: <b>${user.role}</b>
📞 Mobile: <code>${escapeHtml(user.phone || last10Digits)}</code>

Aapka Telegram account ab <b>GARVIX ERP Terminal</b> se 100% connect ho gaya hai.
Aapke permissions ke anusar aapka control menu neeche active hai:
━━━━━━━━━━━━━━━━━━━━
        `.trim();

        const menu = await buildDynamicMenu(user.role);
        await sendTelegramReply(chatId, welcomeLinked, menu);
        return NextResponse.json({ ok: true });
      } else {
        const notFoundText = `
❌ <b>Mobile Number Not Registered:</b>
━━━━━━━━━━━━━━━━━━━━
Mobile number <code>${last10Digits}</code> GARVIX ERP ke kisi active staff record me nahi mila.

Kripya apne Admin se sampark karein ya sahi registered number share karein:
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
    // 6. CHECK FOR ACTIVE MULTI-STEP SESSION
    // ----------------------------------------------------
    const activeSession = await getActiveSession(chatId);
    if (activeSession) {
      // If user types cancel, or passes step input
      const handled = await handleWizardStep(
        chatId,
        activeSession,
        userText,
        callbackData,
        user
      );
      if (handled) {
        return NextResponse.json({ ok: true });
      }
    }

    // ----------------------------------------------------
    // 7. HANDLE DIRECT CALLBACK TRIGGERS
    // ----------------------------------------------------
    if (callbackData) {
      if (callbackData === "cmd_menu") {
        await clearSession(chatId);
        const welcomeText = `
👋 <b>Namaste ${escapeHtml(user.name)} ji!</b>
GARVIX ERP Terminal active hai.

🏢 <b>Role:</b> <code>${role}</code>
Neeche diye gaye commands and shortcuts me se chunein:
        `.trim();
        const menu = await buildDynamicMenu(role);
        await sendTelegramReply(chatId, welcomeText, menu);
        return NextResponse.json({ ok: true });
      }

      // Wizards
      if (callbackData === "flow_new_client") {
        await startWizard(chatId, "NEW_CLIENT", user);
        return NextResponse.json({ ok: true });
      }
      if (callbackData === "flow_new_employee") {
        await startWizard(chatId, "NEW_EMPLOYEE", user);
        return NextResponse.json({ ok: true });
      }
      if (callbackData === "flow_new_product") {
        await startWizard(chatId, "NEW_PRODUCT", user);
        return NextResponse.json({ ok: true });
      }
      if (callbackData === "flow_new_quote") {
        await startWizard(chatId, "NEW_QUOTATION", user);
        return NextResponse.json({ ok: true });
      }
      if (callbackData.startsWith("q_sel_client_")) {
        const customerId = callbackData.replace("q_sel_client_", "");
        await startWizard(chatId, "NEW_QUOTATION", user, { customerId });
        return NextResponse.json({ ok: true });
      }
      if (callbackData === "flow_settings") {
        await startWizard(chatId, "EDIT_SETTINGS", user);
        return NextResponse.json({ ok: true });
      }
      if (callbackData.startsWith("set_field_")) {
        const field = callbackData.replace("set_field_", "");
        await promptEditField(chatId, field, user);
        return NextResponse.json({ ok: true });
      }
      if (callbackData === "flow_roles") {
        await startWizard(chatId, "MANAGE_ROLES", user);
        return NextResponse.json({ ok: true });
      }
      if (callbackData === "flow_add_role") {
        await setSession(chatId, "ADD_ROLE", 1, {});
        const text = `
🛡️ <b>Step 1/2: New Role Code</b>
━━━━━━━━━━━━━━━━━━━━
Naye role ka code bhejein (Capital letters only, e.g. <code>MANAGER</code>, <code>DISPATCH_HEAD</code>):
        `.trim();
        await sendTelegramReply(chatId, text, {
          inline_keyboard: [[{ text: "❌ Cancel", callback_data: "wizard_cancel" }]],
        });
        return NextResponse.json({ ok: true });
      }
      if (callbackData.startsWith("role_view_")) {
        const roleId = callbackData.replace("role_view_", "");
        await showRolePermissionsEditor(chatId, roleId);
        return NextResponse.json({ ok: true });
      }
      if (callbackData.startsWith("rtog_")) {
        const parts = callbackData.split("_");
        const roleId = parts[1];
        const permCode = parts.slice(2).join("_");
        await toggleRolePermission(chatId, roleId, permCode, callbackQueryId);
        return NextResponse.json({ ok: true });
      }
      if (callbackData.startsWith("q_conv_")) {
        const quoteId = callbackData.replace("q_conv_", "");
        await convertQuotationFromTelegram(chatId, quoteId, user);
        return NextResponse.json({ ok: true });
      }
    }

    // ----------------------------------------------------
    // 8. NATURAL LANGUAGE CREATION COMMANDS
    // ----------------------------------------------------
    if (
      cleanInput === "new client" ||
      cleanInput === "add client" ||
      cleanInput === "create client"
    ) {
      await startWizard(chatId, "NEW_CLIENT", user);
      return NextResponse.json({ ok: true });
    }
    if (
      cleanInput === "new staff" ||
      cleanInput === "add staff" ||
      cleanInput === "new employee" ||
      cleanInput === "add team" ||
      cleanInput === "create user"
    ) {
      await startWizard(chatId, "NEW_EMPLOYEE", user);
      return NextResponse.json({ ok: true });
    }
    if (
      cleanInput === "new product" ||
      cleanInput === "add product" ||
      cleanInput === "create product" ||
      cleanInput === "add item"
    ) {
      await startWizard(chatId, "NEW_PRODUCT", user);
      return NextResponse.json({ ok: true });
    }
    if (
      cleanInput === "new quote" ||
      cleanInput === "new quotation" ||
      cleanInput === "create quote" ||
      cleanInput === "make quote"
    ) {
      await startWizard(chatId, "NEW_QUOTATION", user);
      return NextResponse.json({ ok: true });
    }
    if (
      cleanInput === "settings" ||
      cleanInput === "company settings" ||
      cleanInput === "edit settings"
    ) {
      await startWizard(chatId, "EDIT_SETTINGS", user);
      return NextResponse.json({ ok: true });
    }
    if (
      cleanInput === "roles" ||
      cleanInput === "permissions" ||
      cleanInput === "manage roles"
    ) {
      await startWizard(chatId, "MANAGE_ROLES", user);
      return NextResponse.json({ ok: true });
    }

    // ----------------------------------------------------
    // 9. QUERY COMMANDS (QUOTATIONS, INVOICES, LEADS, ETC.)
    // ----------------------------------------------------

    // Quotations Query
    if (
      cleanInput === "cmd_quotes" ||
      cleanInput.includes("quot") ||
      cleanInput.includes("quote")
    ) {
      if (!(await hasPermission(role, PERMISSIONS.CAN_CREATE_QUOTATION))) {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> You do not have permission to view quotations.`,
          await buildDynamicMenu(role)
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
          getSubMenuKeyboard("cmd_quotes")
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

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_quotes"));
      return NextResponse.json({ ok: true });
    }

    // Invoices Query
    if (
      cleanInput === "cmd_invoices" ||
      cleanInput.includes("inv") ||
      cleanInput.includes("bill") ||
      cleanInput.includes("payment")
    ) {
      if (!(await hasPermission(role, PERMISSIONS.CAN_MANAGE_INVOICES))) {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Invoices and payment dues require invoice permissions.`,
          await buildDynamicMenu(role)
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

    // Leads Query
    if (
      cleanInput === "cmd_leads" ||
      cleanInput.includes("lead") ||
      cleanInput.includes("enquir")
    ) {
      if (!(await hasPermission(role, PERMISSIONS.CAN_VIEW_LEADS))) {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Website leads are restricted for your role.`,
          await buildDynamicMenu(role)
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
          getSubMenuKeyboard("cmd_leads")
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

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_leads"));
      return NextResponse.json({ ok: true });
    }

    // Summary Query
    if (
      cleanInput === "cmd_summary" ||
      cleanInput.includes("sum") ||
      cleanInput.includes("report") ||
      cleanInput.includes("turnover")
    ) {
      if (!(await hasPermission(role, PERMISSIONS.CAN_VIEW_FINANCES))) {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Financial turnover and reports are restricted.`,
          await buildDynamicMenu(role)
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

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_summary"));
      return NextResponse.json({ ok: true });
    }

    // Tickets Query
    if (
      cleanInput === "cmd_tickets" ||
      cleanInput.includes("ticket") ||
      cleanInput.includes("service") ||
      cleanInput.includes("complain") ||
      cleanInput.includes("rma")
    ) {
      if (!(await hasPermission(role, PERMISSIONS.CAN_VIEW_SERVICE))) {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Service and RMA tickets require service permissions.`,
          await buildDynamicMenu(role)
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

    // Stock Query
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
          text += `   💰 Price: ₹${p.sellingPrice.toLocaleString("en-IN")}\n\n`;
        });
      }
      text += `━━━━━━━━━━━━━━━━━━━━`;

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_stock"));
      return NextResponse.json({ ok: true });
    }

    // Team Query
    if (
      cleanInput === "cmd_team" ||
      cleanInput.includes("team") ||
      cleanInput.includes("employee") ||
      cleanInput.includes("staff")
    ) {
      if (!(await hasPermission(role, PERMISSIONS.CAN_MANAGE_TEAM))) {
        await sendTelegramReply(
          chatId,
          `🔒 <b>Access Restricted:</b> Staff and team management requires team permission.`,
          await buildDynamicMenu(role)
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

      await sendTelegramReply(chatId, text, getSubMenuKeyboard("cmd_team"));
      return NextResponse.json({ ok: true });
    }

    // 10. Default Fallback / Main Menu
    const welcomeText = `
👋 <b>Namaste ${escapeHtml(user.name)} ji!</b>
GARVIX ERP Terminal active hai.

🏢 <b>Your Assigned Role:</b> <code>${role}</code>
Aapke permissions ke anusar aapke commands neeche ready hain:
    `.trim();

    const menu = await buildDynamicMenu(role);
    await sendTelegramReply(chatId, welcomeText, menu);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Telegram Webhook Error]:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
