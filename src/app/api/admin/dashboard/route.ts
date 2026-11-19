import { NextResponse } from "next/server";
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

    const fullAdmin = isFullAdminRole(session.role);
    if (!fullAdmin && session.role.toUpperCase() === "DOCUMENT_VIEWER") {
      return NextResponse.json(
        { error: "External document viewers only have Vault access." },
        { status: 403 }
      );
    }

    const [
      canViewFinances,
      canManageInvoices,
      canViewLeads,
      canCreateClient,
      canViewDocs,
    ] = await Promise.all([
      hasPermission(session.role, "CAN_VIEW_FINANCES"),
      hasPermission(session.role, "CAN_MANAGE_INVOICES"),
      hasPermission(session.role, "CAN_VIEW_LEADS"),
      hasPermission(session.role, "CAN_CREATE_CLIENT"),
      hasPermission(session.role, "CAN_VIEW_DOCUMENTS"),
    ]);

    const [
      invoices,
      purchases,
      expenses,
      leads,
      lowStockProducts,
      amcCount,
      clientCount,
      vaultDocCount,
    ] = await Promise.all([
      canViewFinances || canManageInvoices
        ? prisma.invoice.findMany({
            include: { customer: { select: { companyName: true, phone: true } } },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
      canViewFinances ? prisma.purchase.findMany() : Promise.resolve([]),
      canViewFinances ? prisma.expense.findMany() : Promise.resolve([]),
      canViewLeads
        ? prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8 })
        : Promise.resolve([]),
      prisma.product.findMany({
        where: {
          category: { startsWith: "HARDWARE" },
          currentStock: { lte: 5 },
        },
        select: { id: true, name: true, currentStock: true, unit: true },
      }),
      prisma.aMCContract.count({ where: { status: "ACTIVE" } }),
      canCreateClient ? prisma.customer.count() : Promise.resolve(0),
      canViewDocs ? prisma.vaultDocument.count() : Promise.resolve(0),
    ]);

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalReceivables = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalInvoiced - (totalPurchases + totalExpenses);
    const totalItc = purchases
      .filter((p) => p.itcEligible)
      .reduce((sum, p) => sum + p.cgstAmount + p.sgstAmount + p.igstAmount, 0);

    return NextResponse.json({
      kpis: {
        totalInvoiced,
        totalCollected,
        totalReceivables,
        totalItc,
        netProfit,
        invoiceCount: invoices.length,
        clientCount,
        leadCount: leads.length,
        amcCount,
        lowStockCount: lowStockProducts.length,
        vaultDocCount,
      },
      lowStockProducts,
      recentInvoices: invoices.slice(0, 6).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        token: inv.token,
        customerName: inv.customer.companyName,
        totalAmount: inv.totalAmount,
        balanceDue: inv.balanceDue,
        paymentStatus: inv.paymentStatus,
        createdAt: inv.createdAt,
      })),
      recentLeads: leads.slice(0, 6),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load dashboard" }, { status: 500 });
  }
}
