import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { VAULT_STORAGE_DIR } from "@/lib/vault";

export const dynamic = "force-dynamic";

const CUSTOM_SIGNATURE_PATH = path.join(VAULT_STORAGE_DIR, "company-signature.png");
const DEFAULT_SIGNATURE_PATH = path.join(
  process.cwd(),
  "public",
  "images",
  "authorized-signature.png"
);

export async function GET() {
  try {
    let buffer: Buffer | null = null;

    for (const candidate of [CUSTOM_SIGNATURE_PATH, DEFAULT_SIGNATURE_PATH]) {
      try {
        buffer = await fs.readFile(candidate);
        break;
      } catch {
        // Try next fallback
      }
    }

    if (!buffer) {
      return NextResponse.json({ error: "Signature image not found." }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load signature." },
      { status: 500 }
    );
  }
}
