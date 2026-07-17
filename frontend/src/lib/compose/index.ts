// ============================================================================
// Shared compose module — canonical implementation.
// Imported by BOTH frontend (via symlink at src/lib/compose) and backend
// (via symlink at src/lib/compose).  ONE implementation, two execution sites.
//
// Design: pure function — accepts card/modules/sources as parameters; no global
// imports, no framework dependencies, safe to import in Node or browser.
//
// Output is byte-identical to the original hand-written card.scientific shape
// (modulo citation renumbering), so no UI change is required.
// ============================================================================

// ---------------------------------------------------------------------------
// Minimal input types — intentionally independent of React/lucide-react.
// Adapters on each side map their native shapes to these.
// ---------------------------------------------------------------------------

export interface ComposeModuleSection {
  key: string;
  judul: string;
  isi: string;
}

export interface ComposeModuleStat {
  key: string;
  value: string;
  label: string;
  sourceId: string;
}

export interface ComposeModule {
  sections: ComposeModuleSection[];
  stats: ComposeModuleStat[];
}

export interface ComposeSource {
  label: string;
  url?: string;
}

// A section ref in a card's scientific data (matches ScientificSectionRef shape)
type SectionRef =
  | { type: 'module'; moduleId: string; sectionKey: string; judulOverride?: string; isiOverride?: string }
  | { type: 'own'; judul: string; isi: string };

// A stat ref in a card's scientific data (matches ScientificStatRef shape)
type StatRef =
  | { type: 'module'; moduleId: string; statKey: string }
  | { type: 'own'; value: string; label: string; sourceId: string };

// Legacy stat (plain value/label/ref, no sourceId token)
interface LegacyStat {
  value: string;
  label: string;
  ref?: number;
}

// Legacy section (plain judul/isi with [n] markers already in place)
interface LegacySection {
  judul: string;
  isi: string;
}

export interface ComposeFigure {
  id: string;
  caption: string;
  afterSectionIndex?: number;
}

export interface ComposeCard {
  id: string;
  scientific: {
    title: string;
    readMinutes?: number;
    reviewedBy?: { name: string; date: string };
    figure?: ComposeFigure;
    sections?: (SectionRef | LegacySection)[];
    stats?: (StatRef | LegacyStat)[];
    paragraphs?: string[];
  };
}

// ---------------------------------------------------------------------------
// Output types — match the ScientificResolved shape the reader UI expects
// ---------------------------------------------------------------------------

export interface ResolvedStat {
  value: string;
  label: string;
  ref?: number;
}

export interface ResolvedSection {
  judul: string;
  isi: string;
}

export interface ResolvedReference {
  n: number;
  text: string;
  url?: string;
}

export interface ScientificResolved {
  title: string;
  readMinutes?: number;
  reviewedBy?: { name: string; date: string };
  stats?: ResolvedStat[];
  figure?: ComposeFigure;
  sections?: ResolvedSection[];
  references?: ResolvedReference[];
  paragraphs?: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const REF_TOKEN = /\[ref:([^\]]+)\]/g;

function hasType(x: unknown): x is { type: string } {
  return typeof x === 'object' && x !== null && 'type' in (x as object);
}

function isModuleSectionRef(x: unknown): x is { type: 'module'; moduleId: string; sectionKey: string; judulOverride?: string; isiOverride?: string } {
  return hasType(x) && (x as { type: string }).type === 'module' && 'sectionKey' in (x as object);
}

function isOwnSectionRef(x: unknown): x is { type: 'own'; judul: string; isi: string } {
  return hasType(x) && (x as { type: string }).type === 'own' && 'isi' in (x as object);
}

function isModuleStatRef(x: unknown): x is { type: 'module'; moduleId: string; statKey: string } {
  return hasType(x) && (x as { type: string }).type === 'module' && 'statKey' in (x as object);
}

