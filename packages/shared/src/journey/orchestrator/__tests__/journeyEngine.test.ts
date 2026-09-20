// Rekah Journey — Full Engine Orchestration tests (Phase 9B-8). Conductor routing only.
import { describe, it, expect } from 'vitest';
import { journeyEngineStep } from '../journeyEngine';
import type { JourneyEngineStepInput } from '../types';
import type { VersionStamp } from '../../types';
import { FamilyId, FamilyJourneyId, DevelopmentThreadId, ChildId, FocusId, MappingId, ContentId, IdempotencyKey } from '../../ids';
import type { ActiveThreadInput } from '../../multichild/types';
import type { FocusResolutionInput } from '../../focus/types';
import type { ContentSelectionInput, ContentDescriptor } from '../../content/types';
import type { AdaptationInput } from '../../adaptation/types';
import type { CanonicalJourneyContentMapping } from '../../types';

const V: VersionStamp = { metadataVersion: 'v6' as any, mappingVersion: 'ctj-v1.0' as any, ruleVersion: 'fsm-v1.0' as any };
const T = '2026-01-01T00:00:00.000Z';
const IK = IdempotencyKey('k1');
const tid = DevelopmentThreadId('t1');
const base = (o: Partial<JourneyEngineStepInput>): JourneyEngineStepInput => ({
  currentState: 'GROUND', paused: false, resumeState: null, trigger: 'FOUNDATION_SET', actor: 'SYSTEM', versions: V, idempotencyKey: IK, ...o,
});
// module input fixtures
const F1 = FamilyId('fam1');
const atInput: ActiveThreadInput = {
  versions: V, family: { familyId: F1, createdAt: T, status: 'ACTIVE', activeThreadId: null, seq: 0 },
  familyJourney: { familyJourneyId: FamilyJourneyId('fj1'), familyId: F1, status: 'ACTIVE', startedAt: T, startedUnderVersions: V, seq: 0 },
  threads: [{ threadId: tid, familyId: F1, childId: ChildId('c1'), status: 'ACTIVE', createdAt: T, activeFocusId: null }],
};
const focusInput = (empty = false): FocusResolutionInput => empty
  ? { asOf: T, ruleVersion: V.ruleVersion, activeThreadId: tid, currentFocus: null }
  : { asOf: T, ruleVersion: V.ruleVersion, activeThreadId: tid, currentFocus: null,
      observations: [{ observationId: 'o1' as any, threadId: tid, childId: 'c1' as any, source: 'PARENT_OBSERVATION',
        signal: { axis: 'DEVELOPMENT', domainOrArea: 'Gross Motor', capabilityOrTopic: 'Locomotion and Moving Through Space' },
        parentWording: null, salienceInitial: 'HIGH', observedAt: T, createdAt: T, retracted: false, retractedAt: null,
        effectiveLifecycle: 'ACTIVE', effectiveSalience: 'HIGH' }] };
const map = (id: string, ct: string, role: string, stages: string[]): CanonicalJourneyContentMapping => ({
  mappingStatus: 'CANONICAL', confidence: 'HIGH', mappingId: ('m-' + id) as any, contentId: id as any, contentType: ct as any, primaryRole: role as any, secondaryRoles: [], stages: stages as any, mappingVersion: V.mappingVersion });
const desc = (id: string, ct: string, role: string, stages: string[], amax: number, dom: string | null, cap: string | null): ContentDescriptor =>
  ({ mapping: map(id, ct, role, stages), ageMinMonths: 0, ageMaxMonths: amax, devDomain: dom, devCapability: cap, familyValue: ct === 'KEBIASAAN_BAIK' ? ('Kemandirian' as any) : null, knowledgeArea: null, knowledgeTopic: null, parentingPracticeCandidate: false });
const grossFocus = { domainOrArea: 'Gross Motor', capabilityOrTopic: 'Locomotion and Moving Through Space' };
const contentInput = (descriptors: ContentDescriptor[], age = 8): ContentSelectionInput =>
  ({ asOf: T, versions: V, currentState: 'DO', activeFocusTargets: grossFocus, childAgeMonths: age, descriptors });
const adaptInput = (o: Partial<AdaptationInput> = {}): AdaptationInput => ({ versions: V, focusId: FocusId('foc1'), threadId: tid, reflection: null, ...o });

