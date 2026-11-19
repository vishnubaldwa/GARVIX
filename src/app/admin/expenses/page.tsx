import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/gst";
import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";
import { Paperclip } from "lucide-react";
import { ExpenseCreateForm } from "@/components/admin/ExpenseCreateForm";
import { ExpenseEditButton } from "@/components/admin/ExpenseEditButton";
import { SuperAdminDeleteButton } from "@/components/admin/SuperAdminDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  const [session, expenses, staff] = await Promise.all([
    getSession(),
    prisma.expense.findMany({
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    }),
    prisma.user.findMany({
      where: { isActive: true, role: { not: "DOCUMENT_VIEWER" } },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const isSuperAdmin = isFullAdminRole(session?.role);

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const pendingReimbursement = expenses
    .filter((e) => e.reimbursementStatus === "PENDING")
    .reduce((s, e) => s + e.amount, 0);
  const distinctCategories = Array.from(new Set(expenses.map((e) => e.category)));
  const staffNames = staff.map((u) => u.name).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Expense Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Log operating costs, vendor bills, director reimbursements, and attach receipts for CA audit &amp; net profit tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingReimbursement > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-mono text-amber-800">
              Pending Reimb.: <span className="font-bold">{formatINR(pendingReimbursement)}</span>
            </div>
          )}
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-mono text-rose-800">
            Total Expenses: <span className="font-bold">{formatINR(totalExpense)}</span>
          </div>
        </div>
      </div>

      {/* Top Full-Width Compact Record New Expense Form */}
      <div className="admin-card p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Record New Expense
          </h3>
          <span className="text-[11px] text-slate-400">
            Quick 2-row entry • Click &ldquo;More Details&rdquo; for Paid By, Bill # &amp; Receipt
          </span>
        </div>
        <ExpenseCreateForm
          initialCustomCategories={distinctCategories}
          staffNames={staffNames}
        />
      </div>

      {/* Bottom Full-Width Expenses Register Table */}
      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Expense Register ({expenses.length} {expenses.length === 1 ? "Entry" : "Entries"})
          </h3>
          {isSuperAdmin && (
            <span className="text-[11px] text-slate-500">
              Super Admin: Edit &amp; Delete enabled
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Date</th>
                <th className="py-3 px-4 whitespace-nowrap">Category</th>
                <th className="py-3 px-4">Expense &amp; Vendor Details</th>
                <th className="py-3 px-4 whitespace-nowrap">Paid By &amp; Status</th>
                <th className="py-3 px-4 whitespace-nowrap">Mode</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Bill</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Amount</th>
                {isSuperAdmin && (
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 8 : 7}
                    className="py-10 text-center font-sans text-slate-400"
                  >
                    No business expenses logged yet.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(e.expenseDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 font-sans font-bold">
                        {e.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-slate-900">{e.description}</div>
                      {(e.vendorName || e.billNumber || e.referenceNo) && (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          {e.vendorName && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                              To: {e.vendorName}
                            </span>
                          )}
                          {e.billNumber && (
                            <span className="font-mono text-slate-500">Bill #{e.billNumber}</span>
                          )}
                          {e.referenceNo && (
                            <span className="font-mono text-slate-500">Ref: {e.referenceNo}</span>
                          )}
                        </div>
                      )}
                      {e.notes && (
                        <p className="mt-1 text-[11px] text-slate-500 leading-snug">{e.notes}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-sans whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {e.paidBy ? (
                          <span className="rounded bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                            {e.paidBy}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Company Account</span>
                        )}
                        {e.reimbursementStatus === "PENDING" && (
                          <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Pending Reimb.
                          </span>
                        )}
                        {e.reimbursementStatus === "REIMBURSED" && (
                          <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Reimbursed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {e.paymentMode.replace(/_/g, " ")}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {e.receiptUrl ? (
                        <a
                          href={`/api/admin/expenses/${e.id}/receipt`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={e.receiptName || "View Bill / Receipt"}
                          className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-700 hover:bg-blue-100 transition"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                      {formatINR(e.amount)}
                    </td>
                    {isSuperAdmin && (
                      <td className="py-3.5 px-4 text-right font-sans whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <ExpenseEditButton
                            expense={{
                              id: e.id,
                              expenseDate: e.expenseDate.toISOString(),
                              category: e.category,
                              amount: e.amount,
                              description: e.description,
                              paymentMode: e.paymentMode,
                              vendorName: e.vendorName,
                              paidBy: e.paidBy,
                              billNumber: e.billNumber,
                              referenceNo: e.referenceNo,
                              reimbursementStatus: e.reimbursementStatus,
                              notes: e.notes,
                              hasReceipt: Boolean(e.receiptUrl),
                              receiptName: e.receiptName,
                            }}
                            customCategories={distinctCategories}
                            staffNames={staffNames}
                          />
                          <SuperAdminDeleteButton
                            entity="expense"
                            id={e.id}
                            label={`expense "${e.description}"`}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
