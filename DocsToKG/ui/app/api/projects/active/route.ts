import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";

// GET /api/projects/active - Get the currently active project for user
export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT project_name, user_id FROM Project WHERE user_id = ? AND is_active = TRUE LIMIT 1`,
      [user.user_id]
    );

    const activeProject = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    return NextResponse.json({ activeProject });
  } catch (err) {
    console.error("Error fetching active project:", err);
    return NextResponse.json({ message: "Failed to fetch active project" }, { status: 500 });
  }
}

// POST /api/projects/active - Set active project for user
export async function POST(request: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectName } = body;

    if (!projectName) {
      return NextResponse.json({ message: "Project name is required" }, { status: 400 });
    }

    const pool = await getConnection();

    // First, deactivate all projects for this user
    await pool.query(
      "UPDATE Project SET is_active = FALSE WHERE user_id = ?",
      [user.user_id]
    );

    // Then, activate the specified project
    const [result]: any = await pool.query(
      "UPDATE Project SET is_active = TRUE WHERE user_id = ? AND project_name = ?",
      [user.user_id, projectName]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Active project set successfully" });
  } catch (err) {
    console.error("Error setting active project:", err);
    return NextResponse.json({ message: "Failed to set active project" }, { status: 500 });
  }
}
