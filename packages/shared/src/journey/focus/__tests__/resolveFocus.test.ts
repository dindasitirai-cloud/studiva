// Rekah Journey — Focus Resolution tests (Phase 9B-4). Focus decisions ONLY; no content.
import { describe, it, expect } from 'vitest';
import { resolveFocus, focusKey, compareCandidates } from '../resolveFocus';
import type { Cand } from '../resolveFocus';
import type { FocusResolutionInput, FocusTargets } from '../types';
import type { Focus } from '../../types';
import type { EffectiveObservation } from '../../types';
import { FocusId, DevelopmentThreadId } from '../../ids';
import type { RuleVersion } from '../../types';

const RV = 'fsm-v1.0' as RuleVersion;
const T0 = '2026-01-01T00:00:00.000Z';
const NOW = '2026-01-10T00:00:00.000Z';       // 9 days later (within window)
const LATE = '2026-02-01T00:00:00.000Z';      // 31 days later (past soft window)
const tid = DevelopmentThreadId('t1');

const baseIn = (o: Partial<FocusResolutionInput> = {}): FocusResolutionInput => ({
  asOf: NOW, ruleVersion: RV, activeThreadId: tid, currentFocus: null, ...o,
});
const obs = (dom: string, cap: string, sal: 'HIGH' | 'MED' | 'LOW', life: 'ACTIVE' | 'SOFT_DECAY' | 'EXPIRED' | 'RETRACTED' = 'ACTIVE'): EffectiveObservation => ({
  observationId: ('o-' + dom + cap) as any, threadId: tid, childId: ('c1') as any, source: 'PARENT_OBSERVATION',
  signal: { axis: 'DEVELOPMENT', domainOrArea: dom, capabilityOrTopic: cap }, parentWording: null,
  salienceInitial: sal, observedAt: T0, createdAt: T0, retracted: life === 'RETRACTED', retractedAt: null,
  effectiveLifecycle: life, effectiveSalience: (life === 'EXPIRED' || life === 'RETRACTED') ? null : sal,
});
const activeFocus = (startedAt = T0): Focus => ({
  focusId: FocusId('foc-cur'), scope: 'THREAD', familyId: ('f1') as any, threadId: tid,
  source: 'SYSTEM_SUGGESTED', parentConfirmed: true, status: 'ACTIVE', rationaleText: 'r',
  informedByObservationIds: [], priorityRank: 1, createdAt: T0, startedAt, targetEndAt: null,
  completedAt: null, pausedAt: null, abandonedAt: null, seq: 0,
});

describe('parent agency', () => {
  it('1-2 parent-selected focus beats all system candidates and is parentConfirmed', () => {
    const r = resolveFocus(baseIn({
      parentSelectedTargets: { value: 'Kemandirian' },
      observations: [obs('Social-Emotional', 'Emotional Regulation', 'HIGH')],
      directionValues: ['Kasih Sayang'],
    }));
    expect(r.outcome).toBe('PROPOSE');
    expect(r.proposed?.source).toBe('PARENT_SELECTED');
    expect(r.proposed?.parentConfirmed).toBe(true);
    expect(r.reasonCode).toBe('PARENT_CHOICE');
  });
  it('3 system suggestion is parentConfirmed=false', () => {
    const r = resolveFocus(baseIn({ observations: [obs('Cognitive', 'Attention and Focus', 'HIGH')] }));
    expect(r.outcome).toBe('PROPOSE');
    expect(r.proposed?.source).toBe('SYSTEM_SUGGESTED');
    expect(r.proposed?.parentConfirmed).toBe(false);
  });
  it('5 a rejected focus is not re-proposed (unless reactivated)', () => {
    const rejectedKey = focusKey({ domainOrArea: 'Cognitive', capabilityOrTopic: 'Attention and Focus' });
    const r = resolveFocus(baseIn({ observations: [obs('Cognitive', 'Attention and Focus', 'HIGH')], rejectedKeys: [rejectedKey] }));
    expect(r.outcome).toBe('NO_FOCUS');
    const r2 = resolveFocus(baseIn({ observations: [obs('Cognitive', 'Attention and Focus', 'HIGH')], rejectedKeys: [rejectedKey], reactivatedKeys: [rejectedKey] }));
    expect(r2.outcome).toBe('PROPOSE');
  });
});

describe('continuity vs signals', () => {
  it('4 active valid focus beats a newer observation signal (CONTINUE)', () => {
    const r = resolveFocus(baseIn({ currentFocus: activeFocus(), observations: [obs('Cognitive', 'Attention and Focus', 'HIGH')] }));
    expect(r.outcome).toBe('CONTINUE');
    expect(r.focusId).toBe('foc-cur');
    expect(r.reasonCode).toBe('FOCUS_CONTINUITY');
  });
  it('22-23 past-window active focus continues with reviewDue (soft, not auto-expired)', () => {
    const r = resolveFocus(baseIn({ asOf: LATE, currentFocus: activeFocus() }));
    expect(r.outcome).toBe('CONTINUE');
    expect(r.reviewDue).toBe(true);
    const ext = resolveFocus(baseIn({ asOf: LATE, currentFocus: activeFocus(), parentSignals: { extendRequested: true } }));
    expect(ext.outcome).toBe('EXTEND');
  });
  it('lifecycle: complete / abandon / pause per explicit signals', () => {
    expect(resolveFocus(baseIn({ currentFocus: activeFocus(), systemSignals: { completionSignaled: true } })).outcome).toBe('COMPLETE');
    expect(resolveFocus(baseIn({ currentFocus: activeFocus(), systemSignals: { consecutiveSkips: 5 } })).outcome).toBe('ABANDON');
    expect(resolveFocus(baseIn({ currentFocus: activeFocus(), parentSignals: { pauseRequested: true } })).outcome).toBe('PAUSE');
  });
});

