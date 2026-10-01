import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ensureDefaultRoles, hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// GET: List all roles with parsed permissions
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const canManageRoles = await hasPermission(session.role, "CAN_MANAGE_ROLES");
    if (!canManageRoles) {
      return NextResponse.json({ error: "Access denied. Role management permission required." }, { status: 403 });
    }

    await ensureDefaultRoles();

    const rawRoles = await prisma.role.findMany({
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    });

    const roles = rawRoles.map((r) => ({
      id: r.id,
      name: r.name,
      displayName: r.displayName,
      description: r.description,
      permissions: JSON.parse(r.permissions || "[]"),
      isSystem: r.isSystem,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({ roles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new custom role
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const canManageRoles = await hasPermission(session.role, "CAN_MANAGE_ROLES");
    if (!canManageRoles) {
      return NextResponse.json({ error: "Access denied. Role management permission required." }, { status: 403 });
    }

    const body = await request.json();
    const { name, displayName, description, permissions } = body;

    if (!displayName?.trim()) {
      return NextResponse.json({ error: "Role Display Name is required." }, { status: 400 });
    }

    const cleanName = (name || displayName)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_");

    const existing = await prisma.role.findUnique({
      where: { name: cleanName },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Role code '${cleanName}' already exists.` },
        { status: 400 }
      );
    }

    const permsArray = Array.isArray(permissions) ? permissions : [];

    const role = await prisma.role.create({
      data: {
        name: cleanName,
        displayName: displayName.trim(),
        description: description?.trim() || null,
        permissions: JSON.stringify(permsArray),
        isSystem: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        username: session.username,
        action: "CREATE",
        entityType: "ROLE",
        entityId: role.id,
        details: `Created new custom role '${role.displayName}' (${role.name}) with ${permsArray.length} permissions`,
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        ...role,
        permissions: permsArray,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
