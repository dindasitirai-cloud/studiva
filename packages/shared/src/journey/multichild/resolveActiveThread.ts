// Rekah Journey — deterministic Multi-Child active-thread resolution (Phase 9B-7)
// PURE. resolveActiveThread(input) -> ActiveThreadDecision. Selects WHICH thread is active only.
// No focus/content/FSM/adaptation/persistence. No numeric score. Lexicographic precedence.
import type {
  ActiveThreadInput, ActiveThreadDecision, ActiveThreadProvenance, ThreadPrecedenceDimension,
} from './types';
import type { DevelopmentThread, VersionStamp } from '../types';
import type { DevelopmentThreadId } from '../ids';
import type { ReasonCode } from '../enums';

const decide = (
  input: ActiveThreadInput,
  activeThreadId: DevelopmentThreadId | null,
  provenance: ActiveThreadProvenance,
  reasonCode: ReasonCode,
  reason: string,
  evidence: ThreadPrecedenceDimension[],
): ActiveThreadDecision => {
  const changed = activeThreadId != null && activeThreadId !== input.family.activeThreadId;
  return {
    outcome: activeThreadId ? 'ACTIVE_THREAD' : 'NO_ACTIVE_THREAD',
    activeThreadId,
    provenance,
    requiresChildChange: changed,
    changeChildTrigger: changed ? 'CHANGE_CHILD' : null,
    reasonCode, reason, precedenceEvidence: evidence,
    versions: input.versions, ruleVersion: input.versions.ruleVersion,
  };
};

/**
 * Decide the current active DevelopmentThread for a Family Journey.
 * Precedence (Phase 8A/7A): SAFETY(ownership) > PARENT > CONSTRAINTS > CURRENT-ACTIVE CONTINUITY >
 * ELIGIBILITY > RELEVANCE(low, boolean) > stable TIEBREAK(threadId asc). Never "strongest signal = active".
 */
export const resolveActiveThread = (input: ActiveThreadInput): ActiveThreadDecision => {
  const fam = input.family.familyId;

  // ---- SAFETY / integrity: the journey must belong to this family. ----
  if (input.familyJourney.familyId !== fam) {
    return decide(input, null, 'NO_SELECTION', 'THREAD_OWNERSHIP_REJECTED',
      'FamilyJourney does not belong to this Family; no active thread.', ['SAFETY']);
  }
  const owns = (t: DevelopmentThread) => t.familyId === fam;               // cross-family (== cross-journey) guard
  const excluded = new Set<DevelopmentThreadId>(input.hardExcludedThreadIds ?? []);
  const eligible = input.threads.filter((t) => owns(t) && t.status === 'ACTIVE' && !excluded.has(t.threadId));

  // ---- PARENT: explicit choice is authoritative (must be owned + eligible). ----
  if (input.parentSelectedThreadId != null) {
    const t = input.threads.find((x) => x.threadId === input.parentSelectedThreadId);
    if (!t || !owns(t)) {
      return decide(input, null, 'NO_SELECTION', 'THREAD_OWNERSHIP_REJECTED',
        'Parent-selected thread is unknown or belongs to another family; rejected.', ['SAFETY', 'PARENT']);
    }
    if (!eligible.some((e) => e.threadId === t.threadId)) {
      return decide(input, null, 'NO_SELECTION', 'NO_ELIGIBLE_THREAD',
        'Parent-selected thread is not eligible (archived/inactive/excluded).', ['PARENT', 'CONSTRAINTS', 'ELIGIBILITY']);
    }
    return decide(input, t.threadId, 'PARENT_SELECTED', 'PARENT_CHOICE',
      'Parent explicitly selected this child; it is the active thread.', ['SAFETY', 'PARENT']);
  }

  // ---- CONTINUITY: keep the current active thread if still eligible. ----
  if (input.family.activeThreadId != null) {
    const cur = eligible.find((t) => t.threadId === input.family.activeThreadId);
    if (cur) {
      return decide(input, cur.threadId, 'SYSTEM_SUGGESTED', 'ACTIVE_THREAD_CONTINUITY',
        'Current active thread remains eligible; preserved for continuity.', ['SAFETY', 'CONTINUITY']);
    }
  }

  // ---- No eligible thread -> valid NO_ACTIVE_THREAD (never fabricate a child). ----
  if (eligible.length === 0) {
    return decide(input, null, 'NO_SELECTION', 'NO_ELIGIBLE_THREAD',
      'No eligible thread; the family has no active child thread yet.', ['SAFETY', 'ELIGIBILITY']);
  }

  // ---- SYSTEM SUGGESTION: RELEVANCE (low, boolean) then stable TIEBREAK (threadId asc). ----
  const signal = new Set<DevelopmentThreadId>(input.signalThreadIds ?? []);
  const sorted = [...eligible].sort((a, b) => {
    const sa = signal.has(a.threadId) ? 1 : 0;
    const sb = signal.has(b.threadId) ? 1 : 0;
    if (sb !== sa) return sb - sa;                                          // RELEVANCE (only breaks ties here)
    return (a.threadId as string) < (b.threadId as string) ? -1 : (a.threadId as string) > (b.threadId as string) ? 1 : 0; // TIEBREAK
  });
  const winner = sorted[0];
  return decide(input, winner.threadId, 'SYSTEM_SUGGESTED', 'THREAD_SUGGESTED',
    'System suggested an eligible thread (relevance then stable tie-break); awaiting parent confirmation.',
    ['SAFETY', 'ELIGIBILITY', 'RELEVANCE', 'TIEBREAK']);
};
