import { run, get, all } from '../database';

interface KcRow { id: string; status: string; data: string }

function parse(row: KcRow) {
  const card = JSON.parse(row.data);
  return { ...card, adminStatus: row.status === 'draft' ? 'draft' : undefined };
}

export async function kcGetAll(status?: string) {
  let sql = 'SELECT id, status, data FROM kc_managed';
  const params: string[] = [];
  if (status) { sql += ' WHERE status = ?'; params.push(status); }
  const rows = await all<KcRow>(sql, params);
  return rows.map(parse);
}

export async function kcGetById(id: string) {
  const row = await get<KcRow>('SELECT id, status, data FROM kc_managed WHERE id = ?', [id]);
  return row ? parse(row) : null;
}

export async function kcUpsert(id: string, cardData: Record<string, unknown>, status: string) {
  const { adminStatus, ...rest } = cardData;
  const data = JSON.stringify(rest);
  await run(
    `INSERT INTO kc_managed (id, status, data) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET status = excluded.status, data = excluded.data, updated_at = CURRENT_TIMESTAMP`,
    [id, status, data]
  );
  return kcGetById(id);
}

export async function kcUpdate(id: string, patch: { data?: Record<string, unknown>; status?: string }) {
  const existing = await get<KcRow>('SELECT id, status, data FROM kc_managed WHERE id = ?', [id]);
  if (!existing) return null;
  const newData = patch.data ? JSON.stringify(patch.data) : existing.data;
  const newStatus = patch.status ?? existing.status;
  await run(
    'UPDATE kc_managed SET status = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newStatus, newData, id]
  );
  return kcGetById(id);
}

export async function kcDelete(id: string) {
  await run('DELETE FROM kc_managed WHERE id = ?', [id]);
}

export async function kcCount() {
  const row = await get<{ c: number }>('SELECT COUNT(*) as c FROM kc_managed');
  return row?.c ?? 0;
}