describe('constraints / context / no-focus', () => {
  it('7 a constraint blocks an otherwise valid focus', () => {
    const key = focusKey({ domainOrArea: 'Cognitive', capabilityOrTopic: 'Attention and Focus' });
    const r = resolveFocus(baseIn({ observations: [obs('Cognitive', 'Attention and Focus', 'HIGH')], constraintExcludedKeys: [key] }));
    expect(r.outcome).toBe('NO_FOCUS');
  });
  it('17-18 no candidates / all blocked -> NO_FOCUS (no fabrication)', () => {
    expect(resolveFocus(baseIn({})).outcome).toBe('NO_FOCUS');
  });
  it('6 hard constraint can block even a parent-selected focus', () => {
    const key = focusKey({ value: 'Kemandirian' });
    const r = resolveFocus(baseIn({ parentSelectedTargets: { value: 'Kemandirian' }, hardConstraintKeys: [key] }));
    expect(r.outcome).toBe('NO_FOCUS');
  });
});

describe('signal decay', () => {
  it('14 expired observation is not an active signal', () => {
    expect(resolveFocus(baseIn({ observations: [obs('Cognitive', 'Attention and Focus', 'HIGH', 'EXPIRED')] })).outcome).toBe('NO_FOCUS');
  });
  it('15-16 soft-decay observation remains eligible', () => {
    expect(resolveFocus(baseIn({ observations: [obs('Cognitive', 'Attention and Focus', 'MED', 'SOFT_DECAY')] })).outcome).toBe('PROPOSE');
  });
});

describe('lexicographic precedence (comparator)', () => {
  const C = (o: Partial<Cand>): Cand => ({
    key: 'k', targets: {}, source: 'SYSTEM_SUGGESTED', contextCompatible: true, childRelevant: false,
    directionAligned: false, journeyContinuity: false, salience: null, novel: false, ...o,
  });
  const wins = (a: Cand, b: Cand) => compareCandidates(a, b) < 0;
  it('8 context outranks everything below', () => {
    expect(wins(C({ key: 'a', contextCompatible: true }), C({ key: 'b', contextCompatible: false, childRelevant: true, directionAligned: true, salience: 'HIGH', novel: true }))).toBe(true);
  });
  it('9 child outranks direction', () => {
    expect(wins(C({ key: 'a', childRelevant: true }), C({ key: 'b', directionAligned: true }))).toBe(true);
  });
  it('10 direction outranks continuity', () => {
    expect(wins(C({ key: 'a', directionAligned: true }), C({ key: 'b', journeyContinuity: true }))).toBe(true);
  });
  it('11 continuity outranks relevance(salience)', () => {
    expect(wins(C({ key: 'a', journeyContinuity: true }), C({ key: 'b', salience: 'HIGH' }))).toBe(true);
  });
  it('12 relevance outranks novelty', () => {
    expect(wins(C({ key: 'a', salience: 'LOW' }), C({ key: 'b', novel: true }))).toBe(true);
  });
  it('13/19 equal candidates resolve by stable key-ascending tie-break', () => {
    expect(wins(C({ key: 'aaa' }), C({ key: 'bbb' }))).toBe(true);
  });
});

describe('determinism & invariants', () => {
  it('20 same input 50x -> identical output', () => {
    const input = baseIn({ observations: [obs('Cognitive', 'Attention and Focus', 'HIGH')] });
    const one = resolveFocus(input);
    for (let i = 0; i < 50; i++) expect(resolveFocus(input)).toEqual(one);
  });
  it('1/2/3 focus identity is never a content_id; no content/score fields', () => {
    const r = resolveFocus(baseIn({ observations: [obs('Cognitive', 'Attention and Focus', 'HIGH')] })) as unknown as Record<string, unknown>;
    expect('selectedContent' in r).toBe(false);
    expect('contentId' in r).toBe(false);
    expect('score' in r).toBe(false);
    expect(r.proposed && (r.proposed as any).key).not.toMatch(/^(kb-|am-|RL-)/); // not a content id
  });
  it('12 rule_version preserved', () => {
    expect(resolveFocus(baseIn({})).ruleVersion).toBe(RV);
  });
  it('4/5 parent-selected never becomes system-derived', () => {
    const r = resolveFocus(baseIn({ parentSelectedTargets: { value: 'Empati' } }));
    expect(r.proposed?.source).toBe('PARENT_SELECTED');
  });
});
