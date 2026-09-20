// Rekah Journey — deterministic Focus Resolution (Phase 9B-4)
// PURE. resolveFocus(input) -> FocusResolution. No content imports, no repository writes,
// no Date/random, no numeric scoring, no diagnosis. Lexicographic precedence (Phase 8A).
import type {
  FocusResolutionInput, FocusResolution, FocusTargets, ProposedFocus, PrecedenceDimension,
} from './types';
import { SOFT_FOCUS_WINDOW_DAYS, ABANDON_SKIP_THRESHOLD } from './types';
import type { FocusSource, SalienceLevel } from '../enums';

/** Canonical focus identity from targets. Stable & deterministic; NOT a content id. */
export const focusKey = (t: FocusTargets): string =>
  [t.value ?? '', t.domainOrArea ?? '', t.capabilityOrTopic ?? ''].join('|');

const daysBetween = (a: string, b: string): number => Math.floor((Date.parse(b) - Date.parse(a)) / 86_400_000);
const SAL_RANK: Record<string, number> = { HIGH: 3, MED: 2, LOW: 1 };
const salRank = (s: SalienceLevel | null | undefined): number => (s ? SAL_RANK[s] : 0);

export interface Cand {
  key: string;
  targets: FocusTargets;
  source: FocusSource;
  contextCompatible: boolean;
  childRelevant: boolean;
  directionAligned: boolean;
  journeyContinuity: boolean;
  salience: SalienceLevel | null;
  novel: boolean;
}

