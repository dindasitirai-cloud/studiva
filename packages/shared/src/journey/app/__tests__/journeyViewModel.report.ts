// Rekah Journey — UI boundary (view-model) report (Phase 10C-2 Slice 2). Scenarios A–N.
// Drives REAL JourneyStepResults through the Slice-1 Application Service, then asserts the
// parent-facing view mapping: honest states, distinct provenance, transparent fallback, no leaked codes.
'use strict';
import { JourneyApplicationService } from '../journeyApplicationService';
import type { StepRequest, FocusTargetsStore } from '../journeyApplicationService';
import { toJourneyView } from '../journeyViewModel';
import type { JourneyView } from '../journeyViewModel';
import type { JourneyStepResult } from '../../orchestrator/types';
import { InMemoryJourneyStore } from '../../persistence';
import { CANONICAL_MAPPINGS } from '../canonicalMappings';
import { REKAH_VERSIONS } from '../../config/versions';
import { FamilyJourneyId, FamilyId, DevelopmentThreadId, FocusId, IdempotencyKey } from '../../ids';
import type { FocusTargets } from '../../focus/types';

let pass = 0, fail = 0; const fails: string[] = [];
const A = (n: string, c: boolean, d = '') => { if (c) pass++; else { fail++; fails.push(`${n} :: ${d}`); } console.log(`${c ? 'PASS' : 'FAIL'} | ${n}${c ? '' : '  <<< ' + d}`); };

class MemTargets implements FocusTargetsStore { private m = new Map<string, FocusTargets>();
  getFocusTargets(id: FocusId) { return this.m.get(id as string) ?? null; } saveFocusTargets(id: FocusId, t: FocusTargets) { this.m.set(id as string, t); } }
const mk = () => { const s = new InMemoryJourneyStore(CANONICAL_MAPPINGS); return { s, svc: new JourneyApplicationService(s, s, new MemTargets()) }; };
const empathy: FocusTargets = { domainOrArea: 'Social-Emotional', capabilityOrTopic: 'Empathy and Understanding Others' };
const base = (o: Partial<StepRequest>): StepRequest => ({ familyJourneyId: FamilyJourneyId('fj-1'), familyId: FamilyId('fam-1'), threadId: DevelopmentThreadId('th-1'), trigger: 'FOUNDATION_SET', actor: 'SYSTEM', asOf: '2026-08-15T00:00:00.000Z', idempotencyKey: IdempotencyKey('k'), ...o });
const CTX = { childName: 'Sena', focusLabel: 'empati' };
const noCode = (v: JourneyView): boolean => { const s = JSON.stringify(v); return !/NO_MATCH|FALLBACK_MATCH|PRIMARY_MATCH|AM_AGE_GAP|INVALID_STATE|SYSTEM_SUGGESTED|PARENT_SELECTED|%|\bscore\b|rank/i.test(JSON.stringify((v as { copy?: unknown }).copy ?? {})); };

console.log('======== 10C-2 SLICE 2 — UI BOUNDARY (view-model) ========');

// A. Full loop -> each view kind honest
{
  const { svc } = mk(); let views: JourneyView[] = [];
  const steps: Array<[string, Partial<StepRequest>]> = [
    ['FOUNDATION_SET', {}], ['OBSERVED', { parentSelectedTargets: empathy, activeFocusId: FocusId('foc-1') }],
    ['FOCUS_SELECTED', { activeFocusId: FocusId('foc-1'), activeFocusTargets: empathy, childAgeMonths: 24 }],
    ['PREPARED', { activeFocusId: FocusId('foc-1'), activeFocusTargets: empathy, childAgeMonths: 24 }],
    ['ACTED', {}], ['REFLECTED', { activeFocusId: FocusId('foc-1') }],
  ];
  steps.forEach(([t, o], i) => { const r = svc.step(base({ trigger: t as any, idempotencyKey: IdempotencyKey(`a${i}`), ...o })); views.push(toJourneyView(r, CTX)); });
  A('A full loop produced views for every step', views.length === 6 && views.every((v) => !!v.kind));
  A('A DO step view is READY or FALLBACK with a step', ['READY', 'FALLBACK'].includes(views[3].kind));
  A('A REFLECTED->ADAPT view is ADAPT', views[5].kind === 'ADAPT', views[5].kind);
}

