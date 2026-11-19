import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed = await hasPermission(session.role, "CAN_VIEW_SERVICE");
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const [contracts, tickets] = await Promise.all([
      prisma.aMCContract.findMany({
        include: {
          customer: { select: { companyName: true, phone: true, email: true } },
        },
        orderBy: { endDate: "asc" },
      }),
      prisma.serviceTicket.findMany({
        include: {
          customer: { select: { companyName: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    return NextResponse.json({
      contracts: contracts.map((c) => ({
        id: c.id,
        contractNumber: c.contractNumber,
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
        customerName: t.customer.companyName,
        customerPhone: t.customer.phone,
        issueTitle: t.issueTitle,
        description: t.description,
        priority: t.priority,
        status: t.status,
        assignedTo: t.assignedTo,
        resolutionNotes: t.resolutionNotes,
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
