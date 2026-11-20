import { NextResponse } from "next/server";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { resolveClientLogoPath } from "@/lib/client-logos";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await prisma.websiteClient.findUnique({
      where: { id },
      select: { logoFile: true, logoMimeType: true },
    });

    if (!client || !client.logoFile) {
      return NextResponse.json({ error: "Logo not found." }, { status: 404 });
    }

    const fullPath = resolveClientLogoPath(client.logoFile);
    if (!fullPath) {
      return NextResponse.json({ error: "Invalid logo path." }, { status: 400 });
    }

    const buffer = await fs.readFile(fullPath);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": client.logoMimeType || "image/png",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      return NextResponse.json({ error: "Logo file missing." }, { status: 404 });
    }
    return NextResponse.json(
      { error: err.message || "Failed to load logo." },
      { status: 500 }
    );
  }
}