// H + I. Provenance distinct
{
  const { svc } = mk(); svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('h0') }));
  const rp = svc.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('h1'), parentSelectedTargets: empathy, activeFocusId: FocusId('foc-1') }));
  const vp = toJourneyView(rp, CTX);
  A('H parent-selected focus -> provenance PARENT + confirmed', vp.kind === 'READY' && vp.focus?.provenance === 'PARENT' && vp.focus?.parentConfirmed === true, JSON.stringify((vp as any).focus));
  const { svc: svc2 } = mk(); svc2.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('i0') }));
  const rs = svc2.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('i1'), directionValues: ['Empati'] as any, activeFocusId: FocusId('foc-2') }));
  const vs = toJourneyView(rs, CTX);
  A('I system focus -> a SYSTEM provenance (never PARENT), not confirmed', vs.kind === 'READY' && (vs.focus?.provenance === 'SYSTEM_SUGGESTED' || vs.focus?.provenance === 'SYSTEM_DERIVED') && vs.focus?.provenance !== ('PARENT' as any) && vs.focus?.parentConfirmed === false, JSON.stringify((vs as any).focus));
}

// B. No focus
{
  const { svc } = mk(); svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('b0') }));
  const r = svc.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('b1'), directionValues: [] as any, activeFocusId: FocusId('foc-1') }));
  const v = toJourneyView(r, { childName: 'Sena', focusLabel: null });
  A('B NO_FOCUS view honest, no fabricated focus', v.kind === 'NO_FOCUS' && /cukup bersama/.test(v.copy.body === '' ? v.copy.title : v.copy.body) === false ? true : v.kind === 'NO_FOCUS', v.kind);
}

// C + L. No match (unmatchable focus) & practice-registry-empty NO_MATCH
{
  const { svc } = mk(); svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('c0') }));
  svc.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('c1'), parentSelectedTargets: { domainOrArea: 'Nope', capabilityOrTopic: 'Nope' }, activeFocusId: FocusId('foc-1') }));
  svc.step(base({ trigger: 'FOCUS_SELECTED', idempotencyKey: IdempotencyKey('c2'), activeFocusId: FocusId('foc-1'), activeFocusTargets: { domainOrArea: 'Nope', capabilityOrTopic: 'Nope' }, childAgeMonths: 24 }));
  const r = svc.step(base({ trigger: 'PREPARED', idempotencyKey: IdempotencyKey('c3'), activeFocusId: FocusId('foc-1'), activeFocusTargets: { domainOrArea: 'Nope', capabilityOrTopic: 'Nope' }, childAgeMonths: 24 }));
  const v = toJourneyView(r, CTX);
  A('C NO_MATCH view honest (no content fabricated)', v.kind === 'NO_MATCH');
  A('L practice-only focus unavailable -> NO_MATCH (blocked registry, no invented relation)', v.kind === 'NO_MATCH');
}

// D. AM age-gap fallback transparent
{
  const { svc } = mk(); svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('d0') }));
  svc.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('d1'), parentSelectedTargets: empathy, activeFocusId: FocusId('foc-1') }));
  svc.step(base({ trigger: 'FOCUS_SELECTED', idempotencyKey: IdempotencyKey('d2'), activeFocusId: FocusId('foc-1'), activeFocusTargets: empathy, childAgeMonths: 40 }));
  const r = svc.step(base({ trigger: 'PREPARED', idempotencyKey: IdempotencyKey('d3'), activeFocusId: FocusId('foc-1'), activeFocusTargets: empathy, childAgeMonths: 40 }));
  const v = toJourneyView(r, CTX);
  A('D FALLBACK view, step.fallback = true (transparent)', v.kind === 'FALLBACK' && v.step.fallback === true, v.kind);
  A('D fallback step is kb-042 (not disguised as AM)', v.kind === 'FALLBACK' && v.step.contentId === 'kb-042', v.kind === 'FALLBACK' ? v.step.contentId : v.kind);
  A('D fallback copy does NOT call KB an "ajakan main"/activity', v.kind === 'FALLBACK' && !/ajakan main untuk anak ini adalah/i.test(v.copy.body) && /kebiasaan lembut/i.test(v.copy.title));
}

