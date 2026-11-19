import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function parseDateSafe(raw?: string | null): Date | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? new Date(`${trimmed}T12:00:00.000Z`)
    : new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_VIEW_SERVICE"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const [contracts, tickets, customers, staff] = await Promise.all([
      prisma.aMCContract.findMany({
        include: {
          customer: { select: { id: true, companyName: true, phone: true, email: true } },
        },
        orderBy: { endDate: "asc" },
      }),
      prisma.serviceTicket.findMany({
        include: {
          customer: { select: { id: true, companyName: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 150,
      }),
      prisma.customer.findMany({
        select: { id: true, companyName: true, phone: true },
        orderBy: { companyName: "asc" },
      }),
      prisma.user.findMany({
        where: { isActive: true, role: { not: "DOCUMENT_VIEWER" } },
        select: { name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      customers,
      staffNames: staff.map((s) => s.name).filter(Boolean),
      contracts: contracts.map((c) => ({
        id: c.id,
        contractNumber: c.contractNumber,
        customerId: c.customerId,
        customerName: c.customer.companyName,
        customerPhone: c.customer.phone,
        title: c.title,
        startDate: c.startDate,
        endDate: c.endDate,
        contractValue: c.contractValue,
        visitFrequency: c.visitFrequency,
        status: c.status,
        notes: c.notes,
      })),
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        customerId: t.customerId,
        amcId: t.amcId,
        customerName: t.customer.companyName,
        customerPhone: t.customer.phone,
        issueTitle: t.issueTitle,
        description: t.description,
        priority: t.priority,
        status: t.status,
        assignedTo: t.assignedTo,
        resolutionNotes: t.resolutionNotes,
        resolvedAt: t.resolvedAt,
        createdAt: t.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load AMC & service desk" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_VIEW_SERVICE"));
    if (!allowed) {
      return NextResponse.json(
        { error: "Access denied. Service & AMC permission required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const type = String(body.type || "contract");

    if (type === "contract") {
      const customerId = String(body.customerId || "").trim();
      const title = String(body.title || "").trim();
      const startDate = parseDateSafe(body.startDate) ?? new Date();
      const endDate =
        parseDateSafe(body.endDate) ??
        new Date(new Date(startDate).setFullYear(startDate.getFullYear() + 1));
      const contractValue = Number(body.contractValue || 0);
      const visitFrequency = String(body.visitFrequency || "QUARTERLY").trim();
      const notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;

      if (!customerId || !title) {
        return NextResponse.json(
          { error: "Customer and SLA Scope / Title are required." },
          { status: 400 }
        );
      }
      if (endDate < startDate) {
        return NextResponse.json(
          { error: "End date must be after start date." },
          { status: 400 }
        );
      }

      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        return NextResponse.json({ error: "Customer not found." }, { status: 404 });
      }

      const prefix = "GARVIX/AMC/26-27/";
      const existing = await prisma.aMCContract.findMany({
        where: { contractNumber: { startsWith: prefix } },
        select: { contractNumber: true },
      });
      let maxSeq = 0;
      for (const item of existing) {
        const n = parseInt(item.contractNumber.slice(prefix.length), 10);
        if (!Number.isNaN(n) && n > maxSeq) maxSeq = n;
      }
      const contractNumber = `${prefix}${String(maxSeq + 1).padStart(3, "0")}`;

      const contract = await prisma.aMCContract.create({
        data: {
          contractNumber,
          customerId,
          title,
          startDate,
          endDate,
          contractValue: Number.isNaN(contractValue) ? 0 : contractValue,
          visitFrequency,
          status: "ACTIVE",
          notes,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          username: session.email,
          action: "CREATE",
          entityType: "AMC",
          entityId: contract.id,
          details: `Created AMC ${contractNumber} for ${customer.companyName} (${title}, INR ${contract.contractValue})`,
        },
      });

      revalidatePath("/admin", "layout");
      return NextResponse.json({ success: true, contract });
    }

    if (type === "ticket") {
      const customerId = String(body.customerId || "").trim();
      const amcId =
        typeof body.amcId === "string" && body.amcId.trim() ? body.amcId.trim() : null;
      const issueTitle = String(body.issueTitle || "").trim();
      const description = String(body.description || "").trim();
      const priority = String(body.priority || "MEDIUM").trim();
      const assignedTo =
        typeof body.assignedTo === "string" && body.assignedTo.trim()
          ? body.assignedTo.trim()
          : null;
      const status = String(body.status || "OPEN").trim();
      const resolutionNotes =
        typeof body.resolutionNotes === "string" && body.resolutionNotes.trim()
          ? body.resolutionNotes.trim()
          : null;

      if (!customerId || !issueTitle) {
        return NextResponse.json(
          { error: "Customer and Issue Title are required." },
          { status: 400 }
        );
      }

      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        return NextResponse.json({ error: "Customer not found." }, { status: 404 });
      }

      const prefix = "GARVIX/TKT/26-27/";
      const existing = await prisma.serviceTicket.findMany({
        where: { ticketNumber: { startsWith: prefix } },
        select: { ticketNumber: true },
      });
      let maxSeq = 0;
      for (const item of existing) {
        const n = parseInt(item.ticketNumber.slice(prefix.length), 10);
        if (!Number.isNaN(n) && n > maxSeq) maxSeq = n;
      }
      const ticketNumber = `${prefix}${String(maxSeq + 1).padStart(3, "0")}`;

      const ticket = await prisma.serviceTicket.create({
        data: {
          ticketNumber,
          customerId,
          amcId,
          issueTitle,
          description: description || issueTitle,
          priority,
          status,
          assignedTo,
          resolutionNotes,
          resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : null,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          username: session.email,
          action: "CREATE",
          entityType: "SERVICE_TICKET",
          entityId: ticket.id,
          details: `Logged Ticket ${ticketNumber} for ${customer.companyName}: ${issueTitle}`,
        },
      });

      revalidatePath("/admin", "layout");
      return NextResponse.json({ success: true, ticket });
    }

    return NextResponse.json({ error: "Invalid type. Use 'contract' or 'ticket'." }, { status: 400 });
  } catch (err: any) {
    console.error("AMC/Ticket create error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save record." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const type = String(body.type || "ticket");
    const id = String(body.id || "").trim();

    if (!id) {
      return NextResponse.json({ error: "Record ID is required." }, { status: 400 });
    }

    if (type === "contract") {
      if (!isFullAdminRole(session.role)) {
        return NextResponse.json(
          { error: "Only Super Admin can edit AMC contracts." },
          { status: 403 }
        );
      }

      const data: Record<string, any> = {};
      if (body.title !== undefined) data.title = String(body.title).trim();
      if (body.startDate !== undefined) {
        const d = parseDateSafe(body.startDate);
        if (d) data.startDate = d;
      }
      if (body.endDate !== undefined) {
        const d = parseDateSafe(body.endDate);
        if (d) data.endDate = d;
      }
      if (body.contractValue !== undefined) data.contractValue = Number(body.contractValue) || 0;
      if (body.visitFrequency !== undefined) data.visitFrequency = String(body.visitFrequency).trim();
      if (body.status !== undefined) data.status = String(body.status).trim();
      if (body.notes !== undefined) {
        data.notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
      }

      const updated = await prisma.aMCContract.update({
        where: { id },
        data,
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          username: session.email,
          action: "UPDATE",
          entityType: "AMC",
          entityId: id,
          details: `Updated AMC ${updated.contractNumber} (${updated.status})`,
        },
      });

      revalidatePath("/admin", "layout");
      return NextResponse.json({ success: true, contract: updated });
    }

    if (type === "ticket") {
      const allowed =
        isFullAdminRole(session.role) ||
        (await hasPermission(session.role, "CAN_VIEW_SERVICE"));
      if (!allowed) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }

      const data: Record<string, any> = {};
      if (body.status !== undefined) {
        data.status = String(body.status).trim();
        if (data.status === "RESOLVED" || data.status === "CLOSED") {
          data.resolvedAt = new Date();
        } else {
          data.resolvedAt = null;
        }
      }
      if (body.priority !== undefined) data.priority = String(body.priority).trim();
      if (body.assignedTo !== undefined) {
        data.assignedTo =
          typeof body.assignedTo === "string" && body.assignedTo.trim()
            ? body.assignedTo.trim()
            : null;
      }
      if (body.resolutionNotes !== undefined) {
        data.resolutionNotes =
          typeof body.resolutionNotes === "string" && body.resolutionNotes.trim()
            ? body.resolutionNotes.trim()
            : null;
      }

      const updated = await prisma.serviceTicket.update({
        where: { id },
        data,
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          username: session.email,
          action: "UPDATE",
          entityType: "SERVICE_TICKET",
          entityId: id,
          details: `Updated Ticket ${updated.ticketNumber} → ${updated.status}`,
        },
      });

      revalidatePath("/admin", "layout");
      return NextResponse.json({ success: true, ticket: updated });
    }

    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  } catch (err: any) {
    console.error("AMC/Ticket update error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update record." },
      { status: 500 }
    );
  }
}
