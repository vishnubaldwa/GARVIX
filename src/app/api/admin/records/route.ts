import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

type DeletableEntity =
  | "client"
  | "quotation"
  | "invoice"
  | "lead"
  | "challan"
  | "product"
  | "serial"
  | "amc"
  | "ticket"
  | "expense"
  | "purchase";

/**
 * Super-Admin-Only Centralized Permanent Delete API across all ERP modules.
 * Enforces Option B referential safety for Clients & Products so financial records
 * are never accidentally orphaned or wiped.
 */
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isFullAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Access denied. Only the Super Admin has permission to delete records." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let entity = searchParams.get("entity") as DeletableEntity | null;
    let id = searchParams.get("id");

    if (!entity || !id) {
      try {
        const body = await request.json();
        entity = entity || body?.entity;
        id = id || body?.id;
      } catch {
        // Query params only
      }
    }

    if (!entity || !id) {
      return NextResponse.json(
        { error: "Both 'entity' and 'id' are required." },
        { status: 400 }
      );
    }

    let auditEntityType = entity.toUpperCase();
    let auditDetails = "";

    switch (entity) {
      case "client": {
        const client = await prisma.customer.findUnique({
          where: { id },
          include: {
            _count: {
              select: {
                quotations: true,
                invoices: true,
                challans: true,
                amcContracts: true,
                serviceTickets: true,
              },
            },
          },
        });
        if (!client) {
          return NextResponse.json({ error: "Client not found." }, { status: 404 });
        }

        // Option B: Block deletion if linked business records exist
        const linked: string[] = [];
        if (client._count.quotations > 0) linked.push(`${client._count.quotations} quotation(s)`);
        if (client._count.invoices > 0) linked.push(`${client._count.invoices} invoice(s)`);
        if (client._count.challans > 0) linked.push(`${client._count.challans} challan(s)`);
        if (client._count.amcContracts > 0) linked.push(`${client._count.amcContracts} AMC contract(s)`);
        if (client._count.serviceTickets > 0) linked.push(`${client._count.serviceTickets} service ticket(s)`);

        if (linked.length > 0) {
          return NextResponse.json(
            {
              error: `Cannot delete '${client.companyName}' while linked to ${linked.join(", ")}. Please delete those records first.`,
            },
            { status: 400 }
          );
        }

        await prisma.customer.delete({ where: { id } });
        auditEntityType = "CUSTOMER";
        auditDetails = `Permanently deleted client '${client.companyName}'`;
        break;
      }

      case "quotation": {
        const quote = await prisma.quotation.findUnique({
          where: { id },
          include: { customer: { select: { companyName: true } } },
        });
        if (!quote) {
          return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
        }

        await prisma.$transaction([
          prisma.invoice.updateMany({
            where: { quotationId: id },
            data: { quotationId: null },
          }),
          prisma.quotation.delete({ where: { id } }),
        ]);
        auditEntityType = "QUOTATION";
        auditDetails = `Permanently deleted quotation ${quote.quoteNumber} (${quote.customer.companyName})`;
        break;
      }

      case "invoice": {
        const inv = await prisma.invoice.findUnique({
          where: { id },
          include: { customer: { select: { companyName: true } } },
        });
        if (!inv) {
          return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
        }

        await prisma.$transaction([
          prisma.serialNumber.updateMany({
            where: { invoiceId: id },
            data: { invoiceId: null, status: "IN_STOCK" },
          }),
          prisma.invoice.delete({ where: { id } }),
        ]);
        auditEntityType = "INVOICE";
        auditDetails = `Permanently deleted invoice ${inv.invoiceNumber} (${inv.customer.companyName}, INR ${inv.totalAmount})`;
        break;
      }

      case "lead": {
        const lead = await prisma.lead.findUnique({ where: { id } });
        if (!lead) {
          return NextResponse.json({ error: "Lead not found." }, { status: 404 });
        }
        await prisma.lead.delete({ where: { id } });
        auditEntityType = "LEAD";
        auditDetails = `Permanently deleted lead '${lead.name}' (${lead.email})`;
        break;
      }

      case "challan": {
        const ch = await prisma.deliveryChallan.findUnique({
          where: { id },
          include: { customer: { select: { companyName: true } } },
        });
        if (!ch) {
          return NextResponse.json({ error: "Delivery Challan not found." }, { status: 404 });
        }

        await prisma.$transaction([
          prisma.serialNumber.updateMany({
            where: { challanId: id },
            data: { challanId: null, status: "IN_STOCK" },
          }),
          prisma.invoice.updateMany({
            where: { challanId: id },
            data: { challanId: null },
          }),
          prisma.deliveryChallan.delete({ where: { id } }),
        ]);
        auditEntityType = "CHALLAN";
        auditDetails = `Permanently deleted delivery challan ${ch.challanNumber} (${ch.customer.companyName})`;
        break;
      }

      case "product": {
        const prod = await prisma.product.findUnique({
          where: { id },
          include: { _count: { select: { serialNumbers: true } } },
        });
        if (!prod) {
          return NextResponse.json({ error: "Product not found." }, { status: 404 });
        }
        if (prod._count.serialNumbers > 0) {
          return NextResponse.json(
            {
              error: `Cannot delete '${prod.name}' while ${prod._count.serialNumbers} tracked serial number(s) exist. Delete those serials first.`,
            },
            { status: 400 }
          );
        }

        await prisma.$transaction([
          prisma.quotationItem.updateMany({ where: { productId: id }, data: { productId: null } }),
          prisma.invoiceItem.updateMany({ where: { productId: id }, data: { productId: null } }),
          prisma.challanItem.updateMany({ where: { productId: id }, data: { productId: null } }),
          prisma.purchaseItem.updateMany({ where: { productId: id }, data: { productId: null } }),
          prisma.product.delete({ where: { id } }),
        ]);
        auditEntityType = "PRODUCT";
        auditDetails = `Permanently deleted product '${prod.name}' (SKU: ${prod.sku})`;
        break;
      }

      case "serial": {
        const serial = await prisma.serialNumber.findUnique({ where: { id } });
        if (!serial) {
          return NextResponse.json({ error: "Serial number not found." }, { status: 404 });
        }
        await prisma.serialNumber.delete({ where: { id } });
        auditEntityType = "SERIAL";
        auditDetails = `Permanently deleted hardware serial '${serial.serialNumber}'`;
        break;
      }

      case "amc": {
        const amc = await prisma.aMCContract.findUnique({ where: { id } });
        if (!amc) {
          return NextResponse.json({ error: "AMC contract not found." }, { status: 404 });
        }
        await prisma.$transaction([
          prisma.serviceTicket.updateMany({ where: { amcId: id }, data: { amcId: null } }),
          prisma.aMCContract.delete({ where: { id } }),
        ]);
        auditEntityType = "AMC";
        auditDetails = `Permanently deleted AMC contract ${amc.contractNumber}`;
        break;
      }

      case "ticket": {
        const ticket = await prisma.serviceTicket.findUnique({ where: { id } });
        if (!ticket) {
          return NextResponse.json({ error: "Service ticket not found." }, { status: 404 });
        }
        await prisma.serviceTicket.delete({ where: { id } });
        auditEntityType = "SERVICE_TICKET";
        auditDetails = `Permanently deleted service ticket ${ticket.ticketNumber}`;
        break;
      }

      case "expense": {
        const exp = await prisma.expense.findUnique({ where: { id } });
        if (!exp) {
          return NextResponse.json({ error: "Expense not found." }, { status: 404 });
        }
        await prisma.expense.delete({ where: { id } });
        auditEntityType = "EXPENSE";
        auditDetails = `Permanently deleted expense '${exp.description}' (INR ${exp.amount})`;
        break;
      }

      case "purchase": {
        const pur = await prisma.purchase.findUnique({ where: { id } });
        if (!pur) {
          return NextResponse.json({ error: "Purchase bill not found." }, { status: 404 });
        }
        await prisma.purchase.delete({ where: { id } });
        auditEntityType = "PURCHASE";
        auditDetails = `Permanently deleted purchase bill #${pur.billNumber} (${pur.vendorName})`;
        break;
      }

      default:
        return NextResponse.json({ error: `Unsupported entity type: ${entity}` }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username: session.email,
        action: "DELETE",
        entityType: auditEntityType,
        entityId: id,
        details: auditDetails,
      },
    });

    revalidatePath("/admin", "layout");

    return NextResponse.json({ success: true, message: auditDetails });
  } catch (err: any) {
    console.error("Super admin delete error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete record." },
      { status: 500 }
    );
  }
}
