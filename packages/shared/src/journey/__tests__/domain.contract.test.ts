// Rekah Journey — runtime structural-guard tests (Phase 9B-1).
// Runs via `pnpm --filter @studiva/shared test` on macOS (native Vitest).
// These test STRUCTURE ONLY — no journey behavior, no transitions, no recommendations.
import { describe, it, expect } from 'vitest';
import {
  isJourneyState, isJourneyRole, isFallbackStatus, isCanonicalMapping, isParentSelectedFocus,
  isTransitionTrigger, isSideTransition, assertNever,
} from '../guards';
import { JOURNEY_STATES, JOURNEY_ROLES, FALLBACK_STATUSES, ENGINE_RESULT_KINDS, SIDE_TRANSITIONS } from '../enums';
import type { CanonicalJourneyContentMapping, CandidateJourneyContentMapping, Focus } from '../types';

describe('journey domain guards (structure only)', () => {
  it('accepts valid journey states and rejects invalid ones', () => {
    expect(JOURNEY_STATES.every(isJourneyState)).toBe(true);
    expect(isJourneyState('FOOBAR')).toBe(false);
    expect(isJourneyState(42)).toBe(false);
  });

  it('accepts exactly the 6 canonical journey roles', () => {
    expect(JOURNEY_ROLES.length).toBe(6);
    expect(JOURNEY_ROLES.every(isJourneyRole)).toBe(true);
    expect(isJourneyRole('FOCUS')).toBe(false); // FOCUS is a state, not a content role
  });

  it('treats fallback status as three-state, never boolean', () => {
    expect([...FALLBACK_STATUSES].sort()).toEqual(['FALLBACK_MATCH', 'NO_MATCH', 'PRIMARY_MATCH']);
    expect(isFallbackStatus('PRIMARY_MATCH')).toBe(true);
    expect(isFallbackStatus(true as unknown)).toBe(false);
  });

  it('distinguishes canonical from candidate mappings', () => {
    const canonical = { mappingStatus: 'CANONICAL', confidence: 'HIGH' } as unknown as CanonicalJourneyContentMapping;
    const candidate = { mappingStatus: 'CANDIDATE', confidence: 'MEDIUM' } as unknown as CandidateJourneyContentMapping;
    expect(isCanonicalMapping(canonical)).toBe(true);
    expect(isCanonicalMapping(candidate)).toBe(false);
  });

  it('distinguishes parent-selected focus from system focus', () => {
    const parent = { source: 'PARENT_SELECTED', parentConfirmed: true } as unknown as Focus;
    const system = { source: 'SYSTEM_SUGGESTED', parentConfirmed: false } as unknown as Focus;
    expect(isParentSelectedFocus(parent)).toBe(true);
    expect(isParentSelectedFocus(system)).toBe(false);
  });

  it('recognizes side transitions and triggers', () => {
    expect(SIDE_TRANSITIONS.every(isSideTransition)).toBe(true);
    expect(isTransitionTrigger('PAUSE')).toBe(true);
    expect(isTransitionTrigger('NOT_A_TRIGGER')).toBe(false);
  });

  it('exposes all 10 engine result kinds', () => {
    expect(ENGINE_RESULT_KINDS.length).toBe(10);
    expect(ENGINE_RESULT_KINDS).toContain('NO_MATCH');
    expect(ENGINE_RESULT_KINDS).toContain('CONFLICT');
  });

  it('assertNever throws when reached', () => {
    expect(() => assertNever('x' as never)).toThrow();
  });
});
