import mysql, { Pool } from "mysql2/promise";
import bcrypt from "bcryptjs";

const {
  DB_HOST = "localhost",
  DB_PORT = "3308",
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_POOL_SIZE = "5",
} = process.env;

if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
  throw new Error("Missing DB_NAME, DB_USER, or DB_PASSWORD environment variables.");
}

let pool: Pool | null = null;
let schemaInitialized = false;

async function ensureDatabase(): Promise<void> {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await connection.end();
}

function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: Number(DB_POOL_SIZE),
      namedPlaceholders: true,
    });
  }
  return pool;
}

export async function ensureSchema(): Promise<void> {
  if (schemaInitialized) return;

  await ensureDatabase();
  const pool = getPool();

  const statements = [
    `CREATE TABLE IF NOT EXISTS User (
      user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      birth_date DATE,
      email VARCHAR(320) UNIQUE,
      address VARCHAR(512),
      role ENUM('admin','member','user') DEFAULT 'user',
      is_connected TINYINT(1) DEFAULT 0,
      is_blocked BOOLEAN DEFAULT FALSE,
      password VARCHAR(255),
      avatar_path VARCHAR(1024),
      bio TEXT,
      website VARCHAR(512),
      phone VARCHAR(50),
      gender ENUM('Male','Female'),
      language VARCHAR(50),
      timezone VARCHAR(100),
      theme ENUM('light','dark','system') DEFAULT 'system',
      two_factor_enabled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS Project (
      project_name VARCHAR(255) NOT NULL,
      user_id BIGINT NOT NULL,
      description TEXT,
      is_favorite BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT FALSE,
      status ENUM('uploading','processing','analyzing','error') DEFAULT 'uploading',
      tags TEXT,
      percentage INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (project_name, user_id),
      CONSTRAINT fk_project_user FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS Run (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      extract_metadata BOOLEAN DEFAULT FALSE,
      extract_text BOOLEAN DEFAULT FALSE,
      extract_figures BOOLEAN DEFAULT FALSE,
      extract_tables BOOLEAN DEFAULT FALSE,
      extract_formulas BOOLEAN DEFAULT FALSE,
      conf_fig_score_threshold FLOAT,
      conf_fig_classif_threshold FLOAT,
      conf_fig_labels TEXT,
      conf_fig_accepted_labels TEXT,
      graph_gen_conf_separator VARCHAR(255),
      graph_gen_conf_chunk_size INT,
      graph_gen_conf_chunk_overlap INT,
      graph_gen_conf_allowed_nodes TEXT,
      graph_gen_conf_allowed_relationships TEXT,
      graph_gen_conf_retry_condition TEXT,
      graph_gen_conf_additional_instruction TEXT,
      is_executed BOOLEAN DEFAULT FALSE,
      extract_text_state FLOAT DEFAULT 0,
      extract_figures_state FLOAT DEFAULT 0,
      extract_formulas_state FLOAT DEFAULT 0,
      extract_metadata_state FLOAT DEFAULT 0,
      extract_tables_state FLOAT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS Document (
      doc_id VARCHAR(64) NOT NULL,
      user_id BIGINT NOT NULL,
      project_name VARCHAR(255) NOT NULL,
      document_name VARCHAR(1024) NOT NULL,
      id_run BIGINT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (doc_id, user_id, project_name),
      INDEX idx_document_project (project_name, user_id),
      INDEX idx_document_run (id_run),
      CONSTRAINT fk_document_project FOREIGN KEY (project_name, user_id) REFERENCES Project(project_name, user_id) ON DELETE CASCADE,
      CONSTRAINT fk_document_run FOREIGN KEY (id_run) REFERENCES Run(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS Setting (
      user_id BIGINT NOT NULL,
      project_name VARCHAR(255) NOT NULL,
      raw_doc_path VARCHAR(1024),
      raw_doc_prefix VARCHAR(255),
      metadata_doc_path VARCHAR(1024),
      metadata_doc_prefix VARCHAR(255),
      text_doc_path VARCHAR(1024),
      text_doc_prefix VARCHAR(255),
      figures_doc_path VARCHAR(1024),
      figures_doc_prefix VARCHAR(255),
      formulas_doc_path VARCHAR(1024),
      formulas_doc_prefix VARCHAR(255),
      tables_doc_path VARCHAR(1024),
      tables_doc_prefix VARCHAR(255),
      hierarchy_doc_path VARCHAR(1024),
      hierarchy_doc_prefix VARCHAR(255),
      shrinks_doc_path VARCHAR(1024),
      shrinks_doc_prefix VARCHAR(255),
      llm_provider VARCHAR(255),
      llm VARCHAR(255),
      embedding_provider VARCHAR(255),
      embedding_model VARCHAR(255),
      dimensions INT,
      similarity_metric VARCHAR(255),
      lexical_graph_meta_label VARCHAR(255),
      domain_graph_meta_label VARCHAR(255),
      formulas_graph_meta_label VARCHAR(255),
      tables_graph_meta_label VARCHAR(255),
      figures_graph_meta_label VARCHAR(255),
      hierarchy_level TEXT,
      llm_graph_builder_url VARCHAR(1024),
      neo_4j_uri VARCHAR(1024),
      neo4j_username VARCHAR(255),
      neo4j_password VARCHAR(255),
      neo4j_database VARCHAR(255),
      neo4j_auradb BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (project_name, user_id),
      CONSTRAINT fk_setting_project FOREIGN KEY (project_name, user_id) REFERENCES Project(project_name, user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS UsersHistory (
      history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      event ENUM('login','logout') NOT NULL,
      device VARCHAR(512),
      event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_history_user (user_id),
      CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];

  for (const stmt of statements) {
    await pool.query(stmt);
  }

  // Ensure is_active exists on older databases (ignore if already present)
  try {
    await pool.query(`ALTER TABLE Project ADD COLUMN is_active BOOLEAN DEFAULT FALSE AFTER is_favorite`);
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME") {
      throw err;
    }
  }

  // Ensure role exists on older databases (ignore if already present)
  try {
    await pool.query(`ALTER TABLE User ADD COLUMN role ENUM('admin','member','user') DEFAULT 'user' AFTER address`);
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME") {
      throw err;
    }
  }

  // Ensure id_run column exists in Document table (ignore if already present)
  try {
    await pool.query(`ALTER TABLE Document ADD COLUMN id_run BIGINT AFTER document_name`);
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME") {
      throw err;
    }
  }

  // Ensure foreign key constraint exists for id_run (ignore if already present)
  try {
    await pool.query(`ALTER TABLE Document ADD INDEX idx_document_run (id_run)`);
    await pool.query(`ALTER TABLE Document ADD CONSTRAINT fk_document_run FOREIGN KEY (id_run) REFERENCES Run(id) ON DELETE SET NULL`);
  } catch (err: any) {
    if (err?.code !== "ER_DUP_KEYNAME") {
      // Ignore duplicate key/constraint errors
    }
  }

  // Ensure is_connected exists on older databases (ignore if already present)
  try {
    await pool.query(`ALTER TABLE User ADD COLUMN is_connected TINYINT(1) DEFAULT 0 AFTER role`);
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME") {
      throw err;
    }
  }

  // Ensure is_blocked exists on older databases (ignore if already present)
  try {
    await pool.query(`ALTER TABLE User ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE AFTER is_connected`);
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME") {
      throw err;
    }
  }

  // Ensure is_executed exists on Run table (ignore if already present)
  try {
    await pool.query(`ALTER TABLE Run ADD COLUMN is_executed BOOLEAN DEFAULT FALSE`);
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME") {
      // Some MySQL versions return different codes; ignore if column exists
      if (err?.errno !== 1060) {
        throw err;
      }
    }
  }

  // Ensure extraction state columns exist on Run table (ignore if already present)
  const extractionStateColumns = [
    'extract_text_state',
    'extract_figures_state',
    'extract_formulas_state',
    'extract_metadata_state',
    'extract_tables_state'
  ];
  
  for (const col of extractionStateColumns) {
    try {
      await pool.query(`ALTER TABLE Run ADD COLUMN ${col} FLOAT DEFAULT 0`);
    } catch (err: any) {
      if (err?.code !== "ER_DUP_FIELDNAME" && err?.errno !== 1060) {
        throw err;
      }
    }
  }

  // Ensure extraction status columns exist on Document table (ignore if already present)
  const documentExtractionColumns = [
    'text_extracted',
    'figures_extracted',
    'metadata_extracted',
    'tables_extracted',
    'formulas_extracted'
  ];
  
  for (const col of documentExtractionColumns) {
    try {
      await pool.query(`ALTER TABLE Document ADD COLUMN ${col} BOOLEAN DEFAULT FALSE`);
    } catch (err: any) {
      if (err?.code !== "ER_DUP_FIELDNAME" && err?.errno !== 1060) {
        // Column likely already exists
      }
    }
  }

  // Ensure llm column exists on Setting table
  try {
    await pool.query(`ALTER TABLE Setting ADD COLUMN llm VARCHAR(255)`);
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME" && err?.errno !== 1060) {
      throw err;
    }
  }

  // Ensure embedding_provider column exists on Setting table
  try {
    await pool.query(`ALTER TABLE Setting ADD COLUMN embedding_provider VARCHAR(255)`);
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME" && err?.errno !== 1060) {
      throw err;
    }
  }

  // Migrate existing model values into llm when available
  try {
    await pool.query(`UPDATE Setting SET llm = model WHERE llm IS NULL AND model IS NOT NULL`);
  } catch (err: any) {
    // Ignore if model column does not exist or other benign errors
  }

  // Ensure new profile fields exist on older databases
  const profileColumns = [
    { col: 'avatar_path', def: 'VARCHAR(1024)' },
    { col: 'bio', def: 'TEXT' },
    { col: 'website', def: 'VARCHAR(512)' },
    { col: 'phone', def: 'VARCHAR(50)' },
    { col: 'gender', def: "ENUM('Male','Female')" },
    { col: 'language', def: 'VARCHAR(50)' },
    { col: 'timezone', def: 'VARCHAR(100)' },
    { col: 'theme', def: "ENUM('light','dark','system') DEFAULT 'system'" },
    { col: 'two_factor_enabled', def: 'BOOLEAN DEFAULT FALSE' }
  ];
  
  for (const { col, def } of profileColumns) {
    try {
      await pool.query(`ALTER TABLE User ADD COLUMN ${col} ${def}`);
    } catch (err: any) {
      if (err?.code !== "ER_DUP_FIELDNAME") {
        console.warn(`Could not add column ${col}:`, err?.message);
      }
    }
  }

  // Ensure device column in UsersHistory
  try {
    await pool.query(`ALTER TABLE UsersHistory ADD COLUMN device VARCHAR(512) AFTER event`);
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME") {
      console.warn('Could not add device column:', err?.message);
    }
  }

  // Rename path_name to document_name in Document table
  try {
    await pool.query(`ALTER TABLE Document CHANGE COLUMN path_name document_name VARCHAR(1024) NOT NULL`);
  } catch (err: any) {
    if (err?.code !== "ER_BAD_FIELD_ERROR") {
      console.warn('Could not rename path_name to document_name:', err?.message);
    }
  }

  // Change doc_id from BIGINT to VARCHAR(64) for hash storage
  try {
    // Drop auto_increment first
    await pool.query(`ALTER TABLE Document MODIFY COLUMN doc_id VARCHAR(64) NOT NULL`);
  } catch (err: any) {
    console.warn('Could not modify doc_id column:', err?.message);
  }

  // Seed a unique admin account if it does not already exist
  try {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      "SELECT user_id FROM User WHERE email = ?",
      ["admin@admin.com"]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      const hash = await bcrypt.hash("Admin0000?*", 10);
      await pool.query(
        `INSERT INTO User (email, password, role, is_connected, is_blocked, first_name, last_name, birth_date, address)
         VALUES (?, ?, 'admin', 0, 0, NULL, NULL, NULL, NULL)`,
        ["admin@admin.com", hash]
      );
    }
  } catch (err) {
    console.error("Admin seeding failed", err);
  }

  schemaInitialized = true;
}

export async function getConnection() {
  await ensureSchema();
  return getPool();
}
