// Rekah Journey Engine — domain types (Phase 9B-1)
// Faithful TypeScript representation of the Phase 9A conceptual data model.
// NO product behavior, NO persistence, NO state-machine logic — types only.
//
// CONVENTIONS
//   - `field?: T`  (OPTIONAL)  → not applicable / not supplied for this record.
//   - `field: T | null` (NULLABLE) → applicable but currently has no value.
//   - Historical/event records are fully `readonly` (immutable after creation).
//   - Content is referenced by immutable `content_id` only; content metadata is never copied.
//   - The 12 Nilai Akar are the frozen `FamilyValue` type re-used from the metadata layer.

import type { ContentType, FamilyValue, CandidateContentType } from '../content/metadata';
import type {
  FamilyId, ChildId, DevelopmentThreadId, FamilyJourneyId, FocusId, ObservationId,
  ContextSignalId, ActionInstanceId, ContentExposureId, ReflectionId, AdaptationId,
  ParentActionEventId, TransitionId, EngineDecisionId, MappingId, EventId,
  ContentId, IdempotencyKey, IsoTimestamp,
} from './ids';
import type {
  JourneyRole, JourneyState, TransitionTrigger, FocusStatus, FocusSource, FocusScope,
  ObservationLifecycle, ObservationSource, SalienceLevel, SignalAxis, PersistenceTier,
  ContextKind, ActionOrigin, ActionStatus, ExposureType, ContentStage, FallbackStatus,
  ReflectionChildResponse, ReflectionDifficulty, ReflectionRelevance, AdaptationOutcome,
  AdaptationTriggeredBy, ParentActionType, Actor, DecisionType, JourneyMappingStatus,
  MappingConfidence, ReasonCode,
} from './enums';

// Re-export the frozen value types so journey consumers reference one source of truth.
export type { ContentType, FamilyValue, CandidateContentType };

// ===================================================================================
// VERSIONING (Phase 9A §O)
// ===================================================================================
export type MetadataVersion = string & { readonly __v: 'MetadataVersion' };
export type MappingVersion = string & { readonly __v: 'MappingVersion' };
export type RuleVersion = string & { readonly __v: 'RuleVersion' };

export interface VersionStamp {
  readonly metadataVersion: MetadataVersion;
  readonly mappingVersion: MappingVersion;
  readonly ruleVersion: RuleVersion;
}

// ===================================================================================
// IMMUTABLE CONTENT REFERENCE (Phase 9A §6) — content_id only; no metadata duplication
// ===================================================================================
export interface ContentReference {
  readonly contentId: ContentId;
  /** Optional canonical mapping that justified this reference. */
  readonly mappingId?: MappingId;
}

// ===================================================================================
// CONTENT MAPPING BOUNDARY (Phase 9A §M) — canonical vs candidate as a discriminated union
// ===================================================================================
interface JourneyContentMappingBase {
  readonly mappingId: MappingId;
  readonly contentId: ContentId;
  readonly contentType: ContentType;
  readonly primaryRole: JourneyRole;
  readonly secondaryRoles: readonly JourneyRole[];
  readonly stages: readonly ContentStage[];
  readonly mappingVersion: MappingVersion;
}
/** The ONLY mapping type the engine may consume. */
export interface CanonicalJourneyContentMapping extends JourneyContentMappingBase {
  readonly mappingStatus: 'CANONICAL';
  readonly confidence: 'HIGH';
}
/** Quarantined. Structurally distinct so it cannot be passed where canonical is required. */
export interface CandidateJourneyContentMapping extends JourneyContentMappingBase {
  readonly mappingStatus: 'CANDIDATE';
  readonly confidence: Exclude<MappingConfidence, 'HIGH'>;
}
export type JourneyContentMapping = CanonicalJourneyContentMapping | CandidateJourneyContentMapping;

// ===================================================================================
// IDENTITY (Phase 9A §7, §10)
// ===================================================================================
export interface Family {
  readonly familyId: FamilyId;
  readonly createdAt: IsoTimestamp;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  /** Pointer to the child currently "in focus"; null when none is active. */
  activeThreadId: DevelopmentThreadId | null;
  seq: number;
}

