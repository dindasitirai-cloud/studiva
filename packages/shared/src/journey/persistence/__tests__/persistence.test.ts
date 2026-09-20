// Rekah Journey — persistence/repository tests (Phase 9B-2). STRUCTURE & SEMANTICS only.
// No engine behavior (no transitions decided, no content ranked). Fixtures + direct repo ops.
import { describe, it, expect } from 'vitest';
import {
  FamilyId, ChildId, DevelopmentThreadId, FamilyJourneyId, FocusId, ObservationId,
  ContentId, MappingId, TransitionId, ParentActionEventId, EngineDecisionId, IdempotencyKey,
} from '../../ids';
import type {
  Family, Child, DevelopmentThread, FamilyJourney, ThreadJourneyStateProjection,
  Focus, Observation, TransitionEvent, ParentActionEvent, ContentExposure, EngineDecision,
  VersionStamp, CanonicalJourneyContentMapping, CandidateJourneyContentMapping,
} from '../../types';
import { InMemoryJourneyStore } from '../inMemory';
import { serializeEvent, deserializeEvent } from '../events';
import { rebuildThreadJourneyState } from '../projection';

const T = '2026-08-14T00:00:00.000Z';
const V: VersionStamp = { metadataVersion: 'v6' as any, mappingVersion: 'ctj-v1.0' as any, ruleVersion: 'fsm-v1.0' as any };
const fjid = FamilyJourneyId('fj1');
const tid = DevelopmentThreadId('t1');

const family = (seq: number): Family => ({ familyId: FamilyId('f1'), createdAt: T, status: 'ACTIVE', activeThreadId: null, seq });
const transition = (seq: number, from: any, to: any, id: string): { kind: 'TRANSITION'; event: TransitionEvent } => ({
  kind: 'TRANSITION', event: {
    transitionId: TransitionId(id), familyJourneyId: fjid, threadId: tid, fromState: from, trigger: 'ACTED',
    toState: to, actor: 'SYSTEM', reasonCode: 'PRIMARY_MATCH_SELECTED', reasonText: '', ruleVersion: V.ruleVersion,
    sequence: seq, occurredAt: T, idempotencyKey: IdempotencyKey('k-' + id),
  },
});

describe('persistence: current-state', () => {
  it('1-4 creates family/child/thread/journey and persists current thread state', () => {
    const s = new InMemoryJourneyStore();
    expect(s.saveFamily(family(0), 0).kind).toBe('OK');
    expect(s.getFamily(FamilyId('f1')).kind).toBe('OK');
    const child: Child = { childId: ChildId('c1'), familyId: FamilyId('f1'), displayName: 'A', birthdate: T, createdAt: T };
    expect(s.saveChild(child).kind).toBe('OK');
    const thread: DevelopmentThread = { threadId: tid, familyId: FamilyId('f1'), childId: ChildId('c1'), status: 'ACTIVE', createdAt: T, activeFocusId: null };
    expect(s.saveThread(thread, 0).kind).toBe('OK');
    const j: FamilyJourney = { familyJourneyId: fjid, familyId: FamilyId('f1'), status: 'ACTIVE', startedAt: T, startedUnderVersions: V, seq: 0 };
    expect(s.saveFamilyJourney(j, 0).kind).toBe('OK');
    const st: ThreadJourneyStateProjection = { threadId: tid, familyJourneyId: fjid, activeFocusId: null, currentState: 'GROUND', currentStageActionId: null, resumeState: null, pauseReason: null, stateEnteredAt: T, stateUpdatedAt: T, seq: 0, lastTransitionId: null };
    expect(s.saveThreadState(st, 0).kind).toBe('OK');
    expect(s.getActiveThreadForChild(ChildId('c1')).kind).toBe('OK');
  });

  it('8 optimistic-concurrency conflict on stale expectedSeq', () => {
    const s = new InMemoryJourneyStore();
    s.saveFamily(family(0), 0);
    s.saveFamily(family(1), 0);              // now stored seq = 1
    const r = s.saveFamily(family(2), 0);    // expected 0, actual 1 -> conflict
    expect(r.kind).toBe('CONFLICT');
  });
});

