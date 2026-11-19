import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ensureDefaultRoles } from "@/lib/permissions";
import {
  ensureDefaultVaultFolders,
  getVaultAccessContext,
} from "@/lib/vault";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureDefaultVaultFolders();
    const access = await getVaultAccessContext(session);
    if (!access.canView) {
      return NextResponse.json({ error: "Access denied to Company Vault." }, { status: 403 });
    }

    const folderWhere =
      access.allowedFolderIds === "ALL"
        ? {}
        : { id: { in: access.allowedFolderIds } };

    const folders = await prisma.vaultFolder.findMany({
      where: folderWhere,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!access.canManage) {
      return NextResponse.json({
        canManage: false,
        folders,
        users: [],
        shareLinks: [],
        activityLogs: [],
      });
    }

    await ensureDefaultRoles();

    const [users, shareLinks, activityLogs] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          expiresAt: true,
          createdAt: true,
          vaultAccess: {
            select: { folderId: true },
          },
        },
      }),
      prisma.vaultShareLink.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.findMany({
        where: {
          entityType: { in: ["VAULT_DOCUMENT", "VAULT_FOLDER", "VAULT_SHARE"] },
        },
        orderBy: { createdAt: "desc" },
        take: 40,
      }),
    ]);

    return NextResponse.json({
      canManage: true,
      folders,
      users: users.map((u) => ({
        ...u,
        folderIds: u.vaultAccess.map((v) => v.folderId),
      })),
      shareLinks: shareLinks.map((s) => ({
        id: s.id,
        token: s.token,
        label: s.label,
        recipient: s.recipient,
        folderIds: JSON.parse(s.folderIds || "[]") as string[],
        hasPin: Boolean(s.pinHash),
        expiresAt: s.expiresAt,
        isActive: s.isActive,
        createdBy: s.createdBy,
        accessCount: s.accessCount,
        lastAccessAt: s.lastAccessAt,
        createdAt: s.createdAt,
      })),
      activityLogs,
    });
  } catch (err: any) {
    console.error("Vault GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to load vault" }, { status: 500 });
  }
}

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
    const { name, description, icon } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Folder name is required." }, { status: 400 });
    }

    const baseSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug || "folder"}-${Date.now().toString(36)}`;

    const maxOrder = await prisma.vaultFolder.aggregate({
      _max: { sortOrder: true },
    });

    const folder = await prisma.vaultFolder.create({
      data: {
        slug,
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || "folder",
        sortOrder: (maxOrder._max.sortOrder ?? 10) + 1,
        isDefault: false,
      },
      include: { documents: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "CREATE",
        entityType: "VAULT_FOLDER",
        entityId: folder.id,
        details: `Created Vault folder '${folder.name}'`,
      },
    });

    return NextResponse.json({ success: true, folder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create folder" }, { status: 500 });
  }
}
