import { run, get, all } from '../database';

export interface KnowledgeCardRow {
  id: number;
  slug: string;
  age_key: string;
  domain: string;
  title: string;
  photo_src: string | null;
  photo_alt: string | null;
  photo_credit: string | null;
  read_minutes: number;
  is_medical: number;
  terjadi: string;
  penting: string;
  lakukan: string; // JSON string
  perhatian: string;
  sci_title: string | null;
  sci_read_minutes: number | null;
  sci_paragraphs: string; // JSON string
  sources: string; // JSON string
  status: string;
  reviewer_notes: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeCard {
  id: number;
  slug: string;
  age_key: string;
  domain: string;
  title: string;
  photo_src: string | null;
  photo_alt: string | null;
  photo_credit: string | null;
  read_minutes: number;
  is_medical: boolean;
  terjadi: string;
  penting: string;
  lakukan: string[];
  perhatian: string;
  sci_title: string | null;
  sci_read_minutes: number | null;
  sci_paragraphs: string[];
  sources: string[];
  status: string;
  reviewer_notes: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

function parseRow(row: KnowledgeCardRow): KnowledgeCard {
  return {
    ...row,
    is_medical: row.is_medical === 1,
    lakukan: safeParseJson(row.lakukan, []),
    sci_paragraphs: safeParseJson(row.sci_paragraphs, []),
    sources: safeParseJson(row.sources, []),
  };
}

function safeParseJson<T>(val: string, fallback: T): T {
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

export interface CreateKnowledgeCardData {
  slug: string;
  age_key: string;
  domain: string;
  title: string;
  photo_src?: string | null;
  photo_alt?: string | null;
  photo_credit?: string | null;
  read_minutes?: number;
  is_medical?: boolean;
  terjadi?: string;
  penting?: string;
  lakukan?: string[];
  perhatian?: string;
  sci_title?: string | null;
  sci_read_minutes?: number | null;
  sci_paragraphs?: string[];
  sources?: string[];
  status?: string;
  reviewer_notes?: string | null;
  reviewed_by?: number | null;
  created_by?: number | null;
}

export interface UpdateKnowledgeCardData {
  slug?: string;
  age_key?: string;
  domain?: string;
  title?: string;
  photo_src?: string | null;
  photo_alt?: string | null;
  photo_credit?: string | null;
  read_minutes?: number;
  is_medical?: boolean;
  terjadi?: string;
  penting?: string;
  lakukan?: string[];
  perhatian?: string;
  sci_title?: string | null;
  sci_read_minutes?: number | null;
  sci_paragraphs?: string[];
  sources?: string[];
  status?: string;
  reviewer_notes?: string | null;
  reviewed_by?: number | null;
  updated_by?: number | null;
}

export async function createKnowledgeCard(data: CreateKnowledgeCardData): Promise<KnowledgeCard> {
  const result = await run(
    `INSERT INTO knowledge_cards
      (slug, age_key, domain, title, photo_src, photo_alt, photo_credit,
       read_minutes, is_medical, terjadi, penting, lakukan, perhatian,
       sci_title, sci_read_minutes, sci_paragraphs, sources, status,
       reviewer_notes, reviewed_by, created_by, updated_by, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      data.slug,
      data.age_key,
      data.domain,
      data.title,
      data.photo_src ?? null,
      data.photo_alt ?? null,
      data.photo_credit ?? null,
      data.read_minutes ?? 2,
      data.is_medical ? 1 : 0,
      data.terjadi ?? '',
      data.penting ?? '',
      JSON.stringify(data.lakukan ?? []),
      data.perhatian ?? '',
      data.sci_title ?? null,
      data.sci_read_minutes ?? null,
      JSON.stringify(data.sci_paragraphs ?? []),
      JSON.stringify(data.sources ?? []),
      data.status ?? 'DRAFT',
      data.reviewer_notes ?? null,
      data.reviewed_by ?? null,
      data.created_by ?? null,
      data.created_by ?? null,
    ]
  );
  const row = await get<KnowledgeCardRow>('SELECT * FROM knowledge_cards WHERE id = ?', [result.lastID]);
  if (!row) throw new Error('Failed to create knowledge card');
  return parseRow(row);
}

export async function findKnowledgeCardById(id: number): Promise<KnowledgeCard | undefined> {
  const row = await get<KnowledgeCardRow>('SELECT * FROM knowledge_cards WHERE id = ?', [id]);
  return row ? parseRow(row) : undefined;
}

export async function findKnowledgeCardBySlug(slug: string): Promise<KnowledgeCard | undefined> {
  const row = await get<KnowledgeCardRow>('SELECT * FROM knowledge_cards WHERE slug = ?', [slug]);
  return row ? parseRow(row) : undefined;
}

export async function findAllKnowledgeCards(filters?: {
  ageKey?: string;
  domain?: string;
  status?: string;
}): Promise<KnowledgeCard[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.ageKey) {
    conditions.push('age_key = ?');
    params.push(filters.ageKey);
  }
  if (filters?.domain) {
    conditions.push('domain = ?');
    params.push(filters.domain);
  }
  if (filters?.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await all<KnowledgeCardRow>(
    `SELECT * FROM knowledge_cards ${where} ORDER BY age_key, domain, title`,
    params
  );
  return rows.map(parseRow);
}

export async function findPublishedKnowledgeCards(
  ageKey?: string,
  domain?: string
): Promise<KnowledgeCard[]> {
  return findAllKnowledgeCards({ ageKey, domain, status: 'PUBLISHED' });
}

export async function updateKnowledgeCard(
  id: number,
  data: UpdateKnowledgeCardData
): Promise<KnowledgeCard> {
  const sets: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  const params: unknown[] = [];

  if (data.slug !== undefined) { sets.push('slug = ?'); params.push(data.slug); }
  if (data.age_key !== undefined) { sets.push('age_key = ?'); params.push(data.age_key); }
  if (data.domain !== undefined) { sets.push('domain = ?'); params.push(data.domain); }
  if (data.title !== undefined) { sets.push('title = ?'); params.push(data.title); }
  if (data.photo_src !== undefined) { sets.push('photo_src = ?'); params.push(data.photo_src); }
  if (data.photo_alt !== undefined) { sets.push('photo_alt = ?'); params.push(data.photo_alt); }
  if (data.photo_credit !== undefined) { sets.push('photo_credit = ?'); params.push(data.photo_credit); }
  if (data.read_minutes !== undefined) { sets.push('read_minutes = ?'); params.push(data.read_minutes); }
  if (data.is_medical !== undefined) { sets.push('is_medical = ?'); params.push(data.is_medical ? 1 : 0); }
  if (data.terjadi !== undefined) { sets.push('terjadi = ?'); params.push(data.terjadi); }
  if (data.penting !== undefined) { sets.push('penting = ?'); params.push(data.penting); }
  if (data.lakukan !== undefined) { sets.push('lakukan = ?'); params.push(JSON.stringify(data.lakukan)); }
  if (data.perhatian !== undefined) { sets.push('perhatian = ?'); params.push(data.perhatian); }
  if (data.sci_title !== undefined) { sets.push('sci_title = ?'); params.push(data.sci_title); }
  if (data.sci_read_minutes !== undefined) { sets.push('sci_read_minutes = ?'); params.push(data.sci_read_minutes); }
  if (data.sci_paragraphs !== undefined) { sets.push('sci_paragraphs = ?'); params.push(JSON.stringify(data.sci_paragraphs)); }
  if (data.sources !== undefined) { sets.push('sources = ?'); params.push(JSON.stringify(data.sources)); }
  if (data.status !== undefined) { sets.push('status = ?'); params.push(data.status); }
  if (data.reviewer_notes !== undefined) { sets.push('reviewer_notes = ?'); params.push(data.reviewer_notes); }
  if (data.reviewed_by !== undefined) { sets.push('reviewed_by = ?'); params.push(data.reviewed_by); }
  if (data.updated_by !== undefined) { sets.push('updated_by = ?'); params.push(data.updated_by); }

  params.push(id);
  await run(`UPDATE knowledge_cards SET ${sets.join(', ')} WHERE id = ?`, params);

  const updated = await findKnowledgeCardById(id);
  if (!updated) throw new Error('Knowledge card not found after update');
  return updated;
}

export async function updateKnowledgeCardStatus(
  id: number,
  status: string,
  reviewerId?: number,
  reviewerNotes?: string
): Promise<KnowledgeCard> {
  const sets: string[] = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
  const params: unknown[] = [status];

  if (reviewerId !== undefined) {
    sets.push('reviewed_by = ?', 'reviewed_at = CURRENT_TIMESTAMP');
    params.push(reviewerId);
  }
  if (reviewerNotes !== undefined) {
    sets.push('reviewer_notes = ?');
    params.push(reviewerNotes);
  }

  params.push(id);
  await run(`UPDATE knowledge_cards SET ${sets.join(', ')} WHERE id = ?`, params);

  const updated = await findKnowledgeCardById(id);
  if (!updated) throw new Error('Knowledge card not found after status update');
  return updated;
}

export async function deleteKnowledgeCard(id: number): Promise<void> {
  await run('DELETE FROM knowledge_cards WHERE id = ?', [id]);
}
