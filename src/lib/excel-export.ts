import * as XLSX from "xlsx";

export interface InvoiceRecord {
  invoiceNumber: string;
  invoiceDate: Date;
  totalAmount: number;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  customer: {
    companyName: string;
    gstin?: string | null;
    state: string;
    stateCode: string;
    isB2B: boolean;
  };
  items: {
    hsnCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
  }[];
}

export interface PurchaseRecord {
  billNumber: string;
  vendorName: string;
  vendorGstin?: string | null;
  billDate: Date;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  itcEligible: boolean;
}

export function generateGstr1Workbook(invoices: InvoiceRecord[], monthYearLabel: string): Buffer {
  const wb = XLSX.utils.book_new();

  // 1. B2B Sheet
  const b2bRows = invoices
    .filter((inv) => inv.customer.isB2B && inv.customer.gstin)
    .map((inv) => ({
      "GSTIN/UIN of Recipient": inv.customer.gstin,
      "Receiver Name": inv.customer.companyName,
      "Invoice Number": inv.invoiceNumber,
      "Invoice date": new Date(inv.invoiceDate).toLocaleDateString("en-IN"),
      "Invoice Value": inv.totalAmount,
      "Place Of Supply": `${inv.customer.stateCode}-${inv.customer.state}`,
      "Reverse Charge": "N",
      "Applicable % of Tax Rate": "",
      "Invoice Type": "Regular",
      "E-Commerce GSTIN": "",
      "Rate (%)": inv.igstAmount > 0 ? 18 : 18,
      "Taxable Value": inv.subtotal,
      "Central Tax (CGST)": inv.cgstAmount,
      "State Tax (SGST)": inv.sgstAmount,
      "Integrated Tax (IGST)": inv.igstAmount,
      "Cess Amount": 0,
    }));

  const wsB2B = XLSX.utils.json_to_sheet(b2bRows.length > 0 ? b2bRows : [{ Note: "No B2B Invoices for period" }]);
  XLSX.utils.book_append_sheet(wb, wsB2B, "b2b");

  // 2. B2CS Sheet (Unregistered / Consumers)
  const b2csRows = invoices
    .filter((inv) => !inv.customer.isB2B || !inv.customer.gstin)
    .map((inv) => ({
      Type: "OE",
      "Place Of Supply": `${inv.customer.stateCode}-${inv.customer.state}`,
      "Applicable % of Tax Rate": "",
      "Rate (%)": 18,
      "Taxable Value": inv.subtotal,
      "Central Tax": inv.cgstAmount,
      "State Tax": inv.sgstAmount,
      "Integrated Tax": inv.igstAmount,
      "Cess Amount": 0,
      "E-Commerce GSTIN": "",
    }));

  const wsB2CS = XLSX.utils.json_to_sheet(b2csRows.length > 0 ? b2csRows : [{ Note: "No B2C Invoices for period" }]);
  XLSX.utils.book_append_sheet(wb, wsB2CS, "b2cs");

  // 3. HSN Summary Sheet
  const hsnMap = new Map<string, { desc: string; qty: number; totalVal: number; taxableVal: number; igst: number; cgst: number; sgst: number }>();
  for (const inv of invoices) {
    for (const item of inv.items) {
      const existing = hsnMap.get(item.hsnCode) || {
        desc: item.description,
        qty: 0,
        totalVal: 0,
        taxableVal: 0,
        igst: 0,
        cgst: 0,
        sgst: 0,
      };
      existing.qty += item.quantity;
      existing.totalVal += item.totalAmount;
      const taxable = item.quantity * item.unitPrice;
      existing.taxableVal += taxable;
      if (inv.igstAmount > 0) {
        existing.igst += item.taxAmount;
      } else {
        existing.cgst += item.taxAmount / 2;
        existing.sgst += item.taxAmount / 2;
      }
      hsnMap.set(item.hsnCode, existing);
    }
  }

  const hsnRows = Array.from(hsnMap.entries()).map(([hsn, d]) => ({
    HSN: hsn,
    Description: d.desc,
    UQC: "NOS/PCS",
    "Total Quantity": d.qty,
    "Total Value": Math.round(d.totalVal * 100) / 100,
    "Rate (%)": 18,
    "Taxable Value": Math.round(d.taxableVal * 100) / 100,
    "Integrated Tax Amount": Math.round(d.igst * 100) / 100,
    "Central Tax Amount": Math.round(d.cgst * 100) / 100,
    "State/UT Tax Amount": Math.round(d.sgst * 100) / 100,
    "Cess Amount": 0,
  }));

  const wsHSN = XLSX.utils.json_to_sheet(hsnRows.length > 0 ? hsnRows : [{ Note: "No items recorded" }]);
  XLSX.utils.book_append_sheet(wb, wsHSN, "hsn");

  // 4. Docs Issued Sheet
  const firstInv = invoices[0]?.invoiceNumber || "N/A";
  const lastInv = invoices[invoices.length - 1]?.invoiceNumber || "N/A";
  const docRows = [
    {
      "Nature of Document": "Invoices for outward supply",
      "Sr. No. From": firstInv,
      "Sr. No. To": lastInv,
      "Total Number": invoices.length,
      Cancelled: 0,
    },
  ];
  const wsDocs = XLSX.utils.json_to_sheet(docRows);
  XLSX.utils.book_append_sheet(wb, wsDocs, "doc_issue");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

export function generateGstr3bSummaryWorkbook(
  invoices: InvoiceRecord[],
  purchases: PurchaseRecord[],
  periodLabel: string
): Buffer {
  const wb = XLSX.utils.book_new();

  const totalSalesTaxable = invoices.reduce((s, i) => s + i.subtotal, 0);
  const totalOutputCGST = invoices.reduce((s, i) => s + i.cgstAmount, 0);
  const totalOutputSGST = invoices.reduce((s, i) => s + i.sgstAmount, 0);
  const totalOutputIGST = invoices.reduce((s, i) => s + i.igstAmount, 0);

  const eligiblePurchases = purchases.filter((p) => p.itcEligible);
  const totalInputCGST = eligiblePurchases.reduce((s, p) => s + p.cgstAmount, 0);
  const totalInputSGST = eligiblePurchases.reduce((s, p) => s + p.sgstAmount, 0);
  const totalInputIGST = eligiblePurchases.reduce((s, p) => s + p.igstAmount, 0);

  const netPayableCGST = Math.max(0, totalOutputCGST - totalInputCGST);
  const netPayableSGST = Math.max(0, totalOutputSGST - totalInputSGST);
  const netPayableIGST = Math.max(0, totalOutputIGST - totalInputIGST);
  const netCashPayable = netPayableCGST + netPayableSGST + netPayableIGST;

  const summaryRows = [
    { Section: "1. Outward Supplies (Sales)", "Taxable Value (₹)": totalSalesTaxable, "IGST (₹)": totalOutputIGST, "CGST (₹)": totalOutputCGST, "SGST (₹)": totalOutputSGST, "Total Tax (₹)": totalOutputCGST + totalOutputSGST + totalOutputIGST },
    { Section: "2. Eligible ITC (Purchases)", "Taxable Value (₹)": eligiblePurchases.reduce((s, p) => s + p.subtotal, 0), "IGST (₹)": totalInputIGST, "CGST (₹)": totalInputCGST, "SGST (₹)": totalInputSGST, "Total Tax (₹)": totalInputCGST + totalInputSGST + totalInputIGST },
    { Section: "3. Net Tax Payable in Cash", "Taxable Value (₹)": "-", "IGST (₹)": netPayableIGST, "CGST (₹)": netPayableCGST, "SGST (₹)": netPayableSGST, "Total Tax (₹)": netCashPayable },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "GSTR-3B Summary");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
