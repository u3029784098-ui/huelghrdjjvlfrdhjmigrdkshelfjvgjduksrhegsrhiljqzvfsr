import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getConnection } from '@/app/lib/db';
import { getUserFromToken } from '@/app/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const pool = await getConnection();

    // Authenticate user
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const runId = parseInt(id, 10);

    if (isNaN(runId)) {
      return NextResponse.json({ error: 'Invalid run ID' }, { status: 400 });
    }

    const body = await req.json();

    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    // Boolean extraction flags
    if (typeof body.extract_metadata === 'boolean') {
      updates.push('extract_metadata = ?');
      values.push(body.extract_metadata);
    }
    if (typeof body.extract_text === 'boolean') {
      updates.push('extract_text = ?');
      values.push(body.extract_text);
    }
    if (typeof body.extract_figures === 'boolean') {
      updates.push('extract_figures = ?');
      values.push(body.extract_figures);
    }
    if (typeof body.extract_tables === 'boolean') {
      updates.push('extract_tables = ?');
      values.push(body.extract_tables);
    }
    if (typeof body.extract_formulas === 'boolean') {
      updates.push('extract_formulas = ?');
      values.push(body.extract_formulas);
    }

    // Float configuration
    if (typeof body.conf_fig_score_threshold === 'number') {
      updates.push('conf_fig_score_threshold = ?');
      values.push(body.conf_fig_score_threshold);
    }
    if (typeof body.conf_fig_classif_threshold === 'number') {
      updates.push('conf_fig_classif_threshold = ?');
      values.push(body.conf_fig_classif_threshold);
    }

    // String/Array fields (stored as comma-separated strings)
    if (typeof body.conf_fig_labels === 'string' || Array.isArray(body.conf_fig_labels)) {
      updates.push('conf_fig_labels = ?');
      values.push(Array.isArray(body.conf_fig_labels) ? body.conf_fig_labels.join(',') : body.conf_fig_labels);
    }
    if (typeof body.conf_fig_accepted_labels === 'string' || Array.isArray(body.conf_fig_accepted_labels)) {
      updates.push('conf_fig_accepted_labels = ?');
      values.push(Array.isArray(body.conf_fig_accepted_labels) ? body.conf_fig_accepted_labels.join(',') : body.conf_fig_accepted_labels);
    }

    // Graph generation configuration
    if (typeof body.graph_gen_conf_separator === 'string') {
      updates.push('graph_gen_conf_separator = ?');
      values.push(body.graph_gen_conf_separator);
    }
    if (typeof body.graph_gen_conf_chunk_size === 'number') {
      updates.push('graph_gen_conf_chunk_size = ?');
      values.push(body.graph_gen_conf_chunk_size);
    }
    if (typeof body.graph_gen_conf_chunk_overlap === 'number') {
      updates.push('graph_gen_conf_chunk_overlap = ?');
      values.push(body.graph_gen_conf_chunk_overlap);
    }
    if (typeof body.graph_gen_conf_allowed_nodes === 'string' || Array.isArray(body.graph_gen_conf_allowed_nodes)) {
      updates.push('graph_gen_conf_allowed_nodes = ?');
      values.push(Array.isArray(body.graph_gen_conf_allowed_nodes) ? body.graph_gen_conf_allowed_nodes.join(',') : body.graph_gen_conf_allowed_nodes);
    }
    if (typeof body.graph_gen_conf_allowed_relationships === 'string' || Array.isArray(body.graph_gen_conf_allowed_relationships)) {
      updates.push('graph_gen_conf_allowed_relationships = ?');
      values.push(Array.isArray(body.graph_gen_conf_allowed_relationships) ? body.graph_gen_conf_allowed_relationships.join(',') : body.graph_gen_conf_allowed_relationships);
    }
    if (typeof body.graph_gen_conf_retry_condition === 'string') {
      updates.push('graph_gen_conf_retry_condition = ?');
      values.push(body.graph_gen_conf_retry_condition);
    }
    if (typeof body.graph_gen_conf_additional_instruction === 'string') {
      updates.push('graph_gen_conf_additional_instruction = ?');
      values.push(body.graph_gen_conf_additional_instruction);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add run ID to values array
    values.push(runId);

    const query = `UPDATE Run SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.query<any>(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    console.log('[API /api/runs/[id] PATCH] Updated Run ID:', runId, 'Fields:', updates.length);

    return NextResponse.json({ success: true, updated: updates.length }, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/runs/[id] PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update run', details: error.message },
      { status: 500 }
    );
  }
}
