import QRCode from "qrcode";

export interface UpiPaymentParams {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionRef: string;
  note?: string;
}

export function buildUpiUri(params: UpiPaymentParams): string {
  const vpa = encodeURIComponent(params.upiId.trim());
  const pn = encodeURIComponent(params.payeeName.trim());
  const am = params.amount.toFixed(2);
  const tr = encodeURIComponent(params.transactionRef.replace(/[^a-zA-Z0-9]/g, ""));
  const tn = encodeURIComponent(params.note || `Payment for ${params.transactionRef}`);

  return `upi://pay?pa=${vpa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}&tr=${tr}`;
}

export async function generateUpiQrCodeDataUrl(upiUri: string): Promise<string> {
  try {
    return await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
      color: {
        dark: "#0a0e17",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to generate QR code:", err);
    return "";
  }
}
