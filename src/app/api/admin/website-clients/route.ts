import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";
import { normalizeWebsiteUrl, saveClientLogo } from "@/lib/client-logos";

export const dynamic = "force-dynamic";

async function canManageWebsiteClients(role: string): Promise<boolean> {
  if (isFullAdminRole(role)) return true;
  if (await hasPermission(role, "CAN_MANAGE_SETTINGS")) return true;
  if (await hasPermission(role, "CAN_CREATE_CLIENT")) return true;
  return false;
}

function serializeClient(c: {
  id: string;
  name: string;
  industry: string | null;
  websiteUrl: string | null;
  logoFile: string | null;
  displayOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: c.id,
    name: c.name,
    industry: c.industry,
    websiteUrl: c.websiteUrl,
    hasLogo: Boolean(c.logoFile),
    logoUrl: c.logoFile
      ? `/api/public/client-logo/${c.id}?v=${c.updatedAt.getTime()}`
      : null,
    displayOrder: c.displayOrder,
    isVisible: c.isVisible,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await canManageWebsiteClients(session.role))) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const clients = await prisma.websiteClient.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      clients: clients.map(serializeClient),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load website clients." },
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
    if (!(await canManageWebsiteClients(session.role))) {
      return NextResponse.json(
        { error: "Access denied. Settings or Client permission required." },
        { status: 403 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let name = "";
    let industry: string | null = null;
    let websiteUrl: string | null = null;
    let displayOrder = 0;
    let isVisible = true;
    let logoFileObj: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = String(formData.get("name") || "").trim();
      const rawInd = String(formData.get("industry") || "").trim();
      industry = rawInd || null;
      websiteUrl = normalizeWebsiteUrl(String(formData.get("websiteUrl") || ""));
      displayOrder = parseInt(String(formData.get("displayOrder") || "0"), 10) || 0;
      const rawVis = formData.get("isVisible");
      if (rawVis !== null) isVisible = String(rawVis) !== "false";
      const maybeFile = formData.get("logo");
      if (maybeFile instanceof File && maybeFile.size > 0) {
        logoFileObj = maybeFile;
      }
    } else {
      const body = await request.json();
      name = String(body.name || "").trim();
      industry =
        typeof body.industry === "string" && body.industry.trim()
          ? body.industry.trim()
          : null;
      websiteUrl = normalizeWebsiteUrl(body.websiteUrl);
      displayOrder = Number(body.displayOrder || 0) || 0;
      if (typeof body.isVisible === "boolean") isVisible = body.isVisible;
    }

    if (!name) {
      return NextResponse.json(
        { error: "Client / Brand Name is required." },
        { status: 400 }
      );
    }

    let logoFile: string | null = null;
    let logoMimeType: string | null = null;
    if (logoFileObj) {
      const saved = await saveClientLogo(logoFileObj);
      logoFile = saved.storageKey;
      logoMimeType = saved.mimeType;
    }

    const client = await prisma.websiteClient.create({
      data: {
        name,
        industry,
        websiteUrl,
        logoFile,
        logoMimeType,
        displayOrder,
        isVisible,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "CREATE",
        entityType: "WEBSITE_CLIENT",
        entityId: client.id,
        details: `Added website showcase client '${client.name}' (Visible: ${client.isVisible})`,
      },
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, client: serializeClient(client) });
  } catch (err: any) {
    console.error("Website client create error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to add website client." },
      { status: 500 }
    );
  }
}
