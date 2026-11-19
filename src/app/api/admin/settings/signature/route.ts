import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";
import { ensureVaultStorageDir, VAULT_STORAGE_DIR } from "@/lib/vault";

export const dynamic = "force-dynamic";

const CUSTOM_SIGNATURE_PATH = path.join(VAULT_STORAGE_DIR, "company-signature.png");
const MAX_SIG_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Converts any uploaded signature image (white-paper scan or transparent PNG)
 * into a clean, tightly-cropped transparent PNG with crisp dark ink strokes.
 */
async function processSignatureToTransparentPng(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .rotate()
    .resize({ width: 900, height: 450, fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  let hasInk = false;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      let alpha = Math.round(((230 - lum) / (230 - 120)) * 255);
      alpha = Math.max(0, Math.min(255, alpha));
      alpha = Math.round(alpha * (a / 255));

      out[idx] = 17;
      out[idx + 1] = 24;
      out[idx + 2] = 39;
      out[idx + 3] = alpha;

      if (alpha > 15) {
        hasInk = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  let pipeline = sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });

  if (hasInk) {
    const pad = 14;
    const left = Math.max(0, minX - pad);
    const top = Math.max(0, minY - pad);
    const width = Math.min(info.width - left, maxX - minX + 1 + pad * 2);
    const height = Math.min(info.height - top, maxY - minY + 1 + pad * 2);
    pipeline = pipeline.extract({ left, top, width, height });
  }

  return pipeline.png({ compressionLevel: 9 }).toBuffer();
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_MANAGE_SETTINGS"));
    if (!allowed) {
      return NextResponse.json(
        { error: "Access denied. Settings permission required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Signature image file is required." }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_SIG_BYTES) {
      return NextResponse.json(
        { error: "Signature file must be under 5 MB." },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const cleanPng = await processSignatureToTransparentPng(inputBuffer);

    await ensureVaultStorageDir();
    await fs.writeFile(CUSTOM_SIGNATURE_PATH, cleanPng);

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "UPDATE",
        entityType: "SETTINGS",
        entityId: "signature",
        details: `Updated Authorized Signatory digital signature (${file.name})`,
      },
    });

    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      signatureUrl: `/api/public/signature?v=${Date.now()}`,
    });
  } catch (err: any) {
    console.error("Signature upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload signature." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isFullAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Only Super Admin can reset the company signature." },
        { status: 403 }
      );
    }

    try {
      await fs.unlink(CUSTOM_SIGNATURE_PATH);
    } catch {
      // Already using default signature
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "DELETE",
        entityType: "SETTINGS",
        entityId: "signature",
        details: "Reset Authorized Signatory signature to default",
      },
    });

    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      signatureUrl: `/api/public/signature?v=${Date.now()}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to reset signature." },
      { status: 500 }
    );
  }
}
