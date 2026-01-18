import { NextResponse } from "next/server";
import { ensureSchema, getConnection } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import { RowDataPacket } from "mysql2/promise";

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await ensureSchema();
    const pool = await getConnection();

    // Get active project for this user
    const [projectRows] = await pool.query<RowDataPacket[]>(
      "SELECT project_name FROM Project WHERE user_id = ? AND is_active = 1 LIMIT 1",
      [user.user_id]
    );

    if (!projectRows || projectRows.length === 0) {
      return NextResponse.json({ message: "No active project found" }, { status: 404 });
    }

    const projectName = projectRows[0].project_name;

    // Get all documents for this user and project
    const [documents] = await pool.query<RowDataPacket[]>(
      `SELECT doc_id, document_name, created_at, updated_at 
       FROM Document 
       WHERE user_id = ? AND project_name = ?
       ORDER BY created_at DESC`,
      [user.user_id, projectName]
    );

    return NextResponse.json({
      documents: documents || [],
      projectName,
      count: documents?.length || 0
    });

  } catch (err) {
    console.error("Failed to fetch documents:", err);
    return NextResponse.json({ message: "Failed to fetch documents" }, { status: 500 });
  }
}
