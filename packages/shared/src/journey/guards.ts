// Rekah Journey Engine — structural type guards (Phase 9B-1)
// STRUCTURE-ONLY validation. These narrow types and validate membership in a closed
// vocabulary. They contain NO journey business logic (no "shouldMoveToNextState", etc.).

import {
  JOURNEY_ROLES, JOURNEY_STATES, TRANSITION_TRIGGERS, SIDE_TRANSITIONS, FOCUS_STATUSES,
  FOCUS_SOURCES, OBSERVATION_LIFECYCLES, FALLBACK_STATUSES, ADAPTATION_OUTCOMES,
  PARENT_ACTION_TYPES, ENGINE_RESULT_KINDS, MAPPING_STATUSES,
} from './enums';
import type {
  JourneyRole, JourneyState, TransitionTrigger, SideTransition, FocusStatus, FocusSource,
  ObservationLifecycle, FallbackStatus, AdaptationOutcome, ParentActionType, EngineResultKind,
} from './enums';
import type { CanonicalJourneyContentMapping, JourneyContentMapping, Focus, ParentSelectedFocus } from './types';

const inList = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === 'string' && (list as readonly string[]).includes(v);

export const isJourneyRole = (v: unknown): v is JourneyRole => inList(JOURNEY_ROLES, v);
export const isJourneyState = (v: unknown): v is JourneyState => inList(JOURNEY_STATES, v);
export const isTransitionTrigger = (v: unknown): v is TransitionTrigger => inList(TRANSITION_TRIGGERS, v);
export const isSideTransition = (v: unknown): v is SideTransition => inList(SIDE_TRANSITIONS, v);
export const isFocusStatus = (v: unknown): v is FocusStatus => inList(FOCUS_STATUSES, v);
export const isFocusSource = (v: unknown): v is FocusSource => inList(FOCUS_SOURCES, v);
export const isObservationLifecycle = (v: unknown): v is ObservationLifecycle => inList(OBSERVATION_LIFECYCLES, v);
export const isFallbackStatus = (v: unknown): v is FallbackStatus => inList(FALLBACK_STATUSES, v);
export const isAdaptationOutcome = (v: unknown): v is AdaptationOutcome => inList(ADAPTATION_OUTCOMES, v);
export const isParentActionType = (v: unknown): v is ParentActionType => inList(PARENT_ACTION_TYPES, v);
export const isEngineResultKind = (v: unknown): v is EngineResultKind => inList(ENGINE_RESULT_KINDS, v);
export const isMappingStatus = (v: unknown): v is 'CANONICAL' | 'CANDIDATE' => inList(MAPPING_STATUSES, v);

/** Narrow a mapping to the canonical variant the engine is allowed to consume. */
export const isCanonicalMapping = (m: JourneyContentMapping): m is CanonicalJourneyContentMapping =>
  m.mappingStatus === 'CANONICAL';

/** Narrow a focus to the parent-selected (always-confirmed) variant. */
export const isParentSelectedFocus = (f: Focus): f is ParentSelectedFocus => f.source === 'PARENT_SELECTED';

/** Exhaustiveness helper for discriminated-union switches. */
export const assertNever = (x: never): never => {
  throw new Error(`Unexpected value: ${String(x)}`);
};
