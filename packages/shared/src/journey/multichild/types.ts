// Rekah Journey — Multi-Child Orchestration contract (Phase 9B-7)
// PURE active-thread selection. One family journey, many threads, one active at a time.
// No focus/content/FSM/adaptation/persistence. No numeric score.
import type { Family, FamilyJourney, DevelopmentThread, VersionStamp } from '../types';
import type { DevelopmentThreadId, FamilyId } from '../ids';
import type { ReasonCode } from '../enums';
import type { RuleVersion } from '../types';

/** Provenance of the active-thread choice (reuses the PARENT_SELECTED / SYSTEM_SUGGESTED concept). */
export type ActiveThreadProvenance = 'PARENT_SELECTED' | 'SYSTEM_SUGGESTED' | 'NO_SELECTION';

export interface ActiveThreadInput {
  readonly versions: VersionStamp;
  readonly family: Family;                       // holds current activeThreadId
  readonly familyJourney: FamilyJourney;         // one-per-family; validated against family
  readonly threads: readonly DevelopmentThread[];// available threads (any family — filtered by ownership)
  readonly parentSelectedThreadId?: DevelopmentThreadId | null; // explicit parent choice (highest authority)
  readonly hardExcludedThreadIds?: readonly DevelopmentThreadId[];
  /** Low-priority boolean relevance signals (e.g. a thread has a fresh observation). NEVER a score. */
  readonly signalThreadIds?: readonly DevelopmentThreadId[];
}

export type ActiveThreadOutcome = 'ACTIVE_THREAD' | 'NO_ACTIVE_THREAD';
export type ThreadPrecedenceDimension =
  | 'SAFETY' | 'PARENT' | 'CONSTRAINTS' | 'CONTINUITY' | 'ELIGIBILITY' | 'RELEVANCE' | 'TIEBREAK';

export interface ActiveThreadDecision {
  readonly outcome: ActiveThreadOutcome;
  readonly activeThreadId: DevelopmentThreadId | null;
  readonly provenance: ActiveThreadProvenance;
  /** True when the chosen active thread differs from family.activeThreadId. */
  readonly requiresChildChange: boolean;
  /** A trigger for the OUTER FSM layer to run — NOT executed here. */
  readonly changeChildTrigger: 'CHANGE_CHILD' | null;
  readonly reasonCode: ReasonCode;
  readonly reason: string;
  readonly precedenceEvidence: readonly ThreadPrecedenceDimension[];
  readonly versions: VersionStamp;
  readonly ruleVersion: RuleVersion;
}

/**
 * Family-level parenting-practice dedup key (Phase 8A). Intentionally (content_id, family, week) —
 * NOT (content_id, child, week) — so a shared practice is not re-surfaced per child in the same week.
 * Provided as a helper; content selection (Phase 9B-5) consumes it. This layer never selects content.
 */
export const familyPracticeDedupKey = (contentId: string, familyId: FamilyId, weekKey: string): string =>
  `${contentId}::${familyId}::${weekKey}`;

/** Focus identity is (threadId, focusId) — identical focus keys across children never merge. */
export const threadFocusIdentity = (threadId: DevelopmentThreadId, focusId: string): string =>
  `${threadId}::${focusId}`;
