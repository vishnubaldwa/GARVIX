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
}: {
  phone?: string | null;
  clientName: string;
  documentType: "Quotation" | "Tax Invoice";
  documentNumber: string;
  amount: number;
  portalUrl: string;
}) {
  const handleShare = () => {
    let cleanPhone = "";
    if (phone) {
      cleanPhone = phone.replace(/[^\d]/g, "");
      if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
      }
    }

    const message = `Dear ${clientName},\n\nPlease find your ${documentType} *#${documentNumber}* for *${formatINR(amount)}* from *GARVIX TECHNOLOGIES*.\n\n🔗 *View & Download Document:* ${portalUrl}\n\nThank you for choosing GARVIX!`;

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
      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
      title="Share directly to Client via WhatsApp"
    >
      <MessageSquareShare className="h-3 w-3 text-emerald-600" />
      <span>WhatsApp</span>
    </button>
  );
}
