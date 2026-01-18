import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getConnection } from '@/app/lib/db';
import { getUserFromToken } from '@/app/lib/auth';
import { RowDataPacket } from 'mysql2/promise';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string; runId: string }> }
) {
  try {
    await ensureSchema();
    const pool = await getConnection();

    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, runId } = await params;
    const projectName = decodeURIComponent(name);
    const runIdNum = parseInt(runId, 10);

    if (isNaN(runIdNum)) {
      return NextResponse.json({ error: 'Invalid run ID' }, { status: 400 });
    }

    // Get documents for this run
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT doc_id, document_name, text_extracted, figures_extracted, metadata_extracted, tables_extracted, formulas_extracted 
       FROM Document
       WHERE user_id = ? AND project_name = ? AND id_run = ?
       ORDER BY document_name`,
      [user.user_id, projectName, runIdNum]
    );

    const documents = (rows || []).map((doc: any) => ({
      docId: doc.doc_id,
      documentName: doc.document_name,
      extractions: {
        text: Boolean(doc.text_extracted),
        metadata: Boolean(doc.metadata_extracted),
        figures: Boolean(doc.figures_extracted),
        tables: Boolean(doc.tables_extracted),
        formulas: Boolean(doc.formulas_extracted)
      }
    }));

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error(`[API /api/projects/[name]/runs/[runId]/documents] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch run documents', details: error.message },
      { status: 500 }
    );
  }
}