export const resolveFocus = (input: FocusResolutionInput): FocusResolution => {
  const base = { focusId: null, closesFocusId: null, proposed: null, ruleVersion: input.ruleVersion } as const;
  const rejected = new Set(input.rejectedKeys ?? []);
  const reactivated = new Set(input.reactivatedKeys ?? []);
  const constraintBlocked = new Set(input.constraintExcludedKeys ?? []);
  const hardBlocked = new Set(input.hardConstraintKeys ?? []);
  const contextBad = new Set(input.contextIncompatibleKeys ?? []);
  const priorTheme = new Set(input.priorFocusThemeKeys ?? []);
  const recentlyUsed = new Set(input.recentlyUsedKeys ?? []);

  // ---- SAFETY (tier 1): enforced structurally — the resolver never emits a score/diagnosis and
  // never fabricates a focus. The frozen architecture defines no medical safety-triage rule; none is invented.

  // ---- PARENT (tier 2): explicit selection this cycle wins outright ----
  if (input.parentSelectedTargets) {
    const key = focusKey(input.parentSelectedTargets);
    if (hardBlocked.has(key)) {
      return { ...base, outcome: 'NO_FOCUS', reasonCode: 'CONTEXT_FEASIBILITY',
        reason: 'Parent-selected focus is blocked by a hard constraint; no focus set.',
        precedenceEvidence: ['SAFETY', 'PARENT', 'CONSTRAINTS'] };
    }
    const proposed: ProposedFocus = { key, targets: input.parentSelectedTargets, source: 'PARENT_SELECTED', parentConfirmed: true };
    return { ...base, outcome: 'PROPOSE', proposed,
      closesFocusId: input.currentFocus && focusKey(getTargets(input.currentFocus)) !== key ? input.currentFocus.focusId : null,
      reasonCode: 'PARENT_CHOICE', reason: 'Parent explicitly selected this focus; it takes precedence.',
      precedenceEvidence: ['SAFETY', 'PARENT'] };
  }

  // ---- PARENT lifecycle on the current focus, then FOCUS continuity (tier 5) ----
  const cur = input.currentFocus;
  const curActive = !!cur && (cur.status === 'ACTIVE' || cur.status === 'BACKGROUND');
  if (cur && curActive) {
    const ps = input.parentSignals ?? {};
    const ss = input.systemSignals ?? {};
    if (ps.changeRequested) {
      // parent wants a different focus -> fall through to candidate generation, closing the current one
    } else if (ps.pauseRequested) {
      return { ...base, outcome: 'PAUSE', focusId: cur.focusId, reasonCode: 'PARENT_PAUSE',
        reason: 'Parent paused the current focus.', precedenceEvidence: ['SAFETY', 'PARENT'] };
    } else if (ss.completionSignaled) {
      return { ...base, outcome: 'COMPLETE', focusId: cur.focusId, reasonCode: 'STATE_COMPLETE',
        reason: 'Current focus goal met; focus completed.', precedenceEvidence: ['SAFETY', 'PARENT', 'FOCUS'] };
    } else if ((ss.consecutiveSkips ?? 0) >= ABANDON_SKIP_THRESHOLD) {
      return { ...base, outcome: 'ABANDON', focusId: cur.focusId, reasonCode: 'ABANDONED',
        reason: `Current focus skipped ${ss.consecutiveSkips} times; abandonment suggested.`, precedenceEvidence: ['SAFETY', 'FOCUS'] };
    } else {
      const elapsed = cur.startedAt ? daysBetween(cur.startedAt, input.asOf) : 0;
      const pastWindow = elapsed >= SOFT_FOCUS_WINDOW_DAYS;
      if (pastWindow && ps.extendRequested) {
        return { ...base, outcome: 'EXTEND', focusId: cur.focusId, reasonCode: 'FOCUS_CONTINUITY',
          reason: 'Soft window elapsed; parent extended the focus.', precedenceEvidence: ['SAFETY', 'PARENT', 'FOCUS'], reviewDue: true };
      }
      // CONTINUITY of the active focus (tier 5) dominates newer signals (tiers 6-10).
      return { ...base, outcome: 'CONTINUE', focusId: cur.focusId, reasonCode: 'FOCUS_CONTINUITY',
        reason: pastWindow
          ? 'Current focus remains valid; soft 21-day window elapsed (review suggested, not forced).'
          : 'Current focus remains valid and takes precedence over newer signals.',
        precedenceEvidence: ['SAFETY', 'FOCUS'], reviewDue: pastWindow || undefined };
    }
  }

  // ---- Candidate generation (NO content sources) ----
  const cands: Cand[] = [];
  for (const o of input.observations ?? []) {
    if (o.effectiveLifecycle === 'EXPIRED' || o.effectiveLifecycle === 'RETRACTED') continue; // never revive
    const targets: FocusTargets = { domainOrArea: o.signal.domainOrArea ?? undefined, capabilityOrTopic: o.signal.capabilityOrTopic ?? undefined };
    const key = focusKey(targets);
    cands.push({ key, targets, source: 'SYSTEM_SUGGESTED', contextCompatible: !contextBad.has(key),
      childRelevant: true, directionAligned: false, journeyContinuity: priorTheme.has(key),
      salience: o.effectiveSalience, novel: !recentlyUsed.has(key) });
  }
  const dirs = input.directionValues ?? [];
  if (dirs.length > 0) {
    const targets: FocusTargets = { value: dirs[0] };
    const key = focusKey(targets);
    cands.push({ key, targets, source: 'SYSTEM_DERIVED', contextCompatible: !contextBad.has(key),
      childRelevant: false, directionAligned: true, journeyContinuity: priorTheme.has(key),
      salience: null, novel: !recentlyUsed.has(key) });
  }

  // ---- CONSTRAINTS (tier 3) + rejection memory (parent) ----
  const eligible = dedupe(cands).filter((c) =>
    !constraintBlocked.has(c.key) && !hardBlocked.has(c.key) &&
    (!rejected.has(c.key) || reactivated.has(c.key)));

  if (eligible.length === 0) {
    return { ...base, outcome: 'NO_FOCUS',
      closesFocusId: cur && curActive && (input.parentSignals?.changeRequested ?? false) ? cur.focusId : null,
      reasonCode: 'NO_ELIGIBLE_CONTENT',
      reason: 'No eligible focus candidate (none supplied, all blocked, or all rejected). No focus fabricated.',
      precedenceEvidence: ['SAFETY', 'PARENT', 'CONSTRAINTS'] };
  }

  // ---- Lexicographic precedence: CONTEXT(4) > CHILD(6) > DIRECTION(7) > CONTINUITY(8) > RELEVANCE(9) > NOVELTY(10) > TIEBREAK ----
  const winner = [...eligible].sort(compareCandidates)[0];
  const source = winner.source;
  const proposed: ProposedFocus = { key: winner.key, targets: winner.targets, source, parentConfirmed: false };
  const reasonCode = winner.targets.value ? 'FAMILY_DIRECTION' : 'OBSERVATION_SIGNAL';
  return { ...base, outcome: 'PROPOSE', proposed,
    closesFocusId: cur && curActive && (input.parentSignals?.changeRequested ?? false) ? cur.focusId : null,
    reasonCode, reason: describe(winner),
    precedenceEvidence: evidenceFor(winner), winningSalience: winner.salience };
};

