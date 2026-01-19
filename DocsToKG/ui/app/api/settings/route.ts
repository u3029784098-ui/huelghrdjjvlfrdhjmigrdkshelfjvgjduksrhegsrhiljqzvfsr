import { NextResponse } from "next/server";
import { ensureSchema, getConnection } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import { RowDataPacket } from "mysql2/promise";

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    // Get settings for this user and project
    const [settingRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM Setting WHERE user_id = ? AND project_name = ?",
      [user.user_id, projectName]
    );

    if (!settingRows || settingRows.length === 0) {
      return NextResponse.json({ 
        settings: null,
        projectName 
      });
    }

    return NextResponse.json({ 
      settings: settingRows[0],
      projectName 
    });
  } catch (err) {
    console.error("Failed to fetch settings:", err);
    return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

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

    const settingData = {
      user_id: user.user_id,
      project_name: projectName,
      // Storage paths
      raw_doc_path: body.storagePaths?.rawDocuments?.path || null,
      raw_doc_prefix: body.storagePaths?.rawDocuments?.prefix || null,
      metadata_doc_path: body.storagePaths?.metadata?.path || null,
      metadata_doc_prefix: body.storagePaths?.metadata?.prefix || null,
      text_doc_path: body.storagePaths?.text?.path || null,
      text_doc_prefix: body.storagePaths?.text?.prefix || null,
      figures_doc_path: body.storagePaths?.figures?.path || null,
      figures_doc_prefix: body.storagePaths?.figures?.prefix || null,
      formulas_doc_path: body.storagePaths?.formulas?.path || null,
      formulas_doc_prefix: body.storagePaths?.formulas?.prefix || null,
      tables_doc_path: body.storagePaths?.tables?.path || null,
      tables_doc_prefix: body.storagePaths?.tables?.prefix || null,
      hierarchy_doc_path: body.storagePaths?.hierarchy?.path || null,
      hierarchy_doc_prefix: body.storagePaths?.hierarchy?.prefix || null,
      shrinks_doc_path: body.storagePaths?.shrinks?.path || null,
      shrinks_doc_prefix: body.storagePaths?.shrinks?.prefix || null,
      // LLM & GraphRAG
      llm_provider: body.llmProvider || null,
      llm: body.llmName || null,
      formulas_llm_provider: body.formulasLlmProvider || null,
      formulas_llm: body.formulasLlm || null,
      embedding_provider: body.embeddingProvider || null,
      embedding_model: body.embeddingModel || null,
      dimensions: body.embeddingDimensions ? parseInt(body.embeddingDimensions) : null,
      similarity_metric: body.similarityMetric || null,
      // Graph properties
      lexical_graph_meta_label: body.metaLabels?.lexicalGraph || null,
      domain_graph_meta_label: body.metaLabels?.domainGraph || null,
      formulas_graph_meta_label: body.metaLabels?.formulasGraph || null,
      tables_graph_meta_label: body.metaLabels?.tablesGraph || null,
      figures_graph_meta_label: body.metaLabels?.figuresGraph || null,
      hierarchy_level: body.hierarchyLevels ? JSON.stringify(body.hierarchyLevels) : null,
      // APIs
      llm_graph_builder_url: body.llmGraphBuilderUrl || null,
      // Neo4j connection (if provided)
      neo_4j_uri: body.neo4jConnection?.uri || null,
      neo4j_username: body.neo4jConnection?.username || null,
      neo4j_password: body.neo4jConnection?.password || null,
      neo4j_database: body.neo4jConnection?.database || null,
      neo4j_auradb: body.neo4jConnection?.isAuraDB || false,
    };

    if (existingRows && existingRows.length > 0) {
      // Update existing settings
      const updateFields = Object.keys(settingData)
        .filter(key => key !== 'user_id' && key !== 'project_name')
        .map(key => `${key} = ?`)
        .join(', ');
      
      const updateValues = Object.keys(settingData)
        .filter(key => key !== 'user_id' && key !== 'project_name')
        .map(key => settingData[key as keyof typeof settingData]);

      await pool.query(
        `UPDATE Setting SET ${updateFields} WHERE user_id = ? AND project_name = ?`,
        [...updateValues, user.user_id, projectName]
      );
    } else {
      // Insert new settings
      const fields = Object.keys(settingData).join(', ');
      const placeholders = Object.keys(settingData).map(() => '?').join(', ');
      const values = Object.values(settingData);

      await pool.query(
        `INSERT INTO Setting (${fields}) VALUES (${placeholders})`,
        values
      );
    }

    // Fetch and return updated settings
    const [updatedRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM Setting WHERE user_id = ? AND project_name = ?",
      [user.user_id, projectName]
    );

    return NextResponse.json({
      message: "Settings saved successfully",
      settings: updatedRows[0],
      projectName
    });
  } catch (err) {
    console.error("Failed to save settings:", err);
    return NextResponse.json({ message: "Failed to save settings" }, { status: 500 });
  }
}
