import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const {
      companyName,
      contactPerson,
      phone,
      email,
      gstin,
      state,
      stateCode,
      billingAddress,
      isB2B,
    } = await request.json();

    if (!companyName?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Company Name and Phone Number are required." },
        { status: 400 }
      );
    }

    const session = await getSession();

    // Auto-detect state code from GSTIN if provided (first 2 digits)
    let finalStateCode = stateCode || "06";
    const cleanedGstin = gstin?.trim().toUpperCase() || null;
    if (cleanedGstin && cleanedGstin.length >= 2) {
      const codeFromGst = cleanedGstin.substring(0, 2);
      if (/^\d{2}$/.test(codeFromGst)) {
        finalStateCode = codeFromGst;
      }
    }

    const customer = await prisma.customer.create({
      data: {
        companyName: companyName.trim(),
        contactPerson: contactPerson?.trim() || null,
        phone: phone.trim(),
        email: email?.trim() || null,
        gstin: cleanedGstin,
        state: state?.trim() || (finalStateCode === "06" ? "Haryana" : "Other State"),
        stateCode: finalStateCode,
        billingAddress: billingAddress?.trim() || null,
        isB2B: isB2B === true || !!cleanedGstin,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        username: session?.email || "admin@garvix.in",
        action: "CREATE",
        entityType: "CUSTOMER",
        entityId: customer.id,
        details: `Created new client: ${customer.companyName} (${customer.state} - ${customer.stateCode})`,
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (err: any) {
    console.error("Create client error:", err);
    return NextResponse.json({ error: err.message || "Failed to create client." }, { status: 500 });
  }
}
