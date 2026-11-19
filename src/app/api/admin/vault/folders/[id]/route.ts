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
    const { name, description } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Folder name is required." }, { status: 400 });
    }

    const updated = await prisma.vaultFolder.update({
      where: { id },
      data: {
        name: name.trim(),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "UPDATE",
        entityType: "VAULT_FOLDER",
        entityId: updated.id,
        details: `Renamed Vault folder to '${updated.name}'`,
      },
    });

    return NextResponse.json({ success: true, folder: updated });
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
        { error: "Only Super Admin can permanently delete Vault folders." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const folder = await prisma.vaultFolder.findUnique({
      where: { id },
      include: { documents: true },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found." }, { status: 404 });
    }

    // Remove stored files from private-vault/
    for (const doc of folder.documents) {
      try {
        await fs.unlink(getSafeVaultFilePath(doc.storedName));
      } catch {
        // Ignore if file already missing on disk
      }
    }

    await prisma.vaultFolder.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "DELETE",
        entityType: "VAULT_FOLDER",
        entityId: id,
        details: `Deleted Vault folder '${folder.name}' (${folder.documents.length} files removed)`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 500 });
  }
}
