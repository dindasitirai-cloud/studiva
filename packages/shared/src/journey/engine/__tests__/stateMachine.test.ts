// Rekah Journey — deterministic FSM tests (Phase 9B-3). Transition logic ONLY.
import { describe, it, expect } from 'vitest';
import { evaluateTransition } from '../stateMachine';
import { CANONICAL_STATES } from '../types';
import type { CanonicalState, FsmInput } from '../types';
import type { TransitionTrigger, Actor } from '../../enums';
import type { RuleVersion } from '../../types';

const RV = 'fsm-v1.0' as RuleVersion;
const inp = (currentState: CanonicalState, trigger: TransitionTrigger, extra: Partial<FsmInput> = {}): FsmInput => ({
  currentState, paused: false, resumeState: null, trigger, actor: 'SYSTEM' as Actor, ruleVersion: RV, ...extra,
});

describe('canonical loop', () => {
  const cases: [CanonicalState, TransitionTrigger, CanonicalState][] = [
    ['GROUND', 'FOUNDATION_SET', 'NOTICE'],
    ['NOTICE', 'OBSERVED', 'FOCUS'],
    ['FOCUS', 'FOCUS_SELECTED', 'PREPARE'],
    ['PREPARE', 'PREPARED', 'DO'],
    ['DO', 'ACTED', 'REFLECT'],
    ['REFLECT', 'REFLECTED', 'ADAPT'],
    ['ADAPT', 'CONTINUE', 'NOTICE'],
  ];
  it.each(cases)('%s + %s -> %s', (from, trig, to) => {
    const d = evaluateTransition(inp(from, trig));
    expect(d.allowed).toBe(true);
    expect(d.toState).toBe(to);
    expect(d.result).toBe('OK');
    expect(d.lifecycle).toBe('RUNNING');
  });
});

describe('pause / resume', () => {
  it.each(CANONICAL_STATES)('PAUSE from %s captures resumeState and stays canonical', (s) => {
    const d = evaluateTransition(inp(s as CanonicalState, 'PAUSE'));
    expect(d.result).toBe('PAUSED');
    expect(d.lifecycle).toBe('PAUSED');
    expect(d.toState).toBe(s);            // canonical state unchanged
    expect(d.resumeState).toBe(s);
    expect(d.sideTransition).toBe('PAUSE');
    expect(CANONICAL_STATES).toContain(d.toState); // never emits PAUSED as a state
  });
  it('RESUME returns to the exact stored resumeState', () => {
    const d = evaluateTransition(inp('DO', 'RESUME', { paused: true, resumeState: 'DO' }));
    expect(d.allowed).toBe(true);
    expect(d.toState).toBe('DO');
    expect(d.lifecycle).toBe('RUNNING');
    expect(d.resumeState).toBe(null);
  });
  it('RESUME when not paused is INVALID', () => {
    expect(evaluateTransition(inp('DO', 'RESUME')).result).toBe('INVALID_STATE');
  });
  it('while paused, any non-RESUME trigger is INVALID', () => {
    expect(evaluateTransition(inp('DO', 'ACTED', { paused: true, resumeState: 'DO' })).result).toBe('INVALID_STATE');
  });
});

describe('side transitions', () => {
  it('SKIP advances one step in the canonical loop', () => {
    expect(evaluateTransition(inp('DO', 'SKIP')).toState).toBe('REFLECT');
    expect(evaluateTransition(inp('ADAPT', 'SKIP')).toState).toBe('NOTICE');
  });
  it('OVERRIDE defaults to FOCUS, STEP target routes to DO', () => {
    const f = evaluateTransition(inp('DO', 'OVERRIDE'));
    expect(f.toState).toBe('FOCUS'); expect(f.result).toBe('PARENT_OVERRIDE');
    const s = evaluateTransition(inp('DO', 'OVERRIDE', { overrideTarget: 'STEP' }));
    expect(s.toState).toBe('DO');
  });
  it('CHANGE_CHILD and CHANGE_CONTEXT route to NOTICE; ABANDON to FOCUS', () => {
    expect(evaluateTransition(inp('DO', 'CHANGE_CHILD')).toState).toBe('NOTICE');
    expect(evaluateTransition(inp('PREPARE', 'CHANGE_CONTEXT')).toState).toBe('NOTICE');
    expect(evaluateTransition(inp('DO', 'ABANDON')).toState).toBe('FOCUS');
  });
  it('NO_MATCH is valid only from DO and is not an error', () => {
    const d = evaluateTransition(inp('DO', 'NO_MATCH'));
    expect(d.result).toBe('NO_MATCH'); expect(d.toState).toBe('NOTICE'); expect(d.sideTransition).toBe('NO_MATCH');
    expect(evaluateTransition(inp('FOCUS', 'NO_MATCH')).result).toBe('INVALID_STATE');
  });
});

describe('invalid transitions', () => {
  it.each([['GROUND', 'ACTED'], ['NOTICE', 'REFLECTED'], ['PREPARE', 'FOCUS_SELECTED'], ['DO', 'FOUNDATION_SET']] as [CanonicalState, TransitionTrigger][])(
    '%s + %s is INVALID and stays put', (s, t) => {
      const d = evaluateTransition(inp(s, t));
      expect(d.allowed).toBe(false);
      expect(d.result).toBe('INVALID_STATE');
      expect(d.toState).toBe(s);
      expect(d.reasonCode).toBe('INVALID_TRANSITION');
    });
});

describe('determinism & invariants', () => {
  it('same input yields identical output every time', () => {
    const one = evaluateTransition(inp('DO', 'ACTED'));
    for (let i = 0; i < 50; i++) expect(evaluateTransition(inp('DO', 'ACTED'))).toEqual(one);
  });
  it('every toState is a canonical state (never PAUSED)', () => {
    const triggers: TransitionTrigger[] = ['FOUNDATION_SET', 'OBSERVED', 'FOCUS_SELECTED', 'PREPARED', 'ACTED', 'REFLECTED', 'CONTINUE', 'PAUSE', 'SKIP', 'OVERRIDE', 'CHANGE_CHILD', 'CHANGE_CONTEXT', 'ABANDON', 'NO_MATCH'];
    for (const s of CANONICAL_STATES) for (const t of triggers) {
      const d = evaluateTransition(inp(s as CanonicalState, t));
      expect(CANONICAL_STATES).toContain(d.toState);
    }
  });
  it('preserves rule_version', () => {
    expect(evaluateTransition(inp('DO', 'ACTED')).ruleVersion).toBe(RV);
  });
  it('decision carries no focus-source / content fields (no hidden logic)', () => {
    const d = evaluateTransition(inp('DO', 'ACTED')) as unknown as Record<string, unknown>;
    expect('focusSource' in d).toBe(false);
    expect('selectedContent' in d).toBe(false);
    expect('contentId' in d).toBe(false);
  });
});