describe('persistence: event store (append-only)', () => {
  it('5 appends a transition and assigns monotonic sequence', () => {
    const s = new InMemoryJourneyStore();
    const r1 = s.append(fjid, transition(0, 'GROUND', 'NOTICE', 'x1'), IdempotencyKey('i1'), T);
    const r2 = s.append(fjid, transition(0, 'NOTICE', 'FOCUS', 'x2'), IdempotencyKey('i2'), T);
    expect(r1.kind).toBe('OK'); expect(r2.kind).toBe('OK');
    expect(s.lastSequence(fjid)).toBe(2);
    const seqs = s.read(fjid).map((e) => e.sequence);
    expect(seqs).toEqual([1, 2]); // strictly monotonic
  });

  it('6 duplicate idempotency key does not duplicate the event', () => {
    const s = new InMemoryJourneyStore();
    const ev = transition(0, 'GROUND', 'NOTICE', 'x1');
    const a = s.append(fjid, ev, IdempotencyKey('same'), T);
    const b = s.append(fjid, ev, IdempotencyKey('same'), T);
    expect(a.kind).toBe('OK');
    expect(b.kind).toBe('IDEMPOTENT_REPLAY');
    expect(s.read(fjid).length).toBe(1);
  });

  it('7 same key with different payload returns a mismatch, never overwrites', () => {
    const s = new InMemoryJourneyStore();
    s.append(fjid, transition(0, 'GROUND', 'NOTICE', 'x1'), IdempotencyKey('same'), T);
    const b = s.append(fjid, transition(0, 'NOTICE', 'FOCUS', 'x2'), IdempotencyKey('same'), T);
    expect(b.kind).toBe('IDEMPOTENCY_PAYLOAD_MISMATCH');
    expect(s.read(fjid).length).toBe(1);
  });

  it('10/20 stored events are frozen (no mutation, no delete)', () => {
    const s = new InMemoryJourneyStore();
    s.append(fjid, transition(0, 'GROUND', 'NOTICE', 'x1'), IdempotencyKey('i1'), T);
    const stored = s.read(fjid)[0];
    expect(Object.isFrozen(stored)).toBe(true);
    expect(() => { (stored as any).sequence = 999; }).toThrow();
  });

  it('9 appends a parent action event distinctly from system decisions', () => {
    const s = new InMemoryJourneyStore();
    const pa: { kind: 'PARENT_ACTION'; event: ParentActionEvent } = {
      kind: 'PARENT_ACTION', event: {
        parentActionId: ParentActionEventId('p1'), familyJourneyId: fjid, threadId: tid, focusId: null,
        actionId: null, contentId: null, actionType: 'REJECT', detail: null, occurredAt: T, idempotencyKey: IdempotencyKey('pa1'),
      },
    };
    expect(s.append(fjid, pa, IdempotencyKey('pa1'), T).kind).toBe('OK');
    expect(s.readByKind(fjid, 'PARENT_ACTION').length).toBe(1);
    expect(s.readByKind(fjid, 'TRANSITION').length).toBe(0);
  });
});

