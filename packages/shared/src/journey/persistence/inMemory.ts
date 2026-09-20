// Rekah Journey — in-memory reference persistence adapter (Phase 9B-2)
// Dependency-free reference implementation of the repository interfaces. Demonstrates the
// required semantics (append-only, idempotency, optimistic concurrency, projection rebuild).
// A real Supabase/Postgres adapter is a LATER infrastructure phase; the domain never depends on it.
// NO engine logic here.
import type {
  Family, FamilyPreferences, FamilyDirection, FamilyDirectionEvent, ContextSignal,
  Child, DevelopmentThread, Observation, Focus, FamilyJourney, ThreadJourneyStateProjection,
  ActionInstance, Reflection, CanonicalJourneyContentMapping, EffectiveObservation,
} from '../types';
import type {
  FamilyId, ChildId, DevelopmentThreadId, FamilyJourneyId, FocusId, ObservationId,
  ActionInstanceId, ReflectionId, IdempotencyKey, IsoTimestamp,
} from '../ids';
import type {
  EventStore, FamilyRepository, ChildThreadRepository, JourneyRepository, FocusRepository,
  ObservationRepository, ActionRepository, ReflectionRepository, ContentMappingRepository,
} from './repositories';
import type { JourneyEvent, JourneyEventKind, StoredEvent } from './events';
import { serializeEvent, deepFreeze } from './events';
import type { RepoResult } from './results';
import { ok, replay, idempotencyMismatch, conflict, notFound } from './results';
import { toEffectiveObservation } from './projection';

/** Optimistic-concurrency save into a Map keyed by id, comparing an entity `seq` field. */
function saveVersioned<T extends { seq: number }>(
  store: Map<string, T>, id: string, entity: T, expectedSeq: number,
): RepoResult<T> {
  const cur = store.get(id);
  if (cur && cur.seq !== expectedSeq) return conflict(cur.seq, expectedSeq);
  store.set(id, entity);
  return ok(entity);
}
const get = <T>(store: Map<string, T>, id: string): RepoResult<T> => {
  const v = store.get(id);
  return v ? ok(v) : notFound(id);
};

