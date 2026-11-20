import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { VAULT_STORAGE_DIR } from "@/lib/vault";

export const CLIENT_LOGOS_DIR = path.join(VAULT_STORAGE_DIR, "client-logos");
const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

function inferLogoMimeType(ext: string, fallback: string): string {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return fallback || "image/png";
  }
}

export async function saveClientLogo(file: File): Promise<{
  storageKey: string;
  mimeType: string;
}> {
  if (file.size <= 0 || file.size > MAX_LOGO_BYTES) {
    throw new Error("Logo file must be under 5 MB.");
  }

  const rawName = (file.name || "logo.png").replace(/[^a-zA-Z0-9._\-]/g, "_").trim();
  const ext = path.extname(rawName).toLowerCase() || ".png";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("Unsupported logo format. Please upload PNG, JPG, WEBP, or SVG.");
  }

  await fs.mkdir(CLIENT_LOGOS_DIR, { recursive: true });
  const storageKey = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const fullPath = path.join(CLIENT_LOGOS_DIR, storageKey);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return {
    storageKey,
    mimeType: inferLogoMimeType(ext, file.type),
  };
}

export function resolveClientLogoPath(storageKey: string): string | null {
  const safeBase = path.basename(storageKey);
  if (!safeBase || safeBase !== storageKey || safeBase.includes("..")) {
    return null;
  }
  return path.join(CLIENT_LOGOS_DIR, safeBase);
}

export async function deleteClientLogoFile(storageKey?: string | null): Promise<void> {
  if (!storageKey) return;
  const fullPath = resolveClientLogoPath(storageKey);
  if (!fullPath) return;
  try {
    await fs.unlink(fullPath);
  } catch {
    // Already removed
  }
}

export function normalizeWebsiteUrl(raw?: string | null): string | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
