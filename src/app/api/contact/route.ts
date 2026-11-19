import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLeadEmail } from "@/lib/mailer";
import { getCompanySettings } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      company,
      email,
      phone,
      industry,
      requirementType,
      requirementDetails,
      solution,
      message,
    } = body;

    const details = requirementDetails || message;

    if (!name || !email || !phone || !details) {
      return NextResponse.json(
        { error: "Please fill in all required fields (Name, Email, Phone, Requirements)." },
        { status: 400 }
      );
    }

    const fullMessage = [
      industry ? `[Industry: ${industry}]` : "",
      requirementType ? `[Requirement: ${requirementType}]` : "",
      details,
    ]
      .filter(Boolean)
      .join("\n\n");

    const finalSolution = requirementType || solution || "CUSTOM_SOFTWARE";

    // Save lead to database
    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        company: company?.trim() || null,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        solution: finalSolution,
        message: fullMessage.trim(),
        status: "NEW",
      },
    });

    // Send Email to the Official Email configured in Company Settings
    const companySettings = await getCompanySettings();
    const emailResult = await sendLeadEmail({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      industry,
      solution: lead.solution,
      message: details.trim(),
      toEmail: companySettings.email,
    });

    return NextResponse.json({
      success: true,
      message: `Thank you! Your enquiry has been sent to ${companySettings.email}. Our team will connect with you shortly.`,
      leadId: lead.id,
      emailSent: emailResult.sent,
      recipientEmail: companySettings.email,
    });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "An error occurred while submitting your enquiry. Please try again." },
      { status: 500 }
    );
  }
}
