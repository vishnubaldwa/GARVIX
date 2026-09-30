export interface LeadPayload {
  name: string;
  company?: string | null;
  email: string;
  phone: string;
  solution: string;
  message: string;
}

export async function sendTelegramLeadAlert(lead: LeadPayload): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token === "your_bot_token_here") {
    console.log("[Telegram Bot Alert (Simulated - Token not set)]");
    console.log(`Lead from: ${lead.name} (${lead.phone}) for ${lead.solution}`);
    return false;
  }

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
━━━━━━━━━━━━━━━━━━━
👤 <b>Name:</b> ${escapeHtml(lead.name)}
🏢 <b>Company:</b> ${escapeHtml(lead.company || "Not provided")}
📞 <b>Phone:</b> <code>${escapeHtml(lead.phone)}</code>
✉️ <b>Email:</b> ${escapeHtml(lead.email)}
🎯 <b>Solution:</b> ${escapeHtml(formattedSolution)}

💬 <b>Requirement:</b>
<i>${escapeHtml(lead.message)}</i>
━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</i>
  `.trim();

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();
    return data.ok === true;
  } catch (err) {
    console.error("Failed to send telegram notification:", err);
    return false;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
