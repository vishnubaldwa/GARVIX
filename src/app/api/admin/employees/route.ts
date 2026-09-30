import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET: List all employees
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied. Super Admin role required." }, { status: 403 });
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
        telegramChatId: true,
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
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied. Super Admin role required." }, { status: 403 });
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
        telegramChatId: true,
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
