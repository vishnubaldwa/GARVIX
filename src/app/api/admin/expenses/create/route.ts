import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { category, amount, description, paymentMode } = await request.json();
    if (!amount || !description) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const session = await getSession();

    const expense = await prisma.expense.create({
      data: {
        category,
        amount: Number(amount),
        description,
        paymentMode: paymentMode || "UPI",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        username: session?.email || "admin@garvix.in",
        action: "CREATE",
        entityType: "EXPENSE",
        entityId: expense.id,
        details: `Logged expense of INR ${amount} under ${category}: ${description}`,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (err: any) {
    console.error("Expense log error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
