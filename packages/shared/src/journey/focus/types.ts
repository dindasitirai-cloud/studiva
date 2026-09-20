// Rekah Journey — Focus Resolution contract (Phase 9B-4)
// PURE focus decision types. Focus != content. No content_id, no mappings, no scoring.
import type { Focus, FamilyValue } from '../types';
import type { FocusId, DevelopmentThreadId, IsoTimestamp } from '../ids';
import type { FocusSource, SalienceLevel, ReasonCode } from '../enums';
import type { EffectiveObservation } from '../types';
import type { RuleVersion } from '../types';

/** The semantic target of a focus (reuses the Phase 9B-1 FocusCandidate.targets shape). */
export interface FocusTargets {
  readonly domainOrArea?: string;      // canonical DevelopmentDomain or KnowledgeArea label
  readonly capabilityOrTopic?: string;
  readonly value?: FamilyValue;        // one of the frozen 12 Nilai Akar
}

/** Lifecycle / proposal outcomes (Phase 8A). CHANGE is realized as PROPOSE + closesFocusId. */
export type FocusOutcome = 'CONTINUE' | 'EXTEND' | 'COMPLETE' | 'ABANDON' | 'PAUSE' | 'PROPOSE' | 'NO_FOCUS';

/** The 10 precedence dimensions (Phase 8A authoritative order) used as explanation evidence. */
export type PrecedenceDimension =
  | 'SAFETY' | 'PARENT' | 'CONSTRAINTS' | 'CONTEXT' | 'FOCUS'
  | 'CHILD' | 'DIRECTION' | 'CONTINUITY' | 'RELEVANCE' | 'NOVELTY' | 'TIEBREAK';

/** A focus the resolver proposes for parent confirmation (not yet a persisted Focus). */
export interface ProposedFocus {
  readonly key: string;                // canonical focus identity (derived from targets)
  readonly targets: FocusTargets;
  readonly source: FocusSource;        // SYSTEM_SUGGESTED | SYSTEM_DERIVED | PARENT_SELECTED
  readonly parentConfirmed: boolean;   // true only for PARENT_SELECTED
}

/** Explicit, content-free input. Time is `asOf` (no hidden clock). */
export interface FocusResolutionInput {
  readonly asOf: IsoTimestamp;
  readonly ruleVersion: RuleVersion;
  readonly activeThreadId: DevelopmentThreadId;
  readonly currentFocus: Focus | null;
  /** Parent explicitly chose a focus this cycle (highest non-safety authority). */
  readonly parentSelectedTargets?: FocusTargets | null;
  readonly parentSignals?: {
    readonly changeRequested?: boolean;
    readonly pauseRequested?: boolean;
    readonly extendRequested?: boolean;
  };
  readonly systemSignals?: {
    readonly completionSignaled?: boolean;   // focus goal met (supplied, not inferred)
    readonly consecutiveSkips?: number;      // for the >=5 abandon rule
  };
  /** Already-decayed observations (expired/retracted excluded upstream; double-guarded here). */
  readonly observations?: readonly EffectiveObservation[];
  /** Ordered family Direction values (index 0 = highest). Canonical 12 Nilai Akar only. */
  readonly directionValues?: readonly FamilyValue[];
  readonly contextIncompatibleKeys?: readonly string[]; // keys made infeasible by current dynamic context
  readonly constraintExcludedKeys?: readonly string[];  // parent hard constraints / exclusions
  readonly hardConstraintKeys?: readonly string[];      // can block even a parent-selected focus (rare)
  readonly rejectedKeys?: readonly string[];            // parent-rejected — not re-proposed
  readonly reactivatedKeys?: readonly string[];         // explicit reactivation of a rejected key
  readonly priorFocusThemeKeys?: readonly string[];     // recent theme (continuity, anti-repetition)
  readonly recentlyUsedKeys?: readonly string[];        // for novelty (lowest tier)
}

export interface FocusResolution {
  readonly outcome: FocusOutcome;
  readonly focusId: FocusId | null;          // set for lifecycle ops on the existing focus
  readonly closesFocusId: FocusId | null;    // set when a parent CHANGE closes the current focus
  readonly proposed: ProposedFocus | null;   // set for PROPOSE
  readonly reasonCode: ReasonCode;
  readonly reason: string;
  readonly precedenceEvidence: readonly PrecedenceDimension[];
  readonly ruleVersion: RuleVersion;
  /** Present only when the soft 21-day window has elapsed and a review is suggested (not forced). */
  readonly reviewDue?: boolean;
  /** Diagnostic: the qualitative salience of the winning signal (never a numeric score). */
  readonly winningSalience?: SalienceLevel | null;
}

/** Soft focus window (Phase 8A §J): 21 days. It PROMPTS review; it never auto-expires a focus. */
export const SOFT_FOCUS_WINDOW_DAYS = 21;
/** Consecutive-skip threshold for an abandon suggestion (Phase 8A §J). */
export const ABANDON_SKIP_THRESHOLD = 5;
