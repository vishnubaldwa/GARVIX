"use client";

import { MessageSquareShare } from "lucide-react";
import { formatINR } from "@/lib/gst";

export function WhatsAppShareButton({
  phone,
  clientName,
  documentType,
  documentNumber,
  amount,
  portalUrl,
  customLabel,
}: {
  phone?: string | null;
  clientName: string;
  documentType: "Quotation" | "Tax Invoice" | "Proforma Invoice" | "Payment Reminder" | "AMC Renewal" | string;
  documentNumber: string;
  amount: number;
  portalUrl: string;
  customLabel?: string;
}) {
  const handleShare = () => {
    let cleanPhone = "";
    if (phone) {
      cleanPhone = phone.replace(/[^\d]/g, "");
      if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
      }
    }

    let message = "";
    if (documentType === "AMC Renewal") {
      message = `Dear ${clientName},\n\nThis is a friendly reminder that your Annual Maintenance Contract (AMC) *#${documentNumber}* with *GARVIX SOFTWARE SOLUTIONS PVT LTD* is due for renewal.\n\n💰 *Annual Value:* ${formatINR(amount)}\n\nTo ensure uninterrupted hardware maintenance and priority technical support, please renew your contract.\n\n🔗 *Details:* ${portalUrl}\n\nThank you!`;
    } else if (documentType === "Payment Reminder") {
      message = `Dear ${clientName},\n\nThis is a gentle payment reminder regarding Invoice *#${documentNumber}* with an outstanding balance of *${formatINR(amount)}* due to *GARVIX SOFTWARE SOLUTIONS PVT LTD*.\n\nKindly arrange the clearance at your earliest convenience.\n\n🔗 *View & Pay Online:* ${portalUrl}\n\nThank you!`;
    } else if (documentType === "Proforma Invoice") {
      message = `Dear ${clientName},\n\nPlease find your Proforma Invoice *#${documentNumber}* for *${formatINR(amount)}* from *GARVIX SOFTWARE SOLUTIONS PVT LTD*.\n\n🔗 *View & Pay Advance:* ${portalUrl}\n\nThank you for choosing GARVIX!`;
    } else {
      message = `Dear ${clientName},\n\nPlease find your ${documentType} *#${documentNumber}* for *${formatINR(amount)}* from *GARVIX SOFTWARE SOLUTIONS PVT LTD*.\n\n🔗 *View & Download Document:* ${portalUrl}\n\nThank you for choosing GARVIX!`;
    }

    const encodedMessage = encodeURIComponent(message);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-300 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
      title="Share directly to Client via WhatsApp"
    >
      <MessageSquareShare className="h-3 w-3 text-emerald-600" />
      <span>{customLabel || "WhatsApp"}</span>
    </button>
  );
}
