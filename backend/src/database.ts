import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL || './database.db';
const dbPath = path.resolve(__dirname, '..', DATABASE_URL);

export const db = new sqlite3.Database(dbPath);

export function run(sql: string, params: unknown[] = []): Promise<sqlite3.RunResult> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (this: sqlite3.RunResult, err: Error | null) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function get<T = unknown>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: Error | null, row: T) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function all<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: T[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Columns added to `children` after the table already existed in deployed databases.
// `CREATE TABLE IF NOT EXISTS` in schema.sql only covers fresh databases, so these
// run on every startup and are no-ops (ignored "duplicate column" error) once applied.
const COLUMN_MIGRATIONS = [
  "ALTER TABLE children ADD COLUMN enrollment_status TEXT NOT NULL DEFAULT 'not_enrolled'",
  'ALTER TABLE children ADD COLUMN tier1_start_date DATE',
  'ALTER TABLE children ADD COLUMN school_class TEXT',
  'ALTER TABLE children ADD COLUMN assigned_teacher_id INTEGER REFERENCES users(id)',
  'ALTER TABLE children ADD COLUMN emergency_contact TEXT',
  'ALTER TABLE community_profiles ADD COLUMN is_expert INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE community_profiles ADD COLUMN expert_badge TEXT',
  'ALTER TABLE consultations ADD COLUMN outcome_notes TEXT',
];

export async function initDatabase(): Promise<void> {
  const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  await new Promise<void>((resolve, reject) => {
    db.exec(schema, (err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });

  for (const migration of COLUMN_MIGRATIONS) {
    try {
      await run(migration);
    } catch (err) {
      if (!(err as Error).message.includes('duplicate column name')) throw err;
    }
  }
}
