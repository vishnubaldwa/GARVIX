import { prisma } from "@/lib/prisma";
import { Users, Phone, Mail, Building, Send, CheckCircle2, Clock } from "lucide-react";
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
          <h1 className="text-2xl font-black text-white tracking-tight">Leads & CRM Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Incoming website enquiries with real-time Telegram Bot dispatch records.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d18] text-slate-400 font-semibold border-b border-slate-800 uppercase">
              <tr>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Interest / Solution</th>
                <th className="py-3 px-4">Requirement</th>
                <th className="py-3 px-4 text-center">Telegram Alert</th>
                <th className="py-3 px-4">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{lead.name}</div>
                    <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] mt-0.5">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    {lead.company || <span className="text-slate-500 italic">Not provided</span>}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[11px] font-mono text-cyan-300">
                      {lead.solution.replace("RFID_", "")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 max-w-xs text-[11px] leading-relaxed">
                    {lead.message}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {lead.telegramNotified ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
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
