import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isFullAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Access denied. Admin role required for audit logs." },
        { status: 403 }
      );
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        username: l.username || "System Engine",
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        details: l.details || "",
        createdAt: l.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load audit logs" },
      { status: 500 }
    );
  }
}
