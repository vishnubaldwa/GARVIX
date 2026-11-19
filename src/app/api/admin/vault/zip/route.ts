import { NextResponse } from "next/server";
import fs from "fs/promises";
import JSZip from "jszip";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  getSafeVaultFilePath,
  getVaultAccessContext,
  isFolderPermitted,
  sanitizeDownloadFilename,
} from "@/lib/vault";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getVaultAccessContext(session);
    if (!access.canView) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const url = new URL(request.url);
    const folderId = url.searchParams.get("folderId");

    if (folderId && !isFolderPermitted(folderId, access.allowedFolderIds)) {
      return NextResponse.json(
        { error: "Access denied to requested folder." },
        { status: 403 }
      );
    }

    const folderWhere = folderId
      ? { id: folderId }
      : access.allowedFolderIds === "ALL"
      ? {}
      : { id: { in: access.allowedFolderIds } };

    const folders = await prisma.vaultFolder.findMany({
      where: folderWhere,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        documents: { orderBy: { createdAt: "asc" } },
      },
    });

    const zip = new JSZip();
    let totalFiles = 0;

    for (const folder of folders) {
      if (folder.documents.length === 0) continue;
      const folderSafeName = sanitizeDownloadFilename(folder.name);
      const zipFolder = folders.length > 1 ? zip.folder(folderSafeName) : zip;
      if (!zipFolder) continue;

      const usedNames = new Set<string>();
      for (const doc of folder.documents) {
        try {
          const data = await fs.readFile(getSafeVaultFilePath(doc.storedName));
          let entryName = sanitizeDownloadFilename(doc.originalName);
          if (usedNames.has(entryName)) {
            entryName = `${doc.id.slice(-4)}_${entryName}`;
          }
          usedNames.add(entryName);
          zipFolder.file(entryName, data);
          totalFiles++;
        } catch {
          // Skip missing file gracefully
        }
      }
    }

    if (totalFiles === 0) {
      return NextResponse.json(
        { error: "No documents available to download in this selection." },
        { status: 404 }
      );
    }

    const zipBuffer = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const zipFilename =
      folderId && folders[0]
        ? `GARVIX_${sanitizeDownloadFilename(folders[0].name)}.zip`
        : `GARVIX_Company_Vault_Kit.zip`;

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "DOWNLOAD_ZIP",
        entityType: "VAULT_DOCUMENT",
        entityId: folderId || "ALL",
        details: `Downloaded ZIP archive '${zipFilename}' (${totalFiles} files) by ${session.name} (${session.role})`,
      },
    });

    return new NextResponse(Buffer.from(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": String(zipBuffer.byteLength),
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("Vault ZIP error:", err);
    return NextResponse.json({ error: "Failed to create ZIP archive" }, { status: 500 });
  }
}
