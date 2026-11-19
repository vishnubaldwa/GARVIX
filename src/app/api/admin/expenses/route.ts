import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed = await hasPermission(session.role, "CAN_VIEW_FINANCES");
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const expenses = await prisma.expense.findMany({
      orderBy: { expenseDate: "desc" },
      take: 150,
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      totalExpenses,
      expenses: expenses.map((e) => ({
        id: e.id,
        expenseDate: e.expenseDate,
        category: e.category,
        amount: e.amount,
        description: e.description,
        paymentMode: e.paymentMode,
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
