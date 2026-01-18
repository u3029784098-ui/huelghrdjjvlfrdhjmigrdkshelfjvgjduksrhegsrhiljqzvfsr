import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";

export async function DELETE() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pool = await getConnection();
    
    // Delete user (cascade will handle related records)
    await pool.query("DELETE FROM User WHERE user_id = ?", [user.user_id]);

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    return NextResponse.json({ message: "Failed to delete account" }, { status: 500 });
  }
}
