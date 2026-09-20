// Rekah Journey Engine — closed string-literal vocabularies (Phase 9B-1)
// These mirror the FROZEN Phase 7A/7B/8A/9A specifications exactly. No role, state,
// status, or outcome is added beyond the specification. Const tuples back the structural
// type guards in guards.ts (single source of truth for both the union and the runtime list).

// ---- Journey Roles (Phase 7B — the 6 canonical roles) ----
export const JOURNEY_ROLES = ['UNDERSTAND', 'NOTICE', 'ROUTINE', 'DO', 'CONNECT', 'PARENT_IMPLEMENTATION'] as const;
export type JourneyRole = (typeof JOURNEY_ROLES)[number];

// ---- FSM persistent states (Phase 8A) — plus PAUSED, the one persistent side-state ----
export const JOURNEY_STATES = ['GROUND', 'NOTICE', 'FOCUS', 'PREPARE', 'DO', 'REFLECT', 'ADAPT', 'PAUSED'] as const;
export type JourneyState = (typeof JOURNEY_STATES)[number];

// ---- Side transitions / triggers (Phase 8A). A trigger is an EVENT, not a persistent state. ----
export const TRANSITION_TRIGGERS = [
  'FOUNDATION_SET', 'OBSERVED', 'SKIPPED', 'TIMEOUT', 'FOCUS_SELECTED', 'FOCUS_DEFERRED',
  'PREPARED', 'ACTED', 'REFLECTED', 'CONTINUE', 'REPEAT', 'SIMPLIFY', 'CHANGE_APPROACH',
  'CHANGE_CONTEXT', 'EXPLORE_DEEPER', 'CHANGE_FOCUS', 'PAUSE', 'RESUME', 'SKIP',
  'OVERRIDE', 'CHANGE_CHILD', 'NO_MATCH', 'ABANDON', 'EXIT', 'INVALID',
] as const;
export type TransitionTrigger = (typeof TRANSITION_TRIGGERS)[number];

/** Side transitions are triggers that may fire from many states; they are NOT FSM states. */
export const SIDE_TRANSITIONS = ['PAUSE', 'SKIP', 'OVERRIDE', 'CHANGE_CHILD', 'CHANGE_CONTEXT', 'NO_MATCH', 'ABANDON', 'RESUME'] as const;
export type SideTransition = (typeof SIDE_TRANSITIONS)[number];

// ---- Focus (Phase 9A) ----
export const FOCUS_STATUSES = ['PROPOSED', 'ACTIVE', 'BACKGROUND', 'PAUSED', 'COMPLETED', 'ABANDONED', 'EXPIRED', 'REJECTED'] as const;
export type FocusStatus = (typeof FOCUS_STATUSES)[number];

export const FOCUS_SOURCES = ['PARENT_SELECTED', 'SYSTEM_SUGGESTED', 'SYSTEM_DERIVED'] as const;
export type FocusSource = (typeof FOCUS_SOURCES)[number];

export const FOCUS_SCOPES = ['THREAD', 'FAMILY'] as const;
export type FocusScope = (typeof FOCUS_SCOPES)[number];

// ---- Observation (Phase 9A) ----
export const OBSERVATION_LIFECYCLES = ['ACTIVE', 'SOFT_DECAY', 'EXPIRED', 'RETRACTED'] as const;
export type ObservationLifecycle = (typeof OBSERVATION_LIFECYCLES)[number];

export const OBSERVATION_SOURCES = ['PARENT_OBSERVATION', 'PARENT_SELECTED_CONCERN', 'FAMILY_CONTEXT', 'JOURNEY_HISTORY', 'CONTENT_ASSISTED'] as const;
export type ObservationSource = (typeof OBSERVATION_SOURCES)[number];

/** Qualitative salience only — NEVER a numeric developmental score. */
export const SALIENCE_LEVELS = ['HIGH', 'MED', 'LOW'] as const;
export type SalienceLevel = (typeof SALIENCE_LEVELS)[number];

/** Axis a signal points at (Development or Knowledge). Family axis is not an observation axis. */
export const SIGNAL_AXES = ['DEVELOPMENT', 'KNOWLEDGE'] as const;
export type SignalAxis = (typeof SIGNAL_AXES)[number];

// ---- Persistence tier (Phase 8A/9A) — DISTINCT from lifecycle state ----
export const PERSISTENCE_TIERS = ['PERSISTENT', 'SOFT_DECAY', 'HARD_EXPIRE'] as const;
export type PersistenceTier = (typeof PERSISTENCE_TIERS)[number];

// ---- Context (Phase 9A) ----
export const CONTEXT_KINDS = ['STABLE', 'DYNAMIC', 'TEMPORARY'] as const;
export type ContextKind = (typeof CONTEXT_KINDS)[number];

// ---- Action instance (Phase 9A) ----
export const ACTION_ORIGINS = ['CONTENT', 'PARENT_AUTHORED'] as const;
export type ActionOrigin = (typeof ACTION_ORIGINS)[number];

export const ACTION_STATUSES = ['SUGGESTED', 'ACCEPTED', 'MODIFIED', 'STARTED', 'DONE', 'PARTIAL', 'SKIPPED', 'REJECTED', 'ABANDONED'] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

// ---- Content exposure (Phase 9A) ----
export const EXPOSURE_TYPES = ['SURFACED', 'OPENED', 'STARTED', 'COMPLETED', 'SKIPPED', 'REJECTED', 'REPEATED', 'REUSED_OTHER_CHILD'] as const;
export type ExposureType = (typeof EXPOSURE_TYPES)[number];

