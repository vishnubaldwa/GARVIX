import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { AuthSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";

export const VAULT_STORAGE_DIR = path.join(process.cwd(), "private-vault");
export const MAX_VAULT_FILE_BYTES = 25 * 1024 * 1024; // 25 MB per file

export const ALLOWED_VAULT_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt",
]);

export const DEFAULT_VAULT_FOLDERS = [
  {
    slug: "incorporation",
    name: "Company Incorporation (MCA)",
    description: "COI, MOA, AOA, Company PAN, TAN, Share Certificates & Board Resolutions",
    icon: "building",
    sortOrder: 1,
  },
  {
    slug: "office-registrations",
    name: "Office & Registrations",
    description: "Rent Agreement, Electricity Bill, NOC, GST Certificate, MSME / Udyam",
    icon: "map",
    sortOrder: 2,
  },
  {
    slug: "director-1",
    name: "Director 1 — KYC",
    description: "PAN, Aadhaar, Passport Photo, DIN & Address Proof (rename anytime)",
    icon: "user",
    sortOrder: 3,
  },
  {
    slug: "director-2",
    name: "Director 2 — KYC",
    description: "PAN, Aadhaar, Passport Photo, DIN & Address Proof (rename anytime)",
    icon: "user",
    sortOrder: 4,
  },
  {
    slug: "director-3",
    name: "Director 3 — KYC",
    description: "PAN, Aadhaar, Passport Photo, DIN & Address Proof (rename anytime)",
    icon: "user",
    sortOrder: 5,
  },
  {
    slug: "banking",
    name: "Banking & Mandates",
    description: "Bank Account Opening Forms, Cancelled Cheque, NetBanking & Signatory Docs",
    icon: "bank",
    sortOrder: 6,
  },
  {
    slug: "ca-tax",
    name: "CA, Tax & Agreements",
    description: "ITR, Audit Reports, Balance Sheets, NDAs & Client/Vendor Contracts",
    icon: "shield",
    sortOrder: 7,
  },
];

export async function ensureVaultStorageDir(): Promise<void> {
  await fs.mkdir(VAULT_STORAGE_DIR, { recursive: true });
}

export async function ensureDefaultVaultFolders(): Promise<void> {
  const existingCount = await prisma.vaultFolder.count();
  if (existingCount > 0) return;

  for (const folder of DEFAULT_VAULT_FOLDERS) {
    await prisma.vaultFolder.upsert({
      where: { slug: folder.slug },
      update: {},
      create: {
        slug: folder.slug,
        name: folder.name,
        description: folder.description,
        icon: folder.icon,
        sortOrder: folder.sortOrder,
        isDefault: true,
      },
    });
  }
}

export function getSafeVaultFilePath(storedName: string): string {
  const safeBase = path.basename(storedName);
  return path.join(VAULT_STORAGE_DIR, safeBase);
}

export function generateStoredFilename(originalName: string): string {
  const ext = path.extname(originalName || "").toLowerCase();
  const safeExt = ALLOWED_VAULT_EXTENSIONS.has(ext) ? ext : ".bin";
  return `${Date.now()}-${crypto.randomUUID()}${safeExt}`;
}

export function sanitizeDownloadFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\-() ]/g, "_").trim() || "document";
}

export interface VaultAccessContext {
  canView: boolean;
  canManage: boolean;
  allowedFolderIds: "ALL" | string[];
}

export async function getVaultAccessContext(
  session: AuthSession
): Promise<VaultAccessContext> {
  if (isFullAdminRole(session.role)) {
    return { canView: true, canManage: true, allowedFolderIds: "ALL" };
  }

  const [canManage, canView] = await Promise.all([
    hasPermission(session.role, "CAN_MANAGE_DOCUMENTS"),
    hasPermission(session.role, "CAN_VIEW_DOCUMENTS"),
  ]);

  if (canManage) {
    return { canView: true, canManage: true, allowedFolderIds: "ALL" };
  }

  if (!canView) {
    return { canView: false, canManage: false, allowedFolderIds: [] };
  }

  // Restricted viewer (e.g. Banker / CA / Staff with view permission):
  // Only folders explicitly assigned in VaultFolderAccess are visible (fail-closed).
  const grants = await prisma.vaultFolderAccess.findMany({
    where: { userId: session.userId },
    select: { folderId: true },
  });

  return {
    canView: true,
    canManage: false,
    allowedFolderIds: grants.map((g) => g.folderId),
  };
}

export function isFolderPermitted(
  folderId: string,
  allowedFolderIds: "ALL" | string[]
): boolean {
  if (allowedFolderIds === "ALL") return true;
  return allowedFolderIds.includes(folderId);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
