import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { leadId, status } = await request.json();
    if (!leadId || !status) {
      return NextResponse.json({ error: "Missing parameters." }, { status: 400 });
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
