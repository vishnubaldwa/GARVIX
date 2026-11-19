import nodemailer from "nodemailer";

export interface LeadEmailPayload {
  name: string;
  company?: string | null;
  email: string;
  phone: string;
  industry?: string | null;
  solution: string;
  message: string;
}

export async function sendLeadEmail(
  lead: LeadEmailPayload
): Promise<{ sent: boolean; reason?: string }> {
  const smtpUser = process.env.SMTP_USER || "info@garvix.in";
  const smtpPass = process.env.SMTP_PASS;
  const toEmail = process.env.CONTACT_TO_EMAIL || "info@garvix.in";

  if (!smtpPass) {
    console.warn(
      "[GARVIX Mailer] SMTP_PASS not set in environment. Skipping SMTP dispatch to",
      toEmail
    );
    return { sent: false, reason: "SMTP_PASS_MISSING" };
  }

  const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
        <div style="background: #1d1d1f; color: #ffffff; padding: 24px 28px;">
          <h2 style="margin: 0; font-size: 18px; letter-spacing: 0.5px;">GARVIX — New Website Enquiry</h2>
          <p style="margin: 6px 0 0; font-size: 12px; color: #a1a1aa;">Submitted via garvix.in Contact Form</p>
        </div>
        <div style="padding: 24px 28px; color: #1d1d1f; font-size: 14px; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 140px;"><strong>Name</strong></td>
              <td style="padding: 8px 0;">${escapeHtml(lead.name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Company</strong></td>
              <td style="padding: 8px 0;">${escapeHtml(lead.company || "Not provided")}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Email</strong></td>
              <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(lead.email)}" style="color: #0071e3;">${escapeHtml(lead.email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Phone</strong></td>
              <td style="padding: 8px 0;"><a href="tel:${escapeHtml(lead.phone)}" style="color: #0071e3;">${escapeHtml(lead.phone)}</a></td>
            </tr>
            ${
              lead.industry
                ? `<tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Industry</strong></td>
              <td style="padding: 8px 0;">${escapeHtml(lead.industry)}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Solution</strong></td>
              <td style="padding: 8px 0;"><span style="background: #eff6ff; color: #1d4ed8; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;">${escapeHtml(lead.solution)}</span></td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #f5f5f7; border-radius: 12px;">
            <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px;">Requirement Details</div>
            <div style="white-space: pre-wrap; color: #1d1d1f;">${escapeHtml(lead.message)}</div>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 14px 28px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          Reply directly to this email to respond to ${escapeHtml(lead.name)}. Also logged in GARVIX Admin CRM (/admin/leads).
        </div>
      </div>
    `;

    const textBody = [
      `New Website Enquiry from garvix.in`,
      `Name: ${lead.name}`,
      `Company: ${lead.company || "N/A"}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone}`,
      lead.industry ? `Industry: ${lead.industry}` : "",
      `Solution: ${lead.solution}`,
      ``,
      `Requirement Details:`,
      lead.message,
    ]
      .filter(Boolean)
      .join("\n");

    await transporter.sendMail({
      from: `"GARVIX Website" <${smtpUser}>`,
      to: toEmail,
      replyTo: lead.email,
      subject: `[GARVIX Enquiry] ${lead.solution} — ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
      text: textBody,
      html: htmlBody,
    });

    return { sent: true };
  } catch (err: any) {
    console.error("[GARVIX Mailer] Failed to send lead email:", err?.message || err);
    return { sent: false, reason: err?.message || "SEND_FAILED" };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
