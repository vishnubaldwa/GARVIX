import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { Clock, ShieldCheck, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAmcPage() {
  const [contracts, tickets] = await Promise.all([
    prisma.aMCContract.findMany({
      include: { customer: true },
      orderBy: { endDate: "asc" },
    }),
    prisma.serviceTicket.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">AMC Contracts & Service Desk</h1>
        <p className="text-xs text-slate-500 mt-1">
          Annual Maintenance Contracts (AMC), automated expiry countdowns, and on-site hardware support tickets.
        </p>
      </div>

      {/* AMC Contracts Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active AMC Contracts</h3>
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-4">Contract #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">SLA Scope</th>
                  <th className="py-3 px-4">Contract Period</th>
                  <th className="py-3 px-4 text-center">Frequency</th>
                  <th className="py-3 px-4 text-right">Value (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {contracts.map((c) => {
                  const now = new Date();
                  const end = new Date(c.endDate);
                  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = daysLeft <= 30 && daysLeft >= 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-blue-600">{c.contractNumber}</td>
                      <td className="py-3.5 px-4 font-sans font-medium text-slate-900">
                        {c.customer.companyName}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-700">{c.title}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div>From: {new Date(c.startDate).toLocaleDateString("en-IN")}</div>
                        <div>To: {new Date(c.endDate).toLocaleDateString("en-IN")}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 font-bold">
                          {c.visitFrequency}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                        {formatINR(c.contractValue)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        {isExpiringSoon ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <AlertTriangle className="h-3 w-3" /> {daysLeft} Days Left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <ShieldCheck className="h-3 w-3" /> Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Support Tickets */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Service & Maintenance Tickets</h3>
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Reported Issue</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4">Assigned Engineer</th>
                  <th className="py-3 px-4">Resolution Summary</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{t.ticketNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{t.customer.companyName}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>{t.issueTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {t.assignedTo || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 text-[11px] max-w-xs font-medium">
                      {t.resolutionNotes || "Work in progress"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                        <CheckCircle2 className="h-3 w-3" /> {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