describe('canonical pipeline', () => {
  it('1 GROUND -> NOTICE (+ active thread resolved)', () => {
    const r = journeyEngineStep(base({ currentState: 'GROUND', trigger: 'FOUNDATION_SET', activeThreadInput: atInput }));
    expect(r.nextState).toBe('NOTICE'); expect(r.result.kind).toBe('OK'); expect(r.activeThread?.activeThreadId).toBe('t1');
  });
  it('7-8 NOTICE -> FOCUS resolves a proposal', () => {
    const r = journeyEngineStep(base({ currentState: 'NOTICE', trigger: 'OBSERVED', focusInput: focusInput() }));
    expect(r.nextState).toBe('FOCUS'); expect(r.result.kind).toBe('OK'); expect(r.focus?.outcome).toBe('PROPOSE');
    expect((r.result as any).output.focusRecommendation.candidates.length).toBe(1);
  });
  it('9 NO_FOCUS is honest and defers to NOTICE', () => {
    const r = journeyEngineStep(base({ currentState: 'NOTICE', trigger: 'OBSERVED', focusInput: focusInput(true) }));
    expect(r.result.kind).toBe('NO_FOCUS'); expect(r.nextState).toBe('NOTICE');
  });
  it('10-11 FOCUS -> PREPARE selects canonical content', () => {
    const c = contentInput([desc('RL-0-3m-KG', 'WAWASAN_TUMBUH', 'UNDERSTAND', ['PREPARE'], 12, 'Gross Motor', 'Locomotion and Moving Through Space')]);
    const r = journeyEngineStep(base({ currentState: 'FOCUS', trigger: 'FOCUS_SELECTED', contentInput: c }));
    expect(r.nextState).toBe('PREPARE'); expect(r.result.kind).toBe('OK'); expect(r.content?.selected?.contentId).toBe('RL-0-3m-KG');
  });
  it('15 PREPARE -> DO primary AM content', () => {
    const c = contentInput([desc('am-001', 'AJAK_MAIN', 'DO', ['DO'], 12, 'Gross Motor', 'Locomotion and Moving Through Space')]);
    const r = journeyEngineStep(base({ currentState: 'PREPARE', trigger: 'PREPARED', contentInput: c }));
    expect(r.nextState).toBe('DO'); expect(r.result.kind).toBe('OK'); expect(r.content?.fallbackStatus).toBe('PRIMARY_MATCH');
  });
  it('16 DO AM age-gap fallback preserved', () => {
    const c = contentInput([desc('am-001', 'AJAK_MAIN', 'DO', ['DO'], 36, 'Gross Motor', 'Locomotion and Moving Through Space'),
                            desc('kb-050', 'KEBIASAAN_BAIK', 'ROUTINE', ['DO'], 72, 'Gross Motor', 'Locomotion and Moving Through Space')], 48);
    const r = journeyEngineStep(base({ currentState: 'PREPARE', trigger: 'PREPARED', contentInput: c }));
    expect(r.result.kind).toBe('FALLBACK_ONLY');
    expect((r.result as any).output.fallbackStatus).toBe('FALLBACK_MATCH');
    expect((r.result as any).output.reason.code).toBe('AM_AGE_GAP_FALLBACK');
  });
  it('17 DO NO_MATCH stays honest', () => {
    const r = journeyEngineStep(base({ currentState: 'PREPARE', trigger: 'PREPARED', contentInput: contentInput([], 48) }));
    expect(r.result.kind).toBe('NO_MATCH');
  });
  it('18 DO -> REFLECT', () => {
    const r = journeyEngineStep(base({ currentState: 'DO', trigger: 'ACTED' }));
    expect(r.nextState).toBe('REFLECT'); expect(r.result.kind).toBe('OK');
  });
});