export class InMemoryJourneyStore
  implements EventStore, FamilyRepository, ChildThreadRepository, JourneyRepository,
             FocusRepository, ObservationRepository, ActionRepository, ReflectionRepository,
             ContentMappingRepository {
  private events = new Map<FamilyJourneyId, StoredEvent[]>();
  private idem = new Map<string, StoredEvent>();
  private families = new Map<string, Family>();
  private prefs = new Map<string, FamilyPreferences>();
  private directions = new Map<string, FamilyDirection>();
  private directionHistory: FamilyDirectionEvent[] = [];
  private contexts = new Map<string, ContextSignal[]>();
  private children = new Map<string, Child>();
  private threads = new Map<string, DevelopmentThread>();
  private journeys = new Map<string, FamilyJourney>();
  private threadStates = new Map<string, ThreadJourneyStateProjection>();
  private focuses = new Map<string, Focus>();
  private observations = new Map<string, Observation>();
  private actions = new Map<string, ActionInstance>();
  private reflections = new Map<string, Reflection>();
  private reflectionEdits: Reflection[] = [];
  private canonicalMappings: readonly CanonicalJourneyContentMapping[];

  constructor(canonicalMappings: readonly CanonicalJourneyContentMapping[] = []) {
    // Defensive: only accept mappings that are actually CANONICAL (candidates can never enter).
    this.canonicalMappings = canonicalMappings.filter((m) => m.mappingStatus === 'CANONICAL');
  }

  // ---- EventStore (append-only) ----
  append(
    streamId: FamilyJourneyId, ev: JourneyEvent, idempotencyKey: IdempotencyKey,
    occurredAt: IsoTimestamp, expectedSequence?: number,
  ): RepoResult<StoredEvent> {
    const prior = this.idem.get(idempotencyKey);
    if (prior) {
      const samePayload = prior.payloadJson === JSON.stringify(ev.event) && prior.kind === ev.kind;
      return samePayload ? replay(prior) : idempotencyMismatch<StoredEvent>(idempotencyKey);
    }
    const stream = this.events.get(streamId) ?? [];
    const lastSeq = stream.length ? stream[stream.length - 1].sequence : 0;
    if (expectedSequence !== undefined && expectedSequence !== lastSeq) {
      return conflict<StoredEvent>(lastSeq, expectedSequence);
    }
    const stored = deepFreeze(serializeEvent(streamId, lastSeq + 1, occurredAt, idempotencyKey, ev));
    stream.push(stored);
    this.events.set(streamId, stream);
    this.idem.set(idempotencyKey, stored);
    return ok(stored);
  }
  read(streamId: FamilyJourneyId): readonly StoredEvent[] { return this.events.get(streamId) ?? []; }
  readByKind(streamId: FamilyJourneyId, kind: JourneyEventKind): readonly StoredEvent[] {
    return (this.events.get(streamId) ?? []).filter((e) => e.kind === kind);
  }
  lastSequence(streamId: FamilyJourneyId): number {
    const s = this.events.get(streamId) ?? [];
    return s.length ? s[s.length - 1].sequence : 0;
  }

  // ---- FamilyRepository ----
  getFamily(id: FamilyId) { return get(this.families, id); }
  saveFamily(f: Family, expectedSeq: number) { return saveVersioned(this.families, f.familyId, f, expectedSeq); }
  getPreferences(id: FamilyId) { return get(this.prefs, id); }
  savePreferences(p: FamilyPreferences, expectedSeq: number) { return saveVersioned(this.prefs, p.familyId, p, expectedSeq); }
  getDirection(id: FamilyId) { return get(this.directions, id); }
  saveDirection(d: FamilyDirection, history: FamilyDirectionEvent, _expectedSeq: number): RepoResult<FamilyDirection> {
    this.directions.set(d.familyId, d);
    this.directionHistory.push(deepFreeze(history));   // append-only history; never rewrites past
    return ok(d);
  }
  getContext(id: FamilyId): readonly ContextSignal[] { return this.contexts.get(id) ?? []; }
  saveContextSignal(sig: ContextSignal): RepoResult<ContextSignal> {
    const arr = this.contexts.get(sig.familyId) ?? [];
    arr.push(sig); this.contexts.set(sig.familyId, arr); return ok(sig);
  }

  // ---- ChildThreadRepository ----
  getChild(id: ChildId) { return get(this.children, id); }
  saveChild(c: Child): RepoResult<Child> { this.children.set(c.childId, c); return ok(c); }
  listChildren(familyId: FamilyId): readonly Child[] {
    return [...this.children.values()].filter((c) => c.familyId === familyId);
  }
  getThread(id: DevelopmentThreadId) { return get(this.threads, id); }
  saveThread(t: DevelopmentThread, _expectedSeq: number): RepoResult<DevelopmentThread> {
    this.threads.set(t.threadId, t); return ok(t);
  }
  getActiveThreadForChild(childId: ChildId): RepoResult<DevelopmentThread> {
    const t = [...this.threads.values()].find((x) => x.childId === childId && x.status === 'ACTIVE');
    return t ? ok(t) : notFound(childId);
  }

  // ---- JourneyRepository ----
  getFamilyJourney(id: FamilyJourneyId) { return get(this.journeys, id); }
  getActiveJourneyForFamily(familyId: FamilyId): RepoResult<FamilyJourney> {
    const j = [...this.journeys.values()].find((x) => x.familyId === familyId && x.status === 'ACTIVE');
    return j ? ok(j) : notFound(familyId);
  }
  saveFamilyJourney(j: FamilyJourney, expectedSeq: number) { return saveVersioned(this.journeys, j.familyJourneyId, j, expectedSeq); }
  getCurrentThreadState(threadId: DevelopmentThreadId) { return get(this.threadStates, threadId); }
  saveThreadState(s: ThreadJourneyStateProjection, expectedSeq: number) { return saveVersioned(this.threadStates, s.threadId, s, expectedSeq); }

  // ---- FocusRepository ----
  getFocus(id: FocusId) { return get(this.focuses, id); }
  saveFocus(f: Focus, expectedSeq: number) { return saveVersioned(this.focuses, f.focusId, f, expectedSeq); }
  listFocusesByThread(threadId: DevelopmentThreadId): readonly Focus[] {
    return [...this.focuses.values()].filter((f) => f.threadId === threadId);
  }

  // ---- ObservationRepository ----
  getObservation(id: ObservationId) { return get(this.observations, id); }
  saveObservation(o: Observation): RepoResult<Observation> {
    // append/upsert by id; retraction is a field flip via a NEW saved value, prior stays in event log.
    this.observations.set(o.observationId, o); return ok(o);
  }
  listObservationsByThread(threadId: DevelopmentThreadId): readonly Observation[] {
    return [...this.observations.values()].filter((o) => o.threadId === threadId);
  }
  listEffective(threadId: DevelopmentThreadId, now: IsoTimestamp): readonly EffectiveObservation[] {
    return this.listObservationsByThread(threadId)
      .map((o) => toEffectiveObservation(o, now))
      .filter((e) => e.effectiveLifecycle !== 'EXPIRED' && e.effectiveLifecycle !== 'RETRACTED');
  }

  // ---- ActionRepository ----
  getAction(id: ActionInstanceId) { return get(this.actions, id); }
  saveAction(a: ActionInstance, expectedSeq: number) { return saveVersioned(this.actions, a.actionId, a, expectedSeq); }
  listByFocus(focusId: FocusId): readonly ActionInstance[] {
    return [...this.actions.values()].filter((a) => a.focusId === focusId);
  }

  // ---- ReflectionRepository ----
  getReflection(id: ReflectionId) { return get(this.reflections, id); }
  saveReflection(r: Reflection): RepoResult<Reflection> { this.reflections.set(r.reflectionId, r); return ok(r); }
  appendEdit(r: Reflection): RepoResult<Reflection> {
    const prior = this.reflections.get(r.reflectionId);
    if (prior) this.reflectionEdits.push(deepFreeze({ ...prior }));  // preserve prior value
    this.reflections.set(r.reflectionId, r);
    return ok(r);
  }
  getByAction(actionId: ActionInstanceId): RepoResult<Reflection> {
    const r = [...this.reflections.values()].find((x) => x.actionId === actionId);
    return r ? ok(r) : notFound(actionId);
  }

  // ---- ContentMappingRepository (canonical only) ----
  getCanonicalMappings(): readonly CanonicalJourneyContentMapping[] { return this.canonicalMappings; }
  getCanonicalMappingsForContent(contentId: string): readonly CanonicalJourneyContentMapping[] {
    return this.canonicalMappings.filter((m) => (m.contentId as string) === contentId);
  }

  // ---- test/debug helpers (not part of the repository contract) ----
  _reflectionEditCount(): number { return this.reflectionEdits.length; }
  _directionHistoryCount(): number { return this.directionHistory.length; }
}
