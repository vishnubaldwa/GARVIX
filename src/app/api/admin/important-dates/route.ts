import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";
import { updateCompanySettings } from "@/lib/settings";
import { getComplianceCalendar } from "@/lib/compliance-engine";

export const dynamic = "force-dynamic";

async function canAccessImportantDates(role: string): Promise<boolean> {
  if (isFullAdminRole(role)) return true;
  if (await hasPermission(role, "CAN_VIEW_FINANCES")) return true;
  if (await hasPermission(role, "CAN_MANAGE_SETTINGS")) return true;
  return false;
}

function normalizeUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await canAccessImportantDates(session.role))) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const fy = searchParams.get("fy");
    const calendar = await getComplianceCalendar(fy);

    return NextResponse.json({
      ...calendar,
      isSuperAdmin: isFullAdminRole(session.role),
    });
  } catch (err: any) {
    console.error("Important dates GET error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load important dates." },
      { status: 500 }
    );
  }
}

/**
 * PUT: Updates Company Compliance Setup (Incorporation Date, Company Type, GST Scheme, GST Reg Date, PF/ESIC toggle)
 */
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await canAccessImportantDates(session.role))) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const body = await request.json();
    const rawIncorp =
      typeof body.incorporationDate === "string"
        ? body.incorporationDate.trim()
        : "";
    const rawGstReg =
      typeof body.gstRegistrationDate === "string"
        ? body.gstRegistrationDate.trim()
        : "";

    const validTypes = new Set(["PVT_LTD", "LLP", "OPC", "PROPRIETORSHIP"]);
    const companyType = validTypes.has(String(body.companyType || "").toUpperCase())
      ? String(body.companyType).toUpperCase()
      : "PVT_LTD";

    const validFreqs = new Set(["MONTHLY", "QUARTERLY", "NONE"]);
    const gstFilingFrequency = validFreqs.has(
      String(body.gstFilingFrequency || "").toUpperCase()
    )
      ? String(body.gstFilingFrequency).toUpperCase()
      : "MONTHLY";

    const pfEsicApplicable = Boolean(body.pfEsicApplicable);

    if (rawIncorp && Number.isNaN(new Date(`${rawIncorp}T00:00:00.000Z`).getTime())) {
      return NextResponse.json(
        { error: "Invalid Incorporation Date format (use YYYY-MM-DD)." },
        { status: 400 }
      );
    }
    if (rawGstReg && Number.isNaN(new Date(`${rawGstReg}T00:00:00.000Z`).getTime())) {
      return NextResponse.json(
        { error: "Invalid GST Registration Date format (use YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    await updateCompanySettings({
      incorporationDate: rawIncorp ? `${rawIncorp.slice(0, 10)}T00:00:00.000Z` : null,
      companyType,
      gstFilingFrequency,
      gstRegistrationDate: rawGstReg
        ? `${rawGstReg.slice(0, 10)}T00:00:00.000Z`
        : null,
      pfEsicApplicable,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "UPDATE",
        entityType: "COMPLIANCE_PROFILE",
        entityId: "default",
        details: `Updated Compliance Profile (DOI: ${rawIncorp || "Not set"}, Type: ${companyType}, GST: ${gstFilingFrequency}, PF/ESIC: ${pfEsicApplicable ? "Yes" : "No"})`,
      },
    });

    const fy = typeof body.fy === "string" ? body.fy : undefined;
    const calendar = await getComplianceCalendar(fy);

    return NextResponse.json({
      success: true,
      ...calendar,
      isSuperAdmin: isFullAdminRole(session.role),
    });
  } catch (err: any) {
    console.error("Important dates PUT error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save compliance profile." },
      { status: 500 }
    );
  }
}

/**
 * POST: Creates a Custom Important Date (Rent Renewal, DSC Expiry, Trademark, ISO Audit, etc.)
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await canAccessImportantDates(session.role))) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const body = await request.json();
    const title = String(body.title || "").trim();
    const rawDue = String(body.dueDate || "").trim();
    const category = String(body.category || "CUSTOM").trim().toUpperCase();
    const recurrence = String(body.recurrence || "NONE").trim().toUpperCase();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required for the important date." },
        { status: 400 }
      );
    }
    if (!rawDue) {
      return NextResponse.json(
        { error: "Due date is required (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    const parsedDue = new Date(`${rawDue.slice(0, 10)}T00:00:00.000Z`);
    if (Number.isNaN(parsedDue.getTime())) {
      return NextResponse.json(
        { error: "Invalid due date format." },
        { status: 400 }
      );
    }

    const created = await prisma.customImportantDate.create({
      data: {
        title,
        category: [
          "CUSTOM",
          "POST_INCORP",
          "GST",
          "MCA_ROC",
          "INCOME_TAX",
          "PF_ESIC",
        ].includes(category)
          ? category
          : "CUSTOM",
        dueDate: parsedDue,
        portalName:
          typeof body.portalName === "string" && body.portalName.trim()
            ? body.portalName.trim()
            : null,
        portalUrl: normalizeUrl(body.portalUrl),
        instructions:
          typeof body.instructions === "string" && body.instructions.trim()
            ? body.instructions.trim()
            : null,
        penaltyNote:
          typeof body.penaltyNote === "string" && body.penaltyNote.trim()
            ? body.penaltyNote.trim()
            : null,
        recurrence: ["NONE", "MONTHLY", "QUARTERLY", "YEARLY"].includes(recurrence)
          ? recurrence
          : "NONE",
        createdBy: session.name || session.email,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "CREATE",
        entityType: "IMPORTANT_DATE",
        entityId: created.id,
        details: `Created custom important date '${created.title}' due ${rawDue.slice(0, 10)}`,
      },
    });

    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    console.error("Important dates POST error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to add custom important date." },
      { status: 500 }
    );
  }
}