describe('REFLECT -> ADAPT -> next (adaptation authority)', () => {
  it('20-22 neutral reflection -> CONTINUE -> NOTICE', () => {
    const r = journeyEngineStep(base({ currentState: 'REFLECT', trigger: 'REFLECTED', adaptationInput: adaptInput() }));
    expect(r.adaptation?.outcome).toBe('CONTINUE'); expect(r.nextState).toBe('NOTICE');
  });
  it('23 parent CHANGE_FOCUS -> FOCUS', () => {
    const r = journeyEngineStep(base({ currentState: 'REFLECT', trigger: 'REFLECTED', adaptationInput: adaptInput({ parentChosenOutcome: 'CHANGE_FOCUS' }) }));
    expect(r.adaptation?.provenance).toBe('PARENT_SELECTED'); expect(r.nextState).toBe('FOCUS');
  });
  it('19 system TOO_HARD -> SIMPLIFY -> NOTICE', () => {
    const refl = { reflectionId: 'r1' as any, actionId: 'a1' as any, threadId: tid, childResponse: null, parentExperience: null, difficulty: 'TOO_HARD' as any, relevance: null, willingnessToRepeat: null, contextChange: null, createdAt: T, editedAt: null };
    const r = journeyEngineStep(base({ currentState: 'REFLECT', trigger: 'REFLECTED', adaptationInput: adaptInput({ reflection: refl }) }));
    expect(r.adaptation?.outcome).toBe('SIMPLIFY'); expect(r.adaptation?.provenance).toBe('SYSTEM_DERIVED'); expect(r.nextState).toBe('NOTICE');
  });
});

describe('side transitions & integrity', () => {
  it('27 PAUSE from DO -> PAUSED result, canonical state kept', () => {
    const r = journeyEngineStep(base({ currentState: 'DO', trigger: 'PAUSE' }));
    expect(r.result.kind).toBe('PAUSED'); expect(r.transition.lifecycle).toBe('PAUSED'); expect(r.transition.resumeState).toBe('DO');
  });
  it('28 RESUME returns to resumeState', () => {
    const r = journeyEngineStep(base({ currentState: 'DO', paused: true, resumeState: 'DO', trigger: 'RESUME' }));
    expect(r.result.kind).toBe('OK'); expect(r.nextState).toBe('DO');
  });
  it('29 CHANGE_CHILD -> NOTICE + active thread (no focus/content)', () => {
    const r = journeyEngineStep(base({ currentState: 'DO', trigger: 'CHANGE_CHILD', activeThreadInput: atInput }));
    expect(r.nextState).toBe('NOTICE'); expect(r.activeThread?.activeThreadId).toBe('t1');
    expect(r.focus).toBe(null); expect(r.content).toBe(null);
  });
  it('INVALID trigger -> INVALID_STATE', () => {
    const r = journeyEngineStep(base({ currentState: 'GROUND', trigger: 'ACTED' }));
    expect(r.result.kind).toBe('INVALID_STATE');
  });
});

describe('invariants', () => {
  it('35-36 candidate mappings cannot enter (structural) — content input is canonical-only by type', () => {
    // A ContentDescriptor.mapping is typed CanonicalJourneyContentMapping; a candidate is unrepresentable.
    const r = journeyEngineStep(base({ currentState: 'PREPARE', trigger: 'PREPARED', contentInput: contentInput([desc('RL-0-3m-KG', 'WAWASAN_TUMBUH', 'UNDERSTAND', ['PREPARE'], 12, 'Gross Motor', 'Locomotion and Moving Through Space')]) }));
    expect(r.content?.selected?.contentId).toBe('RL-0-3m-KG');
  });
  it('41 selected content is only {contentId, mappingId}', () => {
    const r = journeyEngineStep(base({ currentState: 'PREPARE', trigger: 'PREPARED', contentInput: contentInput([desc('am-001', 'AJAK_MAIN', 'DO', ['DO'], 12, 'Gross Motor', 'Locomotion and Moving Through Space')]) }));
    const sel = (r.result as any).output.selectedContent[0];
    expect(Object.keys(sel).sort()).toEqual(['contentId', 'mappingId']);
  });
  it('50 version stamps + deterministic decisionRef preserved', () => {
    const r = journeyEngineStep(base({ currentState: 'GROUND', trigger: 'FOUNDATION_SET', activeThreadInput: atInput }));
    expect(r.versions).toEqual(V);
    expect((r.result as any).output.decisionRef).toBe('k1:decision');
  });
  it('49 determinism x50', () => {
    const i = base({ currentState: 'NOTICE', trigger: 'OBSERVED', focusInput: focusInput() });
    const one = JSON.stringify(journeyEngineStep(i));
    for (let k = 0; k < 50; k++) expect(JSON.stringify(journeyEngineStep(i))).toBe(one);
  });
  it('43 orchestrator adds no hidden score/diagnosis fields', () => {
    const r = journeyEngineStep(base({ currentState: 'NOTICE', trigger: 'OBSERVED', focusInput: focusInput() })) as unknown as Record<string, unknown>;
    for (const k of ['score', 'ranking', 'childScore', 'diagnosis']) expect(k in r).toBe(false);
  });
});
