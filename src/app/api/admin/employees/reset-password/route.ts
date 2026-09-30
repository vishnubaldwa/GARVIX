import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied. Super Admin role required." }, { status: 403 });
    }

    const { id, newPassword } = await request.json();
    if (!id || !newPassword) {
      return NextResponse.json({ error: "Employee ID and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: { id: true, name: true, email: true },
    });

    await prisma.auditLog.create({
      data: {
        username: session.username,
        action: "UPDATE",
        entityType: "USER",
        entityId: updated.id,
        details: `Reset password for staff member '${updated.name}' (${updated.email})`,
      },
    });

    return NextResponse.json({ success: true, message: `Password reset successfully for ${updated.name}.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
