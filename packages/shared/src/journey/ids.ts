// Rekah Journey Engine — branded domain IDs (Phase 9B-1)
// Type-safe identifiers. Values are opaque strings; the brand exists only at
// compile time to prevent accidental cross-assignment (e.g. a ChildId used as a FamilyId).
// No runtime cost. These do NOT create a second identity for content — ContentId
// wraps the frozen content_id string unchanged (same value, tagged for safety).

declare const __brand: unique symbol;

/** Attach a compile-time nominal tag to a base type. */
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type FamilyId = Brand<string, 'FamilyId'>;
export type ChildId = Brand<string, 'ChildId'>;
export type DevelopmentThreadId = Brand<string, 'DevelopmentThreadId'>;
export type FamilyJourneyId = Brand<string, 'FamilyJourneyId'>;
export type FocusId = Brand<string, 'FocusId'>;
export type ObservationId = Brand<string, 'ObservationId'>;
export type ContextSignalId = Brand<string, 'ContextSignalId'>;
export type ActionInstanceId = Brand<string, 'ActionInstanceId'>;
export type ContentExposureId = Brand<string, 'ContentExposureId'>;
export type ReflectionId = Brand<string, 'ReflectionId'>;
export type AdaptationId = Brand<string, 'AdaptationId'>;
export type ParentActionEventId = Brand<string, 'ParentActionEventId'>;
export type TransitionId = Brand<string, 'TransitionId'>;
export type EngineDecisionId = Brand<string, 'EngineDecisionId'>;
export type MappingId = Brand<string, 'MappingId'>;
export type EventId = Brand<string, 'EventId'>;

/**
 * ContentId wraps the frozen v6 `content_id` (kb-* / am-* / RL-*). It is the SAME
 * value as the immutable content identity — branded only to keep the journey domain
 * type-safe. It is never a second identifier and never mutates content.
 */
export type ContentId = Brand<string, 'ContentId'>;

/** ISO-8601 idempotency key carried on every mutating event. */
export type IdempotencyKey = Brand<string, 'IdempotencyKey'>;

// Smart constructors (identity at runtime; assert the brand at the boundary).
export const FamilyId = (s: string): FamilyId => s as FamilyId;
export const ChildId = (s: string): ChildId => s as ChildId;
export const DevelopmentThreadId = (s: string): DevelopmentThreadId => s as DevelopmentThreadId;
export const FamilyJourneyId = (s: string): FamilyJourneyId => s as FamilyJourneyId;
export const FocusId = (s: string): FocusId => s as FocusId;
export const ObservationId = (s: string): ObservationId => s as ObservationId;
export const ContextSignalId = (s: string): ContextSignalId => s as ContextSignalId;
export const ActionInstanceId = (s: string): ActionInstanceId => s as ActionInstanceId;
export const ContentExposureId = (s: string): ContentExposureId => s as ContentExposureId;
export const ReflectionId = (s: string): ReflectionId => s as ReflectionId;
export const AdaptationId = (s: string): AdaptationId => s as AdaptationId;
export const ParentActionEventId = (s: string): ParentActionEventId => s as ParentActionEventId;
export const TransitionId = (s: string): TransitionId => s as TransitionId;
export const EngineDecisionId = (s: string): EngineDecisionId => s as EngineDecisionId;
export const MappingId = (s: string): MappingId => s as MappingId;
export const EventId = (s: string): EventId => s as EventId;
export const ContentId = (s: string): ContentId => s as ContentId;
export const IdempotencyKey = (s: string): IdempotencyKey => s as IdempotencyKey;

/** ISO-8601 timestamp string (project convention). Documented, not branded, to match existing code. */
export type IsoTimestamp = string;
