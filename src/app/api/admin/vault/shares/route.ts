import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getVaultAccessContext } from "@/lib/vault";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getVaultAccessContext(session);
    if (!access.canManage) {
      return NextResponse.json({ error: "Manage permission required." }, { status: 403 });
    }

    const body = await request.json();
    const { label, recipient, folderIds, pin, expiresInHours } = body;

    if (!label?.trim()) {
      return NextResponse.json({ error: "Share link title/label is required." }, { status: 400 });
    }

    const validFolders: string[] = Array.isArray(folderIds) ? folderIds : [];
    if (validFolders.length === 0) {
      return NextResponse.json(
        { error: "Select at least one folder to share." },
        { status: 400 }
      );
    }

    const hours = Math.max(1, Math.min(24 * 90, Number(expiresInHours) || 72));
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    const pinHash = pin?.trim() ? await bcrypt.hash(pin.trim(), 10) : null;

    const shareLink = await prisma.vaultShareLink.create({
      data: {
        label: label.trim(),
        recipient: recipient?.trim() || null,
        folderIds: JSON.stringify(validFolders),
        pinHash,
        expiresAt,
        isActive: true,
        createdBy: session.name || session.email,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "CREATE",
        entityType: "VAULT_SHARE",
        entityId: shareLink.id,
        details: `Created Share Link '${shareLink.label}' for ${shareLink.recipient || "External Recipient"} (${validFolders.length} folders, ${pinHash ? "PIN-protected" : "No PIN"}, expires ${expiresAt.toLocaleString("en-IN")})`,
      },
    });

    return NextResponse.json({
      success: true,
      shareLink: {
        id: shareLink.id,
        token: shareLink.token,
        label: shareLink.label,
        recipient: shareLink.recipient,
        folderIds: validFolders,
        hasPin: Boolean(pinHash),
        expiresAt: shareLink.expiresAt,
        isActive: shareLink.isActive,
        accessCount: shareLink.accessCount,
        createdAt: shareLink.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create share link" }, { status: 500 });
  }
}
