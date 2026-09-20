// Rekah Journey — repository INTERFACES (Phase 9B-2)
// Domain-shaped persistence operations only. NO SQL, NO engine logic.
// Aggregates: identity/direction/preferences share the Family aggregate; child+thread share one;
// journey+thread-state share one. Append-only events go through the EventStore.
import type {
  Family, FamilyPreferences, FamilyDirection, FamilyDirectionEvent, ContextSignal,
  Child, DevelopmentThread, Observation, Focus, FamilyJourney, ThreadJourneyStateProjection,
  ActionInstance, Reflection, CanonicalJourneyContentMapping, EffectiveObservation,
} from '../types';
import type {
  FamilyId, ChildId, DevelopmentThreadId, FamilyJourneyId, FocusId, ObservationId,
  ActionInstanceId, ReflectionId, IdempotencyKey, IsoTimestamp,
} from '../ids';
import type { RepoResult } from './results';
import type { JourneyEvent, JourneyEventKind, StoredEvent } from './events';

/** Append-only event stream, keyed by FamilyJourney. Immutable once appended. */
export interface EventStore {
  /** Append one event. Idempotent on idempotencyKey; optimistic on expectedSequence. */
  append(
    streamId: FamilyJourneyId, ev: JourneyEvent, idempotencyKey: IdempotencyKey,
    occurredAt: IsoTimestamp, expectedSequence?: number,
  ): RepoResult<StoredEvent>;
  read(streamId: FamilyJourneyId): readonly StoredEvent[];
  readByKind(streamId: FamilyJourneyId, kind: JourneyEventKind): readonly StoredEvent[];
  lastSequence(streamId: FamilyJourneyId): number;
}

/** Family identity + preferences + direction (one aggregate). Direction changes are also event-logged. */
export interface FamilyRepository {
  getFamily(id: FamilyId): RepoResult<Family>;
  saveFamily(family: Family, expectedSeq: number): RepoResult<Family>;
  getPreferences(id: FamilyId): RepoResult<FamilyPreferences>;
  savePreferences(prefs: FamilyPreferences, expectedSeq: number): RepoResult<FamilyPreferences>;
  getDirection(id: FamilyId): RepoResult<FamilyDirection>;
  saveDirection(dir: FamilyDirection, history: FamilyDirectionEvent, expectedSeq: number): RepoResult<FamilyDirection>;
  getContext(id: FamilyId): readonly ContextSignal[];
  saveContextSignal(sig: ContextSignal): RepoResult<ContextSignal>;
}

export interface ChildThreadRepository {
  getChild(id: ChildId): RepoResult<Child>;
  saveChild(child: Child): RepoResult<Child>;
  listChildren(familyId: FamilyId): readonly Child[];
  getThread(id: DevelopmentThreadId): RepoResult<DevelopmentThread>;
  saveThread(thread: DevelopmentThread, expectedSeq: number): RepoResult<DevelopmentThread>;
  getActiveThreadForChild(childId: ChildId): RepoResult<DevelopmentThread>;
}

export interface JourneyRepository {
  getFamilyJourney(id: FamilyJourneyId): RepoResult<FamilyJourney>;
  getActiveJourneyForFamily(familyId: FamilyId): RepoResult<FamilyJourney>;
  saveFamilyJourney(journey: FamilyJourney, expectedSeq: number): RepoResult<FamilyJourney>;
  getCurrentThreadState(threadId: DevelopmentThreadId): RepoResult<ThreadJourneyStateProjection>;
  saveThreadState(state: ThreadJourneyStateProjection, expectedSeq: number): RepoResult<ThreadJourneyStateProjection>;
}

export interface FocusRepository {
  getFocus(id: FocusId): RepoResult<Focus>;
  /** Persist a focus fact. Persisting a proposal does NOT confer parent intent. */
  saveFocus(focus: Focus, expectedSeq: number): RepoResult<Focus>;
  listFocusesByThread(threadId: DevelopmentThreadId): readonly Focus[];
}

export interface ObservationRepository {
  getObservation(id: ObservationId): RepoResult<Observation>;
  saveObservation(obs: Observation): RepoResult<Observation>;
  listObservationsByThread(threadId: DevelopmentThreadId): readonly Observation[];
  /** Derived read: effective lifecycle/salience resolved as of `now` (9A-specified derivation, not decision logic). */
  listEffective(threadId: DevelopmentThreadId, now: IsoTimestamp): readonly EffectiveObservation[];
}

export interface ActionRepository {
  getAction(id: ActionInstanceId): RepoResult<ActionInstance>;
  saveAction(action: ActionInstance, expectedSeq: number): RepoResult<ActionInstance>;
  listByFocus(focusId: FocusId): readonly ActionInstance[];
}

export interface ReflectionRepository {
  getReflection(id: ReflectionId): RepoResult<Reflection>;
  saveReflection(r: Reflection): RepoResult<Reflection>;
  /** Reflections are editable, but edits append (never destroy the prior value). */
  appendEdit(r: Reflection): RepoResult<Reflection>;
  getByAction(actionId: ActionInstanceId): RepoResult<Reflection>;
}

/** Canonical mappings ONLY. There is deliberately no getMappings() that could leak candidates. */
export interface ContentMappingRepository {
  getCanonicalMappings(): readonly CanonicalJourneyContentMapping[];
  getCanonicalMappingsForContent(contentId: string): readonly CanonicalJourneyContentMapping[];
}
