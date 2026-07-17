// ============================================================================
// /api/admin/content/* — read-only admin content endpoints
// Requires admin role.  Fase 1: modules, sources, tracker summary, usage map.
// TODO(fase-2/3): write endpoints for module/card/source editor.
// ============================================================================
import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { all, get } from '../database';
import { hitungFreshness } from '../lib/contentFreshness';

const router = Router();
router.use(authenticate);
router.use(requireRole('admin'));

// ---------------------------------------------------------------------------
// DB row types
// ---------------------------------------------------------------------------
interface ModuleRow {
  id: string;
  title: string;
  domain_hints: string;
  figure_id: string | null;
  status: string;
  last_reviewed_at: string | null;
}

interface SourceRow {
  id: string;
  label: string;
  url: string | null;
  type: string;
}

interface DomainRow {
  code: string;
  label: string;
  strict_freshness: number;
}

interface CardSummaryRow {
  id: string;
  age_key: string;
  domain: string;
  summary: string | null;
  reviewed_by_date: string | null;
  section_count: number;
}

// ---------------------------------------------------------------------------
// GET /api/admin/content/modules
// ---------------------------------------------------------------------------
router.get(
  '/modules',
  asyncHandler(async (_req: Request, res: Response) => {
    const rows = await all<ModuleRow>(
      'SELECT id, title, domain_hints, figure_id, status, last_reviewed_at FROM cms_modules ORDER BY id',
    );
    res.json({
      modules: rows.map((r) => ({
        id: r.id,
        title: r.title,
        domainHints: JSON.parse(r.domain_hints) as string[],
        figureId: r.figure_id ?? undefined,
        status: r.status,
        lastReviewed: r.last_reviewed_at ?? undefined,
      })),
    });
  }),
);

// ---------------------------------------------------------------------------
// GET /api/admin/content/modules/:id
// ---------------------------------------------------------------------------
router.get(
  '/modules/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const row = await get<ModuleRow>(
      'SELECT id, title, domain_hints, figure_id, status, last_reviewed_at FROM cms_modules WHERE id = ?',
      [id],
    );
    if (!row) throw new ApiError(404, `Module '${id}' not found`);

    const sections = await all<{ key: string; judul: string; isi: string; sort: number }>(
      'SELECT key, judul, isi, sort FROM cms_module_sections WHERE module_id = ? ORDER BY sort',
      [id],
    );
    const stats = await all<{ key: string; value: string; label: string; source_id: string; sort: number }>(
      'SELECT key, value, label, source_id, sort FROM cms_module_stats WHERE module_id = ? ORDER BY sort',
      [id],
    );
    const sourceLinks = await all<{ source_id: string }>(
      'SELECT source_id FROM cms_module_sources WHERE module_id = ?',
      [id],
    );

    res.json({
      id: row.id,
      title: row.title,
      domainHints: JSON.parse(row.domain_hints) as string[],
      figureId: row.figure_id ?? undefined,
      status: row.status,
      lastReviewed: row.last_reviewed_at ?? undefined,
      sections: sections.map((s) => ({ key: s.key, judul: s.judul, isi: s.isi })),
      stats: stats.map((s) => ({ key: s.key, value: s.value, label: s.label, sourceId: s.source_id })),
      sourceIds: sourceLinks.map((l) => l.source_id),
    });
  }),
);

// ---------------------------------------------------------------------------
// GET /api/admin/content/sources
// ---------------------------------------------------------------------------
router.get(
  '/sources',
  asyncHandler(async (_req: Request, res: Response) => {
    const rows = await all<SourceRow>(
      'SELECT id, label, url, type FROM cms_sources ORDER BY id',
    );
    res.json({
      sources: rows.map((r) => ({
        id: r.id,
        label: r.label,
        url: r.url ?? undefined,
        type: r.type,
      })),
    });
  }),
);

