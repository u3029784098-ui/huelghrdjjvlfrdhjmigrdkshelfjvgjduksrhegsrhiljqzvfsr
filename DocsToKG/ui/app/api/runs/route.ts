import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getConnection } from '@/app/lib/db';
import { getUserFromToken } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const pool = await getConnection();

    // Authenticate user
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a new Run record with default values
    const [result] = await pool.query<any>(
      `INSERT INTO Run (
        extract_metadata,
        extract_text,
        extract_figures,
        extract_tables,
        extract_formulas,
        conf_fig_score_threshold,
        conf_fig_classif_threshold,
        conf_fig_labels,
        conf_fig_accepted_labels,
        graph_gen_conf_separator,
        graph_gen_conf_chunk_size,
        graph_gen_conf_chunk_overlap,
        graph_gen_conf_allowed_nodes,
        graph_gen_conf_allowed_relationships,
        graph_gen_conf_retry_condition,
        graph_gen_conf_additional_instruction,
        is_executed
      ) VALUES (
        FALSE, FALSE, FALSE, FALSE, FALSE,
        NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, NULL, NULL,
        FALSE
      )`
    );

    const runId = result.insertId;
    console.log('[API /api/runs POST] Created new Run with ID:', runId);

    return NextResponse.json({ id: runId }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/runs POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create run', details: error.message },
      { status: 500 }
    );
  }
}
