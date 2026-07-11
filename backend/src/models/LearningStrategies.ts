import { run, get, all } from '../database';

// ── Generic helpers ───────────────────────────────────────────────────────────

type ContentType = 'activities' | 'plans' | 'tools' | 'downloads';
const TABLE: Record<ContentType, string> = {
  activities: 'ls_activities',
  plans:      'ls_plans',
  tools:      'ls_tools',
  downloads:  'ls_downloads',
};

interface LsRow {
  id: number;
  status: 'draft' | 'published';
  data: string; // JSON
  created_at: string;
  updated_at: string;
}

function parseRow(row: LsRow) {
  try {
    return { id: row.id, status: row.status, ...JSON.parse(row.data) };
  } catch {
    return { id: row.id, status: row.status };
  }
}

export async function lsGetAll(type: ContentType, status?: string) {
  const table = TABLE[type];
  const rows: LsRow[] = status
    ? await all(`SELECT * FROM ${table} WHERE status = ? ORDER BY id`, [status])
    : await all(`SELECT * FROM ${table} ORDER BY id`);
  return rows.map(parseRow);
}

export async function lsGetById(type: ContentType, id: number) {
  const table = TABLE[type];
  const row = await get<LsRow>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  return row ? parseRow(row) : null;
}

export async function lsCreate(type: ContentType, id: number, data: object, status: string = 'published') {
  const table = TABLE[type];
  const { id: _id, status: _s, ...rest } = data as Record<string, unknown>;
  await run(
    `INSERT OR REPLACE INTO ${table} (id, status, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    [id, status, JSON.stringify(rest)]
  );
  return lsGetById(type, id);
}

export async function lsUpdate(type: ContentType, id: number, patch: Partial<{ data: object; status: string }>) {
  const table = TABLE[type];
  const existing = await get<LsRow>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (!existing) return null;

  const currentData = JSON.parse(existing.data);
  const newData = patch.data ? { ...currentData, ...patch.data } : currentData;
  const newStatus = patch.status ?? existing.status;

  await run(
    `UPDATE ${table} SET status = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [newStatus, JSON.stringify(newData), id]
  );
  return lsGetById(type, id);
}

export async function lsDelete(type: ContentType, id: number) {
  const table = TABLE[type];
  await run(`DELETE FROM ${table} WHERE id = ?`, [id]);
}

export async function lsCount(type: ContentType): Promise<number> {
  const table = TABLE[type];
  const row = await get<{ count: number }>(`SELECT COUNT(*) as count FROM ${table}`);
  return row?.count ?? 0;
}

export async function lsBulkInsert(type: ContentType, items: Array<{ id: number; status?: string; [key: string]: unknown }>) {
  const table = TABLE[type];
  for (const item of items) {
    const { id, status = 'published', ...rest } = item;
    await run(
      `INSERT OR IGNORE INTO ${table} (id, status, data) VALUES (?, ?, ?)`,
      [id, status, JSON.stringify(rest)]
    );
  }
}
