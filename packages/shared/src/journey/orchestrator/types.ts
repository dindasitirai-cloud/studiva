// Rekah Journey — Full Engine Orchestration contract (Phase 9B-8)
// The CONDUCTOR: pure routing over the six authoritative modules. No new decision logic.
import type { VersionStamp, EngineResult } from '../types';
import type { IdempotencyKey } from '../ids';
import type { TransitionTrigger, Actor } from '../enums';
import type { CanonicalState, OverrideTarget, TransitionDecision } from '../engine/types';
import type { ActiveThreadInput, ActiveThreadDecision } from '../multichild/types';
import type { FocusResolutionInput, FocusResolution } from '../focus/types';
import type { ContentSelectionInput, ContentSelectionDecision } from '../content/types';
import type { AdaptationInput, AdaptationDecision } from '../adaptation/types';
import type { RuleVersion } from '../types';
import type { ReasonCode } from '../enums';

/** One journey step. The caller supplies the current FSM position, an explicit trigger, and the
 * fully-formed module inputs. The orchestrator NEVER builds decision inputs itself. */
export interface JourneyEngineStepInput {
  readonly currentState: CanonicalState;
  readonly paused: boolean;
  readonly resumeState: CanonicalState | null;
  readonly trigger: TransitionTrigger;
  readonly actor: Actor;
  readonly overrideTarget?: OverrideTarget;
  readonly versions: VersionStamp;
  readonly idempotencyKey: IdempotencyKey;
  // Fully-formed inputs for the authoritative modules (used only when the destination requires them):
  readonly activeThreadInput?: ActiveThreadInput;
  readonly focusInput?: FocusResolutionInput;
  readonly contentInput?: ContentSelectionInput;
  readonly adaptationInput?: AdaptationInput;
}

/** The orchestrator return: the reused EngineResult (headline) + each module's raw decision
 * (for the outer application service to persist). This COMPOSES existing contracts; it is not a new one. */
export interface JourneyStepResult {
  readonly result: EngineResult;                    // reused 9B-1 discriminated union
  readonly transition: TransitionDecision;          // authoritative FSM decision (9B-3)
  readonly activeThread: ActiveThreadDecision | null; // 9B-7
  readonly focus: FocusResolution | null;           // 9B-4
  readonly content: ContentSelectionDecision | null;// 9B-5
  readonly adaptation: AdaptationDecision | null;   // 9B-6
  readonly nextState: CanonicalState;
  readonly reasonCode: ReasonCode;
  readonly versions: VersionStamp;
  readonly ruleVersion: RuleVersion;
}
