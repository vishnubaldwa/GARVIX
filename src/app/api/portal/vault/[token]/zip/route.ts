import { NextResponse } from "next/server";
import fs from "fs/promises";
import JSZip from "jszip";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyShareAccessToken } from "@/lib/auth";
import { getSafeVaultFilePath, sanitizeDownloadFilename } from "@/lib/vault";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const share = await prisma.vaultShareLink.findUnique({
      where: { token },
    });

    if (!share || !share.isActive || new Date() > share.expiresAt) {
      return NextResponse.json({ error: "Link expired or revoked." }, { status: 403 });
    }

    if (share.pinHash) {
      const cookieStore = await cookies();
      const signed = cookieStore.get(`garvix_vshare_${share.id}`)?.value;
      if (!signed || !verifyShareAccessToken(signed, token)) {
        return NextResponse.json({ error: "PIN verification required." }, { status: 401 });
      }
    }

    const allowedFolderIds: string[] = JSON.parse(share.folderIds || "[]");
    const url = new URL(request.url);
    const requestedFolderId = url.searchParams.get("folderId");

    const targetIds = requestedFolderId
      ? allowedFolderIds.includes(requestedFolderId)
        ? [requestedFolderId]
        : []
      : allowedFolderIds;

    if (targetIds.length === 0) {
      return NextResponse.json({ error: "No accessible folders." }, { status: 403 });
    }

    const folders = await prisma.vaultFolder.findMany({
      where: { id: { in: targetIds } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { documents: { orderBy: { createdAt: "asc" } } },
    });

    const zip = new JSZip();
    let count = 0;

    for (const folder of folders) {
      if (folder.documents.length === 0) continue;
      const folderSafe = sanitizeDownloadFilename(folder.name);
      const container = folders.length > 1 ? zip.folder(folderSafe) : zip;
      if (!container) continue;

      const used = new Set<string>();
      for (const doc of folder.documents) {
        try {
          const data = await fs.readFile(getSafeVaultFilePath(doc.storedName));
          let fname = sanitizeDownloadFilename(doc.originalName);
          if (used.has(fname)) fname = `${doc.id.slice(-4)}_${fname}`;
          used.add(fname);
          container.file(fname, data);
          count++;
        } catch {
          // Skip missing file
        }
      }
    }

    if (count === 0) {
      return NextResponse.json({ error: "No files in selection." }, { status: 404 });
    }

    const zipBytes = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const zipName = `GARVIX_${sanitizeDownloadFilename(share.label)}.zip`;

    await prisma.auditLog.create({
      data: {
        username: `Share: ${share.recipient || share.label}`,
        action: "DOWNLOAD_ZIP",
        entityType: "VAULT_DOCUMENT",
        entityId: share.id,
        details: `Downloaded ZIP '${zipName}' (${count} files) via Share Link '${share.label}'`,
      },
    });

    return new NextResponse(Buffer.from(zipBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}"`,
        "Content-Length": String(zipBytes.byteLength),
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to build ZIP archive." }, { status: 500 });
  }
}
