export interface LeadPayload {
  name: string;
  company?: string | null;
  email: string;
  phone: string;
  solution: string;
  message: string;
}


export function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token === "your_bot_token_here") {
    console.log("[Telegram Alert Skipped - Missing Token or Chat ID]");
    return false;
  }

  return sendTelegramReply(chatId, text);
}

export async function sendTelegramReply(
  chatId: string | number,
  text: string,
  replyMarkup?: any
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data.ok === true;
  } catch (err) {
    console.error("Failed to send telegram reply:", err);
    return false;
  }
}

export async function answerTelegramCallback(
  callbackQueryId: string,
  text?: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  try {
    const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || "",
      }),
    });
    return true;
  } catch (err) {
    console.error("Failed to answer telegram callback query:", err);
    return false;
  }
}


// 1. New Lead Alert
export async function sendTelegramLeadAlert(lead: LeadPayload): Promise<boolean> {
  const solutionLabels: Record<string, string> = {
    RFID_JEWELLERY: "💎 Jewellery RFID Stock Audit",
    RFID_WAREHOUSE: "📦 Warehouse & Pallet RFID",
    RFID_ASSET: "💻 Asset & IT Equipment Tracking",
    RFID_FASTAG: "🚗 FASTag & Parking Automation",
    CUSTOM_SOFTWARE: "💻 Custom Software / Web / App",
    OTHER: "⚡ General Tech / Hardware",
  };

  const formattedSolution = solutionLabels[lead.solution] || lead.solution;

  const text = `
🚀 <b>NEW LEAD ON GARVIX.IN</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Name:</b> ${escapeHtml(lead.name)}
🏢 <b>Company:</b> ${escapeHtml(lead.company || "Not provided")}
📞 <b>Phone:</b> <code>${escapeHtml(lead.phone)}</code>
✉️ <b>Email:</b> ${escapeHtml(lead.email)}
🎯 <b>Solution:</b> ${escapeHtml(formattedSolution)}

💬 <b>Requirement:</b>
<i>${escapeHtml(lead.message)}</i>
━━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</i>
  `.trim();

  return sendTelegramMessage(text);
}

// 2. New Quotation Generated Alert
export async function sendTelegramQuotationAlert(params: {
  quoteNumber: string;
  customerName: string;
  totalAmount: number;
  itemCount: number;
  portalUrl?: string;
}): Promise<boolean> {
  const text = `
📄 <b>NEW QUOTATION GENERATED</b>
━━━━━━━━━━━━━━━━━━━━
🔢 <b>Quote #:</b> <code>${escapeHtml(params.quoteNumber)}</code>
🏢 <b>Client:</b> ${escapeHtml(params.customerName)}
📦 <b>Items:</b> ${params.itemCount} Line Items
💰 <b>Total Value:</b> ₹${params.totalAmount.toLocaleString("en-IN")}
${params.portalUrl ? `🔗 <b>Client Portal:</b> <a href="${params.portalUrl}">View Quotation</a>` : ""}
━━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</i>
  `.trim();

  return sendTelegramMessage(text);
}

// 3. Quotation Digitally Accepted & Auto PI Alert
export async function sendTelegramQuotationAcceptedAlert(params: {
  quoteNumber: string;
  customerName: string;
  totalAmount: number;
  signature: string;
  piNumber?: string;
  piUrl?: string;
  customerPhone?: string;
}): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const text = `
🎉 <b>QUOTATION ACCEPTED & PROFORMA INVOICE GENERATED!</b>
━━━━━━━━━━━━━━━━━━━━
🔢 <b>Quote #:</b> <code>${escapeHtml(params.quoteNumber)}</code>
${params.piNumber ? `📄 <b>Proforma Invoice #:</b> <code>${escapeHtml(params.piNumber)}</code>` : ""}
🏢 <b>Client:</b> ${escapeHtml(params.customerName)}
💰 <b>Total Amount:</b> ₹${params.totalAmount.toLocaleString("en-IN")}
✍️ <b>Signed By:</b> <b>${escapeHtml(params.signature)}</b>
⚡ <i>Auto-PI generated with payment QR code.</i>
━━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</i>
  `.trim();

  const keyboard: any[][] = [];
  const row1: any[] = [];
  if (params.piUrl) {
    row1.push({ text: "📄 Open Proforma Invoice", url: params.piUrl });
  }
  if (params.customerPhone && params.piUrl) {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`Greetings from GARVIX! Proforma Invoice #${params.piNumber || ""} has been generated for ${params.customerName}. View & Pay: ${params.piUrl}`)}`;
    row1.push({ text: "💬 WhatsApp to Client", url: waUrl });
  }
  if (row1.length > 0) keyboard.push(row1);

  return sendTelegramReply(chatId, text, keyboard.length > 0 ? { inline_keyboard: keyboard } : undefined);
}

