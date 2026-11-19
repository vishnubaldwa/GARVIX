import { NextResponse } from "next/server";
import fs from "fs/promises";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyShareAccessToken } from "@/lib/auth";
import { getSafeVaultFilePath, sanitizeDownloadFilename } from "@/lib/vault";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string; docId: string }> }
) {
  try {
    const { token, docId } = await params;

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
    const doc = await prisma.vaultDocument.findUnique({
      where: { id: docId },
      include: { folder: true },
    });

    if (!doc || !allowedFolderIds.includes(doc.folderId)) {
      return NextResponse.json({ error: "Document not permitted." }, { status: 403 });
    }

    const buffer = await fs.readFile(getSafeVaultFilePath(doc.storedName));
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") === "inline" ? "inline" : "attachment";
    const safeName = sanitizeDownloadFilename(doc.originalName);

    await Promise.all([
      mode === "attachment"
        ? prisma.vaultDocument.update({
            where: { id: doc.id },
            data: { downloadCount: { increment: 1 } },
          })
        : Promise.resolve(),
      prisma.auditLog.create({
        data: {
          username: `Share: ${share.recipient || share.label}`,
          action: mode === "inline" ? "PREVIEW" : "DOWNLOAD",
          entityType: "VAULT_DOCUMENT",
          entityId: doc.id,
          details: `${mode === "inline" ? "Previewed" : "Downloaded"} '${doc.title}' via Share Link '${share.label}'`,
        },
      }),
    ]);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Disposition": `${mode}; filename="${safeName}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to load document." }, { status: 500 });
  }
}
