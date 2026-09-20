// Rekah Journey — Reflection -> Adaptation contract (Phase 9B-6)
// PURE adaptation decision types. Reflection is not a score; adaptation is not diagnosis.
import type { Reflection, VersionStamp, EffectiveObservation } from '../types';
import type { FocusId, DevelopmentThreadId } from '../ids';
import type { AdaptationOutcome, AdaptationTriggeredBy, ReasonCode } from '../enums';
import type { RuleVersion } from '../types';

/** Parent intent vs system interpretation. Never conflated (reuses the FocusSource concept). */
export type AdaptationProvenance = 'PARENT_SELECTED' | 'SYSTEM_DERIVED';

/** A focus-lifecycle signal produced upstream (by Phase 9B-4), NOT decided here. */
export type FocusLifecycleSignal = 'COMPLETED' | 'ABANDONED' | 'CHANGE_REQUESTED';

/** Explicit, content-free input. No time read internally (caller supplies everything). */
export interface AdaptationInput {
  readonly versions: VersionStamp;
  readonly focusId: FocusId | null;                 // current focus identity (preserved, never mutated)
  readonly threadId: DevelopmentThreadId;           // supplied thread context (never switched)
  readonly reflection: Reflection | null;           // frozen 9B-1 Reflection; null = "no reflection"
  /** An explicit parent adaptation decision (highest authority). */
  readonly parentChosenOutcome?: AdaptationOutcome | null;
  /** A rare hard journey constraint that forces an outcome. */
  readonly hardConstraint?: AdaptationOutcome | null;
  /** Focus-lifecycle outcome from resolveFocus (e.g. focus completed/abandoned). */
  readonly focusLifecycleSignal?: FocusLifecycleSignal | null;
  /** Optional already-effective observations; expired/retracted are ignored, never revived. */
  readonly supportingSignals?: readonly EffectiveObservation[];
}

export interface AdaptationDecision {
  readonly outcome: AdaptationOutcome;
  readonly provenance: AdaptationProvenance;
  readonly triggeredBy: AdaptationTriggeredBy;      // REFLECTION | DO_OUTCOME | NO_REFLECTION_DEFAULT
  readonly focusId: FocusId | null;                 // echoed current focus; NEVER a new focus
  readonly preserveFocus: boolean;                  // false only for CHANGE_FOCUS / EXIT
  readonly reasonCode: ReasonCode;
  readonly reason: string;
  readonly versions: VersionStamp;
  readonly ruleVersion: RuleVersion;
}

/** Outcomes the SYSTEM may infer from reflection. EXPLORE_DEEPER/CHANGE_FOCUS/EXIT/PAUSE require parent or lifecycle. */
export const SYSTEM_INFERABLE_OUTCOMES: readonly AdaptationOutcome[] = ['CONTINUE', 'REPEAT', 'SIMPLIFY', 'CHANGE_APPROACH'];
