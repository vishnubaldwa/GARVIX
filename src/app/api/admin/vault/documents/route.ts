import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  ALLOWED_VAULT_EXTENSIONS,
  ensureVaultStorageDir,
  generateStoredFilename,
  getSafeVaultFilePath,
  getVaultAccessContext,
  MAX_VAULT_FILE_BYTES,
} from "@/lib/vault";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getVaultAccessContext(session);
    if (!access.canManage) {
      return NextResponse.json(
        { error: "Only Vault Managers / Admins can upload documents." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const folderId = String(formData.get("folderId") || "").trim();
    const customTitle = String(formData.get("title") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const expiryDateRaw = String(formData.get("expiryDate") || "").trim();

    if (!folderId) {
      return NextResponse.json({ error: "Please select a destination folder." }, { status: 400 });
    }

    const folder = await prisma.vaultFolder.findUnique({ where: { id: folderId } });
    if (!folder) {
      return NextResponse.json({ error: "Selected folder does not exist." }, { status: 404 });
    }

    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "Please select at least one file to upload." }, { status: 400 });
    }

    await ensureVaultStorageDir();

    const parsedExpiry = expiryDateRaw ? new Date(expiryDateRaw) : null;
    const validExpiry =
      parsedExpiry && !Number.isNaN(parsedExpiry.getTime()) ? parsedExpiry : null;

    const uploadedDocs = [];

    for (const file of files) {
      if (file.size > MAX_VAULT_FILE_BYTES) {
        return NextResponse.json(
          { error: `File '${file.name}' exceeds the 25 MB limit.` },
          { status: 400 }
        );
      }

      const ext = path.extname(file.name || "").toLowerCase();
      if (!ALLOWED_VAULT_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          {
            error: `File type '${ext || "unknown"}' is not supported. Allowed: PDF, JPG, PNG, WEBP, DOC/DOCX, XLS/XLSX, CSV, TXT.`,
          },
          { status: 400 }
        );
      }

      const storedName = generateStoredFilename(file.name);
      const targetPath = getSafeVaultFilePath(storedName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(targetPath, buffer);

      const defaultTitle = path.basename(file.name, ext).replace(/[_-]+/g, " ").trim();
      const docTitle =
        files.length === 1 && customTitle ? customTitle : defaultTitle || file.name;

      const doc = await prisma.vaultDocument.create({
        data: {
          folderId: folder.id,
          title: docTitle,
          originalName: file.name,
          storedName,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          notes: notes || null,
          expiryDate: validExpiry,
          uploadedBy: session.name || session.email,
        },
      });

      uploadedDocs.push(doc);

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          username: session.email,
          action: "UPLOAD",
          entityType: "VAULT_DOCUMENT",
          entityId: doc.id,
          details: `Uploaded '${doc.title}' (${doc.originalName}) to folder '${folder.name}'`,
        },
      });
    }

    return NextResponse.json({ success: true, documents: uploadedDocs });
  } catch (err: any) {
    console.error("Vault upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload document" },
      { status: 500 }
    );
  }
}
