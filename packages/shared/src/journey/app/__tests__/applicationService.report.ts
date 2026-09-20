// Rekah Journey — Application Service integration report (Phase 10C-2 Slice 1).
// Black-box: drives the SERVICE (not the engine directly) against the proven InMemoryJourneyStore
// + real frozen metadata. Proves the boundary preserves engine behavior and duplicates no logic.
'use strict';
import { JourneyApplicationService } from '../journeyApplicationService';
import type { StepRequest, FocusTargetsStore } from '../journeyApplicationService';
import { InMemoryJourneyStore, rebuildThreadJourneyState } from '../../persistence';
import { buildAllDescriptors } from '../descriptorAssembly';
import { CANONICAL_MAPPINGS } from '../canonicalMappings';
import { REKAH_VERSIONS } from '../../config/versions';
import { selectContent } from '../../content/selectContent';
import { ALL_CONTENT_METADATA } from '../../../content/metadata';
import { FamilyJourneyId, FamilyId, DevelopmentThreadId, FocusId, IdempotencyKey } from '../../ids';
import type { FocusTargets } from '../../focus/types';

let pass = 0, fail = 0; const fails: string[] = [];
const A = (n: string, c: boolean, d = '') => { if (c) pass++; else { fail++; fails.push(`${n} :: ${d}`); } console.log(`${c ? 'PASS' : 'FAIL'} | ${n}${c ? '' : '  <<< ' + d}`); };
const byId = (id: string) => ALL_CONTENT_METADATA.find((x) => x.content_id === id)!;

class MemTargets implements FocusTargetsStore {
  private m = new Map<string, FocusTargets>();
  getFocusTargets(id: FocusId) { return this.m.get(id as string) ?? null; }
  saveFocusTargets(id: FocusId, t: FocusTargets) { this.m.set(id as string, t); }
}
const mk = () => { const store = new InMemoryJourneyStore(CANONICAL_MAPPINGS); return new JourneyApplicationService(store, store, new MemTargets()); };
const ids = () => ({ familyJourneyId: FamilyJourneyId('fj-1'), familyId: FamilyId('fam-1'), threadId: DevelopmentThreadId('th-1') });
const empathy: FocusTargets = { domainOrArea: 'Social-Emotional', capabilityOrTopic: 'Empathy and Understanding Others' };

const base = (over: Partial<StepRequest>): StepRequest => ({
  ...ids(), trigger: 'FOUNDATION_SET', actor: 'SYSTEM', asOf: '2026-08-15T00:00:00.000Z',
  idempotencyKey: IdempotencyKey('k'), ...over,
});

console.log('======== 10C-2 SLICE 1 — APPLICATION SERVICE ========');

// ---- 1. Full loop through the SERVICE + projection replay ----
{
  const store = new InMemoryJourneyStore(CANONICAL_MAPPINGS);
  const svc = new JourneyApplicationService(store, store, new MemTargets());
  const { familyJourneyId, threadId } = ids();
  const seq: Array<[string, string]> = [
    ['FOUNDATION_SET', 'NOTICE'], ['OBSERVED', 'FOCUS'], ['FOCUS_SELECTED', 'PREPARE'],
    ['PREPARED', 'DO'], ['ACTED', 'REFLECT'], ['REFLECTED', 'NOTICE'],
  ];
  let last = '';
  seq.forEach(([trig, expect], i) => {
    const r = svc.step(base({
      trigger: trig as any, idempotencyKey: IdempotencyKey(`loop-${i}`),
      parentSelectedTargets: trig === 'OBSERVED' ? empathy : null,
      activeFocusId: FocusId('foc-1'), activeFocusTargets: empathy, childAgeMonths: 24,
    }));
    A(`loop ${trig}->${r.nextState}`, r.nextState === expect, JSON.stringify({ got: r.nextState, kind: r.result.kind }));
    last = r.nextState;
  });
  const events = store.read(familyJourneyId);
  const proj = rebuildThreadJourneyState(familyJourneyId, threadId, events);
  A('projection replay == executed final state', !!proj && proj.currentState === last, JSON.stringify({ proj: proj?.currentState, last }));
  A('event stream sequences strictly monotonic', events.every((e, i) => e.sequence === i + 1), String(events.length));
  A('at least one TRANSITION persisted per step', store.readByKind(familyJourneyId, 'TRANSITION').length === seq.length);
}

