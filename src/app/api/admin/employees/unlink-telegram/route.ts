import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

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

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { telegramChatId: null },
      select: { id: true, name: true, email: true },
    });

    await prisma.auditLog.create({
      data: {
        username: session.username,
        action: "UPDATE",
        entityType: "USER",
        entityId: updated.id,
        details: `Unlinked Telegram account for staff member '${updated.name}' (${updated.email})`,
      },
    });

    return NextResponse.json({ success: true, message: `Telegram account unlinked for ${updated.name}.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
