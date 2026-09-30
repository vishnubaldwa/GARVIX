import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

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

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
