import { run, get, all } from '../database';
import { DailyUpdate, UpdateCategory, ParentInsight } from '../types';

export async function createUpdate(
  childId: number,
  teacherId: number,
  content: string,
  photos: string | null,
  category: UpdateCategory,
  date: string
): Promise<DailyUpdate> {
  const result = await run(
    'INSERT INTO daily_updates (child_id, teacher_id, content, photos, category, date) VALUES (?, ?, ?, ?, ?, ?)',
    [childId, teacherId, content, photos, category, date]
  );
  const update = await get<DailyUpdate>('SELECT * FROM daily_updates WHERE id = ?', [result.lastID]);
  if (!update) throw new Error('Failed to create update');
  return update;
}

export function findUpdatesByChildId(childId: number, limit?: number): Promise<DailyUpdate[]> {
  const sql = `SELECT * FROM daily_updates WHERE child_id = ? ORDER BY date DESC, id DESC${
    limit ? ' LIMIT ?' : ''
  }`;
  const params = limit ? [childId, limit] : [childId];
  return all<DailyUpdate>(sql, params);
}

export function findUpdateById(id: number): Promise<DailyUpdate | undefined> {
  return get<DailyUpdate>('SELECT * FROM daily_updates WHERE id = ?', [id]);
}

export async function deleteUpdate(id: number): Promise<void> {
  await run('DELETE FROM daily_updates WHERE id = ?', [id]);
}

export async function createParentInsight(
  childId: number,
  parentId: number,
  content: string,
  date: string
): Promise<ParentInsight> {
  const result = await run(
    'INSERT INTO parent_insights (child_id, parent_id, content, date) VALUES (?, ?, ?, ?)',
    [childId, parentId, content, date]
  );
  const insight = await get<ParentInsight>('SELECT * FROM parent_insights WHERE id = ?', [result.lastID]);
  if (!insight) throw new Error('Failed to create parent insight');
  return insight;
}
