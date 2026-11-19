import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";
import { getCompanySettings } from "@/lib/settings";
import { ShieldCheck, CheckCircle2, AlertTriangle, FilePlus2, Clock } from "lucide-react";
import Link from "next/link";
import { WhatsAppShareButton } from "@/components/admin/WhatsAppShareButton";
import { SuperAdminDeleteButton } from "@/components/admin/SuperAdminDeleteButton";
import {
  CreateAmcModalButton,
  EditAmcModalButton,
  CreateTicketModalButton,
  UpdateTicketModalButton,
} from "@/components/admin/AmcServiceActions";

export const dynamic = "force-dynamic";

export default async function AdminAmcPage() {
  const [session, company, contracts, tickets, customers, staff] = await Promise.all([
    getSession(),
    getCompanySettings(),
    prisma.aMCContract.findMany({
      include: { customer: true },
      orderBy: { endDate: "asc" },
    }),
    prisma.serviceTicket.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.user.findMany({
      where: { isActive: true, role: { not: "DOCUMENT_VIEWER" } },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const isSuperAdmin = isFullAdminRole(session?.role);
  const staffNames = staff.map((s) => s.name).filter(Boolean);
  const simpleContracts = contracts.map((c) => ({
    id: c.id,
    contractNumber: c.contractNumber,
    customerId: c.customerId,
    title: c.title,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">AMC Contracts &amp; Service Desk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Annual Maintenance Contracts (AMC), automated expiry countdowns, and on-site hardware support tickets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CreateAmcModalButton customers={customers} />
          <CreateTicketModalButton
            customers={customers}
            contracts={simpleContracts}
            staffNames={staffNames}
          />
        </div>
      </div>

      {/* AMC Contracts Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active AMC Contracts ({contracts.length})
          </h3>
        </div>
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Contract #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">SLA Scope</th>
                  <th className="py-3 px-4 whitespace-nowrap">Contract Period</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Frequency</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Value (₹)</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center font-sans text-slate-400">
                      No AMC contracts created yet. Click &ldquo;New AMC Contract&rdquo; above to add one.
                    </td>
                  </tr>
                ) : (
                  contracts.map((c) => {
                    const now = new Date();
                    const end = new Date(c.endDate);
                    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const isExpired = daysLeft < 0 || c.status === "EXPIRED";
                    const isExpiringSoon = !isExpired && daysLeft <= 30;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-blue-600 whitespace-nowrap">
                          {c.contractNumber}
                        </td>
                        <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                          {c.customer.companyName}
                        </td>
                        <td className="py-3.5 px-4 font-sans text-slate-700">
                          <div>{c.title}</div>
                          {c.notes && (
                            <div className="text-[11px] text-slate-400 mt-0.5">{c.notes}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                          <div>From: {new Date(c.startDate).toLocaleDateString("en-IN")}</div>
                          <div>To: {new Date(c.endDate).toLocaleDateString("en-IN")}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 font-bold">
                            {c.visitFrequency.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                          {formatINR(c.contractValue)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              <AlertTriangle className="h-3 w-3" /> Expired
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              <AlertTriangle className="h-3 w-3" /> {daysLeft}d Left
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              <ShieldCheck className="h-3 w-3" /> {c.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-sans whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <WhatsAppShareButton
                              phone={c.customer.phone}
                              clientName={c.customer.companyName}
                              documentType="AMC Renewal"
                              documentNumber={c.contractNumber}
                              amount={c.contractValue}
                              portalUrl={`https://garvix.in/admin/quotations/create`}
                              companyName={company.name}
                              iconOnly
                            />
                            <Link
                              href="/admin/quotations/create"
                              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-700 hover:bg-blue-100 transition"
                              title="Generate Renewal Quotation"
                            >
                              <FilePlus2 className="h-3.5 w-3.5" />
                            </Link>
                            {isSuperAdmin && (
                              <>
                                <EditAmcModalButton
                                  contract={{
                                    id: c.id,
                                    contractNumber: c.contractNumber,
                                    title: c.title,
                                    startDate: c.startDate.toISOString(),
                                    endDate: c.endDate.toISOString(),
                                    contractValue: c.contractValue,
                                    visitFrequency: c.visitFrequency,
                                    status: c.status,
                                    notes: c.notes,
                                  }}
                                />
                                <SuperAdminDeleteButton
                                  entity="amc"
                                  id={c.id}
                                  label={`AMC ${c.contractNumber}`}
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Support Tickets */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Service &amp; Maintenance Tickets ({tickets.length})
        </h3>
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Ticket #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Reported Issue</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Priority</th>
                  <th className="py-3 px-4 whitespace-nowrap">Assigned Engineer</th>
                  <th className="py-3 px-4">Resolution Summary</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No service tickets logged yet. Click &ldquo;Log Service Ticket&rdquo; above to create one.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => {
                    const isDone = t.status === "RESOLVED" || t.status === "CLOSED";
                    const isProgress = t.status === "IN_PROGRESS";
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                          {t.ticketNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {t.customer.companyName}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div>{t.issueTitle}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{t.description}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono whitespace-nowrap">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                              t.priority === "CRITICAL" || t.priority === "HIGH"
                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                : t.priority === "MEDIUM"
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-slate-100 border-slate-200 text-slate-600"
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {t.assignedTo || "Unassigned"}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] max-w-xs font-medium">
                          {t.resolutionNotes ? (
                            <span className="text-emerald-700">{t.resolutionNotes}</span>
                          ) : (
                            <span className="text-slate-400 italic">Pending resolution</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                              isDone
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : isProgress
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-rose-50 border-rose-200 text-rose-700"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {t.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <UpdateTicketModalButton
                              ticket={{
                                id: t.id,
                                ticketNumber: t.ticketNumber,
                                issueTitle: t.issueTitle,
                                priority: t.priority,
                                status: t.status,
                                assignedTo: t.assignedTo,
                                resolutionNotes: t.resolutionNotes,
                              }}
                              staffNames={staffNames}
                            />
                            {isSuperAdmin && (
                              <SuperAdminDeleteButton
                                entity="ticket"
                                id={t.id}
                                label={`ticket ${t.ticketNumber}`}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
