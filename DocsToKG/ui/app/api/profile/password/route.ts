import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import bcrypt from "bcryptjs";
import { getConnection } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current and new password required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "New password must be at least 8 characters" }, { status: 400 });
    }

    const pool = await getConnection();
    
    // Verify current password
    const [rows]: any = await pool.query(
      "SELECT password FROM User WHERE user_id = ?",
      [user.user_id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    // Hash and update new password
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE User SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
      [hash, user.user_id]
    );

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    return NextResponse.json({ message: "Failed to change password" }, { status: 500 });
  }
}
