import { NextResponse } from "next/server";
import { ensureSchema, getConnection } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import { RowDataPacket } from "mysql2/promise";

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { uri, username, password, database, isAuraDB } = await request.json();

    if (!uri || !username || !password || !database) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
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

    // Check if settings already exist
    const [existingRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM Setting WHERE user_id = ? AND project_name = ?",
      [user.user_id, projectName]
    );

    if (existingRows && existingRows.length > 0) {
      // Update Neo4j connection settings
      await pool.query(
        `UPDATE Setting SET 
          neo_4j_uri = ?,
          neo4j_username = ?,
          neo4j_password = ?,
          neo4j_database = ?,
          neo4j_auradb = ?
        WHERE user_id = ? AND project_name = ?`,
        [uri, username, password, database, isAuraDB || false, user.user_id, projectName]
      );
    } else {
      // Insert new settings with Neo4j connection
      await pool.query(
        `INSERT INTO Setting (
          user_id, project_name, neo_4j_uri, neo4j_username, 
          neo4j_password, neo4j_database, neo4j_auradb
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.user_id, projectName, uri, username, password, database, isAuraDB || false]
      );
    }

    // Fetch and return updated settings
    const [updatedRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM Setting WHERE user_id = ? AND project_name = ?",
      [user.user_id, projectName]
    );

    return NextResponse.json({
      message: "Neo4j connection settings saved successfully",
      settings: updatedRows[0],
      projectName
    });
  } catch (err) {
    console.error("Failed to save Neo4j connection:", err);
    return NextResponse.json({ message: "Failed to save Neo4j connection" }, { status: 500 });
  }
}
