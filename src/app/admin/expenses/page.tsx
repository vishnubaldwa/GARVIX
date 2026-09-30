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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Expense Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Log cloud hosting, on-site travel, prototyping, and office operating costs for net profit computation.
          </p>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-mono text-rose-800">
          Total Expenses: <span className="font-bold">{formatINR(totalExpense)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form (4 cols) */}
        <div className="lg:col-span-4 admin-card p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Record New Expense</h3>
          <ExpenseCreateForm />
        </div>

        {/* Expenses Table (8 cols) */}
        <div className="lg:col-span-8 admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(e.expenseDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 font-sans font-bold">
                        {e.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-900">
                      {e.description}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {e.paymentMode}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
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
