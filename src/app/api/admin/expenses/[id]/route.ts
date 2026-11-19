import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";
import {
  deleteExpenseReceiptFile,
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

/**
 * Super-Admin-Only Expense Update API.
 * Supports both JSON and multipart/form-data (for uploading/replacing/removing bill receipts).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isFullAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Access denied. Only the Super Admin can edit expense entries." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    const updateData: Record<string, any> = {};
    let receiptFile: File | null = null;
    let removeReceipt = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      if (formData.has("category")) {
        const cat = String(formData.get("category") || "").trim();
        if (cat) updateData.category = cat;
      }
      if (formData.has("amount")) {
        const amt = Number(formData.get("amount"));
        if (Number.isNaN(amt) || amt <= 0) {
          return NextResponse.json({ error: "Amount must be greater than 0." }, { status: 400 });
        }
        updateData.amount = amt;
      }
      if (formData.has("description")) {
        const desc = String(formData.get("description") || "").trim();
        if (!desc) {
          return NextResponse.json({ error: "Description cannot be empty." }, { status: 400 });
        }
        updateData.description = desc;
      }
      if (formData.has("paymentMode")) {
        updateData.paymentMode = String(formData.get("paymentMode") || "UPI").trim() || "UPI";
      }
      if (formData.has("expenseDate")) {
        const parsed = parseExpenseDateInput(String(formData.get("expenseDate") || ""));
        if (parsed) updateData.expenseDate = parsed;
      }
      if (formData.has("vendorName")) {
        updateData.vendorName = cleanOptString(formData.get("vendorName"));
      }
      if (formData.has("paidBy")) {
        updateData.paidBy = cleanOptString(formData.get("paidBy"));
      }
      if (formData.has("billNumber")) {
        updateData.billNumber = cleanOptString(formData.get("billNumber"));
      }
      if (formData.has("referenceNo")) {
        updateData.referenceNo = cleanOptString(formData.get("referenceNo"));
      }
      if (formData.has("reimbursementStatus")) {
        const rawReimb = String(formData.get("reimbursementStatus") || "COMPANY_PAID").trim();
        if (VALID_REIMBURSEMENT.has(rawReimb)) {
          updateData.reimbursementStatus = rawReimb;
        }
      }
      if (formData.has("notes")) {
        updateData.notes = cleanOptString(formData.get("notes"));
      }
      if (formData.has("isTaxDeductible")) {
        updateData.isTaxDeductible = String(formData.get("isTaxDeductible")) !== "false";
      }
      if (String(formData.get("removeReceipt") || "") === "true") {
        removeReceipt = true;
      }
      const maybeFile = formData.get("receipt");
      if (maybeFile instanceof File && maybeFile.size > 0) {
        receiptFile = maybeFile;
      }
    } else {
      const body = await request.json();

      if (body.category !== undefined) {
        const cat = String(body.category || "").trim();
        if (cat) updateData.category = cat;
      }
      if (body.amount !== undefined) {
        const amt = Number(body.amount);
        if (Number.isNaN(amt) || amt <= 0) {
          return NextResponse.json({ error: "Amount must be greater than 0." }, { status: 400 });
        }
        updateData.amount = amt;
      }
      if (body.description !== undefined) {
        const desc = String(body.description || "").trim();
        if (!desc) {
          return NextResponse.json({ error: "Description cannot be empty." }, { status: 400 });
        }
        updateData.description = desc;
      }
      if (body.paymentMode !== undefined) {
        updateData.paymentMode = String(body.paymentMode || "UPI").trim() || "UPI";
      }
      if (body.expenseDate !== undefined) {
        const parsed = parseExpenseDateInput(String(body.expenseDate || ""));
        if (parsed) updateData.expenseDate = parsed;
      }
      if (body.vendorName !== undefined) {
        updateData.vendorName = cleanOptString(body.vendorName);
      }
      if (body.paidBy !== undefined) {
        updateData.paidBy = cleanOptString(body.paidBy);
      }
      if (body.billNumber !== undefined) {
        updateData.billNumber = cleanOptString(body.billNumber);
      }
      if (body.referenceNo !== undefined) {
        updateData.referenceNo = cleanOptString(body.referenceNo);
      }
      if (body.reimbursementStatus !== undefined) {
        const rawReimb = String(body.reimbursementStatus || "COMPANY_PAID").trim();
        if (VALID_REIMBURSEMENT.has(rawReimb)) {
          updateData.reimbursementStatus = rawReimb;
        }
      }
      if (body.notes !== undefined) {
        updateData.notes = cleanOptString(body.notes);
      }
      if (typeof body.isTaxDeductible === "boolean") {
        updateData.isTaxDeductible = body.isTaxDeductible;
      }
      if (body.removeReceipt === true) {
        removeReceipt = true;
      }
    }

    if (receiptFile) {
      const saved = await saveExpenseReceipt(receiptFile);
      if (existing.receiptUrl) {
        await deleteExpenseReceiptFile(existing.receiptUrl);
      }
      updateData.receiptUrl = saved.storageKey;
      updateData.receiptName = saved.fileName;
      updateData.receiptMimeType = saved.mimeType;
    } else if (removeReceipt && existing.receiptUrl) {
      await deleteExpenseReceiptFile(existing.receiptUrl);
      updateData.receiptUrl = null;
      updateData.receiptName = null;
      updateData.receiptMimeType = null;
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "UPDATE",
        entityType: "EXPENSE",
        entityId: id,
        details: `Updated expense '${updated.description}' (INR ${updated.amount}, ${updated.category})`,
      },
    });

    revalidatePath("/admin", "layout");

    return NextResponse.json({ success: true, expense: updated });
  } catch (err: any) {
    console.error("Expense update error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update expense." },
      { status: 500 }
    );
  }
}
