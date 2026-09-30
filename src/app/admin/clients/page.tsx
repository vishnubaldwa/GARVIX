import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { Users, Building2, Phone, Mail, FileText, PlusCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ClientCreateModal } from "@/components/admin/ClientCreateModal";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      quotations: true,
      invoices: true,
      amcContracts: true,
    },
  });

  const totalClients = customers.length;
  const b2bClients = customers.filter((c) => c.isB2B || c.gstin).length;
  const haryanaClients = customers.filter((c) => c.stateCode === "06").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clients & Customer Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered B2B/B2C accounts, GSTIN place of supply, billing records, and active AMC contracts.
          </p>
        </div>

        <ClientCreateModal />
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Clients</span>
          <p className="mt-1 text-2xl font-black text-slate-900 font-mono">{totalClients}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active business relationships</p>
        </div>

        <div className="admin-card p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">B2B Registered</span>
          <p className="mt-1 text-2xl font-black text-blue-600 font-mono">{b2bClients}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Entities with valid GSTIN</p>
        </div>

        <div className="admin-card p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Haryana Local Clients</span>
          <p className="mt-1 text-2xl font-black text-emerald-700 font-mono">{haryanaClients}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Eligible for Intra-State CGST+SGST</p>
        </div>
      </div>

      {/* Clients Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone & Email</th>
                <th className="py-3 px-4">State & GSTIN</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-center">Quotes / Invoices</th>
                <th className="py-3 px-4 text-right">Outstanding Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {customers.map((c) => {
                const totalBalanceDue = c.invoices.reduce((s, inv) => s + inv.balanceDue, 0);

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-slate-900 text-sm">{c.companyName}</div>
                      {c.billingAddress && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs font-normal">
                          {c.billingAddress}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-700 font-medium">
                      {c.contactPerson || "—"}
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-600">
                      <div>{c.phone}</div>
                      {c.email && <div className="text-[11px] text-slate-400">{c.email}</div>}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-bold text-slate-900 font-sans">
                        {c.state} ({c.stateCode})
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {c.gstin || "Unregistered"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-sans">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          c.isB2B || c.gstin
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {c.isB2B || c.gstin ? "B2B" : "B2C"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-slate-700">
                        {c.quotations.length} Q / {c.invoices.length} Inv
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {totalBalanceDue > 0 ? (
                        <span className="font-bold text-amber-700 text-sm">
                          {formatINR(totalBalanceDue)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px]">Settled</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-sans">
                      <Link
                        href={`/admin/quotations/create`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                      >
                        <span>New Quote</span>
                        <ArrowUpRight className="h-3 w-3 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