// ---- Journey stage a mapping/action belongs to (subset of FSM used for content) ----
export const CONTENT_STAGES = ['NOTICE', 'PREPARE', 'DO'] as const;
export type ContentStage = (typeof CONTENT_STAGES)[number];

// ---- Fallback (Phase 7B/8A) — three-state, never a boolean ----
export const FALLBACK_STATUSES = ['PRIMARY_MATCH', 'FALLBACK_MATCH', 'NO_MATCH'] as const;
export type FallbackStatus = (typeof FALLBACK_STATUSES)[number];

// ---- Reflection (Phase 9A) — qualitative one-tap enums, never scores ----
export const REFLECTION_CHILD_RESPONSES = ['ENGAGED', 'NEUTRAL', 'RESISTANT', 'UNCLEAR'] as const;
export type ReflectionChildResponse = (typeof REFLECTION_CHILD_RESPONSES)[number];
export const REFLECTION_DIFFICULTIES = ['EASY', 'OK', 'TOO_HARD'] as const;
export type ReflectionDifficulty = (typeof REFLECTION_DIFFICULTIES)[number];
export const REFLECTION_RELEVANCES = ['RELEVANT', 'NEUTRAL', 'NOT_RELEVANT'] as const;
export type ReflectionRelevance = (typeof REFLECTION_RELEVANCES)[number];

// ---- Adaptation outcomes (Phase 8A/9A) ----
export const ADAPTATION_OUTCOMES = ['CONTINUE', 'REPEAT', 'SIMPLIFY', 'CHANGE_APPROACH', 'CHANGE_CONTEXT', 'EXPLORE_DEEPER', 'CHANGE_FOCUS', 'PAUSE', 'EXIT'] as const;
export type AdaptationOutcome = (typeof ADAPTATION_OUTCOMES)[number];

export const ADAPTATION_TRIGGERED_BY = ['REFLECTION', 'DO_OUTCOME', 'NO_REFLECTION_DEFAULT'] as const;
export type AdaptationTriggeredBy = (typeof ADAPTATION_TRIGGERED_BY)[number];

// ---- Parent agency events (Phase 9A) ----
export const PARENT_ACTION_TYPES = ['ACCEPT', 'REJECT', 'SKIP', 'PAUSE', 'RESUME', 'OVERRIDE', 'CHANGE_FOCUS', 'CHANGE_CHILD', 'MODIFY'] as const;
export type ParentActionType = (typeof PARENT_ACTION_TYPES)[number];

// ---- Actors (Phase 9A) ----
export const ACTORS = ['SYSTEM', 'PARENT'] as const;
export type Actor = (typeof ACTORS)[number];

// ---- Engine decision types (Phase 9A) ----
export const DECISION_TYPES = ['TRANSITION', 'FOCUS_RECOMMENDATION', 'CONTENT_SELECTION', 'ADAPTATION'] as const;
export type DecisionType = (typeof DECISION_TYPES)[number];

// ---- Mapping status (Phase 7B/9A) ----
export const MAPPING_STATUSES = ['CANONICAL', 'CANDIDATE'] as const;
export type JourneyMappingStatus = (typeof MAPPING_STATUSES)[number];

export const MAPPING_CONFIDENCES = ['HIGH', 'MEDIUM', 'LOW'] as const;
export type MappingConfidence = (typeof MAPPING_CONFIDENCES)[number];

// ---- Engine result kinds (Phase 9A) — normal product states, not generic errors ----
export const ENGINE_RESULT_KINDS = [
  'OK', 'INSUFFICIENT_CONTEXT', 'NO_FOCUS', 'NO_MATCH', 'FALLBACK_ONLY',
  'PARENT_OVERRIDE', 'INVALID_STATE', 'STALE_STATE', 'CONFLICT', 'PAUSED',
] as const;
export type EngineResultKind = (typeof ENGINE_RESULT_KINDS)[number];

// ---- Reason codes (extensible controlled list; the AM gap is explicit) ----
export const REASON_CODES = [
  // Content/focus-decision reasons (Phase 9B-1)
  'PRIMARY_MATCH_SELECTED', 'AM_AGE_GAP_FALLBACK', 'NO_ELIGIBLE_CONTENT', 'PARENT_CHOICE',
  'FOCUS_CONTINUITY', 'OBSERVATION_SIGNAL', 'FAMILY_DIRECTION', 'CONTEXT_FEASIBILITY',
  'REPEATED_REJECTION_WIDEN', 'SIGNAL_EXPIRED', 'DEDUP_SUPPRESSED',
  // FSM transition reasons (Phase 9B-3 — additive extension of the same controlled list)
  'FOUNDATION_SET', 'STATE_COMPLETE', 'FOCUS_SELECTED', 'FOCUS_DEFERRED', 'PARENT_PAUSE',
  'PARENT_RESUME', 'PARENT_SKIP', 'PARENT_OVERRIDE', 'CHILD_CHANGED', 'CONTEXT_CHANGED',
  'NO_MATCH_ROUTED', 'ABANDONED', 'INVALID_TRANSITION',
  // Adaptation reason (Phase 9B-6 — additive; all other adaptation reasons reuse existing codes)
  'ADAPT_CHANGE_APPROACH',
  // Multi-child active-thread reasons (Phase 9B-7 — additive)
  'ACTIVE_THREAD_CONTINUITY', 'THREAD_SUGGESTED', 'NO_ELIGIBLE_THREAD', 'THREAD_OWNERSHIP_REJECTED',
] as const;
export type ReasonCode = (typeof REASON_CODES)[number];
