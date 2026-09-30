import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { Wallet, Plus, TrendingDown } from "lucide-react";
import { ExpenseCreateForm } from "@/components/admin/ExpenseCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { expenseDate: "desc" },
  });

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Business Expense Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Log cloud hosting, on-site travel, prototyping, and office operating costs for net profit computation.
          </p>
        </div>

        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-3.5 py-1.5 text-xs font-mono text-rose-300">
          Total Expenses: <span className="font-bold">{formatINR(totalExpense)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Record New Expense</h3>
          <ExpenseCreateForm />
        </div>

        {/* Expenses Table (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d18] text-slate-400 font-semibold border-b border-slate-800 uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(e.expenseDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-cyan-300 font-sans font-bold">
                        {e.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-200">
                      {e.description}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {e.paymentMode}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                      {formatINR(e.amount)}
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
