import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getConnection } from '@/app/lib/db';
import { getUserFromToken } from '@/app/lib/auth';
import { RowDataPacket } from 'mysql2/promise';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    await ensureSchema();
    const pool = await getConnection();

    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await params;
    const projectName = decodeURIComponent(name);

    // Get the latest run for this project that is being executed
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.id, r.extract_metadata, r.extract_text, r.extract_figures, 
              r.extract_tables, r.extract_formulas, r.is_executed,
              r.extract_text_state, r.extract_figures_state, 
              r.extract_formulas_state, r.extract_metadata_state, 
              r.extract_tables_state
       FROM Run r
       JOIN Document d ON d.id_run = r.id
       WHERE d.user_id = ? AND d.project_name = ?
       GROUP BY r.id
       ORDER BY r.id DESC
       LIMIT 1`,
      [user.user_id, projectName]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ progress: null });
    }

    const run = rows[0] as any;
    
    return NextResponse.json({
      progress: {
        runId: run.id,
        isExecuted: run.is_executed,
        tasks: {
          metadata: {
            enabled: run.extract_metadata,
            progress: run.extract_metadata_state || 0
          },
          text: {
            enabled: run.extract_text,
            progress: run.extract_text_state || 0
          },
          figures: {
            enabled: run.extract_figures,
            progress: run.extract_figures_state || 0
          },
          tables: {
            enabled: run.extract_tables,
            progress: run.extract_tables_state || 0
          },
          formulas: {
            enabled: run.extract_formulas,
            progress: run.extract_formulas_state || 0
          }
        }
      }
    });
  } catch (error: any) {
    console.error('[API /api/projects/[name]/run-progress GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch run progress', details: error.message },
      { status: 500 }
    );
  }
}
