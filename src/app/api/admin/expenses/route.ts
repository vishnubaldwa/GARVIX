import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_VIEW_FINANCES"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const [expenses, staff] = await Promise.all([
      prisma.expense.findMany({
        orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
        take: 250,
      }),
      prisma.user.findMany({
        where: {
          isActive: true,
          role: { not: "DOCUMENT_VIEWER" },
        },
        select: { name: true, role: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingReimbursements = expenses
      .filter((e) => e.reimbursementStatus === "PENDING")
      .reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      totalExpenses,
      pendingReimbursements,
      staffNames: staff.map((u) => u.name).filter(Boolean),
      expenses: expenses.map((e) => ({
        id: e.id,
        expenseDate: e.expenseDate,
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
        receiptMimeType: e.receiptMimeType,
        receiptApiUrl: e.receiptUrl ? `/api/admin/expenses/${e.id}/receipt` : null,
        isTaxDeductible: e.isTaxDeductible,
        createdAt: e.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load expenses" },
      { status: 500 }
    );
  }
}
