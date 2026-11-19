import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";
import {
  parseExpenseDateInput,
  saveExpenseReceipt,
} from "@/lib/expense-receipts";

export const dynamic = "force-dynamic";

const VALID_REIMBURSEMENT = new Set(["COMPANY_PAID", "PENDING", "REIMBURSED"]);

function cleanOptString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_VIEW_FINANCES"));
    if (!allowed) {
      return NextResponse.json(
        { error: "Access denied. Finance permission required." },
        { status: 403 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let category = "";
    let amount = 0;
    let description = "";
    let paymentMode = "UPI";
    let expenseDateRaw: string | null = null;
    let vendorName: string | null = null;
    let paidBy: string | null = null;
    let billNumber: string | null = null;
    let referenceNo: string | null = null;
    let reimbursementStatus = "COMPANY_PAID";
    let notes: string | null = null;
    let isTaxDeductible = true;
    let receiptFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      category = String(formData.get("category") || "MISC").trim();
      amount = Number(formData.get("amount") || 0);
      description = String(formData.get("description") || "").trim();
      paymentMode = String(formData.get("paymentMode") || "UPI").trim() || "UPI";
      expenseDateRaw = cleanOptString(formData.get("expenseDate"));
      vendorName = cleanOptString(formData.get("vendorName"));
      paidBy = cleanOptString(formData.get("paidBy"));
      billNumber = cleanOptString(formData.get("billNumber"));
      referenceNo = cleanOptString(formData.get("referenceNo"));
      const rawReimb = String(formData.get("reimbursementStatus") || "COMPANY_PAID").trim();
      reimbursementStatus = VALID_REIMBURSEMENT.has(rawReimb) ? rawReimb : "COMPANY_PAID";
      notes = cleanOptString(formData.get("notes"));
      const rawTax = formData.get("isTaxDeductible");
      if (rawTax !== null) {
        isTaxDeductible = String(rawTax) !== "false";
      }
      const maybeFile = formData.get("receipt");
      if (maybeFile instanceof File && maybeFile.size > 0) {
        receiptFile = maybeFile;
      }
    } else {
      const body = await request.json();
      category = String(body.category || "MISC").trim();
      amount = Number(body.amount || 0);
      description = String(body.description || "").trim();
      paymentMode = String(body.paymentMode || "UPI").trim() || "UPI";
      expenseDateRaw = cleanOptString(body.expenseDate);
      vendorName = cleanOptString(body.vendorName);
      paidBy = cleanOptString(body.paidBy);
      billNumber = cleanOptString(body.billNumber);
      referenceNo = cleanOptString(body.referenceNo);
      const rawReimb = String(body.reimbursementStatus || "COMPANY_PAID").trim();
      reimbursementStatus = VALID_REIMBURSEMENT.has(rawReimb) ? rawReimb : "COMPANY_PAID";
      notes = cleanOptString(body.notes);
      if (typeof body.isTaxDeductible === "boolean") {
        isTaxDeductible = body.isTaxDeductible;
      }
    }

    if (!amount || Number.isNaN(amount) || amount <= 0 || !description) {
      return NextResponse.json(
        { error: "Please provide a valid amount and description." },
        { status: 400 }
      );
    }

    let receiptUrl: string | null = null;
    let receiptName: string | null = null;
    let receiptMimeType: string | null = null;

    if (receiptFile) {
      const saved = await saveExpenseReceipt(receiptFile);
      receiptUrl = saved.storageKey;
      receiptName = saved.fileName;
      receiptMimeType = saved.mimeType;
    }

    const parsedDate = parseExpenseDateInput(expenseDateRaw);

    const expense = await prisma.expense.create({
      data: {
        expenseDate: parsedDate ?? new Date(),
        category: category || "MISC",
        amount,
        description,
        paymentMode,
        vendorName,
        paidBy,
        billNumber,
        referenceNo,
        reimbursementStatus,
        notes,
        receiptUrl,
        receiptName,
        receiptMimeType,
        isTaxDeductible,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email || "admin@garvix.in",
        action: "CREATE",
        entityType: "EXPENSE",
        entityId: expense.id,
        details: `Logged expense of INR ${amount} under ${expense.category}: ${description}${vendorName ? ` (Vendor: ${vendorName})` : ""}`,
      },
    });

    revalidatePath("/admin", "layout");

    return NextResponse.json({ success: true, expense });
  } catch (err: any) {
    console.error("Expense log error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log expense." },
      { status: 500 }
    );
  }
}
