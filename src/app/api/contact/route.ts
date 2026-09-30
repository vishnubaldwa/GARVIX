import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramLeadAlert } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, phone, solution, message } = body;

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields (Name, Email, Phone, Message)." },
        { status: 400 }
      );
    }

    // Save lead to database
    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        company: company?.trim() || null,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        solution: solution || "RFID_JEWELLERY",
        message: message.trim(),
        status: "NEW",
      },
    });

    // Send Telegram alert
    const notified = await sendTelegramLeadAlert({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      solution: lead.solution,
      message: lead.message,
    });

    if (notified) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { telegramNotified: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Enquiry received successfully! Our solutions engineer will contact you shortly.",
      leadId: lead.id,
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