/** Mutable preferences — kept separate from identity (Phase 9A §7). */
export interface FamilyPreferences {
  readonly familyId: FamilyId;
  contentTypeLean: readonly ContentType[]; // e.g. prefers AJAK_MAIN over WAWASAN_TUMBUH
  excludedContentIds: readonly ContentId[];
  cadence?: 'LIGHT' | 'NORMAL';
  seq: number;
}

// ===================================================================================
// FAMILY DIRECTION (Phase 9A §8) — references the 12 Nilai Akar; history reproducible
// ===================================================================================
export interface DirectionValueRef {
  readonly value: FamilyValue;       // one of the frozen 12 Nilai Akar
  readonly order: number;            // priority ordering (1 = highest)
  readonly source: 'PARENT_SELECTED' | 'SYSTEM_SUGGESTED';
}
export interface FamilyDirection {
  readonly familyId: FamilyId;
  values: readonly DirectionValueRef[];
  readonly effectiveFrom: IsoTimestamp;
  effectiveUntil: IsoTimestamp | null; // null = still effective
  active: boolean;
}
/** Append-only history entry so a Direction change never rewrites past journeys. */
export interface FamilyDirectionEvent {
  readonly eventId: EventId;
  readonly familyId: FamilyId;
  readonly values: readonly DirectionValueRef[];
  readonly effectiveFrom: IsoTimestamp;
  readonly occurredAt: IsoTimestamp;
}

// ===================================================================================
// FAMILY CONTEXT (Phase 9A §9) — stable / dynamic / temporary, controlled union
// ===================================================================================
export interface ContextSignal {
  readonly contextId: ContextSignalId;
  readonly familyId: FamilyId;
  readonly kind: ContextKind;                 // STABLE | DYNAMIC | TEMPORARY
  readonly source: 'PARENT' | 'SYSTEM';
  readonly key: string;                       // controlled key (e.g. 'available_time', 'transition')
  readonly value: string;                     // controlled value; never an untyped blob
  readonly effectiveFrom: IsoTimestamp;
  effectiveUntil: IsoTimestamp | null;        // null = open-ended (until expiry rule fires)
  readonly persistenceTier: PersistenceTier;
  readonly createdAt: IsoTimestamp;
  readonly parentEditable: boolean;
}

// ===================================================================================
// CHILD + DEVELOPMENT THREAD (Phase 9A §10, §11)
// ===================================================================================
export interface Child {
  readonly childId: ChildId;
  readonly familyId: FamilyId;
  displayName: string;
  /** Birthdate drives age in months; age band is derived, never stored as truth. */
  readonly birthdate: IsoTimestamp;
  readonly createdAt: IsoTimestamp;
}

export interface DevelopmentThread {
  readonly threadId: DevelopmentThreadId;
  readonly familyId: FamilyId;
  readonly childId: ChildId;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'; // at most ONE ACTIVE per child
  readonly createdAt: IsoTimestamp;
  activeFocusId: FocusId | null;
}

// ===================================================================================
// OBSERVATION (Phase 9A §12–13) — salience is DERIVED; lifecycle auditable
// ===================================================================================
export interface ObservationSignal {
  readonly axis: SignalAxis;
  readonly domainOrArea: string | null;   // canonical DevelopmentDomain or KnowledgeArea label
  readonly capabilityOrTopic: string | null;
}
export interface Observation {
  readonly observationId: ObservationId;
  readonly threadId: DevelopmentThreadId;
  readonly childId: ChildId;
  readonly source: ObservationSource;
  readonly signal: ObservationSignal;
  readonly parentWording: string | null;   // nullable: applicable but may be empty
  readonly salienceInitial: SalienceLevel;  // qualitative; NEVER a numeric score
  readonly observedAt: IsoTimestamp;
  readonly createdAt: IsoTimestamp;
  retracted: boolean;
  retractedAt: IsoTimestamp | null;
  // NOTE: effective lifecycle (ACTIVE/SOFT_DECAY/EXPIRED) is DERIVED from observedAt; not stored.
}
export interface ObservationEvent {
  readonly eventId: EventId;
  readonly observationId: ObservationId;
  readonly kind: 'CREATED' | 'RETRACTED';
  readonly occurredAt: IsoTimestamp;
  readonly idempotencyKey: IdempotencyKey;
}
/** Read model presented to the engine: effective lifecycle already resolved. */
export interface EffectiveObservation extends Observation {
  readonly effectiveLifecycle: ObservationLifecycle;
  readonly effectiveSalience: SalienceLevel | null; // null once EXPIRED/RETRACTED
}

