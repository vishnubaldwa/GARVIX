import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { notFound } from "next/navigation";
import { Radio, Download, CheckCircle, ShieldCheck, Printer } from "lucide-react";
import { ClientQuotationAcceptButton } from "@/components/portal/ClientQuotationAcceptButton";
import { PrintButton } from "@/components/portal/PrintButton";
import { getCompanySettings } from "@/lib/settings";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ClientQuotationPage({ params }: Props) {
  const { token } = await params;
  const company = await getCompanySettings();

  const quotation = await prisma.quotation.findUnique({
    where: { token },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!quotation) {
    notFound();
  }

  const isAccepted = quotation.status === "ACCEPTED" || quotation.status === "CONVERTED";

  return (
    <div className="min-h-screen bg-[#07090e] py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-cyan-500/30 bg-[#0d1424] p-4 no-print">
          <div>
            <span className="text-xs font-semibold text-slate-400">GARVIX Client Document Portal</span>
            <h2 className="text-base font-bold text-white">Quotation #{quotation.quoteNumber}</h2>
          </div>
          <div className="flex items-center gap-3">
            <PrintButton />
            {!isAccepted && (
              <ClientQuotationAcceptButton token={token} />
            )}
          </div>
        </div>

        {isAccepted && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-emerald-300 text-xs flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>
                <strong>Quotation Accepted!</strong> Signed by {quotation.acceptedSignature || "Authorized Signatory"} on {quotation.acceptedAt ? new Date(quotation.acceptedAt).toLocaleDateString("en-IN") : "Record"}.
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-900/60 px-2.5 py-1 rounded">Status: Accepted</span>
          </div>
        )}

        {/* Printable Quotation Document Card */}
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
                PROPOSAL / QUOTATION
              </span>
              <p className="text-sm font-bold text-white mt-2 font-mono">{quotation.quoteNumber}</p>
              <p className="text-xs text-slate-400">Date: {new Date(quotation.createdAt).toLocaleDateString("en-IN")}</p>
              <p className="text-xs text-slate-400">
                Valid Until: {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString("en-IN") : "15 Days from Date"}
              </p>
            </div>
          </div>

          {/* Client Info */}
          <div className="my-8 rounded-xl border border-slate-800/80 bg-[#070b14] p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quotation Prepared For:</span>
            <h3 className="text-base font-bold text-white mt-1">{quotation.customer.companyName}</h3>
            {quotation.customer.contactPerson && (
              <p className="text-xs text-slate-300 mt-0.5">Attn: {quotation.customer.contactPerson}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">{quotation.customer.billingAddress || "Office address on file"}</p>
            <p className="text-xs text-slate-400">
              State: {quotation.customer.state} ({quotation.customer.stateCode}) • Phone: {quotation.customer.phone}
            </p>
            {quotation.customer.gstin && (
              <p className="text-xs text-cyan-400 font-mono mt-0.5">Client GSTIN: {quotation.customer.gstin}</p>
            )}
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-700 bg-slate-900/50 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">HSN/SAC</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Rate</th>
                  <th className="py-3 px-3 text-right">Tax (18%)</th>
                  <th className="py-3 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {quotation.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">{item.description}</td>
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

          {/* Tax Breakdown & Totals */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-6">
            <div className="max-w-md text-xs space-y-2 text-slate-400">
              <h4 className="font-bold uppercase text-slate-300 text-[11px]">Terms & Conditions:</h4>
              <p className="whitespace-pre-line leading-relaxed text-[11px]">
                {quotation.terms || "1. 50% Advance with official Purchase Order, 50% on installation/delivery.\n2. Goods remain property of GARVIX until paid in full.\n3. Haryana State Jurisdiction."}
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (Taxable):</span>
                <span>{formatINR(quotation.subtotal)}</span>
              </div>

              {quotation.taxType === "INTRA_STATE" ? (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>CGST (9%):</span>
                    <span>{formatINR(quotation.cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SGST (9%):</span>
                    <span>{formatINR(quotation.sgstAmount)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-400">
                  <span>IGST (18%):</span>
                  <span>{formatINR(quotation.igstAmount)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-slate-700 pt-2 text-base font-bold text-cyan-400">
                <span>Grand Total:</span>
                <span>{formatINR(quotation.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-end text-xs text-slate-400">
            <div>
              <p className="font-semibold text-slate-300">Thank you for considering GARVIX.</p>
              <p className="text-[11px] text-slate-500 mt-1">Computer-generated quotation powered by Garvix ERP Engine.</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-700 w-44 mb-1"></div>
              <p className="text-slate-300 font-semibold">Authorized Signatory</p>
              <p className="text-[11px] text-slate-500">{company.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
