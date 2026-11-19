import { NextResponse } from "next/server";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  getSafeVaultFilePath,
  getVaultAccessContext,
  isFolderPermitted,
  sanitizeDownloadFilename,
} from "@/lib/vault";

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

    const access = await getVaultAccessContext(session);
    if (!access.canView) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { id } = await params;
    const doc = await prisma.vaultDocument.findUnique({
      where: { id },
      include: { folder: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (!isFolderPermitted(doc.folderId, access.allowedFolderIds)) {
      return NextResponse.json(
        { error: "You do not have permission to access this folder." },
        { status: 403 }
      );
    }

    const filePath = getSafeVaultFilePath(doc.storedName);
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      return NextResponse.json(
        { error: "File data is missing on disk. Please re-upload." },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") === "inline" ? "inline" : "attachment";
    const safeFileName = sanitizeDownloadFilename(doc.originalName);

    // Log access & increment counter on download
    await Promise.all([
      mode === "attachment"
        ? prisma.vaultDocument.update({
            where: { id: doc.id },
            data: { downloadCount: { increment: 1 } },
          })
        : Promise.resolve(),
      prisma.auditLog.create({
        data: {
          userId: session.userId,
          username: session.email,
          action: mode === "inline" ? "PREVIEW" : "DOWNLOAD",
          entityType: "VAULT_DOCUMENT",
          entityId: doc.id,
          details: `${mode === "inline" ? "Previewed" : "Downloaded"} '${doc.title}' (${doc.folder.name}) by ${session.name} (${session.role})`,
        },
      }),
    ]);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Disposition": `${mode}; filename="${safeFileName}"`,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: any) {
    console.error("Vault file stream error:", err);
    return NextResponse.json({ error: "Failed to retrieve file" }, { status: 500 });
  }
}
