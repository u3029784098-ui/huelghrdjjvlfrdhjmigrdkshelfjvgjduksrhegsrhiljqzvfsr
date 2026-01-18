import { NextResponse } from "next/server";
import { ensureSchema, getConnection } from "@/app/lib/db";
import { createToken, hashPassword, setAuthCookie } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      address,
    } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await ensureSchema();
    const pool = await getConnection();

    // Check if user exists
    const [existing] = await pool.query("SELECT user_id FROM User WHERE email = ?", [email]);
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashed = await hashPassword(password);

    const [result]: any = await pool.query(
      `INSERT INTO User (first_name, last_name, birth_date, email, address, role, password)
       VALUES (?, ?, ?, ?, ?, 'user', ?)`,
      [firstName, lastName, dateOfBirth || null, email, address || null, hashed]
    );

    const userId = result.insertId;
    const token = createToken({ user_id: userId, email });
    const response = NextResponse.json({
      user_id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'user',
    });

    setAuthCookie(response, token);
    return response;
  } catch (err) {
    console.error("Register error", err);
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
