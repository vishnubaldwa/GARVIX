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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security & Activity Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable event log tracking quotation creations, invoice conversions, tax return downloads, and staff logins.
        </p>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff User</th>
                <th className="py-3 px-4 text-center">Action Type</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(log.createdAt).toLocaleString("en-IN")}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                    {log.username || "System Engine"}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        log.action === "EXPORT_GST"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : log.action === "CONVERT"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : log.action === "CREATE"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-bold">
                    {log.entityType}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-600 text-xs">
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
