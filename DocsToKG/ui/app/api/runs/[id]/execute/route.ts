import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getConnection } from '@/app/lib/db';
import { getUserFromToken } from '@/app/lib/auth';
import { RowDataPacket } from 'mysql2/promise';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

// Helper to run a child process and wait for completion
function runProcess(python: string, args: string[], env: NodeJS.ProcessEnv): Promise<{ exitCode: number | null; pid: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(python, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`[PROCESS] Process exited with code ${code}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
      } else {
        console.log(`[PROCESS] Process completed successfully\nSTDOUT:\n${stdout}`);
      }
      resolve({ exitCode: code, pid: child.pid || 0 });
    });
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureSchema();
    const pool = await getConnection();

    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const runId = parseInt(id, 10);
    if (isNaN(runId)) return NextResponse.json({ message: 'Invalid run id' }, { status: 400 });

    // Get active project
    const [projectRows] = await pool.query<RowDataPacket[]>(
      'SELECT project_name FROM Project WHERE user_id = ? AND is_active = 1 LIMIT 1',
      [user.user_id]
    );
    if (!projectRows || projectRows.length === 0) return NextResponse.json({ message: 'No active project found' }, { status: 404 });
    const projectName = (projectRows[0] as any).project_name;

    // Get ALL settings needed for both extract_data and create_graph
    const [settingRows] = await pool.query<RowDataPacket[]>(
      `SELECT raw_doc_path, raw_doc_prefix, metadata_doc_path, text_doc_path, formulas_doc_path, 
              figures_doc_path, hierarchy_doc_path, hierarchy_doc_prefix, shrinks_doc_path, shrinks_doc_prefix,
              llm_provider, llm, embedding_provider, embedding_model, dimensions, similarity_metric,
              lexical_graph_meta_label, domain_graph_meta_label, hierarchy_level,
              llm_graph_builder_url, neo_4j_uri, neo4j_username, neo4j_password, neo4j_database, neo4j_auradb
       FROM Setting WHERE user_id = ? AND project_name = ?`,
      [user.user_id, projectName]
    );

    if (!settingRows || settingRows.length === 0) {
      return NextResponse.json({ message: 'Settings not configured for active project' }, { status: 400 });
    }

    const settings = settingRows[0] as any;

    // Get Run data for graph generation config
    const [runRows] = await pool.query<RowDataPacket[]>(
      `SELECT graph_gen_conf_separator, graph_gen_conf_chunk_size, graph_gen_conf_chunk_overlap,
              graph_gen_conf_allowed_nodes, graph_gen_conf_allowed_relationships, graph_gen_conf_additional_instruction,
              nbr_attempts
       FROM Run WHERE id = ?`,
      [runId]
    );

    if (!runRows || runRows.length === 0) {
      return NextResponse.json({ message: 'Run not found' }, { status: 404 });
    }

    const run = runRows[0] as any;

    // Get all documents for this run
    const [docRows] = await pool.query<RowDataPacket[]>(
      `SELECT document_name FROM Document WHERE id_run = ? ORDER BY document_name`,
      [runId]
    );

    const documents = (docRows || []) as any[];

    const expand = (p: string | null) => {
      if (!p) return null;
      return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
    };

    const folderPath = expand(settings.raw_doc_path) ? path.join(expand(settings.raw_doc_path)!, String(runId)) : null;
    const metadataPath = expand(settings.metadata_doc_path) || null;
    const textPath = expand(settings.text_doc_path) || null;
    const formulasPath = expand(settings.formulas_doc_path) || null;
    const figuresPath = expand(settings.figures_doc_path) || null;
    const hierarchyPath = expand(settings.hierarchy_doc_path) || null;
    const shrinksPath = expand(settings.shrinks_doc_path) || null;

    // Read body for validTasks and noPipeline
    const body = await req.json().catch(() => ({}));
    const validTasks: string[] = Array.isArray(body.validTasks) ? body.validTasks : [];
    const noPipelineFlag: boolean = Boolean(body.noPipeline);

    if (!folderPath) return NextResponse.json({ message: 'Raw documents path not configured' }, { status: 400 });

    // Ensure all required output paths are configured
    const missingOutputs = [] as string[];
    if (!metadataPath) missingOutputs.push('metadata');
    if (!textPath) missingOutputs.push('text');
    if (!formulasPath) missingOutputs.push('formulas');
    if (!figuresPath) missingOutputs.push('figures');
    if (!hierarchyPath) missingOutputs.push('hierarchy');
    if (!shrinksPath) missingOutputs.push('shrinks');

    if (missingOutputs.length > 0) {
      return NextResponse.json({ message: 'Missing output paths in settings', missing: missingOutputs }, { status: 400 });
    }

    // Locate the Python scripts
    const extractScriptPath = path.resolve(new URL(import.meta.url).pathname).replace('/app/api/runs/[id]/execute/route.ts', '/backend/core/scripts/extract_data.py');
    const graphScriptPath = path.resolve(new URL(import.meta.url).pathname).replace('/app/api/runs/[id]/execute/route.ts', '/backend/core/scripts/create_graph.py');

    const python = process.env.PYTHON || 'python3';
    const envVars = {
      ...process.env,
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || '3308',
      DB_NAME: process.env.DB_NAME || 'docs_to_kg',
      DB_USER: process.env.DB_USER || 'admin',
      DB_PASSWORD: process.env.DB_PASSWORD || 'admin',
      API_URL: process.env.API_URL || 'http://localhost:3000',
    };

    // Build extraction arguments
    const extractArgs: string[] = [];
    extractArgs.push(extractScriptPath);
    extractArgs.push('--folder-path', folderPath);
    if (metadataPath) extractArgs.push('--metadata-path', metadataPath);
    if (textPath) extractArgs.push('--text-path', textPath);
    if (formulasPath) extractArgs.push('--formulas-path', formulasPath);
    if (figuresPath) extractArgs.push('--figures-path', figuresPath);
    if (hierarchyPath) extractArgs.push('--hierarchy-path', hierarchyPath);
    if (shrinksPath) extractArgs.push('--shrinks-path', shrinksPath);
    if (validTasks.length > 0) extractArgs.push('--valid-tasks', ...validTasks);
    extractArgs.push('--run-id', String(runId));
    extractArgs.push('--project-name', projectName);
    extractArgs.push('--api-url', process.env.API_URL || 'http://localhost:3000');
    if (noPipelineFlag) extractArgs.push('--no-pipeline');
    if (run.nbr_attempts) extractArgs.push('--nbr-attempts', String(run.nbr_attempts));
    if (settings.llm_provider) extractArgs.push('--llm-provider', settings.llm_provider);
    if (settings.llm) extractArgs.push('--llm-model', settings.llm);

    console.log(`[GRAPH] Starting extraction for run ${runId}...`);
    
    // Step 1: Run extraction and wait for completion
    const extractResult = await runProcess(python, extractArgs, envVars).catch((err) => {
      console.error('[GRAPH] Extraction process error:', err);
      throw err;
    });

    console.log(`[GRAPH] Extraction completed with exit code: ${extractResult.exitCode}`);

    if (extractResult.exitCode !== 0) {
      console.error(`[GRAPH] Extraction failed with exit code ${extractResult.exitCode}`);
      return NextResponse.json(
        { message: 'Extraction failed', exitCode: extractResult.exitCode },
        { status: 500 }
      );
    }

    // Step 2: Build and run create_graph for each document
    console.log(`[GRAPH] Starting graph generation for ${documents.length} document(s)...`);

    for (const doc of documents) {
      const docName = doc.document_name;
      const docNameNoExt = path.parse(docName).name;
      const rawDocPrefix = settings.raw_doc_prefix || 'raw';
      const hierarchyDocPrefix = settings.hierarchy_doc_prefix || 'hierarchy';
      const shrinksDocPrefix = settings.shrinks_doc_prefix || 'shrinks';

      // Build hierarchy and shrinks paths with full naming convention
      const hierarchyPathForDoc = `${hierarchyPath}/${hierarchyDocPrefix}_${rawDocPrefix}_${docNameNoExt}`;
      const shrinksPathForDoc = `${shrinksPath}/${shrinksDocPrefix}_${rawDocPrefix}_${docNameNoExt}`;

      const graphArgs: string[] = [];
      graphArgs.push(graphScriptPath);
      graphArgs.push('--uri', settings.neo_4j_uri || '');
      graphArgs.push('--username', settings.neo4j_username || '');
      graphArgs.push('--password', settings.neo4j_password || '');
      graphArgs.push('--database', settings.neo4j_database || '');
      if (settings.neo4j_auradb) graphArgs.push('--aura-ds');
      graphArgs.push('--hierarchy-path', hierarchyPathForDoc);
      graphArgs.push('--shrinks-path', shrinksPathForDoc);
      graphArgs.push('--embedding-provider', settings.embedding_provider || '');
      graphArgs.push('--embedding-model', settings.embedding_model || '');
      graphArgs.push('--llm-provider', settings.llm_provider || '');
      graphArgs.push('--llm-model', settings.llm || '');
      graphArgs.push('--similarity-metric', settings.similarity_metric || '');
      graphArgs.push('--separator', run.graph_gen_conf_separator || '');
      graphArgs.push('--chunk-size', String(run.graph_gen_conf_chunk_size || 0));
      graphArgs.push('--chunk-overlap', String(run.graph_gen_conf_chunk_overlap || 0));
      graphArgs.push('--vector-dim', String(settings.dimensions || 0));

      if (settings.hierarchy_level) {
        let levels: string[] = [];
        
        if (Array.isArray(settings.hierarchy_level)) {
          levels = settings.hierarchy_level as string[];
        } else {
          const levelStr = String(settings.hierarchy_level).trim();
          // Check if it's a JSON array string like ["H1","H2","H3"]
          if (levelStr.startsWith('[') && levelStr.endsWith(']')) {
            try {
              const parsed = JSON.parse(levelStr);
              levels = Array.isArray(parsed) ? parsed : [levelStr];
            } catch {
              // If JSON parse fails, treat as comma-separated
              levels = levelStr.slice(1, -1).split(',').map((l: string) => l.trim().replace(/['"]/g, ''));
            }
          } else {
            // Treat as comma-separated string
            levels = levelStr.split(',').map((l: string) => l.trim());
          }
        }
        
        if (levels.length > 0) {
          graphArgs.push('--level-labels', ...levels.map((l: string) => String(l).trim()));
        }
      }

      graphArgs.push('--lexical-meta-label', settings.lexical_graph_meta_label || '');
      graphArgs.push('--domain-meta-label', settings.domain_graph_meta_label || '');
      graphArgs.push('--llmgb-url', settings.llm_graph_builder_url || '');

      if (run.graph_gen_conf_allowed_nodes) {
        const nodes: string[] = String(run.graph_gen_conf_allowed_nodes)
          .split(',')
          .map((n: string) => n.trim());
        if (nodes.length > 0) {
          graphArgs.push('--allowed-nodes', ...nodes);
        }
      }

      if (run.graph_gen_conf_allowed_relationships) {
        const rels: string[] = String(run.graph_gen_conf_allowed_relationships)
          .split(',')
          .map((r: string) => r.trim());
        if (rels.length > 0) {
          graphArgs.push('--allowed-relationships', ...rels);
        }
      }

      if (run.graph_gen_conf_additional_instruction) {
        graphArgs.push('--additional-instructions', run.graph_gen_conf_additional_instruction);
      }

      console.log(`[GRAPH] Running graph generation for document: ${docName}`);

      const graphResult = await runProcess(python, graphArgs, envVars).catch((err) => {
        console.error(`[GRAPH] Graph process error for ${docName}:`, err);
        throw err;
      });

      console.log(`[GRAPH] Graph generation for ${docName} completed with exit code: ${graphResult.exitCode}`);

      if (graphResult.exitCode !== 0) {
        console.error(`[GRAPH] Graph generation failed for ${docName} with exit code ${graphResult.exitCode}`);
        return NextResponse.json(
          { message: `Graph generation failed for ${docName}`, exitCode: graphResult.exitCode },
          { status: 500 }
        );
      }
    }

    console.log(`[GRAPH] All graph generation completed successfully for run ${runId}`);

    // Mark the run as executed
    try {
      await pool.query(`UPDATE Run SET is_executed = TRUE WHERE id = ?`, [runId]);
    } catch (updateErr) {
      console.error(`[GRAPH] Failed to mark run ${runId} as executed:`, updateErr);
    }

    return NextResponse.json({ 
      message: 'Extraction and graph generation completed successfully',
      runId,
      documentsProcessed: documents.length
    }, { status: 200 });
  } catch (err: any) {
    console.error('[API /api/runs/[id]/execute] Error:', err);
    return NextResponse.json({ message: 'Failed to process', error: String(err) }, { status: 500 });
  }
}
