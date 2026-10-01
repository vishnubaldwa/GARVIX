import { prisma } from "@/lib/prisma";
import { formatINR, numberToWords } from "@/lib/gst";
import { notFound } from "next/navigation";
import { Radio, Printer, QrCode, ShieldCheck, CheckCircle2 } from "lucide-react";
import { generateUpiQrCodeDataUrl } from "@/lib/upi";
import { getCompanySettings } from "@/lib/settings";
import Image from "next/image";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ClientInvoicePortalPage({ params }: Props) {
  const { token } = await params;
  const company = await getCompanySettings();

  const invoice = await prisma.invoice.findUnique({
    where: { token },
    include: {
      customer: true,
      items: true,
      payments: true,
    },
  });

  if (!invoice) {
    notFound();
  }

  const qrDataUrl = invoice.upiQrString ? await generateUpiQrCodeDataUrl(invoice.upiQrString) : "";

  return (
    <div className="min-h-screen bg-[#07090e] py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-cyan-500/30 bg-[#0d1424] p-4 no-print">
          <div>
            <span className="text-xs font-semibold text-slate-400">{company.name} Billing Portal</span>
            <h2 className="text-base font-bold text-white">Invoice #{invoice.invoiceNumber}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold font-mono uppercase ${
                invoice.paymentStatus === "PAID"
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                  : invoice.paymentStatus === "PARTIAL"
                  ? "bg-amber-950/80 text-amber-400 border border-amber-500/30"
                  : "bg-rose-950/80 text-rose-400 border border-rose-500/30"
              }`}
            >
              {invoice.paymentStatus}
            </span>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="rounded-2xl border border-slate-800 bg-[#0b101c] p-8 md:p-12 shadow-2xl text-slate-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-800 pb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Radio className="h-5 w-5" />
                </div>
                <span className="text-2xl font-black tracking-widest text-white">
                  {company.name.split(" ")[0] || "GARVIX"}
                </span>
              </div>
              <p className="text-xs text-cyan-400 font-semibold mt-1">{company.name}</p>
              <p className="text-xs text-slate-400">{company.address}</p>
              <p className="text-xs text-slate-400">
                Email: {company.email} • Phone: {company.phone}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                GSTIN: {company.gstin} • State: {company.state} ({company.stateCode})
              </p>
            </div>

            <div className="text-right sm:text-right space-y-1">
              <span className="inline-block rounded-md border border-cyan-500/40 bg-cyan-950/40 px-3 py-1 text-xs font-mono font-bold text-cyan-300">
                TAX INVOICE
              </span>
              <p className="text-sm font-bold text-white mt-2 font-mono">{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-400">Date: {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</p>
              {invoice.dueDate && (
                <p className="text-xs text-slate-400">Due Date: {new Date(invoice.dueDate).toLocaleDateString("en-IN")}</p>
              )}
            </div>
          </div>

          {/* Bill To & Dispatch Details */}
          <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800/80 bg-[#070b14] p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Billed To (Buyer):</span>
              <h3 className="text-base font-bold text-white mt-1">{invoice.customer.companyName}</h3>
              {invoice.customer.contactPerson && (
                <p className="text-xs text-slate-300 mt-0.5">Attn: {invoice.customer.contactPerson}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">{invoice.customer.billingAddress || "Office address"}</p>
              <p className="text-xs text-slate-400">
                State: {invoice.customer.state} ({invoice.customer.stateCode})
              </p>
              {invoice.customer.gstin && (
                <p className="text-xs text-cyan-400 font-mono mt-0.5 font-bold">GSTIN: {invoice.customer.gstin}</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-[#070b14] p-5 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transportation / E-Way Bill:</span>
              {invoice.ewayBillNo ? (
                <>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">E-Way Bill No:</span>
                    <span className="text-cyan-400 font-bold">{invoice.ewayBillNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transporter:</span>
                    <span className="text-white">{invoice.transporterName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Vehicle No:</span>
                    <span className="text-white">{invoice.vehicleNo || "N/A"}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">LR / Doc No:</span>
                    <span className="text-white">{invoice.lrNo || "N/A"}</span>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 italic text-xs mt-2">
                  Standard dispatch / Local supply (E-Way bill not required under ₹50k or services).
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-700 bg-slate-900/50 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Item & Description</th>
                  <th className="py-3 px-3">HSN/SAC</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Rate</th>
                  <th className="py-3 px-3 text-right">Tax</th>
                  <th className="py-3 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-medium text-slate-200">{item.description}</div>
                      {item.serialNumbersList && (
                        <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
                          Serials: {item.serialNumbersList}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{item.hsnCode}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{item.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatINR(item.unitPrice)}</td>
                    <td className="py-3 px-3 text-right text-slate-400">{formatINR(item.taxAmount)}</td>
                    <td className="py-3 px-3 text-right font-bold text-white">{formatINR(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & UPI QR Code Section */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* UPI QR Column */}
            <div className="md:col-span-6 rounded-xl border border-cyan-500/30 bg-[#070b14] p-5">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase mb-3">
                <QrCode className="h-4 w-4" />
                <span>Instant UPI Payment QR Code</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {qrDataUrl && (
                  <div className="bg-white p-2.5 rounded-xl shadow-lg shrink-0">
                    <img
                      src={qrDataUrl}
                      alt="UPI Payment QR Code"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                )}
                <div className="text-xs space-y-1.5 text-slate-300">
                  <p className="text-slate-400 font-mono text-[11px]">UPI VPA: <span className="text-cyan-400 font-bold">garvix@upi</span></p>
                  <p className="text-slate-400 font-mono text-[11px]">Payee: <span className="text-white">GARVIX TECHNOLOGIES</span></p>
                  <p className="text-slate-400 font-mono text-[11px]">Amount: <span className="text-emerald-400 font-bold">{formatINR(invoice.balanceDue)}</span></p>
                  <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                    Scan via PhonePe, Google Pay, Paytm, or BHIM for instant reconciliation.
                  </p>
                </div>
              </div>
            </div>

            {/* Tax Totals Column */}
            <div className="md:col-span-6 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Taxable Subtotal:</span>
                <span>{formatINR(invoice.subtotal)}</span>
              </div>

              {invoice.taxType === "INTRA_STATE" ? (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>CGST ({invoice.cgstRate}%):</span>
                    <span>{formatINR(invoice.cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SGST ({invoice.sgstRate}%):</span>
                    <span>{formatINR(invoice.sgstAmount)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-400">
                  <span>IGST ({invoice.igstRate}%):</span>
                  <span>{formatINR(invoice.igstAmount)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-slate-700 pt-2 text-base font-bold text-white">
                <span>Invoice Total:</span>
                <span>{formatINR(invoice.totalAmount)}</span>
              </div>

              <div className="flex justify-between text-emerald-400 pt-1">
                <span>Amount Paid:</span>
                <span>{formatINR(invoice.amountPaid)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-cyan-400 border-t border-slate-800 pt-2">
                <span>Balance Due:</span>
                <span>{formatINR(invoice.balanceDue)}</span>
              </div>

              <p className="text-[11px] text-slate-400 font-sans italic pt-2">
                Amount in words: {numberToWords(invoice.totalAmount)}
              </p>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-end text-xs text-slate-400">
            <div>
              <p className="font-semibold text-slate-300">Terms & Conditions:</p>
              <p className="text-[11px] text-slate-500 whitespace-pre-line mt-1">
                {invoice.terms || `1. Goods once sold will not be taken back.\n2. Warranty valid per manufacturer terms.\n3. Subject to ${company.state} Jurisdiction.`}
              </p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-700 w-44 mb-1"></div>
              <p className="text-slate-300 font-semibold">For {company.name}</p>
              <p className="text-[11px] text-slate-500">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
