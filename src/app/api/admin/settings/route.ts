import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getCompanySettings, updateCompanySettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Fetch live company settings from DB
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const settings = await getCompanySettings();
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Update live company settings
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const canManageSettings = await hasPermission(session.role, "CAN_MANAGE_SETTINGS");
    if (!canManageSettings) {
      return NextResponse.json(
        { error: "Access denied. Only authorized administrators can modify company settings." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await updateCompanySettings(body);

    await prisma.auditLog.create({
      data: {
        username: session.username,
        action: "UPDATE",
        entityType: "SETTINGS",
        entityId: "default",
        details: `Updated company profile / bank settings`,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
