// Rekah Journey — RUNTIME barrel (Phase 10C-2 Slice 2). ADDITIVE.
// The public entry the application (apps/digital) imports as `@studiva/shared/journey`.
// Distinct from index.ts (types-only). This wires the frozen engine in via the Application Service
// ONLY — the UI never imports the engine functions directly.
export { JourneyApplicationService } from './app/journeyApplicationService';
export type { StepRequest, FocusTargetsStore } from './app/journeyApplicationService';
export { toJourneyView } from './app/journeyViewModel';
export type { JourneyView, ViewContext, ViewProvenance, ViewCopy, ViewStep, ViewFocus } from './app/journeyViewModel';
export { REKAH_VERSIONS } from './config/versions';
export { PRACTICE_RELATION_REGISTRY, relatedFocusKeysFor, BLOCKED_PRACTICE_IDS } from './config/practiceRelationRegistry';
export type { PracticeRelation } from './config/practiceRelationRegistry';
export { buildAllDescriptors } from './app/descriptorAssembly';
export { CANONICAL_MAPPINGS } from './app/canonicalMappings';
export { InMemoryJourneyStore, rebuildThreadJourneyState } from './persistence';
export { SupabaseEventSync } from './persistence/supabase/supabaseEventSync';
export type { EventStore, JourneyRepository } from './persistence/repositories';
export type { JourneyEvent, StoredEvent } from './persistence/events';

export type { SupabaseClientLike } from './persistence/supabase/supabaseClientLike';
// Result types the UI renders (never engine functions):
export type { JourneyStepResult } from './orchestrator/types';
export type { CanonicalState } from './engine/types';

// ── Phase 10D (ADDITIVE): domain type + value surface for the app-layer Journey Input Adapter.
// Type-only re-exports (no new behavior); id/value constructors the adapter brands with.
export type {
  FamilyValue, Reflection, EffectiveObservation, Family, FamilyDirection,
  DirectionValueRef, DevelopmentThread, FamilyJourney, ContentReference,
} from './types';
export type { FocusTargets } from './focus/types';
export type { ActiveThreadInput } from './multichild/types';
export type { ReflectionChildResponse, AdaptationOutcome, ReflectionDifficulty, ReflectionRelevance, ParentActionType, SignalAxis, SalienceLevel, ObservationSource, ObservationLifecycle } from './enums';
export { CANONICAL_FAMILY_VALUES } from '../content/metadata';
export { FamilyId, ChildId, DevelopmentThreadId, FamilyJourneyId, FocusId, ObservationId, ContentId, ReflectionId, ActionInstanceId, IdempotencyKey, MappingId } from './ids';