// ---- helpers ----
function getTargets(f: { informedByObservationIds: readonly unknown[] }): FocusTargets {
  // Focus (9B-1) carries no targets field; a current focus is compared by identity only when the
  // parent selects a different one. We treat an unknown current-focus target as an opaque key.
  return {};
}
function dedupe(cands: Cand[]): Cand[] {
  const byKey = new Map<string, Cand>();
  const rank = (s: FocusSource): number => (s === 'PARENT_SELECTED' ? 3 : s === 'SYSTEM_SUGGESTED' ? 2 : 1);
  for (const c of cands) {
    const prev = byKey.get(c.key);
    if (!prev) { byKey.set(c.key, c); continue; }
    // merge: keep the higher-authority source and the OR of positive signals (deterministic)
    byKey.set(c.key, {
      ...prev,
      source: rank(c.source) > rank(prev.source) ? c.source : prev.source,
      contextCompatible: prev.contextCompatible && c.contextCompatible,
      childRelevant: prev.childRelevant || c.childRelevant,
      directionAligned: prev.directionAligned || c.directionAligned,
      journeyContinuity: prev.journeyContinuity || c.journeyContinuity,
      salience: salRank(c.salience) > salRank(prev.salience) ? c.salience : prev.salience,
      novel: prev.novel && c.novel,
    });
  }
  return [...byKey.values()];
}
export function compareCandidates(a: Cand, b: Cand): number {
  const dims: number[] = [
    Number(b.contextCompatible) - Number(a.contextCompatible), // CONTEXT
    Number(b.childRelevant) - Number(a.childRelevant),         // CHILD
    Number(b.directionAligned) - Number(a.directionAligned),   // DIRECTION
    Number(b.journeyContinuity) - Number(a.journeyContinuity), // CONTINUITY
    salRank(b.salience) - salRank(a.salience),                 // RELEVANCE
    Number(b.novel) - Number(a.novel),                         // NOVELTY
  ];
  for (const d of dims) if (d !== 0) return d;
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;          // deterministic stable TIEBREAK (key asc)
}
function evidenceFor(c: Cand): PrecedenceDimension[] {
  const e: PrecedenceDimension[] = ['SAFETY'];
  if (c.contextCompatible) e.push('CONTEXT');
  if (c.childRelevant) e.push('CHILD');
  if (c.directionAligned) e.push('DIRECTION');
  if (c.journeyContinuity) e.push('CONTINUITY');
  if (c.salience) e.push('RELEVANCE');
  if (c.novel) e.push('NOVELTY');
  e.push('TIEBREAK');
  return e;
}
function describe(c: Cand): string {
  if (c.targets.value) return `Proposed a Direction-aligned focus on the value "${c.targets.value}".`;
  return `Proposed a focus from a child observation signal (${c.targets.domainOrArea ?? ''}${c.targets.capabilityOrTopic ? ' / ' + c.targets.capabilityOrTopic : ''}).`;
}
