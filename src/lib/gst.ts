export const HARYANA_STATE_CODE = "06";

export const INDIAN_STATES: { code: string; name: string }[] = [
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "19", name: "West Bengal" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "33", name: "Tamil Nadu" },
  { code: "36", name: "Telangana" },
];

export const STANDARD_HSN_CODES = [
  { code: "8471", label: "8471 - RFID Readers, Scanners & Processing Machines", category: "Hardware" },
  { code: "8523", label: "8523 - RFID Tags, Cards, Antennas & Smart Devices", category: "Hardware" },
  { code: "8543", label: "8543 - RFID Custom Electrical Transceivers", category: "Hardware" },
  { code: "998314", label: "998314 - Custom Software Design & Development", category: "Service" },
  { code: "998315", label: "998315 - Software & Hardware Maintenance / AMC", category: "Service" },
  { code: "9987", label: "9987 - Maintenance and Repair of Computers & Peripherals", category: "Service" },
];

export interface TaxBreakdown {
  taxType: "INTRA_STATE" | "INTER_STATE";
  taxRate: number; // e.g. 18
  cgstRate: number; // 9
  cgstAmount: number;
  sgstRate: number; // 9
  sgstAmount: number;
  igstRate: number; // 18 or 0
  igstAmount: number;
  totalTax: number;
}

export function computeGst(
  taxableAmount: number,
  customerStateCode: string = "06",
  ratePercent: number = 18
): TaxBreakdown {
  const isIntraState = customerStateCode.trim() === HARYANA_STATE_CODE;
  const totalTax = Math.round(((taxableAmount * ratePercent) / 100) * 100) / 100;

  if (isIntraState) {
    const halfRate = ratePercent / 2;
    const halfTax = Math.round((totalTax / 2) * 100) / 100;
    return {
      taxType: "INTRA_STATE",
      taxRate: ratePercent,
      cgstRate: halfRate,
      cgstAmount: halfTax,
      sgstRate: halfRate,
      sgstAmount: halfTax,
      igstRate: 0,
      igstAmount: 0,
      totalTax: halfTax * 2,
    };
  } else {
    return {
      taxType: "INTER_STATE",
      taxRate: ratePercent,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: ratePercent,
      igstAmount: totalTax,
      totalTax: totalTax,
    };
  }
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

export function numberToWords(num: number): string {
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
    "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ",
    "Seventeen ", "Eighteen ", "Nineteen ",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const n = ("000000000" + Math.floor(num)).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";

  let str = "";
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) + "Crore " : "";
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) + "Lakh " : "";
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) + "Thousand " : "";
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) + "Hundred " : "";
  str += Number(n[5]) !== 0
    ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])])
    : "";

  return str ? `Rupees ${str.trim()} Only` : "Zero Rupees";
}
