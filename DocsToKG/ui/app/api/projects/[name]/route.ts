import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

// GET /api/projects/[name] - Get a specific project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;
    const projectName = decodeURIComponent(name);
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
        created_at, 
        updated_at
      FROM Project 
      WHERE user_id = ? AND project_name = ?`,
      [user.user_id, projectName]
    );

    const project = Array.isArray(rows) ? rows[0] : null;
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (err) {
    console.error("Error fetching project:", err);
    return NextResponse.json({ message: "Failed to fetch project" }, { status: 500 });
  }
}

// PATCH /api/projects/[name] - Update a project
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;
    const projectName = decodeURIComponent(name);
    const body = await request.json();
    const { name: newName, description, is_favorite, status, tags, percentage } = body;

    const pool = await getConnection();

    // Verify project exists and belongs to user
    const [existingRows] = await pool.query<RowDataPacket[]>(
      "SELECT project_name, user_id, description, is_favorite, is_active, status, tags, percentage, created_at FROM Project WHERE user_id = ? AND project_name = ?",
      [user.user_id, projectName]
    );

    if (!Array.isArray(existingRows) || existingRows.length === 0) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const existing = existingRows[0];
    const wantsRename = newName && newName !== projectName;

    if (wantsRename) {
      // Ensure target name is free
      const [conflict] = await pool.query<RowDataPacket[]>(
        "SELECT project_name FROM Project WHERE user_id = ? AND project_name = ?",
        [user.user_id, newName]
      );
      if (Array.isArray(conflict) && conflict.length > 0) {
        return NextResponse.json({ message: "A project with this name already exists" }, { status: 409 });
      }
    }

    // If no rename, do a standard update
    if (!wantsRename) {
      const updates: string[] = [];
      const values: any[] = [];

      if (description !== undefined) {
        updates.push("description = ?");
        values.push(description);
      }
      if (is_favorite !== undefined) {
        updates.push("is_favorite = ?");
        values.push(is_favorite);
      }
      if (status !== undefined) {
        updates.push("status = ?");
        values.push(status);
      }
      if (tags !== undefined) {
        updates.push("tags = ?");
        values.push(tags);
      }
      if (percentage !== undefined) {
        updates.push("percentage = ?");
        values.push(percentage);
      }

      if (updates.length === 0) {
        return NextResponse.json({ message: "No fields to update" }, { status: 400 });
      }

      values.push(user.user_id, projectName);

      await pool.query(
        `UPDATE Project SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ? AND project_name = ?`,
        values
      );

      const [updated] = await pool.query(
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
        [user.user_id, projectName]
      );
      const project = Array.isArray(updated) ? updated[0] : null;
      return NextResponse.json({ project });
    }

    // Rename flow with transaction: insert new row, move children, delete old
    let conn: PoolConnection | null = null;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      const newDescription = description !== undefined ? description : existing.description;
      const newFavorite = is_favorite !== undefined ? is_favorite : existing.is_favorite;
      const newStatus = status !== undefined ? status : existing.status;
      const newTags = tags !== undefined ? tags : existing.tags;
      const newPercentage = percentage !== undefined ? percentage : existing.percentage;

      await conn.query(
        `INSERT INTO Project (project_name, user_id, description, is_favorite, is_active, status, tags, percentage, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [
          newName,
          user.user_id,
          newDescription,
          newFavorite,
          existing.is_active,
          newStatus,
          newTags,
          newPercentage,
          existing.created_at,
        ]
      );

      await conn.query(
        "UPDATE Document SET project_name = ? WHERE user_id = ? AND project_name = ?",
        [newName, user.user_id, projectName]
      );
      await conn.query(
        "UPDATE Setting SET project_name = ? WHERE user_id = ? AND project_name = ?",
        [newName, user.user_id, projectName]
      );

      await conn.query(
        "DELETE FROM Project WHERE user_id = ? AND project_name = ?",
        [user.user_id, projectName]
      );

      await conn.commit();

      const [updated] = await pool.query(
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
        [user.user_id, newName]
      );
      const project = Array.isArray(updated) ? updated[0] : null;
      return NextResponse.json({ project });
    } catch (err) {
      if (conn) await conn.rollback();
      throw err;
    } finally {
      if (conn) conn.release();
    }
  } catch (err) {
    console.error("Error updating project:", err);
    return NextResponse.json({ message: "Failed to update project" }, { status: 500 });
  }
}

// DELETE /api/projects/[name] - Delete a project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;
    const projectName = decodeURIComponent(name);
    const pool = await getConnection();

    const [result]: any = await pool.query(
      "DELETE FROM Project WHERE user_id = ? AND project_name = ?",
      [user.user_id, projectName]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    return NextResponse.json({ message: "Failed to delete project" }, { status: 500 });
  }
}
