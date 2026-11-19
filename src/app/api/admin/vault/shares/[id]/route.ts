import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getVaultAccessContext } from "@/lib/vault";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
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
    const share = await prisma.vaultShareLink.findUnique({ where: { id } });
    if (!share) {
      return NextResponse.json({ error: "Share link not found." }, { status: 404 });
    }

    await prisma.vaultShareLink.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "REVOKE",
        entityType: "VAULT_SHARE",
        entityId: id,
        details: `Revoked Share Link '${share.label}'`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Revoke failed" }, { status: 500 });
  }
}
