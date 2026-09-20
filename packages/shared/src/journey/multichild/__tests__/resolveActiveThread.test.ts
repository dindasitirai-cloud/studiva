// Rekah Journey — Multi-Child orchestration tests (Phase 9B-7). Active-thread selection only.
import { describe, it, expect } from 'vitest';
import { resolveActiveThread } from '../resolveActiveThread';
import { familyPracticeDedupKey, threadFocusIdentity } from '../types';
import type { ActiveThreadInput } from '../types';
import type { Family, FamilyJourney, DevelopmentThread, VersionStamp } from '../../types';
import { FamilyId, FamilyJourneyId, DevelopmentThreadId, ChildId } from '../../ids';

const V: VersionStamp = { metadataVersion: 'v6' as any, mappingVersion: 'ctj-v1.0' as any, ruleVersion: 'fsm-v1.0' as any };
const F1 = FamilyId('fam1');
const family = (activeThreadId: string | null): Family => ({ familyId: F1, createdAt: 't', status: 'ACTIVE', activeThreadId: (activeThreadId as any), seq: 0 });
const journey = (fid = F1): FamilyJourney => ({ familyJourneyId: FamilyJourneyId('fj1'), familyId: fid, status: 'ACTIVE', startedAt: 't', startedUnderVersions: V, seq: 0 });
const thread = (id: string, fam = F1, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' = 'ACTIVE'): DevelopmentThread => ({ threadId: DevelopmentThreadId(id), familyId: fam, childId: ChildId('c-' + id), status, createdAt: 't', activeFocusId: null });
const inp = (o: Partial<ActiveThreadInput>): ActiveThreadInput => ({ versions: V, family: family(null), familyJourney: journey(), threads: [], ...o });

describe('parent agency', () => {
  it('1 one-child family selects that thread (system)', () => {
    const r = resolveActiveThread(inp({ threads: [thread('A')] }));
    expect(r.activeThreadId).toBe('A'); expect(r.provenance).toBe('SYSTEM_SUGGESTED');
  });
  it('2-3 parent explicitly selects a child', () => {
    const r = resolveActiveThread(inp({ threads: [thread('A'), thread('B')], parentSelectedThreadId: DevelopmentThreadId('B') }));
    expect(r.activeThreadId).toBe('B'); expect(r.provenance).toBe('PARENT_SELECTED'); expect(r.reasonCode).toBe('PARENT_CHOICE');
  });
  it('4 parent beats system suggestion (even if B has the signal)', () => {
    const r = resolveActiveThread(inp({ threads: [thread('A'), thread('B')], parentSelectedThreadId: DevelopmentThreadId('A'), signalThreadIds: [DevelopmentThreadId('B')] }));
    expect(r.activeThreadId).toBe('A'); expect(r.provenance).toBe('PARENT_SELECTED');
  });
});

describe('continuity & suggestion', () => {
  it('5 existing active thread beats a weak new signal on another thread', () => {
    const r = resolveActiveThread(inp({ family: family('A'), threads: [thread('A'), thread('B')], signalThreadIds: [DevelopmentThreadId('B')] }));
    expect(r.activeThreadId).toBe('A'); expect(r.reasonCode).toBe('ACTIVE_THREAD_CONTINUITY'); expect(r.requiresChildChange).toBe(false);
  });
  it('7-8 deterministic suggestion: signal then stable tie-break', () => {
    expect(resolveActiveThread(inp({ threads: [thread('B'), thread('A')] })).activeThreadId).toBe('A'); // tie-break asc
    expect(resolveActiveThread(inp({ threads: [thread('A'), thread('B')], signalThreadIds: [DevelopmentThreadId('B')] })).activeThreadId).toBe('B'); // signal wins the tie
  });
  it('6 no eligible thread -> NO_ACTIVE_THREAD', () => {
    const r = resolveActiveThread(inp({ threads: [] }));
    expect(r.outcome).toBe('NO_ACTIVE_THREAD'); expect(r.activeThreadId).toBe(null); expect(r.provenance).toBe('NO_SELECTION');
  });
});

describe('ownership / integrity', () => {
  it('9-10 thread from another family (== another journey) is rejected', () => {
    const other = thread('X', FamilyId('fam2'));
    const r = resolveActiveThread(inp({ threads: [other], parentSelectedThreadId: DevelopmentThreadId('X') }));
    expect(r.reasonCode).toBe('THREAD_OWNERSHIP_REJECTED'); expect(r.activeThreadId).toBe(null);
  });
  it('11 journey/family mismatch rejected', () => {
    const r = resolveActiveThread(inp({ familyJourney: journey(FamilyId('famZ')), threads: [thread('A')] }));
    expect(r.reasonCode).toBe('THREAD_OWNERSHIP_REJECTED');
  });
  it('parent-selected but archived -> NO_ELIGIBLE_THREAD', () => {
    const r = resolveActiveThread(inp({ threads: [thread('A', F1, 'ARCHIVED')], parentSelectedThreadId: DevelopmentThreadId('A') }));
    expect(r.reasonCode).toBe('NO_ELIGIBLE_THREAD');
  });
});

describe('child switching', () => {
  it('12-13-14 switching returns CHANGE_CHILD trigger only (no focus/content/FSM)', () => {
    const r = resolveActiveThread(inp({ family: family('A'), threads: [thread('A'), thread('B')], parentSelectedThreadId: DevelopmentThreadId('B') })) as unknown as Record<string, unknown>;
    expect(r.requiresChildChange).toBe(true);
    expect(r.changeChildTrigger).toBe('CHANGE_CHILD');
    for (const k of ['focus', 'focusId', 'selectedContent', 'nextState', 'outcomeState']) expect(k in r).toBe(false);
  });
  it('23-24 paused/inactive thread does not auto-resume (not eligible unless status ACTIVE)', () => {
    const r = resolveActiveThread(inp({ family: family('A'), threads: [thread('A', F1, 'INACTIVE'), thread('B')] }));
    expect(r.activeThreadId).toBe('B'); // A (inactive) is not kept; B suggested. No auto-resume of A.
  });
});

describe('scope helpers & invariants', () => {
  it('14-19 family-level dedup key is (content_id, family, week), not per child', () => {
    const k = familyPracticeDedupKey('am-ko-regulasi', F1, '2026-W02');
    expect(k).toBe('am-ko-regulasi::fam1::2026-W02');
    expect(k.includes('child')).toBe(false);
  });
  it('15-26 identical focus keys across children keep distinct (threadId, focusId) identity', () => {
    const a = threadFocusIdentity(DevelopmentThreadId('A'), 'value|Kemandirian|');
    const b = threadFocusIdentity(DevelopmentThreadId('B'), 'value|Kemandirian|');
    expect(a).not.toBe(b);
  });
  it('29-30 no numeric score / no diagnosis fields', () => {
    const r = resolveActiveThread(inp({ threads: [thread('A')] })) as unknown as Record<string, unknown>;
    for (const k of ['score', 'childPriorityScore', 'needScore', 'urgencyScore', 'diagnosis']) expect(k in r).toBe(false);
  });
  it('27-28 provenance preserved (parent vs system)', () => {
    expect(resolveActiveThread(inp({ threads: [thread('A')], parentSelectedThreadId: DevelopmentThreadId('A') })).provenance).toBe('PARENT_SELECTED');
    expect(resolveActiveThread(inp({ threads: [thread('A')] })).provenance).toBe('SYSTEM_SUGGESTED');
  });
  it('35 version stamps preserved', () => {
    const r = resolveActiveThread(inp({ threads: [thread('A')] }));
    expect(r.versions).toEqual(V); expect(r.ruleVersion).toBe('fsm-v1.0');
  });
  it('36 determinism x50', () => {
    const i = inp({ threads: [thread('A'), thread('B'), thread('C')], signalThreadIds: [DevelopmentThreadId('B')] });
    const one = JSON.stringify(resolveActiveThread(i));
    for (let k = 0; k < 50; k++) expect(JSON.stringify(resolveActiveThread(i))).toBe(one);
  });
});
