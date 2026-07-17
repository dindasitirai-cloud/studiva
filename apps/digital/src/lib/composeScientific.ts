// ============================================================================
// composeScientific — frontend wrapper around the shared canonical implementation.
//
// This file binds the static MODULES and SOURCES data to the pure compose
// function that lives in shared/compose (reached via the symlink at
// src/lib/compose).  The pure function itself has no imports; all data is
// passed as parameters so it can run identically on the backend.
// ============================================================================
import {
  composeScientific as _compose,
  ComposeCard,
  ComposeModule,
  ComposeSource,
  ScientificResolved,
} from '@studiva/shared';
import type { KnowledgeCard } from '../pages/DashboardPages/Tier2/knowledgeCardData';
import { MODULES } from '../pages/DashboardPages/Tier2/modules';
import { SOURCES } from '../pages/DashboardPages/Tier2/sources';

// Re-export types that callers expect from this module
export type { ScientificResolved };

// Build thin adapter views once at module load time
function toComposeModules(): Record<string, ComposeModule> {
  const out: Record<string, ComposeModule> = {};
  for (const [id, mod] of Object.entries(MODULES)) {
    out[id] = {
      sections: mod.sections.map((s) => ({ key: s.key, judul: s.judul, isi: s.isi })),
      stats: mod.stats.map((s) => ({ key: s.key, value: s.value, label: s.label, sourceId: s.sourceId })),
    };
  }
  return out;
}

function toComposeSources(): Record<string, ComposeSource> {
  const out: Record<string, ComposeSource> = {};
  for (const [id, src] of Object.entries(SOURCES)) {
    out[id] = { label: src.label, ...(src.url ? { url: src.url } : {}) };
  }
  return out;
}

const COMPOSE_MODULES = toComposeModules();
const COMPOSE_SOURCES = toComposeSources();

/**
 * Resolve a KnowledgeCard's scientific payload into the concrete shape the
 * reader UI expects.  Output is byte-identical to the pre-refactor output.
 */
export function composeScientific(card: KnowledgeCard): ScientificResolved {
  return _compose(card as unknown as ComposeCard, COMPOSE_MODULES, COMPOSE_SOURCES);
}
