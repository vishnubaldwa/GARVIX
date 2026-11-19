import { NextResponse } from "next/server";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";
import { getSafeVaultFilePath, getVaultAccessContext } from "@/lib/vault";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getVaultAccessContext(session);
    if (!access.canManage) {
      return NextResponse.json({ error: "Manage permission required." }, { status: 403 });
    }

    const { id } = await params;
    const { title, notes, folderId, expiryDate } = await request.json();

    const parsedExpiry =
      expiryDate === "" || expiryDate === null
        ? null
        : expiryDate
        ? new Date(expiryDate)
        : undefined;

    const updated = await prisma.vaultDocument.update({
      where: { id },
      data: {
        ...(title?.trim() ? { title: title.trim() } : {}),
        ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
        ...(folderId ? { folderId } : {}),
        ...(parsedExpiry !== undefined ? { expiryDate: parsedExpiry } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "UPDATE",
        entityType: "VAULT_DOCUMENT",
        entityId: updated.id,
        details: `Updated Vault document '${updated.title}'`,
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isFullAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Only Super Admin can permanently delete Vault documents." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const doc = await prisma.vaultDocument.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    try {
      await fs.unlink(getSafeVaultFilePath(doc.storedName));
    } catch {
      // Ignore if file already missing
    }

    await prisma.vaultDocument.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "DELETE",
        entityType: "VAULT_DOCUMENT",
        entityId: id,
        details: `Deleted Vault document '${doc.title}' (${doc.originalName})`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 500 });
  }
}
