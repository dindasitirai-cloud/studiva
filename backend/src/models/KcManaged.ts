import { run, get, all } from '../database';

interface KcRow { id: string; status: string; data: string }

interface KnowledgeCardsRow {
  slug: string; age_key: string; domain: string; title: string;
  photo_src: string | null; photo_alt: string | null; photo_credit: string | null;
  read_minutes: number; is_medical: number;
  terjadi: string; penting: string; lakukan: string; perhatian: string;
  sci_title: string | null; sci_read_minutes: number | null;
  sci_sections: string; sci_paragraphs: string; sources: string;
}

function safeJson<T>(val: string | null | undefined, fallback: T): T {
  try { return val ? JSON.parse(val) as T : fallback; } catch { return fallback; }
}

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

// Build a KnowledgeCard-shaped object from a knowledge_cards row (by slug).
// Used when a pipeline-published card hasn't been synced to kc_managed yet.
export async function kcCardFromKnowledgeCards(slug: string) {
  const row = await get<KnowledgeCardsRow>(
    `SELECT slug, age_key, domain, title, photo_src, photo_alt, photo_credit,
            read_minutes, is_medical, terjadi, penting, lakukan, perhatian,
            sci_title, sci_read_minutes, sci_sections, sci_paragraphs, sources
     FROM knowledge_cards WHERE slug = ? AND status = 'PUBLISHED'`,
    [slug]
  );
  if (!row) return null;
  const sciSecs = safeJson<Array<{ judul: string; isi: string }>>(row.sci_sections, []).filter(s => s.isi?.trim());
  const sciParas = safeJson<string[]>(row.sci_paragraphs, []).filter(p => p.trim());
  return {
    id: row.slug,
    ageKey: row.age_key,
    domain: row.domain,
    title: row.title,
    photo: {
      src: row.photo_src ?? `/images/rl/${row.slug}.jpg`,
      alt: row.photo_alt ?? row.title,
      credit: row.photo_credit ?? undefined,
    },
    readMinutes: row.read_minutes,
    isMedical: row.is_medical === 1,
    summary: {
      terjadi: row.terjadi,
      penting: row.penting,
      lakukan: safeJson<string[]>(row.lakukan, []),
      perhatian: row.perhatian,
    },
    scientific: {
      title: row.sci_title ?? '',
      readMinutes: row.sci_read_minutes ?? undefined,
      sections: sciSecs.length > 0 ? sciSecs : undefined,
      paragraphs: sciSecs.length === 0 && sciParas.length > 0 ? sciParas : undefined,
    },
    sources: safeJson<string[]>(row.sources, []),
  };
}

// Returns kc_managed cards merged with PUBLISHED knowledge_cards that have no kc_managed entry.
// Used by the admin list endpoint so pipeline-published cards always appear in Wawasan Tumbuh.
export async function kcGetAllMerged(status?: string) {
  const kcCards = await kcGetAll(status);
  // Only augment when listing published or all — never inject into draft-only queries
  if (status && status !== 'published') return kcCards;

  const kcIds = new Set<string>(kcCards.map((c: Record<string, unknown>) => String(c.id)));
  const rows = await all<KnowledgeCardsRow>(
    `SELECT slug, age_key, domain, title, photo_src, photo_alt, photo_credit,
            read_minutes, is_medical, terjadi, penting, lakukan, perhatian,
            sci_title, sci_read_minutes, sci_sections, sci_paragraphs, sources
     FROM knowledge_cards WHERE status = 'PUBLISHED'`
  );
  const fromKC = rows
    .filter(r => !kcIds.has(r.slug))
    .map(r => {
      const sciSecs = safeJson<Array<{ judul: string; isi: string }>>(r.sci_sections, []).filter(s => s.isi?.trim());
      const sciParas = safeJson<string[]>(r.sci_paragraphs, []).filter(p => p.trim());
      return {
        id: r.slug,
        ageKey: r.age_key,
        domain: r.domain,
        title: r.title,
        photo: {
          src: r.photo_src ?? `/images/rl/${r.slug}.jpg`,
          alt: r.photo_alt ?? r.title,
          credit: r.photo_credit ?? undefined,
        },
        readMinutes: r.read_minutes,
        isMedical: r.is_medical === 1,
        summary: {
          terjadi: r.terjadi,
          penting: r.penting,
          lakukan: safeJson<string[]>(r.lakukan, []),
          perhatian: r.perhatian,
        },
        scientific: {
          title: r.sci_title ?? '',
          readMinutes: r.sci_read_minutes ?? undefined,
          sections: sciSecs.length > 0 ? sciSecs : undefined,
          paragraphs: sciSecs.length === 0 && sciParas.length > 0 ? sciParas : undefined,
        },
        sources: safeJson<string[]>(r.sources, []),
      };
    });

  return [...kcCards, ...fromKC];
}
