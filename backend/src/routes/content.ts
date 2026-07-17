// ============================================================================
// /api/content/* — read-only content endpoints (dashboard user auth)
// Fase 1: serves CMS tables seeded from static files.
// TODO(fase-2/3): add write endpoints for editor workflow.
// ============================================================================
import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { all, get } from '../database';
import { composeScientific as _compose, ComposeCard, ComposeModule, ComposeSource } from '../lib/compose';
import type { ScientificResolved } from '../lib/compose';

const router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Helper: derive content-fill status from DB row (mirrors getCardContentStatus)
// ---------------------------------------------------------------------------
type CardContentStatus = 'segera-hadir' | 'ringkasan-saja' | 'lengkap';

function deriveContentStatus(summary: string | null, sectionCount: number): CardContentStatus {
  if (!summary) return 'segera-hadir';
  if (sectionCount === 0) return 'ringkasan-saja';
  return 'lengkap';
}

// ---------------------------------------------------------------------------
// DB row types
// ---------------------------------------------------------------------------
interface DomainRow {
  code: string;
  label: string;
  short_label: string;
  bg: string;
  fg: string;
  strict_freshness: number;
  sensitive_disclaimer: string | null;
  attention_label: string | null;
}

interface CardListRow {
  id: string;
  age_key: string;
  domain: string;
  title: string;
  read_minutes: number;
  is_medical: number;
  summary: string | null;
  figure_id: string | null;
  figure_caption: string | null;
  sci_title: string;
  sci_read_minutes: number | null;
  reviewed_by_name: string | null;
  reviewed_by_date: string | null;
  admin_status: string;
  cover_src: string | null;
  cover_alt: string | null;
  cover_credit: string | null;
  section_count: number;
}

interface SectionRow {
  id: number;
  type: string;
  sort: number;
  module_id: string | null;
  section_key: string | null;
  judul_override: string | null;
  isi_override: string | null;
  judul: string | null;
  isi: string | null;
}

interface StatRow {
  id: number;
  type: string;
  sort: number;
  module_id: string | null;
  stat_key: string | null;
  value: string | null;
  label: string | null;
  source_id: string | null;
  ref: number | null;
}

// ---------------------------------------------------------------------------
// Adapter: DB rows → composeScientific inputs
// ---------------------------------------------------------------------------
async function loadComposeInputs(
  cardId: string,
): Promise<{ sectionRefs: unknown[]; statRefs: unknown[]; modules: Record<string, ComposeModule>; sources: Record<string, ComposeSource> }> {
  const sectionRows = await all<SectionRow>(
    'SELECT * FROM cms_card_sections WHERE card_id = ? ORDER BY sort',
    [cardId],
  );
  const statRows = await all<StatRow>(
    'SELECT * FROM cms_card_stats WHERE card_id = ? ORDER BY sort',
    [cardId],
  );

  // Collect referenced module ids
  const moduleIds = new Set<string>();
  for (const r of sectionRows) if (r.module_id) moduleIds.add(r.module_id);
  for (const r of statRows) if (r.module_id) moduleIds.add(r.module_id);

  // Load modules + their sections/stats
  const modules: Record<string, ComposeModule> = {};
  for (const modId of moduleIds) {
    const modSections = await all<{ key: string; judul: string; isi: string }>(
      'SELECT key, judul, isi FROM cms_module_sections WHERE module_id = ? ORDER BY sort',
      [modId],
    );
    const modStats = await all<{ key: string; value: string; label: string; source_id: string }>(
      'SELECT key, value, label, source_id FROM cms_module_stats WHERE module_id = ? ORDER BY sort',
      [modId],
    );
    modules[modId] = {
      sections: modSections.map((s) => ({ key: s.key, judul: s.judul, isi: s.isi })),
      stats: modStats.map((s) => ({ key: s.key, value: s.value, label: s.label, sourceId: s.source_id })),
    };
  }

  // Collect source ids from module stats + own-stat rows
  const sourceIds = new Set<string>();
  for (const mod of Object.values(modules)) {
    for (const st of mod.stats) if (st.sourceId) sourceIds.add(st.sourceId);
  }
  for (const r of statRows) if (r.source_id) sourceIds.add(r.source_id);

  // Load sources
  const sources: Record<string, ComposeSource> = {};
  for (const srcId of sourceIds) {
    const src = await get<{ label: string; url: string | null }>(
      'SELECT label, url FROM cms_sources WHERE id = ?',
      [srcId],
    );
    if (src) sources[srcId] = { label: src.label, ...(src.url ? { url: src.url } : {}) };
  }

  // Build ref arrays matching shared compose input shapes
  const sectionRefs = sectionRows.map((r) => {
    if (r.type === 'module') {
      return {
        type: 'module' as const,
        moduleId: r.module_id!,
        sectionKey: r.section_key!,
        ...(r.judul_override ? { judulOverride: r.judul_override } : {}),
        ...(r.isi_override ? { isiOverride: r.isi_override } : {}),
      };
    }
    return { type: 'own' as const, judul: r.judul!, isi: r.isi! };
  });

  const statRefs = statRows.map((r) => {
    if (r.type === 'module') {
      return { type: 'module' as const, moduleId: r.module_id!, statKey: r.stat_key! };
    }
    if (r.type === 'own') {
      return { type: 'own' as const, value: r.value!, label: r.label!, sourceId: r.source_id! };
    }
    // legacy
    const out: Record<string, unknown> = { value: r.value!, label: r.label! };
    if (r.ref != null) out.ref = r.ref;
    return out;
  });

  return { sectionRefs, statRefs, modules, sources };
}

