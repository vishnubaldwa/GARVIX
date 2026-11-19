import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateGstr1Workbook, generateGstr3bSummaryWorkbook } from "@/lib/excel-export";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed = await hasPermission(session.role, "CAN_VIEW_FINANCES");
    if (!allowed) {
      return NextResponse.json({ error: "Access denied. Finance export permission required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "gstr1";
    const month = searchParams.get("month") || "all";

    // Fetch invoices and purchases
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        items: true,
      },
      orderBy: { invoiceDate: "asc" },
    });

    const purchases = await prisma.purchase.findMany({
      orderBy: { billDate: "asc" },
    });

    let buffer: Buffer;
    let filename: string;

    if (type === "gstr3b") {
      buffer = generateGstr3bSummaryWorkbook(invoices, purchases, "FY 2026-27");
      filename = `GARVIX_GSTR3B_Summary_${new Date().toISOString().slice(0, 7)}.xlsx`;
    } else {
      buffer = generateGstr1Workbook(invoices, "FY 2026-27");
      filename = `GARVIX_GSTR1_Return_${new Date().toISOString().slice(0, 7)}.xlsx`;
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        username: session?.email || "admin@garvix.in",
        action: "EXPORT_GST",
        entityType: "INVOICE",
        details: `Exported ${type.toUpperCase()} Excel Workbook for CA tax filing. Total Invoices: ${invoices.length}`,
      },
    });

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("GST export error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
