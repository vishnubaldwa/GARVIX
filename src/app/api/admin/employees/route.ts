import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET: List all employees
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed =
      session.role === "SUPER_ADMIN" ||
      (await hasPermission(session.role, "CAN_MANAGE_TEAM"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied. Team management permission required." }, { status: 403 });
    }

    const employees = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ employees });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new employee
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed =
      session.role === "SUPER_ADMIN" ||
      (await hasPermission(session.role, "CAN_MANAGE_TEAM"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied. Team management permission required." }, { status: 403 });
    }

    const body = await request.json();
    const { name, username, role, phone, password } = body;

    if (!name?.trim() || !username?.trim() || !role || !password) {
      return NextResponse.json(
        { error: "Name, Username, Role, and Initial Password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Enforce Single Super Admin rule
    if (isFullAdminRole(role)) {
      const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      });
      if (existingSuperAdmin) {
        return NextResponse.json(
          {
            error:
              "Only 1 Super Admin account is allowed. Please assign the 'Director' role instead.",
          },
          { status: 400 }
        );
      }
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const email = `${cleanUsername}@garvix.in`;

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `An employee with username '${cleanUsername}' or email '${email}' already exists.` },
        { status: 400 }
      );
    }

    const cleanPhone = phone ? phone.trim().replace(/\s+/g, "") : null;

    // Check phone uniqueness if provided
    if (cleanPhone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: cleanPhone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: `Phone number '${cleanPhone}' is already linked to another employee (${existingPhone.name}).` },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email,
        passwordHash,
        role,
        phone: cleanPhone,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        username: session.username,
        action: "CREATE",
        entityType: "USER",
        entityId: user.id,
        details: `Created new staff account '${user.name}' (${user.email}) with role '${user.role}' and phone '${user.phone || "none"}'`,
      },
    });

    return NextResponse.json({ success: true, employee: user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update employee details
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed =
      session.role === "SUPER_ADMIN" ||
      (await hasPermission(session.role, "CAN_MANAGE_TEAM"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied. Team management permission required." }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, role, phone, isActive } = body;

    if (!id || !name?.trim() || !role) {
      return NextResponse.json(
        { error: "Employee ID, Name, and Role are required." },
        { status: 400 }
      );
    }

    const existingEmp = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingEmp) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    // Protect single Super Admin account & prevent creating a second Super Admin
    if (isFullAdminRole(existingEmp.role)) {
      if (!isFullAdminRole(session.role)) {
        return NextResponse.json(
          { error: "Only the Super Admin can modify the Super Admin profile." },
          { status: 403 }
        );
      }
      if (!isFullAdminRole(role)) {
        return NextResponse.json(
          { error: "The primary Super Admin account role cannot be downgraded." },
          { status: 400 }
        );
      }
      if (isActive === false) {
        return NextResponse.json(
          { error: "The primary Super Admin account cannot be deactivated." },
          { status: 400 }
        );
      }
    } else if (isFullAdminRole(role)) {
      const existingSuperAdmin = await prisma.user.findFirst({
        where: {
          role: { in: ["SUPER_ADMIN", "ADMIN"] },
          id: { not: id },
        },
      });
      if (existingSuperAdmin) {
        return NextResponse.json(
          {
            error:
              "Only 1 Super Admin account is allowed. Please assign the 'Director' role instead.",
          },
          { status: 400 }
        );
      }
    }

    const cleanPhone = phone ? phone.trim().replace(/\s+/g, "") : null;

    // Check phone uniqueness if changed
    if (cleanPhone && cleanPhone !== existingEmp.phone) {
      const duplicatePhone = await prisma.user.findFirst({
        where: {
          phone: cleanPhone,
          id: { not: id },
        },
      });
      if (duplicatePhone) {
        return NextResponse.json(
          { error: `Phone number '${cleanPhone}' is already linked to another employee (${duplicatePhone.name}).` },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name.trim(),
        role,
        phone: cleanPhone,
        isActive: typeof isActive === "boolean" ? isActive : existingEmp.isActive,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        username: session.username,
        action: "UPDATE",
        entityType: "USER",
        entityId: updatedUser.id,
        details: `Updated staff account '${updatedUser.name}' (${updatedUser.email}): Role '${updatedUser.role}', Phone '${updatedUser.phone || "none"}', Active: ${updatedUser.isActive}`,
      },
    });

    return NextResponse.json({ success: true, employee: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Permanently delete a staff / external viewer account (with strict safety guards)
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isFullAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Access denied. Only Super Admin can permanently delete accounts." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // No JSON body
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    if (target.email === session.email) {
      return NextResponse.json(
        { error: "You cannot delete your own currently logged-in account." },
        { status: 400 }
      );
    }

    if (isFullAdminRole(target.role)) {
      return NextResponse.json(
        { error: "The primary Super Admin account cannot be deleted." },
        { status: 400 }
      );
    }

    // Preserve immutable audit log history while removing FK link before deleting user
    await prisma.$transaction([
      prisma.auditLog.updateMany({
        where: { userId: id },
        data: { userId: null },
      }),
      prisma.user.delete({
        where: { id },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        username: session.username,
        action: "DELETE",
        entityType: "USER",
        entityId: id,
        details: `Permanently deleted staff account '${target.name}' (${target.email}, role: ${target.role})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Account '${target.name}' deleted permanently.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