describe('persistence: focus / observation / exposure / decision', () => {
  const sysFocus = (confirmed: boolean, seq: number): Focus => ({
    focusId: FocusId('foc1'), scope: 'THREAD', familyId: FamilyId('f1'), threadId: tid,
    source: 'SYSTEM_SUGGESTED', parentConfirmed: confirmed, status: confirmed ? 'ACTIVE' : 'PROPOSED',
    rationaleText: 'r', informedByObservationIds: [], priorityRank: 1, createdAt: T,
    startedAt: null, targetEndAt: null, completedAt: null, pausedAt: null, abandonedAt: null, seq,
  });

  it('11-12 persists a proposal then a confirmation without inventing parent intent', () => {
    const s = new InMemoryJourneyStore();
    expect(s.saveFocus(sysFocus(false, 0), 0).kind).toBe('OK');
    const stored = s.getFocus(FocusId('foc1'));
    expect(stored.kind === 'OK' && stored.value.parentConfirmed).toBe(false); // still just a suggestion
    expect(s.saveFocus(sysFocus(true, 0), 0).kind).toBe('OK');                 // parent confirms
  });

  it('13-14 observation stays historical after expiration; effective view excludes it', () => {
    const s = new InMemoryJourneyStore();
    const obs: Observation = {
      observationId: ObservationId('o1'), threadId: tid, childId: ChildId('c1'), source: 'PARENT_OBSERVATION',
      signal: { axis: 'DEVELOPMENT', domainOrArea: 'Social-Emotional', capabilityOrTopic: 'Emotional Regulation' },
      parentWording: 'fussy', salienceInitial: 'HIGH', observedAt: '2026-01-01T00:00:00.000Z', createdAt: T,
      retracted: false, retractedAt: null,
    };
    s.saveObservation(obs);
    expect(s.getObservation(ObservationId('o1')).kind).toBe('OK'); // still in history
    const effective = s.listEffective(tid, T); // ~225 days later -> EXPIRED
    expect(effective.length).toBe(0);
  });

  it('15 persists content exposure without content metadata', () => {
    const s = new InMemoryJourneyStore();
    const ex: { kind: 'EXPOSURE'; event: ContentExposure } = {
      kind: 'EXPOSURE', event: {
        exposureId: 'e1' as any, familyId: FamilyId('f1'), threadId: tid, familyJourneyId: fjid,
        contentId: ContentId('am-001'), mappingId: MappingId('m1'), stage: 'DO', role: 'DO',
        exposureType: 'SURFACED', occurredAt: T, idempotencyKey: IdempotencyKey('e1'),
      },
    };
    expect(s.append(fjid, ex, IdempotencyKey('e1'), T).kind).toBe('OK');
    const payload = JSON.parse(s.readByKind(fjid, 'EXPOSURE')[0].payloadJson);
    expect(payload.contentId).toBe('am-001');
    expect('title' in payload).toBe(false); // no content metadata leaked
  });

  it('17-18 persists an engine decision retaining all three versions', () => {
    const s = new InMemoryJourneyStore();
    const d: { kind: 'ENGINE_DECISION'; event: EngineDecision } = {
      kind: 'ENGINE_DECISION', event: {
        decisionId: EngineDecisionId('d1'), familyJourneyId: fjid, threadId: tid, occurredAt: T,
        currentState: 'DO', decisionType: 'CONTENT_SELECTION', inputRef: 'ref', rulesEvaluated: ['eligibility'],
        selectedContentId: ContentId('am-001'), mappingId: MappingId('m1'), fallbackStatus: 'FALLBACK_MATCH',
        reasonCode: 'AM_AGE_GAP_FALLBACK', reasonText: 'no AM > 36m', versions: V, idempotencyKey: IdempotencyKey('d1'),
      },
    };
    s.append(fjid, d, IdempotencyKey('d1'), T);
    const round = deserializeEvent(s.readByKind(fjid, 'ENGINE_DECISION')[0]).event as EngineDecision;
    expect(round.versions.metadataVersion).toBe('v6');
    expect(round.versions.mappingVersion).toBe('ctj-v1.0');
    expect(round.versions.ruleVersion).toBe('fsm-v1.0');
    expect(round.fallbackStatus).toBe('FALLBACK_MATCH'); // fallback preserved, not re-inferred
  });
});

describe('persistence: mappings + projection rebuild + serialization', () => {
  it('16 canonical query never returns candidate mappings', () => {
    const canonical = { mappingStatus: 'CANONICAL', confidence: 'HIGH', mappingId: MappingId('m1'), contentId: ContentId('am-001'), contentType: 'AJAK_MAIN', primaryRole: 'DO', secondaryRoles: [], stages: ['DO'], mappingVersion: V.mappingVersion } as CanonicalJourneyContentMapping;
    const candidate = { mappingStatus: 'CANDIDATE', confidence: 'MEDIUM', mappingId: MappingId('m2'), contentId: ContentId('RL-0-3m-FM'), contentType: 'WAWASAN_TUMBUH', primaryRole: 'UNDERSTAND', secondaryRoles: [], stages: ['NOTICE'], mappingVersion: V.mappingVersion } as unknown as CanonicalJourneyContentMapping;
    const s = new InMemoryJourneyStore([canonical, candidate]); // candidate filtered at the boundary
    expect(s.getCanonicalMappings().length).toBe(1);
    expect(s.getCanonicalMappings()[0].mappingStatus).toBe('CANONICAL');
  });

  it('19 rebuilds the current thread state from the transition event log', () => {
    const s = new InMemoryJourneyStore();
    s.append(fjid, transition(0, 'GROUND', 'NOTICE', 'x1'), IdempotencyKey('i1'), T);
    s.append(fjid, transition(0, 'NOTICE', 'FOCUS', 'x2'), IdempotencyKey('i2'), T);
    s.append(fjid, transition(0, 'FOCUS', 'PREPARE', 'x3'), IdempotencyKey('i3'), T);
    const rebuilt = rebuildThreadJourneyState(fjid, tid, s.read(fjid));
    expect(rebuilt?.currentState).toBe('PREPARE');
    expect(rebuilt?.seq).toBe(3);
  });

  it('version stamps + branded IDs survive serialization round-trip', () => {
    const stored = serializeEvent(fjid, 1, T, IdempotencyKey('i1'), transition(1, 'GROUND', 'NOTICE', 'x1'));
    const back = deserializeEvent(stored).event as TransitionEvent;
    expect(back.ruleVersion).toBe('fsm-v1.0');
    expect(back.familyJourneyId).toBe('fj1'); // branded id is a plain string across the boundary
  });
});
