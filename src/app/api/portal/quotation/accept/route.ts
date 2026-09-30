import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { token, signature } = await request.json();

    if (!token || !signature) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { token },
      include: { customer: true },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
    }

    const updated = await prisma.quotation.update({
      where: { token },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        acceptedSignature: signature.trim(),
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "QUOTATION",
        entityId: quotation.id,
        details: `Quotation ${quotation.quoteNumber} digitally accepted by ${signature.trim()} (${quotation.customer.companyName})`,
      },
    });

    return NextResponse.json({ success: true, quotation: updated });
  } catch (err: any) {
    console.error("Accept quotation error:", err);
    return NextResponse.json({ error: "Failed to record approval." }, { status: 500 });
  }
}
