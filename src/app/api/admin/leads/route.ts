import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed = await hasPermission(session.role, "CAN_VIEW_LEADS");
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    const leads = await prisma.lead.findMany({
      where: status && status !== "ALL" ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ leads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load leads" }, { status: 500 });
  }
}
