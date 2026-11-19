import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "garvix-super-secure-enterprise-jwt-key-2026";
const COOKIE_NAME = "garvix_admin_token";

export interface AuthSession {
  userId: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

export function cleanGarvixEmail(input: string): string {
  const cleanInput = input.trim().toLowerCase();
  if (cleanInput.includes("@")) {
    return cleanInput;
  }
  return `${cleanInput}@garvix.in`;
}

export function signToken(payload: AuthSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch {
    return null;
  }
}

export function signShareAccessToken(shareToken: string): string {
  return jwt.sign({ shareToken, type: "VAULT_SHARE" }, JWT_SECRET, {
    expiresIn: "12h",
  });
}

export function verifyShareAccessToken(
  signedCookie: string,
  expectedShareToken: string
): boolean {
  try {
    const decoded = jwt.verify(signedCookie, JWT_SECRET) as {
      shareToken?: string;
      type?: string;
    };
    return (
      decoded?.type === "VAULT_SHARE" &&
      decoded?.shareToken === expectedShareToken
    );
  } catch {
    return false;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  let token: string | undefined;

  // 1. Check Authorization: Bearer <jwt> header (Flutter Mobile App / API clients)
  try {
    const headerStore = await headers();
    const authHeader = headerStore.get("authorization") || headerStore.get("Authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    }
  } catch {
    // Ignore when called outside request header context
  }

  // 2. Fall back to HttpOnly cookie (Web Admin Panel)
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (!dbUser || !dbUser.isActive) return null;
    if (dbUser.expiresAt && new Date() > dbUser.expiresAt) return null;

    return {
      userId: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    };
  } catch {
    return decoded;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
