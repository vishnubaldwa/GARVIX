export function cleanPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val);
}

// 1. WhatsApp message for Quotation / Proposal
export function getQuotationWhatsAppText(params: {
  customerName: string;
  contactPerson?: string | null;
  quoteNumber: string;
  totalAmount: number;
  itemSummary: string;
  portalUrl: string;
}): string {
  const greeting = params.contactPerson ? `Dear ${params.contactPerson} ji` : `Dear ${params.customerName}`;
  return (
    `*GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED*\n` +
    `---------------------------------------------\n` +
    `${greeting},\n\n` +
    `Greetings from GARVIX! Please find your official *Proposal & Quotation #${params.quoteNumber}* for *${params.itemSummary}*.\n\n` +
    `💰 *Total Amount:* ${formatINR(params.totalAmount)} (Incl. 18% GST)\n\n` +
    `📄 *View, Download & Approve Online:*\n` +
    `${params.portalUrl}\n\n` +
    `Kindly review and click *"Accept & Approve"* on the link to generate your official Proforma Invoice.\n\n` +
    `Warm regards,\n` +
    `*GARVIX Software Solutions Pvt. Ltd.*\n` +
    `📞 +91 99507 18876 | 🌐 https://garvix.in`
  );
}

// 2. WhatsApp message for Proforma / Tax Invoice
export function getInvoiceWhatsAppText(params: {
  customerName: string;
  contactPerson?: string | null;
  invoiceNumber: string;
  invoiceType: "TAX_INVOICE" | "PROFORMA_INVOICE" | string;
  totalAmount: number;
  balanceDue: number;
  portalUrl: string;
}): string {
  const isPI = params.invoiceType === "PROFORMA_INVOICE";
  const docType = isPI ? "Proforma Invoice (PI)" : "Tax Invoice";
  const greeting = params.contactPerson ? `Dear ${params.contactPerson} ji` : `Dear ${params.customerName}`;

  return (
    `*GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED*\n` +
    `---------------------------------------------\n` +
    `${greeting},\n\n` +
    `Please find your official *${docType} #${params.invoiceNumber}* from GARVIX.\n\n` +
    `💰 *Invoice Total:* ${formatINR(params.totalAmount)}\n` +
    `💳 *Balance Due:* ${formatINR(params.balanceDue)}\n\n` +
    `📄 *View Invoice & Pay Online:*\n` +
    `${params.portalUrl}\n\n` +
    `You can pay directly via UPI QR code or NEFT/IMPS bank transfer details given on the document.\n\n` +
    `Thank you for your business!\n` +
    `*GARVIX Software Solutions Pvt. Ltd.*\n` +
    `📞 +91 99507 18876 | 🌐 https://garvix.in`
  );
}

// 3. WhatsApp message for Payment Reminder / Follow-up
export function getPaymentReminderWhatsAppText(params: {
  customerName: string;
  contactPerson?: string | null;
  invoiceNumber: string;
  balanceDue: number;
  daysPending?: number;
  portalUrl: string;
}): string {
  const greeting = params.contactPerson ? `Dear ${params.contactPerson} ji` : `Dear ${params.customerName}`;
  const daysText = params.daysPending && params.daysPending > 0 ? ` (pending since ${params.daysPending} days)` : "";

  return (
    `*PAYMENT REMINDER | GARVIX SOFTWARE SOLUTIONS*\n` +
    `---------------------------------------------\n` +
    `${greeting},\n\n` +
    `Hope you are doing well! This is a gentle reminder regarding the outstanding balance for *Invoice #${params.invoiceNumber}*${daysText}.\n\n` +
    `💳 *Pending Amount:* ${formatINR(params.balanceDue)}\n\n` +
    `📄 *View Invoice & Pay Online:*\n` +
    `${params.portalUrl}\n\n` +
    `Kindly process the payment at your earliest convenience. If already paid, please ignore this message.\n\n` +
    `Warm regards,\n` +
    `*Accounts Desk - GARVIX Software Solutions Pvt. Ltd.*\n` +
    `📞 +91 99507 18876 | 🌐 https://garvix.in`
  );
}

// 4. WhatsApp message for AMC Renewal
export function getAmcRenewalWhatsAppText(params: {
  customerName: string;
  contactPerson?: string | null;
  contractNumber: string;
  serviceTitle: string;
  expiryDateStr: string;
  daysRemaining: number;
}): string {
  const greeting = params.contactPerson ? `Dear ${params.contactPerson} ji` : `Dear ${params.customerName}`;

  return (
    `*AMC RENEWAL NOTICE | GARVIX SOFTWARE SOLUTIONS*\n` +
    `---------------------------------------------\n` +
    `${greeting},\n\n` +
    `This is to notify you that your Annual Maintenance & Support Contract (*${params.serviceTitle} - #${params.contractNumber}*) is due for renewal on *${params.expiryDateStr}* (in ${params.daysRemaining} days).\n\n` +
    `To ensure uninterrupted software updates, RFID support, and maintenance visits, our team will share the renewal proposal with you.\n\n` +
    `Warm regards,\n` +
    `*Support & Services Desk - GARVIX Software Solutions Pvt. Ltd.*\n` +
    `📞 +91 99507 18876 | 🌐 https://garvix.in`
  );
}