// ---------------------------------------------------------------------------
// GET /api/admin/content/tracker/summary
// Returns: matrix 7 domain × 10 age-band; each cell has derived
// contentStatus and freshness.  Derived at request time — never stored.
// ---------------------------------------------------------------------------
router.get(
  '/tracker/summary',
  asyncHandler(async (_req: Request, res: Response) => {
    const now = new Date();

    const domains = await all<DomainRow>(
      'SELECT code, label, strict_freshness FROM cms_domains ORDER BY code',
    );

    const cards = await all<CardSummaryRow>(`
      SELECT
        c.id, c.age_key, c.domain, c.summary,
        c.reviewed_by_date,
        (SELECT COUNT(*) FROM cms_card_sections cs WHERE cs.card_id = c.id) AS section_count
      FROM cms_cards c
      WHERE c.admin_status = 'published'
    `);

    const domainMeta = Object.fromEntries(domains.map((d) => [d.code, d]));

    // Build matrix: key = "domain:ageKey"
    const matrix: Record<string, {
      cardId: string;
      ageKey: string;
      domain: string;
      contentStatus: string;
      freshness: string;
    }> = {};

    for (const card of cards) {
      const dm = domainMeta[card.domain];
      const strict = dm ? dm.strict_freshness === 1 : false;
      let contentStatus: string;
      if (!card.summary) contentStatus = 'segera-hadir';
      else if (card.section_count === 0) contentStatus = 'ringkasan-saja';
      else contentStatus = 'lengkap';

      const freshness = hitungFreshness(card.reviewed_by_date, now, strict);

      matrix[`${card.domain}:${card.age_key}`] = {
        cardId: card.id,
        ageKey: card.age_key,
        domain: card.domain,
        contentStatus,
        freshness,
      };
    }

    res.json({
      generatedAt: now.toISOString(),
      domains: domains.map((d) => ({ code: d.code, label: d.label })),
      matrix,
    });
  }),
);

// ---------------------------------------------------------------------------
// GET /api/admin/content/usage/:type/:id
// type: 'source' → { sourceToModules, sourceToCards }
// type: 'module' → { moduleToCards, cardToModules }
// Derived at request time from FK relationships.
// ---------------------------------------------------------------------------
router.get(
  '/usage/:type/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { type, id } = req.params;

    if (type === 'source') {
      // source → modules (direct: cms_module_sources)
      const modLinks = await all<{ module_id: string }>(
        'SELECT module_id FROM cms_module_sources WHERE source_id = ?',
        [id],
      );
      const moduleIds = modLinks.map((r) => r.module_id);

      // source → cards (transitive: via module → card_sections)
      const cardSet = new Set<string>();
      for (const modId of moduleIds) {
        const cardLinks = await all<{ card_id: string }>(
          "SELECT DISTINCT card_id FROM cms_card_sections WHERE module_id = ? AND type = 'module'",
          [modId],
        );
        for (const r of cardLinks) cardSet.add(r.card_id);
      }
      // also direct own-stat citations
      const directCards = await all<{ card_id: string }>(
        "SELECT DISTINCT card_id FROM cms_card_stats WHERE source_id = ? AND type = 'own'",
        [id],
      );
      for (const r of directCards) cardSet.add(r.card_id);

      res.json({ sourceId: id, moduleIds, cardIds: Array.from(cardSet) });

    } else if (type === 'module') {
      // module → cards (via cms_card_sections)
      const cardLinks = await all<{ card_id: string }>(
        "SELECT DISTINCT card_id FROM cms_card_sections WHERE module_id = ? AND type = 'module'",
        [id],
      );
      const cardIds = cardLinks.map((r) => r.card_id);

      // card → modules (for each card using this module, list all modules it uses)
      const cardModules: Record<string, string[]> = {};
      for (const cId of cardIds) {
        const mods = await all<{ module_id: string }>(
          "SELECT DISTINCT module_id FROM cms_card_sections WHERE card_id = ? AND type = 'module'",
          [cId],
        );
        cardModules[cId] = mods.map((r) => r.module_id);
      }

      res.json({ moduleId: id, cardIds, cardToModules: cardModules });

    } else {
      throw new ApiError(400, "type must be 'source' or 'module'");
    }
  }),
);

export default router;
