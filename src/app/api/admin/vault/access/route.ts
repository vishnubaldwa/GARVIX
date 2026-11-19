import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ensureDefaultRoles } from "@/lib/permissions";
import { getVaultAccessContext } from "@/lib/vault";

export const dynamic = "force-dynamic";

// POST: Create a dedicated Banker / CA / Director Vault Login ID with folder permissions & optional expiry
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

    await ensureDefaultRoles();

    const body = await request.json();
    const { name, username, password, phone, role, expiresInDays, folderIds } = body;

    if (!name?.trim() || !username?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, Username, and Password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/@garvix\.in$/i, "")
      .replace(/[^a-z0-9._-]/g, "");

    if (!cleanUsername) {
      return NextResponse.json({ error: "Invalid username." }, { status: 400 });
    }

    const email = `${cleanUsername}@garvix.in`;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Username '${cleanUsername}' is already taken.` },
        { status: 400 }
      );
    }

    const targetRole = role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "DOCUMENT_VIEWER";

    let expiresAt: Date | null = null;
    if (expiresInDays && Number(expiresInDays) > 0) {
      expiresAt = new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email,
        passwordHash,
        role: targetRole,
        phone: phone?.trim() || null,
        isActive: true,
        expiresAt,
      },
    });

    const validFolderIds: string[] = Array.isArray(folderIds) ? folderIds : [];
    if (validFolderIds.length > 0 && targetRole !== "SUPER_ADMIN") {
      for (const fId of validFolderIds) {
        await prisma.vaultFolderAccess.upsert({
          where: {
            userId_folderId: { userId: createdUser.id, folderId: fId },
          },
          update: {},
          create: {
            userId: createdUser.id,
            folderId: fId,
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "CREATE",
        entityType: "VAULT_SHARE",
        entityId: createdUser.id,
        details: `Created Vault login '${createdUser.username}' (${targetRole}) with access to ${
          targetRole === "SUPER_ADMIN" ? "ALL folders" : `${validFolderIds.length} folder(s)`
        }${expiresAt ? `, expires ${expiresAt.toLocaleDateString("en-IN")}` : ""}`,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        username: createdUser.username,
        email: createdUser.email,
        role: createdUser.role,
        isActive: createdUser.isActive,
        expiresAt: createdUser.expiresAt,
        folderIds: validFolderIds,
      },
    });
  } catch (err: any) {
    console.error("Vault access POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to create account" }, { status: 500 });
  }
}

// PATCH: Update folder permissions, active status, or expiry for an existing user
export async function PATCH(request: Request) {
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
    const { userId, folderIds, isActive, expiresAt } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (target.id === session.userId && isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own logged-in account." },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    if (Array.isArray(folderIds)) {
      await prisma.vaultFolderAccess.deleteMany({ where: { userId } });
      for (const fId of folderIds) {
        await prisma.vaultFolderAccess.create({
          data: { userId, folderId: fId },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "UPDATE",
        entityType: "VAULT_SHARE",
        entityId: userId,
        details: `Updated Vault access for '${target.email}'${
          Array.isArray(folderIds) ? ` (${folderIds.length} folders granted)` : ""
        }${typeof isActive === "boolean" ? `, active=${isActive}` : ""}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 });
  }
}
