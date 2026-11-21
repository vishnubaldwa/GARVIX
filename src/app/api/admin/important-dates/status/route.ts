import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set([
  "PENDING",
  "IN_PROGRESS",
  "FILED",
  "NOT_APPLICABLE",
]);

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const status = String(body.status || "PENDING").trim().toUpperCase();
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Invalid compliance status." },
        { status: 400 }
      );
    }

    const rawFiled =
      typeof body.filedDate === "string" ? body.filedDate.trim() : "";
    let filedDate: Date | null = null;
    if (rawFiled) {
      const parsed = new Date(`${rawFiled.slice(0, 10)}T00:00:00.000Z`);
      if (!Number.isNaN(parsed.getTime())) filedDate = parsed;
    } else if (status === "FILED") {
      filedDate = new Date();
    }

    const referenceNo =
      typeof body.referenceNo === "string" && body.referenceNo.trim()
        ? body.referenceNo.trim()
        : null;
    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : null;

    // Case A: Custom Important Date status update
    if (typeof body.customId === "string" && body.customId.trim()) {
      const customId = body.customId.trim();
      const updated = await prisma.customImportantDate.update({
        where: { id: customId },
        data: {
          status,
          filedDate: status === "FILED" ? filedDate : null,
          referenceNo,
          notes,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          username: session.email,
          action: "UPDATE",
          entityType: "IMPORTANT_DATE",
          entityId: updated.id,
          details: `Marked custom date '${updated.title}' as ${status}${referenceNo ? ` (Ref: ${referenceNo})` : ""}`,
        },
      });

      return NextResponse.json({ success: true, record: updated });
    }

    // Case B: Statutory ComplianceRecord upsert
    const complianceKey = String(body.complianceKey || "").trim();
    const financialYear = String(body.financialYear || "").trim() || "2026-27";
    if (!complianceKey) {
      return NextResponse.json(
        { error: "complianceKey or customId is required." },
        { status: 400 }
      );
    }

    const record = await prisma.complianceRecord.upsert({
      where: { complianceKey },
      create: {
        complianceKey,
        financialYear,
        status,
        filedDate: status === "FILED" ? filedDate : null,
        referenceNo,
        notes,
        updatedBy: session.name || session.email,
      },
      update: {
        financialYear,
        status,
        filedDate: status === "FILED" ? filedDate : null,
        referenceNo,
        notes,
        updatedBy: session.name || session.email,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "UPDATE",
        entityType: "COMPLIANCE_RECORD",
        entityId: record.id,
        details: `Updated compliance '${complianceKey}' to ${status}${referenceNo ? ` (SRN/ARN: ${referenceNo})` : ""}`,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    console.error("Important dates status PATCH error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update compliance status." },
      { status: 500 }
    );
  }
}