async function composeCard(cardRow: CardListRow): Promise<ScientificResolved> {
  const { sectionRefs, statRefs, modules, sources } = await loadComposeInputs(cardRow.id);

  const card: ComposeCard = {
    id: cardRow.id,
    scientific: {
      title: cardRow.sci_title,
      readMinutes: cardRow.sci_read_minutes ?? undefined,
      reviewedBy: cardRow.reviewed_by_name
        ? { name: cardRow.reviewed_by_name, date: cardRow.reviewed_by_date ?? '' }
        : undefined,
      figure: cardRow.figure_id
        ? {
            id: cardRow.figure_id,
            caption: cardRow.figure_caption ?? '',
          }
        : undefined,
      sections: sectionRefs as ComposeCard['scientific']['sections'],
      stats: statRefs as ComposeCard['scientific']['stats'],
    },
  };

  return _compose(card, modules, sources);
}

// ---------------------------------------------------------------------------
// GET /api/content/domains
// ---------------------------------------------------------------------------
router.get(
  '/domains',
  asyncHandler(async (_req: Request, res: Response) => {
    const rows = await all<DomainRow>('SELECT * FROM cms_domains ORDER BY code');
    res.json({
      domains: rows.map((r) => ({
        code: r.code,
        label: r.label,
        shortLabel: r.short_label,
        bg: r.bg,
        fg: r.fg,
        strictFreshness: r.strict_freshness === 1,
        sensitiveDisclaimer: r.sensitive_disclaimer ?? undefined,
        attentionLabel: r.attention_label ?? undefined,
      })),
    });
  }),
);

// ---------------------------------------------------------------------------
// GET /api/content/cards?band=&domain=&status=
// Lightweight list: id, band, domain, title, derived status, cover
// ---------------------------------------------------------------------------
router.get(
  '/cards',
  asyncHandler(async (req: Request, res: Response) => {
    const { band, domain } = req.query as { band?: string; domain?: string };

    let sql = `
      SELECT
        c.id, c.age_key, c.domain, c.title,
        c.read_minutes, c.is_medical,
        c.summary, c.figure_id, c.figure_caption,
        c.sci_title, c.sci_read_minutes,
        c.reviewed_by_name, c.reviewed_by_date,
        c.admin_status,
        cv.src AS cover_src, cv.alt AS cover_alt, cv.credit AS cover_credit,
        (SELECT COUNT(*) FROM cms_card_sections cs WHERE cs.card_id = c.id) AS section_count
      FROM cms_cards c
      LEFT JOIN cms_covers cv ON cv.card_id = c.id
      WHERE c.admin_status = 'published'
    `;
    const params: string[] = [];
    if (band) { sql += ' AND c.age_key = ?'; params.push(band); }
    if (domain) { sql += ' AND c.domain = ?'; params.push(domain); }
    sql += ' ORDER BY c.age_key, c.domain';

    const rows = await all<CardListRow>(sql, params);
    res.json({
      cards: rows.map((r) => ({
        id: r.id,
        ageKey: r.age_key,
        domain: r.domain,
        title: r.title,
        readMinutes: r.read_minutes,
        isMedical: r.is_medical === 1,
        contentStatus: deriveContentStatus(r.summary, r.section_count),
        cover: r.cover_src
          ? { src: r.cover_src, alt: r.cover_alt ?? '', credit: r.cover_credit ?? undefined }
          : null,
      })),
    });
  }),
);