// ===================================================================================
// FOCUS (Phase 9A §14–15) — discriminated on source so PARENT_SELECTED is always confirmed
// ===================================================================================
interface FocusCommon {
  readonly focusId: FocusId;
  readonly scope: FocusScope;
  readonly familyId: FamilyId;
  readonly threadId: DevelopmentThreadId | null; // null when scope = FAMILY
  status: FocusStatus;
  readonly rationaleText: string;
  readonly informedByObservationIds: readonly ObservationId[];
  priorityRank: number;                 // invisible ordering key; NOT a displayed score
  readonly createdAt: IsoTimestamp;
  startedAt: IsoTimestamp | null;
  targetEndAt: IsoTimestamp | null;     // soft 21-day window
  completedAt: IsoTimestamp | null;
  pausedAt: IsoTimestamp | null;
  abandonedAt: IsoTimestamp | null;
  seq: number;
}
export interface ParentSelectedFocus extends FocusCommon {
  readonly source: 'PARENT_SELECTED';
  readonly parentConfirmed: true;       // parent-selected is confirmed by construction
}
export interface SystemFocus extends FocusCommon {
  readonly source: 'SYSTEM_SUGGESTED' | 'SYSTEM_DERIVED';
  parentConfirmed: boolean;             // must be true before it can become ACTIVE (guard/invariant)
}
export type Focus = ParentSelectedFocus | SystemFocus;

/** Append-only focus lifecycle history. */
export interface FocusEvent {
  readonly eventId: EventId;
  readonly focusId: FocusId;
  readonly kind: 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'EXTENDED' | 'PAUSED' | 'RESUMED' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED';
  readonly actor: Actor;
  readonly occurredAt: IsoTimestamp;
  readonly ruleVersion: RuleVersion;
  readonly idempotencyKey: IdempotencyKey;
}

// ===================================================================================
// FAMILY JOURNEY + THREAD JOURNEY STATE (Phase 9A §16–17)
// ===================================================================================
export interface FamilyJourney {
  readonly familyJourneyId: FamilyJourneyId;
  readonly familyId: FamilyId;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  readonly startedAt: IsoTimestamp;
  readonly startedUnderVersions: VersionStamp;
  seq: number;
}
/** Current MATERIALIZED FSM state (a projection of the transition event log). */
export interface ThreadJourneyStateProjection {
  readonly threadId: DevelopmentThreadId;
  readonly familyJourneyId: FamilyJourneyId;
  activeFocusId: FocusId | null;
  currentState: JourneyState;
  currentStageActionId: ActionInstanceId | null;
  resumeState: JourneyState | null;   // set when PAUSED
  pauseReason: string | null;
  readonly stateEnteredAt: IsoTimestamp;
  stateUpdatedAt: IsoTimestamp;
  seq: number;
  lastTransitionId: TransitionId | null;
}

// ===================================================================================
// STATE TRANSITION EVENT (Phase 9A §18) — immutable
// ===================================================================================
export interface TransitionEvent {
  readonly transitionId: TransitionId;
  readonly familyJourneyId: FamilyJourneyId;
  readonly threadId: DevelopmentThreadId | null;
  readonly fromState: JourneyState;
  readonly trigger: TransitionTrigger;
  readonly toState: JourneyState;
  readonly actor: Actor;
  readonly reasonCode: ReasonCode;
  readonly reasonText: string;
  readonly ruleVersion: RuleVersion;
  readonly sequence: number;
  readonly occurredAt: IsoTimestamp;
  readonly idempotencyKey: IdempotencyKey;
}

