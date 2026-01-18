import { NextResponse } from "next/server";
import { ensureSchema, getConnection } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import { RowDataPacket } from "mysql2/promise";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      console.error("Upload: No authenticated user found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log(`Upload: Processing files for user ${user.user_id}`);

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      console.error("Upload: No files provided");
      return NextResponse.json({ message: "No files provided" }, { status: 400 });
    }

    console.log(`Upload: Received ${files.length} files`);

    // Validate file types (PDF and images only)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/svg+xml"
    ];

    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];

    const invalidFiles: string[] = [];

    for (const file of files) {
      const fileName = file.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      const hasValidType = allowedTypes.includes(file.type) || file.type === "";

      if (!hasValidExtension || !hasValidType) {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      return NextResponse.json({
        message: `Invalid file type(s) detected. Only PDF and image files (.pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp, .svg) are allowed.`,
        invalidFiles: invalidFiles,
        rejectedCount: invalidFiles.length
      }, { status: 400 });
    }

    // Filter to only process valid files
    const validFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      return allowedExtensions.some(ext => fileName.endsWith(ext));
    });

    await ensureSchema();
    const pool = await getConnection();

    // Get active project for this user
    const [projectRows] = await pool.query<RowDataPacket[]>(
      "SELECT project_name FROM Project WHERE user_id = ? AND is_active = 1 LIMIT 1",
      [user.user_id]
    );

    if (!projectRows || projectRows.length === 0) {
      console.error(`Upload: No active project found for user ${user.user_id}`);
      return NextResponse.json({ message: "No active project found" }, { status: 404 });
    }

    const projectName = (projectRows[0] as any).project_name;
    console.log(`Upload: Found active project: ${projectName}`);

    // Fetch storage settings for the active project (raw documents path & prefix)
    const [settingRows] = await pool.query<RowDataPacket[]>(
      "SELECT raw_doc_path, raw_doc_prefix FROM Setting WHERE user_id = ? AND project_name = ?",
      [user.user_id, projectName]
    );

    const configuredRawDocPath = (settingRows?.[0] as any)?.raw_doc_path || null;
    const rawDocPrefix = (settingRows?.[0] as any)?.raw_doc_prefix || "raw";

    // Expand tilde to home directory for file system compatibility
    const rawDocPath = configuredRawDocPath
      ? configuredRawDocPath.startsWith("~")
        ? path.join(os.homedir(), configuredRawDocPath.slice(1))
        : configuredRawDocPath
      : null;

    // Create a new Run record for this upload batch (not executed yet)
    const [runResult] = await pool.query<any>(
      `INSERT INTO Run (
        extract_metadata,
        extract_text,
        extract_figures,
        extract_tables,
        extract_formulas,
        is_executed
      ) VALUES (FALSE, FALSE, FALSE, FALSE, FALSE, FALSE)`
    );

    const runId = runResult.insertId;
    console.log(`Upload: Created new Run with ID: ${runId}`);

    const uploadedDocuments: Array<{ docId: string; name: string; size: number; type: string; storedPath?: string | null }> = [];
    const skippedDocuments = [];

    // Process each valid file
    for (const file of validFiles) {
      try {
        const safeFileName = path.basename(file.name);

        // Read file content as buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Calculate hash of file content (SHA-256)
        const hash = crypto.createHash("sha256");
        hash.update(buffer);
        const docId = hash.digest("hex");

        // Check if document already exists for this user and project
        const [existingDocs] = await pool.query<RowDataPacket[]>(
          "SELECT doc_id FROM Document WHERE doc_id = ? AND user_id = ? AND project_name = ?",
          [docId, user.user_id, projectName]
        );

        if (existingDocs && existingDocs.length > 0) {
          skippedDocuments.push({
            name: file.name,
            reason: "Document already exists (duplicate content)"
          });
          continue;
        }

        // Insert document into database with run ID
        await pool.query(
          `INSERT INTO Document (doc_id, user_id, project_name, document_name, id_run) 
           VALUES (?, ?, ?, ?, ?)`,
          [docId, user.user_id, projectName, safeFileName, runId]
        );

        console.log(`Upload: Successfully inserted document ${docId} for file ${safeFileName}`);

        // Persist the file to local storage if a path is configured
        let storedPath: string | null = null;
        if (rawDocPath) {
          try {
            const targetDir = path.join(rawDocPath, String(runId));
            await fs.mkdir(targetDir, { recursive: true });
            const targetFileName = `${rawDocPrefix || "raw"}_${safeFileName}`;
            storedPath = path.join(targetDir, targetFileName);
            await fs.writeFile(storedPath, buffer);
            console.log(`Upload: Stored file at ${storedPath}`);
          } catch (storageErr) {
            console.error(`Upload: Failed to store file ${safeFileName} to raw_doc_path`, storageErr);
          }
        } else {
          console.warn("Upload: raw_doc_path is not configured; skipping file storage.");
        }

        uploadedDocuments.push({
          docId,
          name: safeFileName,
          size: file.size,
          type: file.type,
          storedPath
        });

      } catch (err) {
        console.error(`Failed to process file ${file.name}:`, err);
        skippedDocuments.push({
          name: file.name,
          reason: "Processing error"
        });
      }
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedDocuments.length} document(s)`,
      runId,
      uploaded: uploadedDocuments,
      skipped: skippedDocuments,
      projectName
    });

  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ message: "Failed to upload documents", error: String(err) }, { status: 500 });
  }
}
