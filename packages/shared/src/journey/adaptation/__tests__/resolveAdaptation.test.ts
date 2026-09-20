// Rekah Journey — Reflection -> Adaptation tests (Phase 9B-6). Navigation only; no score/diagnosis.
import { describe, it, expect } from 'vitest';
import { resolveAdaptation } from '../resolveAdaptation';
import type { AdaptationInput } from '../types';
import type { Reflection, VersionStamp } from '../../types';
import { FocusId, DevelopmentThreadId, ReflectionId, ActionInstanceId } from '../../ids';
import type { AdaptationOutcome } from '../../enums';

const V: VersionStamp = { metadataVersion: 'v6' as any, mappingVersion: 'ctj-v1.0' as any, ruleVersion: 'fsm-v1.0' as any };
const fid = FocusId('foc1');
const tid = DevelopmentThreadId('t1');
const refl = (o: Partial<Reflection> = {}): Reflection => ({
  reflectionId: ReflectionId('r1'), actionId: ActionInstanceId('a1'), threadId: tid,
  childResponse: null, parentExperience: null, difficulty: null, relevance: null,
  willingnessToRepeat: null, contextChange: null, createdAt: '2026-01-01T00:00:00.000Z', editedAt: null, ...o,
});
const inp = (o: Partial<AdaptationInput> = {}): AdaptationInput => ({
  versions: V, focusId: fid, threadId: tid, reflection: null, ...o,
});

describe('explicit parent decisions (authoritative)', () => {
  const outcomes: AdaptationOutcome[] = ['CONTINUE', 'REPEAT', 'SIMPLIFY', 'CHANGE_APPROACH', 'EXPLORE_DEEPER', 'CHANGE_FOCUS', 'EXIT'];
  it.each(outcomes)('parent chooses %s -> that outcome, PARENT_SELECTED', (o) => {
    const r = resolveAdaptation(inp({ parentChosenOutcome: o }));
    expect(r.outcome).toBe(o);
    expect(r.provenance).toBe('PARENT_SELECTED');
    expect(r.reasonCode).toBe('PARENT_CHOICE');
  });
  it('8 parent decision beats a conflicting system signal', () => {
    const r = resolveAdaptation(inp({ parentChosenOutcome: 'CONTINUE', reflection: refl({ difficulty: 'TOO_HARD' }) }));
    expect(r.outcome).toBe('CONTINUE');           // parent wins over TOO_HARD->SIMPLIFY
    expect(r.provenance).toBe('PARENT_SELECTED');
  });
});

describe('system inference from reflection', () => {
  it('9 TOO_HARD -> SIMPLIFY (system, not diagnosis)', () => {
    const r = resolveAdaptation(inp({ reflection: refl({ difficulty: 'TOO_HARD' }) }));
    expect(r.outcome).toBe('SIMPLIFY'); expect(r.provenance).toBe('SYSTEM_DERIVED'); expect(r.preserveFocus).toBe(true);
  });
  it('12 NOT_RELEVANT -> CHANGE_APPROACH (same focus preserved)', () => {
    const r = resolveAdaptation(inp({ reflection: refl({ relevance: 'NOT_RELEVANT' }) }));
    expect(r.outcome).toBe('CHANGE_APPROACH'); expect(r.preserveFocus).toBe(true); expect(r.focusId).toBe('foc1');
  });
  it('11 willingnessToRepeat -> REPEAT', () => {
    expect(resolveAdaptation(inp({ reflection: refl({ willingnessToRepeat: true }) })).outcome).toBe('REPEAT');
  });
  it('10 neutral reflection -> CONTINUE', () => {
    expect(resolveAdaptation(inp({ reflection: refl({ childResponse: 'ENGAGED', relevance: 'RELEVANT' }) })).outcome).toBe('CONTINUE');
  });
});

describe('lifecycle / no-reflection / boundaries', () => {
  it('13-14 CHANGE_FOCUS and EXIT do not create a new focus (preserveFocus=false, focusId echoed)', () => {
    const cf = resolveAdaptation(inp({ focusLifecycleSignal: 'CHANGE_REQUESTED' }));
    expect(cf.outcome).toBe('CHANGE_FOCUS'); expect(cf.preserveFocus).toBe(false); expect(cf.focusId).toBe('foc1');
    const ex = resolveAdaptation(inp({ focusLifecycleSignal: 'ABANDONED' }));
    expect(ex.outcome).toBe('EXIT'); expect(ex.preserveFocus).toBe(false);
    expect(resolveAdaptation(inp({ focusLifecycleSignal: 'COMPLETED' })).outcome).toBe('EXIT');
  });
  it('15 no reflection does not fabricate -> CONTINUE via NO_REFLECTION_DEFAULT', () => {
    const r = resolveAdaptation(inp({ reflection: null }));
    expect(r.outcome).toBe('CONTINUE'); expect(r.triggeredBy).toBe('NO_REFLECTION_DEFAULT');
  });
  it('16-17 expired/retracted supporting signals do not change the outcome', () => {
    const expired = [{ effectiveLifecycle: 'EXPIRED' } as any];
    const a = resolveAdaptation(inp({ reflection: refl({ willingnessToRepeat: true }) }));
    const b = resolveAdaptation(inp({ reflection: refl({ willingnessToRepeat: true }), supportingSignals: expired }));
    expect(a.outcome).toBe(b.outcome);
  });
});

describe('invariants & determinism', () => {
  it('18-19 no numeric score / no diagnosis fields', () => {
    const r = resolveAdaptation(inp({ reflection: refl({ difficulty: 'TOO_HARD' }) })) as unknown as Record<string, unknown>;
    for (const k of ['score', 'successScore', 'childScore', 'developmentScore', 'diagnosis', 'severity']) expect(k in r).toBe(false);
  });
  it('6 thread identity is never changed; focusId is echoed, never generated', () => {
    const r = resolveAdaptation(inp({ reflection: refl({ relevance: 'NOT_RELEVANT' }) }));
    expect(r.focusId).toBe('foc1');
  });
  it('2 system inference is never PARENT_SELECTED', () => {
    expect(resolveAdaptation(inp({ reflection: refl({ difficulty: 'TOO_HARD' }) })).provenance).toBe('SYSTEM_DERIVED');
  });
  it('25 version stamps preserved', () => {
    const r = resolveAdaptation(inp({ reflection: refl() }));
    expect(r.versions).toEqual(V); expect(r.ruleVersion).toBe('fsm-v1.0');
  });
  it('26 determinism x50', () => {
    const i = inp({ reflection: refl({ difficulty: 'TOO_HARD' }) });
    const one = JSON.stringify(resolveAdaptation(i));
    for (let k = 0; k < 50; k++) expect(JSON.stringify(resolveAdaptation(i))).toBe(one);
  });
});