// ===================================================================================
// JOURNEY ACTION (Phase 9A §19) — content ref / action instance / outcome separated
// ===================================================================================
export interface ActionInstance {
  readonly actionId: ActionInstanceId;
  readonly familyJourneyId: FamilyJourneyId;
  readonly threadId: DevelopmentThreadId;
  readonly focusId: FocusId;
  readonly origin: ActionOrigin;
  readonly content: ContentReference | null;   // null when origin = PARENT_AUTHORED
  readonly parentActionText: string;
  readonly sizing: { readonly estMinutes: number; readonly effort: 'LOW' | 'MED' };
  readonly stage: ContentStage;
  readonly fallbackStatus: FallbackStatus;      // snapshot of the decision (immutable fact)
  status: ActionStatus;
  readonly createdAt: IsoTimestamp;
  resolvedAt: IsoTimestamp | null;
  seq: number;
}

// ===================================================================================
// CONTENT EXPOSURE (Phase 9A §20) — immutable event; suppression is derived elsewhere
// ===================================================================================
export interface ContentExposure {
  readonly exposureId: ContentExposureId;
  readonly familyId: FamilyId;
  readonly threadId: DevelopmentThreadId | null;
  readonly familyJourneyId: FamilyJourneyId;
  readonly contentId: ContentId;
  readonly mappingId: MappingId;
  readonly stage: ContentStage;
  readonly role: JourneyRole;
  readonly exposureType: ExposureType;
  readonly occurredAt: IsoTimestamp;
  readonly idempotencyKey: IdempotencyKey;
}

// ===================================================================================
// REFLECTION & ADAPTATION (Phase 9A §24–25)
// ===================================================================================
export interface Reflection {
  readonly reflectionId: ReflectionId;
  readonly actionId: ActionInstanceId;
  readonly threadId: DevelopmentThreadId;
  readonly childResponse: ReflectionChildResponse | null;
  readonly parentExperience: string | null;
  readonly difficulty: ReflectionDifficulty | null;
  readonly relevance: ReflectionRelevance | null;
  readonly willingnessToRepeat: boolean | null;
  readonly contextChange: string | null;
  readonly createdAt: IsoTimestamp;
  editedAt: IsoTimestamp | null;
}
export interface Adaptation {
  readonly adaptationId: AdaptationId;
  readonly actionId: ActionInstanceId;
  readonly reflectionId: ReflectionId | null;    // null when NO_REFLECTION_DEFAULT
  readonly outcome: AdaptationOutcome;
  readonly triggeredBy: AdaptationTriggeredBy;
  readonly nextState: JourneyState;
  readonly occurredAt: IsoTimestamp;
}

// ===================================================================================
// PARENT AGENCY EVENT (Phase 9A §26) — first-class, append-only
// ===================================================================================
export interface ParentActionEvent {
  readonly parentActionId: ParentActionEventId;
  readonly familyJourneyId: FamilyJourneyId;
  readonly threadId: DevelopmentThreadId | null;
  readonly focusId: FocusId | null;
  readonly actionId: ActionInstanceId | null;
  readonly contentId: ContentId | null;
  readonly actionType: ParentActionType;
  readonly detail: string | null;                // e.g. parent-authored focus/step text
  readonly occurredAt: IsoTimestamp;
  readonly idempotencyKey: IdempotencyKey;
}