// 4. New Tax Invoice Alert
export async function sendTelegramInvoiceAlert(params: {
  invoiceNumber: string;
  customerName: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  portalUrl?: string;
}): Promise<boolean> {
  const text = `
🧾 <b>TAX INVOICE ISSUED</b>
━━━━━━━━━━━━━━━━━━━━
🔢 <b>Invoice #:</b> <code>${escapeHtml(params.invoiceNumber)}</code>
🏢 <b>Client:</b> ${escapeHtml(params.customerName)}
💵 <b>Taxable:</b> ₹${params.subtotal.toLocaleString("en-IN")}
🏛️ <b>GST (18%):</b> ₹${params.taxAmount.toLocaleString("en-IN")}
💰 <b>Invoice Total:</b> <b>₹${params.totalAmount.toLocaleString("en-IN")}</b>
💳 <i>Dynamic UPI QR Payment Link active</i>
${params.portalUrl ? `🔗 <b>Invoice Portal:</b> <a href="${params.portalUrl}">View & Pay</a>` : ""}
━━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</i>
  `.trim();

  return sendTelegramMessage(text);
}

// 5. Payment Recorded Alert
export async function sendTelegramPaymentAlert(params: {
  invoiceNumber: string;
  customerName: string;
  amountReceived: number;
  paymentMode: string;
  referenceNumber?: string | null;
  balanceDue: number;
}): Promise<boolean> {
  const text = `
💰 <b>PAYMENT RECORDED!</b>
━━━━━━━━━━━━━━━━━━━━
🔢 <b>Invoice #:</b> <code>${escapeHtml(params.invoiceNumber)}</code>
🏢 <b>Client:</b> ${escapeHtml(params.customerName)}
💵 <b>Amount Received:</b> <b>₹${params.amountReceived.toLocaleString("en-IN")}</b>
💳 <b>Mode:</b> ${escapeHtml(params.paymentMode)}
${params.referenceNumber ? `🔖 <b>UTR / Ref #:</b> <code>${escapeHtml(params.referenceNumber)}</code>\n` : ""}⚖️ <b>Remaining Balance:</b> ₹${params.balanceDue.toLocaleString("en-IN")} ${params.balanceDue <= 0 ? "✅ (FULL SETTLEMENT)" : "⚠️"}
━━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</i>
  `.trim();

  return sendTelegramMessage(text);
}

// 6. Service Ticket Alert
export async function sendTelegramServiceTicketAlert(params: {
  ticketNumber: string;
  customerName: string;
  issueTitle: string;
  priority: string;
  assignedTo?: string | null;
}): Promise<boolean> {
  const text = `
🚨 <b>NEW SERVICE COMPLAINT TICKET</b>
━━━━━━━━━━━━━━━━━━━━
🎫 <b>Ticket #:</b> <code>${escapeHtml(params.ticketNumber)}</code>
🏢 <b>Client:</b> ${escapeHtml(params.customerName)}
⚠️ <b>Priority:</b> <b>${escapeHtml(params.priority)}</b>
📋 <b>Issue:</b> ${escapeHtml(params.issueTitle)}
👷 <b>Assigned To:</b> ${escapeHtml(params.assignedTo || "Unassigned")}
━━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</i>
  `.trim();

  return sendTelegramMessage(text);
}
