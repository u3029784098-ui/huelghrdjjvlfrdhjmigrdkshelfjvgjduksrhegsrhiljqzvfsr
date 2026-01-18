import { NextResponse } from "next/server";
import { getConnection, ensureSchema } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const me = await getUserFromToken();
    if (!me || me.role !== 'admin') {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const { id } = await context.params;
    const userId = parseInt(String(id), 10);
    const body = await request.json();
    const { is_blocked } = body as { is_blocked: boolean };

    if (typeof is_blocked !== 'boolean') {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    await ensureSchema();
    const pool = await getConnection();
    await pool.query("UPDATE User SET is_blocked = ? WHERE user_id = ?", [is_blocked ? 1 : 0, userId]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin block/unblock error", err);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const me = await getUserFromToken();
    if (!me || me.role !== 'admin') {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const { id } = await context.params;
    const userId = parseInt(String(id), 10);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    await ensureSchema();
    const pool = await getConnection();
    // Cascades via foreign keys will remove projects/documents/settings
    await pool.query("DELETE FROM User WHERE user_id = ?", [userId]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin delete user error", err);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}
