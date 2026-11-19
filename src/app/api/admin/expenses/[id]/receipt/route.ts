import { NextResponse } from "next/server";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";
import { resolveExpenseReceiptPath } from "@/lib/expense-receipts";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || !expense.receiptUrl) {
      return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
    }

    const fullPath = resolveExpenseReceiptPath(expense.receiptUrl);
    if (!fullPath) {
      return NextResponse.json({ error: "Invalid receipt path." }, { status: 400 });
    }

    const buffer = await fs.readFile(fullPath);
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "1";
    const fileName = (expense.receiptName || expense.receiptUrl).replace(/"/g, "");

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": expense.receiptMimeType || "application/octet-stream",
        "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      return NextResponse.json({ error: "Receipt file missing on server." }, { status: 404 });
    }
    return NextResponse.json(
      { error: err.message || "Failed to load receipt." },
      { status: 500 }
    );
  }
}
