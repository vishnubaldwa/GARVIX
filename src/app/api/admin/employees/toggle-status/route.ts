import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied. Super Admin role required." }, { status: 403 });
    }

    const { id, isActive } = await request.json();
    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Employee ID and status are required." }, { status: 400 });
    }

    // Prevent deactivating own account
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    if (target.email === session.email && !isActive) {
      return NextResponse.json({ error: "You cannot deactivate your own logged-in account." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        username: session.username,
        action: "UPDATE",
        entityType: "USER",
        entityId: updated.id,
        details: `${isActive ? "Activated" : "Deactivated"} staff member '${updated.name}' (${updated.email})`,
      },
    });

    return NextResponse.json({ success: true, employee: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
