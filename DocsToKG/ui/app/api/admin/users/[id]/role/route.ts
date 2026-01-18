import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection, ensureSchema } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getUserFromToken();
    if (!me || me.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = await context.params;
    const user_id = parseInt(params.id, 10);
    if (!Number.isFinite(user_id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { role } = body;

    // Only allow setting to 'user' or 'member'
    if (role !== "user" && role !== "member") {
      return NextResponse.json(
        { error: "Role must be 'user' or 'member'" },
        { status: 400 }
      );
    }

    // Prevent changing admin's own role
    if (user_id === me.user_id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    await ensureSchema();
    const pool = await getConnection();

    // Check if target user exists and is not an admin
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT role FROM User WHERE user_id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (users[0].role === "admin") {
      return NextResponse.json(
        { error: "Cannot change admin role" },
        { status: 403 }
      );
    }

    // Update the role
    await pool.query("UPDATE User SET role = ? WHERE user_id = ?", [
      role,
      user_id,
    ]);

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
