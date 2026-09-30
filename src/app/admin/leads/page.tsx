import { prisma } from "@/lib/prisma";
import { Phone, Mail, CheckCircle2 } from "lucide-react";
import { LeadStatusSelector } from "@/components/admin/LeadStatusSelector";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leads & CRM Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            Website enquiries captured with real-time Telegram Bot dispatch logs.
          </p>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Interest / Solution</th>
                <th className="py-3 px-4">Requirement</th>
                <th className="py-3 px-4 text-center">Telegram Alert</th>
                <th className="py-3 px-4">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                    <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[11px] mt-0.5">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {lead.company || <span className="text-slate-400 italic">Not provided</span>}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-mono text-blue-700 font-semibold">
                      {lead.solution.replace("RFID_", "")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-xs text-[11px] leading-relaxed">
                    {lead.message}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {lead.telegramNotified ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <LeadStatusSelector leadId={lead.id} currentStatus={lead.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
