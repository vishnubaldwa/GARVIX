import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, cleanGarvixEmail, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required." }, { status: 400 });
    }

    const email = cleanGarvixEmail(username);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: username.trim().toLowerCase() }],
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const sessionPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signToken(sessionPayload);

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        username: user.email,
        action: "LOGIN",
        entityType: "USER",
        entityId: user.id,
        details: `Successful login to Admin ERP by ${user.email} (${user.role})`,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