// ---- 2. Parent agency provenance ----
{
  const svc = mk();
  svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('pa-g') })); // GROUND->NOTICE first
  const r = svc.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('pa'), parentSelectedTargets: empathy, activeFocusId: FocusId('foc-1') }));
  A('parent-selected focus -> PARENT_SELECTED + parentConfirmed', r.focus?.proposed?.source === 'PARENT_SELECTED' && r.focus?.proposed?.parentConfirmed === true, JSON.stringify(r.focus?.proposed));
  const svc2 = mk();
  svc2.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('pa2-g') }));
  const r2 = svc2.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('pa2'), directionValues: ['Empati'] as any, activeFocusId: FocusId('foc-2') }));
  A('system-suggested focus proposed AND not auto-confirmed', !!r2.focus?.proposed && r2.focus.proposed.parentConfirmed === false && r2.focus.proposed.source !== 'PARENT_SELECTED', JSON.stringify(r2.focus?.proposed));
}

// ---- 3. AM age-gap fallback (>36mo) via the service ----
{
  const svc = mk();
  // put the thread at PREPARE so PREPARED->DO runs content selection
  svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('g') }));
  svc.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('n'), parentSelectedTargets: empathy, activeFocusId: FocusId('foc-1') }));
  svc.step(base({ trigger: 'FOCUS_SELECTED', idempotencyKey: IdempotencyKey('f'), activeFocusId: FocusId('foc-1'), activeFocusTargets: empathy, childAgeMonths: 40 }));
  const doR = svc.step(base({ trigger: 'PREPARED', idempotencyKey: IdempotencyKey('d'), activeFocusId: FocusId('foc-1'), activeFocusTargets: empathy, childAgeMonths: 40 }));
  A('DO@40 empathy -> FALLBACK_MATCH', doR.content?.fallbackStatus === 'FALLBACK_MATCH', String(doR.content?.fallbackStatus));
  A('reasonCode AM_AGE_GAP_FALLBACK', doR.content?.reasonCode === 'AM_AGE_GAP_FALLBACK', String(doR.content?.reasonCode));
  A('fallback selected kb-042 (real KEBIASAAN_BAIK)', doR.content?.selected?.contentId === 'kb-042' && byId('kb-042').content_type === 'KEBIASAAN_BAIK', String(doR.content?.selected?.contentId));
}

// ---- 4. Candidate quarantine + practice registry BLOCKED -> NO_MATCH ----
{
  const desc = buildAllDescriptors();
  A('descriptors = 172, all CANONICAL', desc.length === 172 && desc.every((d) => d.mapping.mappingStatus === 'CANONICAL'), String(desc.length));
  A('no PRODUCTION content_type PARENTING_PRACTICE', ALL_CONTENT_METADATA.every((m) => (m.content_type as string) !== 'PARENTING_PRACTICE'));
  // practice-only focus with EMPTY registry -> practices carry no relatedFocusKeys -> NO_MATCH
  const ppFocus: FocusTargets = { domainOrArea: 'PARENTING', capabilityOrTopic: 'Co-Regulation' };
  const r = selectContent({ asOf: 't', versions: REKAH_VERSIONS, currentState: 'DO', activeFocusTargets: ppFocus, childAgeMonths: 12, descriptors: desc });
  A('practice registry empty -> practice NO_MATCH (no invented relation)', r.fallbackStatus === 'NO_MATCH', r.fallbackStatus);
}

