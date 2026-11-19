import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed = await hasPermission(session.role, "CAN_MANAGE_SETTINGS");
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const text = `
🔔 <b>GARVIX MANUAL TEST NOTIFICATION</b>
━━━━━━━━━━━━━━━━━━━━
Admin Panel se manual test alert send kiya gaya hai.
Aapka Telegram Bot <b>100% active aur functional</b> hai!

• Live Website Leads: ACTIVE ✅
• Quotation Alerts: ACTIVE ✅
• Invoice & UPI Payment Alerts: ACTIVE ✅
• Service Complaints: ACTIVE ✅
━━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</i>
    `.trim();

    const ok = await sendTelegramMessage(text);
    if (ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to send message to Telegram." }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