function isOwnStatRef(x: unknown): x is { type: 'own'; value: string; label: string; sourceId: string } {
  return hasType(x) && (x as { type: string }).type === 'own' && 'sourceId' in (x as object);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Resolve a card's composable scientific payload into the concrete shape the
 * reader UI expects: numbered [n] citations + a references list.
 *
 * Legacy / TODO cards (plain sections with [n] markers, or title-only stubs)
 * are passed through untouched.
 *
 * @param card    - card to compose
 * @param modules - keyed record of ComposeModule (by moduleId)
 * @param sources - keyed record of ComposeSource (by sourceId)
 */
export function composeScientific(
  card: ComposeCard,
  modules: Record<string, ComposeModule>,
  sources: Record<string, ComposeSource>,
): ScientificResolved {
  const sci = card.scientific;
  const sections = sci.sections ?? [];
  const stats = sci.stats ?? [];

  // Legacy / TODO cards: any ref-type markers → already in final shape.
  const isNew = sections.some(hasType) || stats.some(hasType);
  if (!isNew) {
    return { ...(sci as unknown as ScientificResolved) };
  }

  // 1. Resolve stats to intermediate { value, label, sourceId? }
  const resolvedStats = stats.map((st) => {
    if (isModuleStatRef(st)) {
      const mod = modules[st.moduleId];
      const ms = mod?.stats.find((s) => s.key === st.statKey);
      if (!ms) throw new Error(`[composeScientific] ${card.id}: unknown module stat ${st.moduleId}::${st.statKey}`);
      return { value: ms.value, label: ms.label, sourceId: ms.sourceId };
    }
    if (isOwnStatRef(st)) {
      return { value: st.value, label: st.label, sourceId: st.sourceId };
    }
    // legacy: plain stat, no sourceId token
    const s = st as LegacyStat;
    return { value: s.value, label: s.label, sourceId: undefined as string | undefined };
  });

  // 2. Resolve sections to { judul, isi } (isi still holds [ref:id] tokens)
  const resolvedSections = sections.map((sec) => {
    if (isModuleSectionRef(sec)) {
      const mod = modules[sec.moduleId];
      const ms = mod?.sections.find((s) => s.key === sec.sectionKey);
      if (!ms) throw new Error(`[composeScientific] ${card.id}: unknown module section ${sec.moduleId}::${sec.sectionKey}`);
      return { judul: sec.judulOverride ?? ms.judul, isi: sec.isiOverride ?? ms.isi };
    }
    if (isOwnSectionRef(sec)) {
      return { judul: sec.judul, isi: sec.isi };
    }
    // legacy: plain { judul, isi }
    const s = sec as LegacySection;
    return { judul: s.judul, isi: s.isi };
  });

  // 3. Number sourceIds by first appearance: stats first, then section tokens
  const order: string[] = [];
  const idx = new Map<string, number>();
  const reg = (id: string) => {
    if (!idx.has(id)) {
      order.push(id);
      idx.set(id, order.length);
    }
    return idx.get(id)!;
  };
  for (const s of resolvedStats) if (s.sourceId) reg(s.sourceId);
  for (const s of resolvedSections) {
    let m: RegExpExecArray | null;
    REF_TOKEN.lastIndex = 0;
    while ((m = REF_TOKEN.exec(s.isi)) !== null) reg(m[1]);
  }

  // 4. Emit final output shapes
  const outStats: ResolvedStat[] = resolvedStats.map((s) => ({
    value: s.value,
    label: s.label,
    ...(s.sourceId ? { ref: idx.get(s.sourceId) } : {}),
  }));

  const outSections: ResolvedSection[] = resolvedSections.map((s) => ({
    judul: s.judul,
    isi: s.isi.replace(REF_TOKEN, (_full: string, id: string) => {
      const n = idx.get(id);
      if (!n) {
        console.warn(`[composeScientific] ${card.id}: unmapped [ref:${id}]`);
        return `[ref:${id}]`;
      }
      return `[${n}]`;
    }),
  }));

  const references: ResolvedReference[] = order.map((id, i) => {
    const src = sources[id];
    if (!src) {
      console.warn(`[composeScientific] ${card.id}: sourceId '${id}' not found in sources`);
      return { n: i + 1, text: `(sumber tak dikenal: ${id})` };
    }
    return { n: i + 1, text: src.label, ...(src.url ? { url: src.url } : {}) };
  });

  return {
    title: sci.title,
    readMinutes: sci.readMinutes,
    reviewedBy: sci.reviewedBy,
    figure: sci.figure,
    stats: outStats.length ? outStats : undefined,
    sections: outSections,
    references: references.length ? references : undefined,
  };
}
