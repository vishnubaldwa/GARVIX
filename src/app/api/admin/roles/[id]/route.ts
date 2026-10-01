import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const canManageRoles = await hasPermission(session.role, "CAN_MANAGE_ROLES");
    if (!canManageRoles) {
      return NextResponse.json({ error: "Access denied. Role management permission required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { permissions, displayName, description } = body;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }

    const updateData: any = {};
    if (Array.isArray(permissions)) {
      updateData.permissions = JSON.stringify(permissions);
    }
    if (displayName?.trim()) {
      updateData.displayName = displayName.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    const updated = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        username: session.username,
        action: "UPDATE",
        entityType: "ROLE",
        entityId: updated.id,
        details: `Updated permissions/details for role '${updated.displayName}'`,
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        ...updated,
        permissions: JSON.parse(updated.permissions || "[]"),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const canManageRoles = await hasPermission(session.role, "CAN_MANAGE_ROLES");
    if (!canManageRoles) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { id } = await params;
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json(
        { error: "System default roles (Admin, Sales, Accounts, Service) cannot be deleted." },
        { status: 400 }
      );
    }

    // Check if any users are assigned this role
    const assignedUsersCount = await prisma.user.count({
      where: { role: role.name },
    });

    if (assignedUsersCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete role '${role.displayName}'. ${assignedUsersCount} active employee(s) are currently assigned this role.` },
        { status: 400 }
      );
    }

    await prisma.role.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        username: session.username,
        action: "DELETE",
        entityType: "ROLE",
        entityId: id,
        details: `Deleted custom role '${role.displayName}' (${role.name})`,
      },
    });

    return NextResponse.json({ success: true, message: `Role '${role.displayName}' deleted.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
