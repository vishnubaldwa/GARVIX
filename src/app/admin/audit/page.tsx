import { prisma } from "@/lib/prisma";
import { ShieldCheck, Clock, User, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Security & Activity Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable event log tracking quotation creations, invoice conversions, tax return downloads, and staff logins.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d18] text-slate-400 font-semibold border-b border-slate-800 uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff User</th>
                <th className="py-3 px-4 text-center">Action Type</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {new Date(log.createdAt).toLocaleString("en-IN")}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-cyan-400 font-sans">
                    {log.username || "System Engine"}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        log.action === "EXPORT_GST"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                          : log.action === "CONVERT"
                          ? "bg-purple-950 text-purple-300 border border-purple-500/30"
                          : log.action === "CREATE"
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 font-bold">
                    {log.entityType}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-200 text-xs">
                    {log.details}
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
