import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getConnection } from "./db";

const JWT_SECRET = process.env.AUTH_SECRET;
const TOKEN_COOKIE = "docstokg_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

if (!JWT_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required for JWT.");
}

export interface AuthTokenPayload {
  user_id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'member' | 'user';
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: TOKEN_MAX_AGE });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as AuthTokenPayload;
  } catch (err) {
    return null;
  }
}

type UserRow = RowDataPacket & {
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'member' | 'user';
};

export async function getUserFromToken(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  // Fetch full user data including names
  const pool = await getConnection();
  const [rows] = await pool.query<UserRow[]>(
    "SELECT user_id, email, first_name, last_name, role FROM User WHERE user_id = ?",
    [payload.user_id]
  );
  const user = rows[0];
  if (!user) return null;
  return {
    user_id: user.user_id,
    email: user.email,
    first_name: user.first_name || undefined,
    last_name: user.last_name || undefined,
    role: user.role,
  };
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
