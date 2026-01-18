import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";
import type { RowDataPacket } from "mysql2";

// GET /api/projects - List all projects for the authenticated user
export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT 
        project_name, 
        user_id, 
        description, 
        is_favorite, 
        status, 
        tags, 
        percentage, 
        is_active,
        created_at, 
        updated_at
      FROM Project 
      WHERE user_id = ? 
      ORDER BY created_at DESC`,
      [user.user_id]
    );

    const [activeCountRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS activeCount FROM Project WHERE user_id = ? AND is_active = 1",
      [user.user_id]
    );
    const activeCount = Array.isArray(activeCountRows) && activeCountRows[0]?.activeCount !== undefined
      ? Number(activeCountRows[0].activeCount)
      : 0;

    const projects = Array.isArray(rows) ? rows : [];
    return NextResponse.json({ projects, activeCount });
  } catch (err) {
    console.error("Error fetching projects:", err);
    return NextResponse.json({ message: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, tags } = body;

    if (!name) {
      return NextResponse.json({ message: "Project name is required" }, { status: 400 });
    }

    const pool = await getConnection();

    // Check if project with same name already exists for this user
    const [existing] = await pool.query(
      "SELECT project_name FROM Project WHERE user_id = ? AND project_name = ?",
      [user.user_id, name]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ message: "Project with this name already exists" }, { status: 409 });
    }

    // Insert new project
    await pool.query(
      `INSERT INTO Project (project_name, user_id, description, is_favorite, is_active, status, tags, percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, user.user_id, description || null, false, false, "processing", tags || null, 0]
    );

    // Fetch the created project
    const [newProject] = await pool.query(
      `SELECT 
        project_name, 
        user_id, 
        description, 
        is_favorite, 
        status, 
        tags, 
        percentage, 
        is_active,
        created_at, 
        updated_at
      FROM Project 
      WHERE user_id = ? AND project_name = ?`,
      [user.user_id, name]
    );

    const project = Array.isArray(newProject) ? newProject[0] : null;
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("Error creating project:", err);
    return NextResponse.json({ message: "Failed to create project" }, { status: 500 });
  }
}
