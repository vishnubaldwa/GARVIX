import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signShareAccessToken, verifyShareAccessToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

function shareCookieName(shareId: string): string {
  return `garvix_vshare_${shareId}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const share = await prisma.vaultShareLink.findUnique({
      where: { token },
    });

    if (!share || !share.isActive) {
      return NextResponse.json(
        { error: "This document share link is invalid or has been revoked." },
        { status: 404 }
      );
    }

    if (new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: "This document share link has expired. Please request a new link from GARVIX." },
        { status: 410 }
      );
    }

    const cookieStore = await cookies();
    const signedCookie = cookieStore.get(shareCookieName(share.id))?.value;
    const isUnlocked =
      !share.pinHash || (signedCookie ? verifyShareAccessToken(signedCookie, token) : false);

    if (!isUnlocked) {
      return NextResponse.json({
        locked: true,
        label: share.label,
        recipient: share.recipient,
        expiresAt: share.expiresAt,
      });
    }

    const folderIds: string[] = JSON.parse(share.folderIds || "[]");
    const folders = await prisma.vaultFolder.findMany({
      where: { id: { in: folderIds } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            folderId: true,
            title: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            notes: true,
            expiryDate: true,
            createdAt: true,
          },
        },
      },
    });

    await prisma.vaultShareLink.update({
      where: { id: share.id },
      data: {
        accessCount: { increment: 1 },
        lastAccessAt: new Date(),
      },
    });

    return NextResponse.json({
      locked: false,
      label: share.label,
      recipient: share.recipient,
      expiresAt: share.expiresAt,
      folders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load shared vault" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { pin } = await request.json();

    const share = await prisma.vaultShareLink.findUnique({
      where: { token },
    });

    if (!share || !share.isActive || new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: "This link is expired or revoked." },
        { status: 403 }
      );
    }

    if (share.pinHash) {
      if (!pin?.trim()) {
        return NextResponse.json({ error: "Please enter the access PIN." }, { status: 400 });
      }
      const valid = await bcrypt.compare(pin.trim(), share.pinHash);
      if (!valid) {
        return NextResponse.json({ error: "Incorrect PIN. Please try again." }, { status: 401 });
      }
    }

    const signed = signShareAccessToken(token);
    const cookieStore = await cookies();
    cookieStore.set(shareCookieName(share.id), signed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    await prisma.auditLog.create({
      data: {
        username: share.recipient || "External Share Recipient",
        action: "UNLOCK",
        entityType: "VAULT_SHARE",
        entityId: share.id,
        details: `Unlocked Share Link '${share.label}' (${share.recipient || "External"})`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "PIN verification failed" }, { status: 500 });
  }
}
