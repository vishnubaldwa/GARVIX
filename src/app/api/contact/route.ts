import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramLeadAlert } from "@/lib/telegram";
import { sendLeadEmail } from "@/lib/mailer";

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

    // Send Email to info@garvix.in & Telegram alert in parallel
    const [emailResult, notified] = await Promise.all([
      sendLeadEmail({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        industry,
        solution: lead.solution,
        message: details.trim(),
      }),
      sendTelegramLeadAlert({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        solution: lead.solution,
        message: lead.message,
      }),
    ]);

    if (notified) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { telegramNotified: true },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "Thank you! Your enquiry has been sent to info@garvix.in. Our team will connect with you shortly.",
      leadId: lead.id,
      emailSent: emailResult.sent,
      telegramNotified: notified,
    });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "An error occurred while submitting your enquiry. Please try again." },
      { status: 500 }
    );
  }
}
