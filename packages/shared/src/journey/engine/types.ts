// Rekah Journey — deterministic FSM contract types (Phase 9B-3)
// PURE state-transition types. No content, focus, adaptation, persistence, or scoring.
import type { JourneyState, TransitionTrigger, SideTransition, Actor, ReasonCode, EngineResultKind } from '../enums';
import type { RuleVersion } from '../types';

/** The 7 canonical FSM states. PAUSED is NOT here — it is a lifecycle/projection condition. */
export type CanonicalState = Exclude<JourneyState, 'PAUSED'>;
export const CANONICAL_STATES: readonly CanonicalState[] = ['GROUND', 'NOTICE', 'FOCUS', 'PREPARE', 'DO', 'REFLECT', 'ADAPT'];

/** How an OVERRIDE resolves (parent chose a new focus vs a new step). Supplied by the caller, not inferred. */
export type OverrideTarget = 'FOCUS' | 'STEP';

/** Pure FSM input. `paused`/`resumeState` reflect the persisted lifecycle condition from Phase 9B-2. */
export interface FsmInput {
  readonly currentState: CanonicalState;   // canonical state (one of the 7)
  readonly paused: boolean;                // lifecycle condition, not a canonical state
  readonly resumeState: CanonicalState | null;
  readonly trigger: TransitionTrigger;
  readonly actor: Actor;
  readonly overrideTarget?: OverrideTarget; // only used when trigger = OVERRIDE
  readonly ruleVersion: RuleVersion;
}

/** Pure FSM output. Contains everything needed to explain and persist the transition (persistence happens elsewhere). */
export interface TransitionDecision {
  readonly allowed: boolean;
  readonly fromState: CanonicalState;
  readonly trigger: TransitionTrigger;
  readonly toState: CanonicalState;         // canonical state after the transition (== from for PAUSE)
  readonly sideTransition: SideTransition | null;
  readonly lifecycle: 'RUNNING' | 'PAUSED'; // PAUSE sets PAUSED; RESUME clears it
  readonly resumeState: CanonicalState | null;
  readonly reasonCode: ReasonCode;
  readonly ruleId: string;                  // stable identifier of the matched rule
  readonly ruleVersion: RuleVersion;        // carried through for reproducibility
  readonly result: EngineResultKind;        // OK | PAUSED | PARENT_OVERRIDE | NO_MATCH | INVALID_STATE
}