// ---------------------------------------------------------------------------
// GET /api/content/cards/:id  — full card + summary (no scientific sections)
// ---------------------------------------------------------------------------
router.get(
  '/cards/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const sql = `
      SELECT
        c.id, c.age_key, c.domain, c.title,
        c.read_minutes, c.is_medical,
        c.summary, c.figure_id, c.figure_caption, c.figure_after_index,
        c.sci_title, c.sci_read_minutes,
        c.reviewed_by_name, c.reviewed_by_date,
        c.admin_status,
        cv.src AS cover_src, cv.alt AS cover_alt, cv.credit AS cover_credit,
        (SELECT COUNT(*) FROM cms_card_sections cs WHERE cs.card_id = c.id) AS section_count
      FROM cms_cards c
      LEFT JOIN cms_covers cv ON cv.card_id = c.id
      WHERE c.id = ? AND c.admin_status = 'published'
    `;
    const row = await get<CardListRow>(sql, [id]);
    if (!row) throw new ApiError(404, `Card '${id}' not found`);

    const summary = row.summary ? JSON.parse(row.summary) : null;
    res.json({
      id: row.id,
      ageKey: row.age_key,
      domain: row.domain,
      title: row.title,
      readMinutes: row.read_minutes,
      isMedical: row.is_medical === 1,
      contentStatus: deriveContentStatus(row.summary, row.section_count),
      summary,
      cover: row.cover_src
        ? { src: row.cover_src, alt: row.cover_alt ?? '', credit: row.cover_credit ?? undefined }
        : null,
      scientific: {
        title: row.sci_title,
        readMinutes: row.sci_read_minutes ?? undefined,
        reviewedBy: row.reviewed_by_name
          ? { name: row.reviewed_by_name, date: row.reviewed_by_date ?? '' }
          : undefined,
        figure: row.figure_id
          ? { id: row.figure_id, caption: row.figure_caption ?? '', afterSectionIndex: row.figure_after_index ?? undefined }
          : undefined,
      },
    });
  }),
);

// ---------------------------------------------------------------------------
// GET /api/content/cards/:id/composed  — full scientific payload via composer
// ---------------------------------------------------------------------------
router.get(
  '/cards/:id/composed',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const sql = `
      SELECT
        c.id, c.age_key, c.domain, c.title,
        c.read_minutes, c.is_medical,
        c.summary, c.figure_id, c.figure_caption, c.figure_after_index,
        c.sci_title, c.sci_read_minutes,
        c.reviewed_by_name, c.reviewed_by_date,
        c.admin_status,
        cv.src AS cover_src, cv.alt AS cover_alt, cv.credit AS cover_credit,
        (SELECT COUNT(*) FROM cms_card_sections cs WHERE cs.card_id = c.id) AS section_count
      FROM cms_cards c
      LEFT JOIN cms_covers cv ON cv.card_id = c.id
      WHERE c.id = ? AND c.admin_status = 'published'
    `;
    const row = await get<CardListRow>(sql, [id]);
    if (!row) throw new ApiError(404, `Card '${id}' not found`);

    const composed = await composeCard(row);
    res.json({ id: row.id, scientific: composed });
  }),
);

export default router;