// ===================================================================================
// ENGINE DECISION LOG (Phase 9A §27) — versioned, explainable, references not snapshots
// ===================================================================================
export interface EngineDecision {
  readonly decisionId: EngineDecisionId;
  readonly familyJourneyId: FamilyJourneyId;
  readonly threadId: DevelopmentThreadId | null;
  readonly occurredAt: IsoTimestamp;
  readonly currentState: JourneyState;
  readonly decisionType: DecisionType;
  readonly inputRef: string;                     // pointer to input snapshot, not a full copy
  readonly rulesEvaluated: readonly string[];
  readonly selectedContentId: ContentId | null;
  readonly mappingId: MappingId | null;
  readonly fallbackStatus: FallbackStatus | null;
  readonly reasonCode: ReasonCode;
  readonly reasonText: string;
  readonly versions: VersionStamp;
  readonly idempotencyKey: IdempotencyKey;
}

// ===================================================================================
// ENGINE INPUT CONTRACT (Phase 9A §38) — minimal, immutable, canonical-only mappings
// ===================================================================================
export interface JourneyEngineInput {
  readonly family: Family;
  readonly familyDirection: FamilyDirection;
  readonly familyContext: readonly ContextSignal[];  // effective signals only
  readonly childThread: DevelopmentThread;
  readonly observations?: readonly EffectiveObservation[]; // optional; expired/retracted excluded
  readonly currentFocus: Focus | null;
  readonly journeyState: ThreadJourneyStateProjection;
  readonly recentHistory?: {
    readonly transitions: readonly TransitionEvent[];
    readonly exposures: readonly ContentExposure[];
    readonly reflections: readonly Reflection[];
  };
  readonly parentActions?: readonly ParentActionEvent[];
  /** CANONICAL ONLY — candidate mappings are structurally excluded from the engine input. */
  readonly canonicalContentMappings: readonly CanonicalJourneyContentMapping[];
  readonly versions: VersionStamp;
  readonly idempotencyKey: IdempotencyKey;
}

// ===================================================================================
// ENGINE OUTPUT CONTRACT (Phase 8A/9A §39)
// ===================================================================================
export interface FocusCandidate {
  readonly rationale: string;
  readonly source: FocusSource;
  readonly targets: {
    readonly domainOrArea?: string;
    readonly capabilityOrTopic?: string;
    readonly value?: FamilyValue;
  };
}
export interface EligibleContentItem {
  readonly contentId: ContentId;
  readonly mappingId: MappingId;
  readonly stage: ContentStage;
  readonly role: JourneyRole;
}
export interface JourneyEngineOutput {
  readonly nextState: JourneyState;
  /** A recommendation — NOT a decision; requires parent confirmation to activate. */
  readonly focusRecommendation: { readonly candidates: readonly FocusCandidate[] } | null;
  readonly contentCandidates: readonly EligibleContentItem[];
  readonly selectedContent: readonly ContentReference[]; // may be empty
  readonly parentAction: string | null;
  readonly reason: { readonly code: ReasonCode; readonly text: string };
  readonly fallbackStatus: FallbackStatus;
  readonly decisionRef: EngineDecisionId;
}

// ===================================================================================
// ENGINE RESULT / NO-RESULT CONTRACT (Phase 9A §40) — discriminated union, not success:boolean
// ===================================================================================
export type EngineResult =
  | { readonly kind: 'OK'; readonly output: JourneyEngineOutput }
  | { readonly kind: 'INSUFFICIENT_CONTEXT'; readonly missing: readonly string[] }
  | { readonly kind: 'NO_FOCUS' }
  | { readonly kind: 'NO_MATCH'; readonly gapReasonCode: ReasonCode }
  | { readonly kind: 'FALLBACK_ONLY'; readonly output: JourneyEngineOutput }
  | { readonly kind: 'PARENT_OVERRIDE'; readonly appliedFocusId: FocusId | null }
  | { readonly kind: 'INVALID_STATE'; readonly attempted: TransitionTrigger; readonly from: JourneyState }
  | { readonly kind: 'STALE_STATE'; readonly expectedSeq: number; readonly actualSeq: number }
  | { readonly kind: 'CONFLICT'; readonly expectedSeq: number; readonly actualSeq: number }
  | { readonly kind: 'PAUSED'; readonly resumeState: JourneyState | null };
