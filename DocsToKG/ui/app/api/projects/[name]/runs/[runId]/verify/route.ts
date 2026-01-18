import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getConnection } from '@/app/lib/db';
import { getUserFromToken } from '@/app/lib/auth';
import { RowDataPacket } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Verifies extracted files in storage folders and updates Document table flags
 * This endpoint checks the actual filesystem to determine what was extracted
 */
export async function POST(
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

    // Get storage settings with all prefixes
    const [settingRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        text_doc_path, text_doc_prefix,
        figures_doc_path, figures_doc_prefix,
        metadata_doc_path, metadata_doc_prefix,
        hierarchy_doc_path, hierarchy_doc_prefix,
        formulas_doc_path, formulas_doc_prefix
       FROM Setting WHERE user_id = ? AND project_name = ?`,
      [user.user_id, projectName]
    );

    if (!settingRows || settingRows.length === 0) {
      return NextResponse.json(
        { error: 'Storage settings not configured' },
        { status: 400 }
      );
    }

    const settings = settingRows[0] as any;

    // Expand tilde paths
    const expandPath = (p: string | null) => {
      if (!p) return null;
      return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
    };

    // Get all documents for this run
    const [docs] = await pool.query<RowDataPacket[]>(
      `SELECT doc_id, document_name FROM Document
       WHERE user_id = ? AND project_name = ? AND id_run = ?`,
      [user.user_id, projectName, runIdNum]
    );

    if (!docs || docs.length === 0) {
      return NextResponse.json({
        verified: 0,
        documents: []
      });
    }

    const verificationResults: any[] = [];
    let verifiedCount = 0;

    // Check each document
    for (const doc of docs as any[]) {
      const docName = doc.document_name;
      const fileName = path.parse(docName).name; // Remove extension
      const docId = doc.doc_id;

      const extractionStatus = {
        text_extracted: false,
        figures_extracted: false,
        metadata_extracted: false,
        tables_extracted: false,
        formulas_extracted: false
      };

      // Check text extraction using configured prefix
      if (settings.text_doc_path && settings.text_doc_prefix) {
        const textPath = expandPath(settings.text_doc_path);
        if (textPath && fs.existsSync(textPath)) {
          const expectedFile = path.join(textPath, `${settings.text_doc_prefix}_raw_${fileName}.txt`);
          extractionStatus.text_extracted = fs.existsSync(expectedFile);
        }
      }

      // Check metadata extraction using configured prefix
      if (settings.metadata_doc_path && settings.metadata_doc_prefix) {
        const metaPath = expandPath(settings.metadata_doc_path);
        if (metaPath && fs.existsSync(metaPath)) {
          const expectedFile = path.join(metaPath, `${settings.metadata_doc_prefix}_raw_${fileName}.json`);
          extractionStatus.metadata_extracted = fs.existsSync(expectedFile);
        }
      }

      // Check figures extraction using configured prefix (looks for folder with images)
      if (settings.figures_doc_path && settings.figures_doc_prefix) {
        const figPath = expandPath(settings.figures_doc_path);
        if (figPath && fs.existsSync(figPath)) {
          const expectedFolder = path.join(figPath, `${settings.figures_doc_prefix}_raw_${fileName}`);
          if (fs.existsSync(expectedFolder) && fs.statSync(expectedFolder).isDirectory()) {
            const files = fs.readdirSync(expectedFolder);
            // Consider extracted if folder has image files (not just metadata files)
            extractionStatus.figures_extracted = files.some(f => 
              /\.(png|jpg|jpeg|bmp|tiff|gif)$/i.test(f)
            );
          }
        }
      }

      // Check tables/hierarchy extraction using configured prefix (looks for folder)
      if (settings.hierarchy_doc_path && settings.hierarchy_doc_prefix) {
        const tablesPath = expandPath(settings.hierarchy_doc_path);
        if (tablesPath && fs.existsSync(tablesPath)) {
          const expectedFolder = path.join(tablesPath, `${settings.hierarchy_doc_prefix}_raw_${fileName}`);
          if (fs.existsSync(expectedFolder) && fs.statSync(expectedFolder).isDirectory()) {
            // Consider extracted if folder exists and has content
            const files = fs.readdirSync(expectedFolder);
            extractionStatus.tables_extracted = files.length > 0;
          }
        }
      }

      // Check formulas extraction using configured prefix
      if (settings.formulas_doc_path && settings.formulas_doc_prefix) {
        const formulasPath = expandPath(settings.formulas_doc_path);
        if (formulasPath && fs.existsSync(formulasPath)) {
          const expectedFolder = path.join(formulasPath, `${settings.formulas_doc_prefix}_raw_${fileName}`);
          if (fs.existsSync(expectedFolder) && fs.statSync(expectedFolder).isDirectory()) {
            // Consider extracted if folder exists and has content
            const files = fs.readdirSync(expectedFolder);
            extractionStatus.formulas_extracted = files.length > 0;
          }
        }
      }

      // Update the Document record with verification results
      try {
        await pool.query(
          `UPDATE Document SET 
            text_extracted = ?, 
            figures_extracted = ?, 
            metadata_extracted = ?, 
            tables_extracted = ?, 
            formulas_extracted = ? 
           WHERE doc_id = ? AND id_run = ?`,
          [
            extractionStatus.text_extracted,
            extractionStatus.figures_extracted,
            extractionStatus.metadata_extracted,
            extractionStatus.tables_extracted,
            extractionStatus.formulas_extracted,
            docId,
            runIdNum
          ]
        );
        verifiedCount++;
      } catch (err) {
        console.error(`Failed to update document ${docId}:`, err);
      }

      verificationResults.push({
        documentName: docName,
        docId: docId,
        extractions: extractionStatus
      });
    }

    return NextResponse.json({
      verified: verifiedCount,
      total: docs.length,
      documents: verificationResults
    });
  } catch (error: any) {
    console.error('[API /api/projects/[name]/runs/[runId]/verify] Error:', error);
    return NextResponse.json(
      { error: 'Verification failed', details: error.message },
      { status: 500 }
    );
  }
}