// ---- 5. Multi-child CHANGE_CHILD does not create focus/content ----
{
  const svc = mk();
  const { familyId, familyJourneyId, threadId } = ids();
  const family = { familyId, createdAt: 't', status: 'ACTIVE' as const, activeThreadId: threadId, seq: 0 };
  const familyJourney = { familyJourneyId, familyId, status: 'ACTIVE' as const, startedAt: 't', startedUnderVersions: REKAH_VERSIONS, seq: 0 };
  const thread = { threadId, familyId, childId: ('c1' as any), status: 'ACTIVE' as const, createdAt: 't', activeFocusId: null };
  const otherThread = { threadId: DevelopmentThreadId('th-2'), familyId, childId: ('c2' as any), status: 'ACTIVE' as const, createdAt: 't', activeFocusId: null };
  svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('mc-g') }));
  const r = svc.step(base({ trigger: 'CHANGE_CHILD', idempotencyKey: IdempotencyKey('mc'),
    activeThreadInput: { versions: REKAH_VERSIONS, family, familyJourney, threads: [thread, otherThread] } }));
  A('CHANGE_CHILD routes to NOTICE', r.nextState === 'NOTICE', r.nextState);
  A('CHANGE_CHILD creates NO focus', r.focus === null);
  A('CHANGE_CHILD selects NO content', r.content === null);
  A('CHANGE_CHILD produced an activeThread decision', r.activeThread != null);
}

// ---- 6. Determinism + service adds no decision logic ----
{
  const s1 = mk(); const s2 = mk();
  const req = base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('det'), parentSelectedTargets: empathy, activeFocusId: FocusId('foc-1') });
  A('determinism: identical request -> identical result', JSON.stringify(s1.step(req)) === JSON.stringify(s2.step(req)));
  // service DO selection equals a DIRECT selectContent call (service re-ranks nothing)
  const direct = selectContent({ asOf: '2026-08-15T00:00:00.000Z', versions: REKAH_VERSIONS, currentState: 'DO', activeFocusTargets: empathy, childAgeMonths: 24, descriptors: buildAllDescriptors() });
  const svc = mk();
  svc.step(base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('x1') }));
  svc.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('x2'), parentSelectedTargets: empathy, activeFocusId: FocusId('foc-1') }));
  svc.step(base({ trigger: 'FOCUS_SELECTED', idempotencyKey: IdempotencyKey('x3'), activeFocusId: FocusId('foc-1'), activeFocusTargets: empathy, childAgeMonths: 24 }));
  const svcDo = svc.step(base({ trigger: 'PREPARED', idempotencyKey: IdempotencyKey('x4'), activeFocusId: FocusId('foc-1'), activeFocusTargets: empathy, childAgeMonths: 24 }));
  A('service DO selection == direct selectContent (no re-ranking)', svcDo.content?.selected?.contentId === direct.selected?.contentId && svcDo.content?.fallbackStatus === direct.fallbackStatus, JSON.stringify({ svc: svcDo.content?.selected?.contentId, direct: direct.selected?.contentId }));
}

// ---- 7. Idempotency + version stamp ----
{
  const store = new InMemoryJourneyStore(CANONICAL_MAPPINGS);
  const svc = new JourneyApplicationService(store, store, new MemTargets());
  const { familyJourneyId } = ids();
  const req = base({ trigger: 'FOUNDATION_SET', idempotencyKey: IdempotencyKey('idem-1') });
  svc.step(req); const after1 = store.read(familyJourneyId).length;
  svc.step(req); const after2 = store.read(familyJourneyId).length;
  A('idempotent replay: same key does not duplicate events', after1 === after2, `${after1} vs ${after2}`);
  const r = svc.step(base({ trigger: 'OBSERVED', idempotencyKey: IdempotencyKey('v'), parentSelectedTargets: empathy, activeFocusId: FocusId('foc-1') }));
  A('version stamp preserved (v6/v1.0/v1.0)', r.versions.metadataVersion === 'v6' && r.versions.mappingVersion === 'v1.0' && r.versions.ruleVersion === 'v1.0');
}

console.log('======== SUMMARY ========');
console.log(`TOTAL ${pass + fail}  PASS ${pass}  FAIL ${fail}`);
if (fail) { console.log('FAILURES:'); fails.forEach((f) => console.log('  - ' + f)); }
console.log(fail === 0 ? 'RESULT: PASS' : 'RESULT: FAIL');
