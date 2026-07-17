// ============================================================================
// seed-content.ts — idempotent seed of CMS content tables from static files.
//
// Safe to re-run: uses INSERT OR REPLACE (upsert) for all rows.
// Post-seed verification fails fast with a non-zero exit code.
//
// Run:  npx ts-node -r tsconfig-paths/register src/scripts/seed-content.ts
//   OR: npm run seed:content  (from backend/)
//
// Reads from:
//   frontend/src/pages/DashboardPages/Tier2/domains.ts
//   frontend/src/pages/DashboardPages/Tier2/sources.ts
//   frontend/src/pages/DashboardPages/Tier2/modules.ts
//   frontend/src/pages/DashboardPages/Tier2/knowledgeCardData.ts
//   frontend/src/components/figures/index.ts  (figure id registry)
// ============================================================================
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { db, run, all, initDatabase } from '../database';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ---------------------------------------------------------------------------
// Static data imports (ts-node resolves these at runtime)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DOMAIN_CONFIGS } = require('../../../frontend/src/pages/DashboardPages/Tier2/domains') as {
  DOMAIN_CONFIGS: Array<{
    code: string; label: string; shortLabel: string;
    bg: string; fg: string; strictFreshness: boolean;
    sensitiveDisclaimer?: string; attentionLabel?: string;
  }>;
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SOURCES } = require('../../../frontend/src/pages/DashboardPages/Tier2/sources') as {
  SOURCES: Record<string, { id: string; label: string; url?: string; type: string }>;
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MODULES } = require('../../../frontend/src/pages/DashboardPages/Tier2/modules') as {
  MODULES: Record<string, {
    id: string; title: string; domainHints: string[]; figureId?: string;
    status: string; lastReviewed: string;
    sections: Array<{ key: string; judul: string; isi: string }>;
    stats: Array<{ key: string; value: string; label: string; sourceId: string }>;
    sourceIds: string[];
  }>;
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CARDS } = require('../../../frontend/src/pages/DashboardPages/Tier2/knowledgeCardData') as {
  CARDS: Array<{
    id: string; ageKey: string; domain: string; title: string;
    readMinutes: number; isMedical?: boolean;
    summary?: { terjadi: string; penting: string; lakukan: string[]; perhatian: string };
    photo: { src: string; alt: string; credit?: string };
    scientific: {
      title: string; readMinutes?: number;
      reviewedBy?: { name: string; date: string };
      figure?: { id: string; caption: string; afterSectionIndex?: number };
      sections?: unknown[]; stats?: unknown[];
      paragraphs?: string[];
    };
    sources: string[];
    adminStatus?: string;
  }>;
};

