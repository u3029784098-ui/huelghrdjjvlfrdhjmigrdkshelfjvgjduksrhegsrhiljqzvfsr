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

    // Get all runs for this project with their documents
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        r.id,
        r.extract_metadata,
        r.extract_text,
        r.extract_figures,
        r.extract_tables,
        r.extract_formulas,
        r.extract_text_state,
        r.extract_figures_state,
        r.extract_formulas_state,
        r.extract_metadata_state,
        r.extract_tables_state,
        r.is_executed,
        r.created_at,
        COUNT(DISTINCT d.doc_id) as document_count
       FROM Run r
       LEFT JOIN Document d ON d.id_run = r.id
       WHERE d.user_id = ? AND d.project_name = ?
       GROUP BY r.id
       ORDER BY r.id DESC`,
      [user.user_id, projectName]
    );

    const runs = (rows || []).map((run: any) => ({
      id: run.id,
      extractedData: [
        run.extract_metadata && 'metadata',
        run.extract_text && 'text',
        run.extract_figures && 'figures',
        run.extract_tables && 'tables',
        run.extract_formulas && 'formulas'
      ].filter(Boolean),
      completion: Math.max(
        run.extract_metadata_state || 0,
        run.extract_text_state || 0,
        run.extract_figures_state || 0,
        run.extract_tables_state || 0,
        run.extract_formulas_state || 0
      ),
      documentCount: run.document_count,
      isExecuted: run.is_executed,
      createdAt: run.created_at,
      taskStates: {
        metadata: run.extract_metadata_state || 0,
        text: run.extract_text_state || 0,
        figures: run.extract_figures_state || 0,
        tables: run.extract_tables_state || 0,
        formulas: run.extract_formulas_state || 0
      }
    }));

    return NextResponse.json({ runs });
  } catch (error: any) {
    console.error('[API /api/projects/[name]/runs] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch runs', details: error.message },
      { status: 500 }
    );
  }
}
