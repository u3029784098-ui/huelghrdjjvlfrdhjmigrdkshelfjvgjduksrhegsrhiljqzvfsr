import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";

// GET /api/profile - Get user profile
export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pool = await getConnection();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        user_id, first_name, last_name, birth_date, email, address,
        avatar_path, bio, website, phone, gender, language, timezone, theme,
        two_factor_enabled, created_at, updated_at
      FROM User WHERE user_id = ?`,
      [user.user_id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: rows[0] });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return NextResponse.json({ message: "Failed to fetch profile" }, { status: 500 });
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      first_name, last_name, birth_date, address,
      avatar_path, bio, website, phone, gender, language, timezone, theme
    } = body;

    const pool = await getConnection();

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (first_name !== undefined) {
      updates.push("first_name = ?");
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push("last_name = ?");
      values.push(last_name);
    }
    if (birth_date !== undefined) {
      updates.push("birth_date = ?");
      values.push(birth_date);
    }
    if (address !== undefined) {
      updates.push("address = ?");
      values.push(address);
    }
    if (avatar_path !== undefined) {
      updates.push("avatar_path = ?");
      values.push(avatar_path);
    }
    if (bio !== undefined) {
      updates.push("bio = ?");
      values.push(bio);
    }
    if (website !== undefined) {
      updates.push("website = ?");
      values.push(website);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (gender !== undefined) {
      updates.push("gender = ?");
      values.push(gender);
    }
    if (language !== undefined) {
      updates.push("language = ?");
      values.push(language);
    }
    if (timezone !== undefined) {
      updates.push("timezone = ?");
      values.push(timezone);
    }
    if (theme !== undefined) {
      updates.push("theme = ?");
      values.push(theme);
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 });
    }

    values.push(user.user_id);

    await pool.query(
      `UPDATE User SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      values
    );

    // Fetch updated profile
    const [updated] = await pool.query<RowDataPacket[]>(
      `SELECT 
        user_id, first_name, last_name, birth_date, email, address,
        avatar_path, bio, website, phone, gender, language, timezone, theme,
        two_factor_enabled, created_at, updated_at
      FROM User WHERE user_id = ?`,
      [user.user_id]
    );

    return NextResponse.json({ profile: updated[0] });
  } catch (err) {
    console.error("Error updating profile:", err);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
