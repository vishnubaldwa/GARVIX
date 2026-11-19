import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { VAULT_STORAGE_DIR } from "@/lib/vault";

export const EXPENSE_RECEIPTS_DIR = path.join(VAULT_STORAGE_DIR, "expense-receipts");
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp"]);

function inferMimeType(ext: string, fallback: string): string {
  switch (ext.toLowerCase()) {
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return fallback || "application/octet-stream";
  }
}

export async function saveExpenseReceipt(file: File): Promise<{
  storageKey: string;
  fileName: string;
  mimeType: string;
}> {
  if (file.size <= 0 || file.size > MAX_RECEIPT_BYTES) {
    throw new Error("Receipt file must be between 1 byte and 10 MB.");
  }

  const rawName = (file.name || "receipt").replace(/[^a-zA-Z0-9._\- ]/g, "_").trim();
  const ext = path.extname(rawName).toLowerCase() || (file.type === "application/pdf" ? ".pdf" : ".jpg");
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("Unsupported receipt format. Please upload PDF, PNG, JPG, or WEBP.");
  }

  await fs.mkdir(EXPENSE_RECEIPTS_DIR, { recursive: true });
  const storageKey = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const fullPath = path.join(EXPENSE_RECEIPTS_DIR, storageKey);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return {
    storageKey,
    fileName: rawName.endsWith(ext) ? rawName : `${rawName}${ext}`,
    mimeType: inferMimeType(ext, file.type),
  };
}

export function resolveExpenseReceiptPath(storageKey: string): string | null {
  const safeBase = path.basename(storageKey);
  if (!safeBase || safeBase !== storageKey || safeBase.includes("..")) {
    return null;
  }
  return path.join(EXPENSE_RECEIPTS_DIR, safeBase);
}

export async function deleteExpenseReceiptFile(storageKey?: string | null): Promise<void> {
  if (!storageKey) return;
  const fullPath = resolveExpenseReceiptPath(storageKey);
  if (!fullPath) return;
  try {
    await fs.unlink(fullPath);
  } catch {
    // File may already be removed or absent
  }
}

export function parseExpenseDateInput(raw?: string | null): Date | undefined {
  if (!raw || !raw.trim()) return undefined;
  const trimmed = raw.trim();
  // Support YYYY-MM-DD cleanly in IST/local noon so date never shifts across timezones
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T12:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
