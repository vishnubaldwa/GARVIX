import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function normalizeUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_VIEW_FINANCES")) ||
      (await hasPermission(session.role, "CAN_MANAGE_SETTINGS"));

    if (!allowed) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (typeof body.title === "string" && body.title.trim()) {
      data.title = body.title.trim();
    }
    if (typeof body.category === "string" && body.category.trim()) {
      const cat = body.category.trim().toUpperCase();
      if (
        ["CUSTOM", "POST_INCORP", "GST", "MCA_ROC", "INCOME_TAX", "PF_ESIC"].includes(
          cat
        )
      ) {
        data.category = cat;
      }
    }
    if (typeof body.dueDate === "string" && body.dueDate.trim()) {
      const parsed = new Date(`${body.dueDate.trim().slice(0, 10)}T00:00:00.000Z`);
      if (!Number.isNaN(parsed.getTime())) {
        data.dueDate = parsed;
      }
    }
    if (body.portalName !== undefined) {
      data.portalName =
        typeof body.portalName === "string" && body.portalName.trim()
          ? body.portalName.trim()
          : null;
    }
    if (body.portalUrl !== undefined) {
      data.portalUrl = normalizeUrl(body.portalUrl);
    }
    if (body.instructions !== undefined) {
      data.instructions =
        typeof body.instructions === "string" && body.instructions.trim()
          ? body.instructions.trim()
          : null;
    }
    if (body.penaltyNote !== undefined) {
      data.penaltyNote =
        typeof body.penaltyNote === "string" && body.penaltyNote.trim()
          ? body.penaltyNote.trim()
          : null;
    }
    if (typeof body.recurrence === "string") {
      const rec = body.recurrence.trim().toUpperCase();
      if (["NONE", "MONTHLY", "QUARTERLY", "YEARLY"].includes(rec)) {
        data.recurrence = rec;
      }
    }

    const updated = await prisma.customImportantDate.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "UPDATE",
        entityType: "IMPORTANT_DATE",
        entityId: updated.id,
        details: `Edited custom important date '${updated.title}'`,
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    console.error("Important date PATCH error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update custom date." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Strictly Super Admin ONLY (ERP permanent delete security policy)
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isFullAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Only Super Admin can permanently delete important dates." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const existing = await prisma.customImportantDate.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Custom important date not found." },
        { status: 404 }
      );
    }

    await prisma.customImportantDate.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "DELETE",
        entityType: "IMPORTANT_DATE",
        entityId: id,
        details: `Permanently deleted custom important date '${existing.title}'`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Important date DELETE error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete custom date." },
      { status: 500 }
    );
  }
}
