import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pool = await getConnection();
    
    // Get login history with devices
    const [history] = await pool.query<RowDataPacket[]>(
      `SELECT event, device, event_time 
       FROM UsersHistory 
       WHERE user_id = ? 
       ORDER BY event_time DESC 
       LIMIT 50`,
      [user.user_id]
    );

    return NextResponse.json({ history });
  } catch (err) {
    console.error("Error fetching activity:", err);
    return NextResponse.json({ message: "Failed to fetch activity" }, { status: 500 });
  }
}
