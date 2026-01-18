import { NextResponse } from 'next/server';
import { ensureSchema, getConnection } from '@/app/lib/db';
import { getUserFromToken } from '@/app/lib/auth';
import { RowDataPacket } from 'mysql2/promise';

export async function GET() {
  try {
    await ensureSchema();
    const pool = await getConnection();

    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Get active project for this user
    const [projectRows] = await pool.query<RowDataPacket[]>(
      'SELECT project_name FROM Project WHERE user_id = ? AND is_active = 1 LIMIT 1',
      [user.user_id]
    );

    if (!projectRows || projectRows.length === 0) return NextResponse.json({ message: 'No active project found' }, { status: 404 });
    const projectName = (projectRows[0] as any).project_name;

    // Find latest Run associated with documents in this project that is not executed yet
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.id FROM Run r
       JOIN Document d ON d.id_run = r.id
       WHERE d.user_id = ? AND d.project_name = ? AND r.is_executed = FALSE
       GROUP BY r.id
       ORDER BY r.id DESC
       LIMIT 1`,
      [user.user_id, projectName]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'No pending run found' }, { status: 404 });
    }

    return NextResponse.json({ id: (rows[0] as any).id });
  } catch (err: any) {
    console.error('[API /api/runs/latest] Error:', err);
    return NextResponse.json({ message: 'Failed to fetch latest run', error: String(err) }, { status: 500 });
  }
}