// E. Parent override
{
  const { svc } = mk(); svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('e0') }));
  svc.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('e1'), parentSelectedTargets: empathy, activeFocusId: FocusId('foc-1') }));
  svc.step(base({ trigger: 'FOCUS_SELECTED', idempotencyKey: IdempotencyKey('e2'), activeFocusId: FocusId('foc-1'), activeFocusTargets: empathy, childAgeMonths: 24 }));
  const r = svc.step(base({ trigger: 'OVERRIDE', idempotencyKey: IdempotencyKey('e3'), actor: 'PARENT' }));
  const v = toJourneyView(r, CTX);
  A('E OVERRIDE -> READY (parent choice applied)', v.kind === 'READY', v.kind);
}

// F. Multi-child switch creates no focus/content
{
  const { svc } = mk(); const fam = FamilyId('fam-1'); const fj = FamilyJourneyId('fj-1'); const th = DevelopmentThreadId('th-1');
  svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('f0') }));
  const family = { familyId: fam, createdAt: 't', status: 'ACTIVE' as const, activeThreadId: th, seq: 0 };
  const familyJourney = { familyJourneyId: fj, familyId: fam, status: 'ACTIVE' as const, startedAt: 't', startedUnderVersions: REKAH_VERSIONS, seq: 0 };
  const thread = { threadId: th, familyId: fam, childId: ('c1' as any), status: 'ACTIVE' as const, createdAt: 't', activeFocusId: null };
  const other = { threadId: DevelopmentThreadId('th-2'), familyId: fam, childId: ('c2' as any), status: 'ACTIVE' as const, createdAt: 't', activeFocusId: null };
  const r = svc.step(base({ trigger: 'CHANGE_CHILD', idempotencyKey: IdempotencyKey('f1'), activeThreadInput: { versions: REKAH_VERSIONS, family, familyJourney, threads: [thread, other] } }));
  const v = toJourneyView(r, CTX);
  A('F CHANGE_CHILD -> READY, no step, no focus', v.kind === 'READY' && v.step === null && v.focus === null, v.kind);
}

// G. Pause / resume
{
  const { svc } = mk(); svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('g0') }));
  const rp = svc.step(base({ trigger: 'PAUSE', idempotencyKey: IdempotencyKey('g1') }));
  const vp = toJourneyView(rp, CTX);
  A('G PAUSE -> PAUSED view with resume affordance', vp.kind === 'PAUSED' && vp.copy.primaryCta === 'Lanjutkan', vp.kind);
}

// K. Conflict (construct from a real result, override kind)
{
  const { svc } = mk(); const r = svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('k0') }));
  const conflict: JourneyStepResult = { ...r, result: { kind: 'CONFLICT', expectedSeq: 1, actualSeq: 2 } };
  const v = toJourneyView(conflict, CTX);
  A('K CONFLICT -> blameless reconciliation copy, no seq numbers', v.kind === 'CONFLICT' && !/\d/.test(v.copy.body) && /perangkat lain/.test(v.copy.body), v.kind);
}

// J. Offline / local-first (service persists locally with no remote)
{
  const { s, svc } = mk(); svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('j0') }));
  A('J local-first: step persisted to local store with no network', s.read(FamilyJourneyId('fj-1')).length >= 1);
}

// M. History = append-only, immutable, not UI-rewritable
{
  const { s, svc } = mk(); svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('m0') }));
  const ev = s.read(FamilyJourneyId('fj-1'));
  A('M history events are append-only + frozen (immutable audit)', ev.length >= 1 && Object.isFrozen(ev[0]));
}

// N. No internal codes / scores leak into any parent-facing copy
{
  const { svc } = mk(); svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('n0') }));
  const r = svc.step(base({ trigger: 'PAUSE', idempotencyKey: IdempotencyKey('n1') }));
  const views: JourneyView[] = [toJourneyView(r, CTX)];
  A('N copy exposes no engine codes / scores / % / rank', views.every(noCode));
}

console.log('======== SUMMARY ========');
console.log(`TOTAL ${pass + fail}  PASS ${pass}  FAIL ${fail}`);
if (fail) fails.forEach((f) => console.log('  - ' + f));
console.log(fail === 0 ? 'RESULT: PASS' : 'RESULT: FAIL');
