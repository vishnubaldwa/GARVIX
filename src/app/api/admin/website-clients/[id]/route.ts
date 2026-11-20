import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";
import {
  deleteClientLogoFile,
  normalizeWebsiteUrl,
  saveClientLogo,
} from "@/lib/client-logos";

export const dynamic = "force-dynamic";

async function canManageWebsiteClients(role: string): Promise<boolean> {
  if (isFullAdminRole(role)) return true;
  if (await hasPermission(role, "CAN_MANAGE_SETTINGS")) return true;
  if (await hasPermission(role, "CAN_CREATE_CLIENT")) return true;
  return false;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await canManageWebsiteClients(session.role))) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.websiteClient.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Website client not found." }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    const updateData: Record<string, any> = {};
    let logoFileObj: File | null = null;
    let removeLogo = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      if (formData.has("name")) {
        const n = String(formData.get("name") || "").trim();
        if (!n) {
          return NextResponse.json({ error: "Client Name cannot be empty." }, { status: 400 });
        }
        updateData.name = n;
      }
      if (formData.has("industry")) {
        const ind = String(formData.get("industry") || "").trim();
        updateData.industry = ind || null;
      }
      if (formData.has("websiteUrl")) {
        updateData.websiteUrl = normalizeWebsiteUrl(String(formData.get("websiteUrl") || ""));
      }
      if (formData.has("displayOrder")) {
        updateData.displayOrder = parseInt(String(formData.get("displayOrder") || "0"), 10) || 0;
      }
      if (formData.has("isVisible")) {
        updateData.isVisible = String(formData.get("isVisible")) !== "false";
      }
      if (String(formData.get("removeLogo") || "") === "true") {
        removeLogo = true;
      }
      const maybeFile = formData.get("logo");
      if (maybeFile instanceof File && maybeFile.size > 0) {
        logoFileObj = maybeFile;
      }
    } else {
      const body = await request.json();
      if (body.name !== undefined) {
        const n = String(body.name || "").trim();
        if (!n) {
          return NextResponse.json({ error: "Client Name cannot be empty." }, { status: 400 });
        }
        updateData.name = n;
      }
      if (body.industry !== undefined) {
        updateData.industry =
          typeof body.industry === "string" && body.industry.trim()
            ? body.industry.trim()
            : null;
      }
      if (body.websiteUrl !== undefined) {
        updateData.websiteUrl = normalizeWebsiteUrl(body.websiteUrl);
      }
      if (body.displayOrder !== undefined) {
        updateData.displayOrder = Number(body.displayOrder || 0) || 0;
      }
      if (typeof body.isVisible === "boolean") {
        updateData.isVisible = body.isVisible;
      }
      if (body.removeLogo === true) {
        removeLogo = true;
      }
    }

    if (logoFileObj) {
      const saved = await saveClientLogo(logoFileObj);
      if (existing.logoFile) {
        await deleteClientLogoFile(existing.logoFile);
      }
      updateData.logoFile = saved.storageKey;
      updateData.logoMimeType = saved.mimeType;
    } else if (removeLogo && existing.logoFile) {
      await deleteClientLogoFile(existing.logoFile);
      updateData.logoFile = null;
      updateData.logoMimeType = null;
    }

    const updated = await prisma.websiteClient.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "UPDATE",
        entityType: "WEBSITE_CLIENT",
        entityId: id,
        details: `Updated website client '${updated.name}' (Visible: ${updated.isVisible})`,
      },
    });

    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      client: {
        id: updated.id,
        name: updated.name,
        industry: updated.industry,
        websiteUrl: updated.websiteUrl,
        hasLogo: Boolean(updated.logoFile),
        logoUrl: updated.logoFile
          ? `/api/public/client-logo/${updated.id}?v=${updated.updatedAt.getTime()}`
          : null,
        displayOrder: updated.displayOrder,
        isVisible: updated.isVisible,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Website client update error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update website client." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isFullAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Access denied. Only Super Admin can delete website clients." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await prisma.websiteClient.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Website client not found." }, { status: 404 });
    }

    if (existing.logoFile) {
      await deleteClientLogoFile(existing.logoFile);
    }

    await prisma.websiteClient.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "DELETE",
        entityType: "WEBSITE_CLIENT",
        entityId: id,
        details: `Permanently deleted website client '${existing.name}'`,
      },
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete website client." },
      { status: 500 }
    );
  }
}