// Figure registry: extract id→name mapping from the component index
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { FIGURE_REGISTRY } = require('../../../frontend/src/components/figures') as {
  FIGURE_REGISTRY: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Report structure
// ---------------------------------------------------------------------------
interface SeedReport {
  timestamp: string;
  counts: { domains: number; sources: number; modules: number; moduleSections: number; moduleStats: number; figures: number; cards: number; cardSections: number; cardStats: number; covers: number };
  verification: { pass: boolean; errors: string[] };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isRef(x: unknown): x is { type: string } {
  return typeof x === 'object' && x !== null && 'type' in (x as object);
}

function isModuleSectionRef(x: unknown): x is { type: 'module'; moduleId: string; sectionKey: string; judulOverride?: string; isiOverride?: string } {
  return isRef(x) && (x as { type: string }).type === 'module' && 'sectionKey' in (x as object);
}

function isOwnSectionRef(x: unknown): x is { type: 'own'; judul: string; isi: string } {
  return isRef(x) && (x as { type: string }).type === 'own';
}

function isModuleStatRef(x: unknown): x is { type: 'module'; moduleId: string; statKey: string } {
  return isRef(x) && (x as { type: string }).type === 'module' && 'statKey' in (x as object);
}

function isOwnStatRef(x: unknown): x is { type: 'own'; value: string; label: string; sourceId: string } {
  return isRef(x) && (x as { type: string }).type === 'own';
}

const REF_TOKEN = /\[ref:([^\]]+)\]/g;

function extractRefTokens(text: string): string[] {
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  REF_TOKEN.lastIndex = 0;
  while ((m = REF_TOKEN.exec(text)) !== null) ids.push(m[1]);
  return ids;
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedDomains(): Promise<number> {
  for (const d of DOMAIN_CONFIGS) {
    await run(
      `INSERT OR REPLACE INTO cms_domains
         (code, label, short_label, bg, fg, strict_freshness, sensitive_disclaimer, attention_label, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [d.code, d.label, d.shortLabel, d.bg, d.fg, d.strictFreshness ? 1 : 0,
       d.sensitiveDisclaimer ?? null, d.attentionLabel ?? null],
    );
  }
  return DOMAIN_CONFIGS.length;
}

async function seedSources(): Promise<number> {
  const srcs = Object.values(SOURCES);
  for (const s of srcs) {
    await run(
      `INSERT OR REPLACE INTO cms_sources (id, label, url, type, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [s.id, s.label, s.url ?? null, s.type],
    );
  }
  return srcs.length;
}

async function seedFigures(): Promise<number> {
  const ids = Object.keys(FIGURE_REGISTRY);
  for (const id of ids) {
    // Derive a human-readable name from the camelCase key
    const name = id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const ariaLabel = `Diagram: ${name}`;
    await run(
      `INSERT OR REPLACE INTO cms_figures (id, name, aria_label, svg_source, updated_at)
       VALUES (?, ?, ?, NULL, CURRENT_TIMESTAMP)`,
      // TODO(fase-4): populate svg_source when figure editor migration is built
      [id, name, ariaLabel],
    );
  }
  return ids.length;
}

async function seedModules(): Promise<{ modules: number; sections: number; stats: number }> {
  let modCount = 0;
  let secCount = 0;
  let statCount = 0;

  for (const mod of Object.values(MODULES)) {
    await run(
      `INSERT OR REPLACE INTO cms_modules
         (id, title, domain_hints, figure_id, status, last_reviewed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [mod.id, mod.title, JSON.stringify(mod.domainHints),
       mod.figureId ?? null, mod.status, mod.lastReviewed],
    );
    modCount++;

    // Clear existing child rows before re-inserting (OR REPLACE on composite unique)
    await run('DELETE FROM cms_module_sections WHERE module_id = ?', [mod.id]);
    for (let i = 0; i < mod.sections.length; i++) {
      const sec = mod.sections[i];
      await run(
        `INSERT INTO cms_module_sections (module_id, key, judul, isi, sort)
         VALUES (?, ?, ?, ?, ?)`,
        [mod.id, sec.key, sec.judul, sec.isi, i],
      );
      secCount++;
    }

    await run('DELETE FROM cms_module_stats WHERE module_id = ?', [mod.id]);
    for (let i = 0; i < mod.stats.length; i++) {
      const st = mod.stats[i];
      await run(
        `INSERT INTO cms_module_stats (module_id, key, value, label, source_id, sort)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [mod.id, st.key, st.value, st.label, st.sourceId ?? null, i],
      );
      statCount++;
    }

    await run('DELETE FROM cms_module_sources WHERE module_id = ?', [mod.id]);
    for (const srcId of mod.sourceIds) {
      await run(
        `INSERT OR IGNORE INTO cms_module_sources (module_id, source_id) VALUES (?, ?)`,
        [mod.id, srcId],
      );
    }
  }

  return { modules: modCount, sections: secCount, stats: statCount };
}

async function seedCards(): Promise<{ cards: number; sections: number; stats: number; covers: number }> {
  let cardCount = 0;
  let secCount = 0;
  let statCount = 0;
  let coverCount = 0;

  for (const card of CARDS) {
    const sci = card.scientific;
    const summaryJson = card.summary ? JSON.stringify(card.summary) : null;
    const figureId = sci.figure?.id ?? null;

    await run(
      `INSERT OR REPLACE INTO cms_cards
         (id, age_key, domain, title, read_minutes, is_medical,
          summary, figure_id, figure_caption, figure_after_index,
          sci_title, sci_read_minutes, reviewed_by_name, reviewed_by_date,
          admin_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        card.id, card.ageKey, card.domain, card.title,
        card.readMinutes, card.isMedical ? 1 : 0,
        summaryJson,
        figureId,
        sci.figure?.caption ?? null,
        sci.figure?.afterSectionIndex ?? null,
        sci.title,
        sci.readMinutes ?? null,
        sci.reviewedBy?.name ?? null,
        sci.reviewedBy?.date ?? null,
        card.adminStatus === 'draft' ? 'draft' : 'published',
      ],
    );
    cardCount++;

    // Cover
    await run('DELETE FROM cms_covers WHERE card_id = ?', [card.id]);
    if (card.photo?.src) {
      await run(
        `INSERT INTO cms_covers (card_id, src, alt, credit) VALUES (?, ?, ?, ?)`,
        [card.id, card.photo.src, card.photo.alt, card.photo.credit ?? null],
      );
      coverCount++;
    }

    // Card sections
    await run('DELETE FROM cms_card_sections WHERE card_id = ?', [card.id]);
    const sections = sci.sections ?? [];
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (isModuleSectionRef(sec)) {
        await run(
          `INSERT INTO cms_card_sections
             (card_id, type, sort, module_id, section_key, judul_override, isi_override)
           VALUES (?, 'module', ?, ?, ?, ?, ?)`,
          [card.id, i, sec.moduleId, sec.sectionKey, sec.judulOverride ?? null, sec.isiOverride ?? null],
        );
      } else if (isOwnSectionRef(sec)) {
        await run(
          `INSERT INTO cms_card_sections (card_id, type, sort, judul, isi)
           VALUES (?, 'own', ?, ?, ?)`,
          [card.id, i, sec.judul, sec.isi],
        );
      } else {
        // legacy plain section { judul, isi }
        const s = sec as { judul: string; isi: string };
        await run(
          `INSERT INTO cms_card_sections (card_id, type, sort, judul, isi)
           VALUES (?, 'own', ?, ?, ?)`,
          [card.id, i, s.judul, s.isi],
        );
      }
      secCount++;
    }

    // Card stats
    await run('DELETE FROM cms_card_stats WHERE card_id = ?', [card.id]);
    const stats = sci.stats ?? [];
    for (let i = 0; i < stats.length; i++) {
      const st = stats[i];
      if (isModuleStatRef(st)) {
        await run(
          `INSERT INTO cms_card_stats (card_id, type, sort, module_id, stat_key)
           VALUES (?, 'module', ?, ?, ?)`,
          [card.id, i, st.moduleId, st.statKey],
        );
      } else if (isOwnStatRef(st)) {
        await run(
          `INSERT INTO cms_card_stats (card_id, type, sort, value, label, source_id)
           VALUES (?, 'own', ?, ?, ?, ?)`,
          [card.id, i, st.value, st.label, st.sourceId],
        );
      } else {
        // legacy: plain { value, label, ref? }
        const s = st as { value: string; label: string; ref?: number };
        await run(
          `INSERT INTO cms_card_stats (card_id, type, sort, value, label, ref)
           VALUES (?, 'legacy', ?, ?, ?, ?)`,
          [card.id, i, s.value, s.label, s.ref ?? null],
        );
      }
      statCount++;
    }
  }

  return { cards: cardCount, sections: secCount, stats: statCount, covers: coverCount };
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------
async function verify(): Promise<string[]> {
  const errors: string[] = [];

  // Count checks
  const [dbDomains] = await all<{ n: number }>('SELECT COUNT(*) AS n FROM cms_domains');
  if (dbDomains.n !== DOMAIN_CONFIGS.length)
    errors.push(`Domain count mismatch: DB=${dbDomains.n}, expected=${DOMAIN_CONFIGS.length}`);

  const srcCount = Object.keys(SOURCES).length;
  const [dbSources] = await all<{ n: number }>('SELECT COUNT(*) AS n FROM cms_sources');
  if (dbSources.n !== srcCount)
    errors.push(`Source count mismatch: DB=${dbSources.n}, expected=${srcCount}`);

  const modCount = Object.keys(MODULES).length;
  const [dbModules] = await all<{ n: number }>('SELECT COUNT(*) AS n FROM cms_modules');
  if (dbModules.n !== modCount)
    errors.push(`Module count mismatch: DB=${dbModules.n}, expected=${modCount}`);

  const [dbCards] = await all<{ n: number }>('SELECT COUNT(*) AS n FROM cms_cards');
  if (dbCards.n !== CARDS.length)
    errors.push(`Card count mismatch: DB=${dbCards.n}, expected=${CARDS.length}`);

  // Orphan [ref:...] token check — every token in cms_module_sections.isi must map to a cms_source
  const sectionRows = await all<{ module_id: string; key: string; isi: string }>(
    'SELECT module_id, key, isi FROM cms_module_sections',
  );
  for (const row of sectionRows) {
    const tokens = extractRefTokens(row.isi);
    for (const tid of tokens) {
      const src = await all<{ id: string }>('SELECT id FROM cms_sources WHERE id = ?', [tid]);
      if (src.length === 0)
        errors.push(`Orphan [ref:${tid}] in module section ${row.module_id}::${row.key}`);
    }
  }

  // Same for own-type card sections
  const ownSectionRows = await all<{ card_id: string; isi: string }>(
    "SELECT card_id, isi FROM cms_card_sections WHERE type = 'own' AND isi IS NOT NULL",
  );
  for (const row of ownSectionRows) {
    const tokens = extractRefTokens(row.isi);
    for (const tid of tokens) {
      const src = await all<{ id: string }>('SELECT id FROM cms_sources WHERE id = ?', [tid]);
      if (src.length === 0)
        errors.push(`Orphan [ref:${tid}] in own section of card ${row.card_id}`);
    }
  }

  // Orphan module refs in cms_card_sections
  const moduleSecRefs = await all<{ card_id: string; module_id: string; section_key: string }>(
    "SELECT card_id, module_id, section_key FROM cms_card_sections WHERE type = 'module'",
  );
  for (const r of moduleSecRefs) {
    const mod = await all<{ n: number }>(
      'SELECT COUNT(*) AS n FROM cms_module_sections WHERE module_id = ? AND key = ?',
      [r.module_id, r.section_key],
    );
    if (mod[0].n === 0)
      errors.push(`Orphan module section ref: card ${r.card_id} → ${r.module_id}::${r.section_key}`);
  }

  // Orphan module refs in cms_card_stats
  const moduleStatRefs = await all<{ card_id: string; module_id: string; stat_key: string }>(
    "SELECT card_id, module_id, stat_key FROM cms_card_stats WHERE type = 'module'",
  );
  for (const r of moduleStatRefs) {
    const stat = await all<{ n: number }>(
      'SELECT COUNT(*) AS n FROM cms_module_stats WHERE module_id = ? AND key = ?',
      [r.module_id, r.stat_key],
    );
    if (stat[0].n === 0)
      errors.push(`Orphan module stat ref: card ${r.card_id} → ${r.module_id}::${r.stat_key}`);
  }

  // Every 'lengkap' card must have summary + ≥1 section
  const lengkapCards = await all<{ id: string; summary: string | null }>(
    `SELECT c.id, c.summary
     FROM cms_cards c
     WHERE c.admin_status = 'published'
       AND c.summary IS NOT NULL
       AND (SELECT COUNT(*) FROM cms_card_sections cs WHERE cs.card_id = c.id) > 0`,
  );
  // Cards with sections but no summary = data anomaly
  const anomalies = await all<{ id: string }>(
    `SELECT c.id FROM cms_cards c
     WHERE c.summary IS NULL
       AND (SELECT COUNT(*) FROM cms_card_sections cs WHERE cs.card_id = c.id) > 0`,
  );
  for (const a of anomalies)
    errors.push(`Card ${a.id} has sections but no summary (should be 'lengkap' but missing summary)`);

  return errors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== seed-content: Studiva CMS Fase 1 ===\n');

  await initDatabase();

  console.log('Seeding domains…');
  const domainCount = await seedDomains();

  console.log('Seeding sources…');
  const sourceCount = await seedSources();

  console.log('Seeding figures…');
  const figureCount = await seedFigures();

  console.log('Seeding modules…');
  const { modules: modCount, sections: modSecCount, stats: modStatCount } = await seedModules();

  console.log('Seeding cards…');
  const { cards: cardCount, sections: cardSecCount, stats: cardStatCount, covers: coverCount } = await seedCards();

  const counts = {
    domains: domainCount,
    sources: sourceCount,
    modules: modCount,
    moduleSections: modSecCount,
    moduleStats: modStatCount,
    figures: figureCount,
    cards: cardCount,
    cardSections: cardSecCount,
    cardStats: cardStatCount,
    covers: coverCount,
  };

  console.log('\n--- Seed counts ---');
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`);

  console.log('\nRunning post-seed verification…');
  const errors = await verify();

  const report: SeedReport = {
    timestamp: new Date().toISOString(),
    counts,
    verification: { pass: errors.length === 0, errors },
  };

  const reportPath = path.resolve(__dirname, '../../seed-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nReport written to ${reportPath}`);

  if (errors.length > 0) {
    console.error('\n❌ Verification FAILED:');
    for (const e of errors) console.error(`  • ${e}`);
    db.close();
    process.exit(1);
  }

  console.log(
    `\n✅ Seed complete — ${domainCount} domains / ${cardCount} cards / ${modCount} modules / ${sourceCount} sources — 0 orphans`,
  );
  db.close();
}

main().catch((err) => {
  console.error('Seed error:', err);
  db.close();
  process.exit(1);
});
