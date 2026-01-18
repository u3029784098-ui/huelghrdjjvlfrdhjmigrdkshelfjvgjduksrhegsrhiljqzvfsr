import { NextResponse } from "next/server";
import { getConnection, ensureSchema } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const me = await getUserFromToken();
    if (!me || me.role !== 'admin') {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await ensureSchema();
    const pool = await getConnection();

    type UserRow = RowDataPacket & {
      user_id: number;
      first_name: string | null;
      last_name: string | null;
      birth_date: string | null;
      email: string;
      address: string | null;
      role: 'admin' | 'member' | 'user';
      is_connected: number;
      is_blocked: number;
      created_at: string;
      updated_at: string;
    };

    const [usersRows] = await pool.query<UserRow[]>(
      `SELECT user_id, first_name, last_name, birth_date, email, address, role, is_connected, is_blocked, created_at, updated_at FROM User ORDER BY created_at DESC`
    );

    type ProjectRow = RowDataPacket & {
      user_id: number;
      project_name: string;
      description: string | null;
      is_favorite: number;
      is_active: number;
      status: string;
      tags: string | null;
      percentage: number;
      created_at: string;
      updated_at: string;
    };

    const [projectsRows] = await pool.query<ProjectRow[]>(
      `SELECT user_id, project_name, description, is_favorite, is_active, status, tags, percentage, created_at, updated_at FROM Project`
    );

    type HistoryRow = RowDataPacket & {
      user_id: number;
      event: 'login' | 'logout';
      event_time: string;
    };

    const [historyRows] = await pool.query<HistoryRow[]>(
      `SELECT user_id, event, event_time FROM UsersHistory ORDER BY event_time DESC`
    );

    const projectsByUser = new Map<number, ProjectRow[]>();
    for (const p of projectsRows) {
      const list = projectsByUser.get(p.user_id) || [];
      list.push(p);
      projectsByUser.set(p.user_id, list);
    }

    const historyByUser = new Map<number, HistoryRow[]>();
    for (const h of historyRows) {
      const list = historyByUser.get(h.user_id) || [];
      list.push(h);
      historyByUser.set(h.user_id, list);
    }

    const result = usersRows.map(u => ({
      user: u,
      projects: projectsByUser.get(u.user_id) || [],
      history: historyByUser.get(u.user_id) || [],
    }));

    return NextResponse.json({ users: result });
  } catch (err) {
    console.error("Admin users GET error", err);
    return NextResponse.json({ message: "Failed to load users" }, { status: 500 });
  }
}
