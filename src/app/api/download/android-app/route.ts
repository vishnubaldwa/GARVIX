import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function resolveApkPath(): string | null {
  const candidates = [
    path.join(process.cwd(), "downloads", "garvix-erp.apk"),
    path.join(process.cwd(), "public", "downloads", "garvix-erp.apk"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export async function GET() {
  const apkPath = resolveApkPath();
  if (!apkPath) {
    return NextResponse.json(
      {
        error:
          "Android APK has not been uploaded to the server yet. Upload garvix-erp.apk to /var/www/garvix/downloads/garvix-erp.apk.",
      },
      { status: 404 }
    );
  }

  const stat = fs.statSync(apkPath);
  const nodeStream = fs.createReadStream(apkPath);

  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        controller.enqueue(new Uint8Array(chunk as Buffer));
      });
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      nodeStream.destroy();
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="GARVIX-ERP-Android.apk"',
      "Content-Length": String(stat.size),
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
