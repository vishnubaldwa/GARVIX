import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_CREATE_PRODUCT")) ||
      (await hasPermission(session.role, "CAN_VIEW_SERVICE"));
    if (!allowed) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const serials = await prisma.serialNumber.findMany({
      include: {
        product: { select: { name: true, sku: true } },
        deliveryChallan: {
          select: {
            challanNumber: true,
            customer: { select: { companyName: true } },
          },
        },
        invoice: {
          select: {
            invoiceNumber: true,
            customer: { select: { companyName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 250,
    });

    return NextResponse.json({
      serials: serials.map((s) => ({
        id: s.id,
        serialNumber: s.serialNumber,
        imei: s.imei,
        productName: s.product.name,
        productSku: s.product.sku,
        status: s.status,
        assignedDoc: s.invoice
          ? `Inv #${s.invoice.invoiceNumber}`
          : s.deliveryChallan
          ? `Challan #${s.deliveryChallan.challanNumber}`
          : null,
        assignedClient: s.invoice
          ? s.invoice.customer.companyName
          : s.deliveryChallan
          ? s.deliveryChallan.customer.companyName
          : null,
        warrantyExpiry: s.warrantyExpiry,
        notes: s.notes,
        createdAt: s.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load serials" },
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
    const allowed =
      isFullAdminRole(session.role) ||
      (await hasPermission(session.role, "CAN_CREATE_PRODUCT")) ||
      (await hasPermission(session.role, "CAN_VIEW_SERVICE"));
    if (!allowed) {
      return NextResponse.json(
        { error: "Access denied. Inventory/Service permission required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const productId = String(body.productId || "").trim();
    const rawSerials = String(body.serialNumber || "").trim();
    const imei =
      typeof body.imei === "string" && body.imei.trim() ? body.imei.trim() : null;
    const status = String(body.status || "IN_STOCK").trim();
    const notes =
      typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
    const incrementStock = body.incrementStock === true;

    let warrantyExpiry: Date | null = null;
    if (typeof body.warrantyExpiry === "string" && body.warrantyExpiry.trim()) {
      const parsed = new Date(`${body.warrantyExpiry.trim()}T12:00:00.000Z`);
      if (!Number.isNaN(parsed.getTime())) warrantyExpiry = parsed;
    }

    if (!productId || !rawSerials) {
      return NextResponse.json(
        { error: "Product and Serial Number are required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Support single OR batch comma/newline-separated serials
    const serialList = Array.from(
      new Set(
        rawSerials
          .split(/[\n,]+/)
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      )
    );

    if (serialList.length === 0) {
      return NextResponse.json({ error: "Enter at least one valid serial number." }, { status: 400 });
    }

    // Check duplicates upfront
    const existing = await prisma.serialNumber.findMany({
      where: { serialNumber: { in: serialList } },
      select: { serialNumber: true },
    });
    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: `Serial already exists: ${existing.map((e) => e.serialNumber).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const rows = [];
      for (const sn of serialList) {
        const row = await tx.serialNumber.create({
          data: {
            productId,
            serialNumber: sn,
            imei: serialList.length === 1 ? imei : null,
            status,
            warrantyExpiry,
            notes,
          },
        });
        rows.push(row);
      }

      if (incrementStock && status === "IN_STOCK") {
        await tx.product.update({
          where: { id: productId },
          data: { currentStock: { increment: rows.length } },
        });
      }

      return rows;
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "CREATE",
        entityType: "SERIAL",
        entityId: created[0]?.id || productId,
        details: `Added ${created.length} hardware serial(s) for ${product.name}: ${serialList.slice(0, 5).join(", ")}`,
      },
    });

    revalidatePath("/admin", "layout");
    return NextResponse.json({ success: true, count: created.length, serials: created });
  } catch (err: any) {
    console.error("Serial create error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to add serial number." },
      { status: 500 }
    );
  }
}
