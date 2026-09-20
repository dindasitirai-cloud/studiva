/* Rekah Journey — Phase 9B-9 Integration & Production Validation (VALIDATION ONLY).
 * Additive, black-box. Imports only PUBLIC module surfaces + FROZEN metadata. Mutates nothing.
 * Runs the whole engine (orchestrator + 6 modules + persistence) over REAL v6 content IDs.
 * No new rules/scores/diagnosis. Deterministic: fixed timestamps, no Date/random.
 */
'use strict';
import { ALL_CONTENT_METADATA } from '../../../content/metadata';
import type { ContentMetadata } from '../../../content/metadata';
import { journeyEngineStep } from '../../orchestrator';
import type { JourneyEngineStepInput } from '../../orchestrator/types';
import { evaluateTransition } from '../../engine/stateMachine';
import { CANONICAL_STATES } from '../../engine/types';
import type { CanonicalState } from '../../engine/types';
import { resolveActiveThread } from '../../multichild/resolveActiveThread';
import { familyPracticeDedupKey } from '../../multichild/types';
import { selectContent } from '../../content/selectContent';
import type { ContentDescriptor } from '../../content/types';
import { focusKey } from '../../focus/resolveFocus';
import type { FocusTargets } from '../../focus/types';
import {
  InMemoryJourneyStore, rebuildThreadJourneyState, serializeEvent, deepFreeze,
} from '../../persistence';
import type { StoredEvent, JourneyEvent } from '../../persistence';
import type {
  CanonicalJourneyContentMapping, CandidateJourneyContentMapping, VersionStamp,
  MetadataVersion, MappingVersion, RuleVersion, TransitionEvent, Family, FamilyJourney,
  DevelopmentThread, Focus, EffectiveObservation, Reflection,
} from '../../types';
import type { JourneyRole, ContentStage, Actor } from '../../enums';
import {
  ContentId, MappingId, FamilyId, FamilyJourneyId, DevelopmentThreadId, ChildId, FocusId,
  IdempotencyKey, TransitionId, ReflectionId, ActionInstanceId,
} from '../../ids';

// ---------- assertion harness ----------
let pass = 0, fail = 0; const failures: string[] = [];
const A = (name: string, cond: boolean, detail = ''): void => {
  if (cond) { pass++; } else { fail++; failures.push(`${name} :: ${detail}`); }
  console.log(`${cond ? 'PASS' : 'FAIL'} | ${name}${cond ? '' : '  <<< ' + detail}`);
};
const B = <T>(s: string): T => s as unknown as T;
const V: VersionStamp = {
  metadataVersion: B<MetadataVersion>('meta-v6'),
  mappingVersion: B<MappingVersion>('map-v1.0'),
  ruleVersion: B<RuleVersion>('rule-v1.0'),
};
const TS = '2026-08-15T00:00:00.000Z';

// ---------- role matrix (FROZEN Phase 7A/7B) ----------
function roleFor(m: ContentMetadata): { role: JourneyRole; stages: ContentStage[] } {
  if (m.content_type === 'WAWASAN_TUMBUH') return { role: 'UNDERSTAND', stages: ['NOTICE', 'PREPARE'] };
  if (m.content_type === 'KEBIASAAN_BAIK') return { role: 'ROUTINE', stages: ['DO'] };
  if (m.candidate_content_type === 'PARENTING_PRACTICE') return { role: 'PARENT_IMPLEMENTATION', stages: ['PREPARE', 'DO'] };
  return { role: 'DO', stages: ['DO'] }; // plain AJAK_MAIN
}
const mappingOf = (m: ContentMetadata): CanonicalJourneyContentMapping => {
  const r = roleFor(m);
  return {
    mappingId: MappingId(`map-${m.content_id}`), contentId: ContentId(m.content_id),
    contentType: m.content_type, primaryRole: r.role, secondaryRoles: [], stages: r.stages,
    mappingVersion: B<MappingVersion>('map-v1.0'), mappingStatus: 'CANONICAL', confidence: 'HIGH',
  };
};
const descOf = (m: ContentMetadata, relatedFocusKeys?: readonly string[]): ContentDescriptor => ({
  mapping: mappingOf(m), ageMinMonths: m.age_range.min_months, ageMaxMonths: m.age_range.max_months,
  devDomain: m.development.primary_domain, devCapability: m.development.primary_capability,
  familyValue: m.family.primary_value, knowledgeArea: m.knowledge.area, knowledgeTopic: m.knowledge.topic,
  parentingPracticeCandidate: m.candidate_content_type === 'PARENTING_PRACTICE', relatedFocusKeys,
});
const byId = (id: string) => ALL_CONTENT_METADATA.find((x) => x.content_id === id)!;
const ALL_CANON = ALL_CONTENT_METADATA.map(mappingOf);
const ALL_DESC = ALL_CONTENT_METADATA.map((m) => descOf(m));

console.log('================ PHASE 9B-9 INTEGRATION VALIDATION ================');

// ===== D. Canonical mapping integrity + candidate exclusion (compile + runtime) =====
console.log('--- D. Canonical mapping / candidate exclusion ---');
A('D1 canonical mappings = 172', ALL_CANON.length === 172, String(ALL_CANON.length));
A('D2 every mapping CANONICAL/HIGH', ALL_CANON.every((m) => m.mappingStatus === 'CANONICAL' && m.confidence === 'HIGH'));
const candidate: CandidateJourneyContentMapping = {
  mappingId: MappingId('cand-am-temperamen'), contentId: ContentId('am-temperamen'), contentType: 'AJAK_MAIN',
  primaryRole: 'NOTICE', secondaryRoles: [], stages: ['NOTICE'], mappingVersion: B<MappingVersion>('map-v1.0'),
  mappingStatus: 'CANDIDATE', confidence: 'MEDIUM',
};
// Runtime guard: the store filters non-CANONICAL even if a candidate is smuggled in as any.
const storeGuard = new InMemoryJourneyStore([...ALL_CANON, candidate as unknown as CanonicalJourneyContentMapping]);
A('D3 candidate excluded at runtime by store', storeGuard.getCanonicalMappings().length === 172, String(storeGuard.getCanonicalMappings().length));
const amtQuery = storeGuard.getCanonicalMappingsForContent('am-temperamen');
A('D4 candidate mappingId never surfaces; only CANONICAL mappings returned', amtQuery.every((m) => m.mappingStatus === 'CANONICAL') && !amtQuery.some((m) => (m.mappingId as string) === 'cand-am-temperamen'), JSON.stringify(amtQuery.map((m) => m.mappingId)));
// Compile-time guarantee: CandidateJourneyContentMapping is structurally disjoint from Canonical
// (mappingStatus:'CANDIDATE' vs 'CANONICAL'); passing it where Canonical is required is a type error.
A('D5 candidate discriminant is CANDIDATE (structural quarantine)', candidate.mappingStatus === 'CANDIDATE');

// ===== E. Real-ID content selection (PREPARE / DO primary) =====
console.log('--- E. Real-ID content selection ---');
const empathyFocus: FocusTargets = { domainOrArea: 'Social-Emotional', capabilityOrTopic: 'Empathy and Understanding Others' };
const sleepFocus: FocusTargets = { domainOrArea: 'Child Health', capabilityOrTopic: 'Sleep' };
const prep = selectContent({ asOf: TS, versions: V, currentState: 'PREPARE', activeFocusTargets: sleepFocus, childAgeMonths: 2, descriptors: ALL_DESC });
A('E1 PREPARE selects a WT (UNDERSTAND) for Sleep', prep.fallbackStatus === 'PRIMARY_MATCH' && prep.role === 'UNDERSTAND', JSON.stringify({ fb: prep.fallbackStatus, role: prep.role, id: prep.selected?.contentId }));
A('E2 PREPARE selected id is a real WT id', !!prep.selected && byId(prep.selected.contentId as string).content_type === 'WAWASAN_TUMBUH');
const doPrimary = selectContent({ asOf: TS, versions: V, currentState: 'DO', activeFocusTargets: empathyFocus, childAgeMonths: 24, descriptors: ALL_DESC });
A('E3 DO@24mo primary AM for Empathy', doPrimary.fallbackStatus === 'PRIMARY_MATCH' && doPrimary.role === 'DO', JSON.stringify({ fb: doPrimary.fallbackStatus, role: doPrimary.role, id: doPrimary.selected?.contentId }));
A('E4 DO primary id is real AJAK_MAIN', !!doPrimary.selected && byId(doPrimary.selected.contentId as string).content_type === 'AJAK_MAIN');

// ===== F. AM age-gap fallback (>36mo) -> KB, explicit code =====
console.log('--- F. AM age-gap fallback ---');
const doGap = selectContent({ asOf: TS, versions: V, currentState: 'DO', activeFocusTargets: empathyFocus, childAgeMonths: 40, descriptors: ALL_DESC });
A('F1 fallbackStatus FALLBACK_MATCH', doGap.fallbackStatus === 'FALLBACK_MATCH', doGap.fallbackStatus);
A('F2 reasonCode AM_AGE_GAP_FALLBACK (explicit, not primary)', doGap.reasonCode === 'AM_AGE_GAP_FALLBACK', doGap.reasonCode);
A('F3 fallback selected a real KEBIASAAN_BAIK', !!doGap.selected && byId(doGap.selected.contentId as string).content_type === 'KEBIASAAN_BAIK', String(doGap.selected?.contentId));
A('F4 role of fallback is ROUTINE (KB)', doGap.role === 'ROUTINE', String(doGap.role));

// ===== G. Parenting practices (5) via injected relatedFocusKeys; am-temperamen is NOT a practice =====
console.log('--- G. Parenting practices ---');
const PP5 = ['am-disiplin-empati', 'am-pujian-proses', 'am-rutinitas', 'am-ko-regulasi', 'am-koneksi-nyata'];
A('G1 all 5 PP flagged in metadata, am-temperamen not', PP5.every((id) => byId(id).candidate_content_type === 'PARENTING_PRACTICE') && byId('am-temperamen').candidate_content_type === null);
A('G2 no PRODUCTION content_type is PARENTING_PRACTICE', ALL_CONTENT_METADATA.every((m) => (m.content_type as string) !== 'PARENTING_PRACTICE'));
const ppFocus: FocusTargets = { domainOrArea: 'PARENTING', capabilityOrTopic: 'Co-Regulation' };
const ppKey = focusKey(ppFocus);
const ppDesc = descOf(byId('am-ko-regulasi'), [ppKey]); // relatedFocusKeys injected (its axes are NULL)
const ppSel = selectContent({ asOf: TS, versions: V, currentState: 'DO', activeFocusTargets: ppFocus, childAgeMonths: 12, descriptors: [ppDesc, ...ALL_DESC] });
A('G3 PP selected via relatedFocusKeys (role PARENT_IMPLEMENTATION)', ppSel.selected?.contentId === 'am-ko-regulasi' && ppSel.role === 'PARENT_IMPLEMENTATION', JSON.stringify({ id: ppSel.selected?.contentId, role: ppSel.role }));
A('G4 PP unmatched without relatedFocusKeys (axes NULL) -> not selected', (() => {
  const bare = descOf(byId('am-ko-regulasi')); // no relatedFocusKeys
  const r = selectContent({ asOf: TS, versions: V, currentState: 'DO', activeFocusTargets: ppFocus, childAgeMonths: 12, descriptors: [bare] });
  return r.fallbackStatus === 'NO_MATCH';
})());

// ===== H. Full end-to-end family journey via orchestrator + persistence =====
console.log('--- H. End-to-end journey (orchestrator + persistence) ---');
const famId = FamilyId('fam-1'); const fjId = FamilyJourneyId('fj-1'); const thId = DevelopmentThreadId('th-1'); const chId = ChildId('ch-1');
const family: Family = { familyId: famId, createdAt: TS, status: 'ACTIVE', activeThreadId: thId, seq: 0 };
const familyJourney: FamilyJourney = { familyJourneyId: fjId, familyId: famId, status: 'ACTIVE', startedAt: TS, startedUnderVersions: V, seq: 0 };
const thread: DevelopmentThread = { threadId: thId, familyId: famId, childId: chId, status: 'ACTIVE', createdAt: TS, activeFocusId: null };
const store = new InMemoryJourneyStore(ALL_CANON);
const activeThreadInput = { versions: V, family, familyJourney, threads: [thread] as readonly DevelopmentThread[] };
const focusInput = {
  asOf: TS, ruleVersion: V.ruleVersion, activeThreadId: thId, currentFocus: null as Focus | null,
  observations: [] as readonly EffectiveObservation[], directionValues: ['Empati'] as any,
};
const doContentInput = { asOf: TS, versions: V, currentState: 'DO' as CanonicalState, activeFocusTargets: empathyFocus, childAgeMonths: 24, descriptors: ALL_DESC };
const prepContentInput = { ...doContentInput, currentState: 'PREPARE' as CanonicalState, activeFocusTargets: sleepFocus, childAgeMonths: 2 };
const adaptationInput = { versions: V, focusId: FocusId('foc-1'), threadId: thId, reflection: null as Reflection | null };

const base = (currentState: CanonicalState, trigger: string, extra: Partial<JourneyEngineStepInput> = {}): JourneyEngineStepInput => ({
  currentState, paused: false, resumeState: null, trigger: trigger as any, actor: 'SYSTEM' as Actor,
  versions: V, idempotencyKey: IdempotencyKey(`idem-${currentState}-${trigger}`), ...extra,
});

const loop: Array<[CanonicalState, string, CanonicalState, Partial<JourneyEngineStepInput>]> = [
  ['GROUND', 'FOUNDATION_SET', 'NOTICE', { activeThreadInput }],
  ['NOTICE', 'OBSERVED', 'FOCUS', { focusInput }],
  ['FOCUS', 'FOCUS_SELECTED', 'PREPARE', { contentInput: prepContentInput }],
  ['PREPARE', 'PREPARED', 'DO', { contentInput: doContentInput }],
  ['DO', 'ACTED', 'REFLECT', {}],
  ['REFLECT', 'REFLECTED', 'NOTICE', { adaptationInput }], // ADAPT is folded: resolve+apply outcome trigger atomically
  ['ADAPT', 'CONTINUE', 'NOTICE', { adaptationInput }],       // direct ADAPT entry also routes to NOTICE
];
let seq = 0; const results: any[] = [];
for (const [from, trig, expected, extra] of loop) {
  const out = journeyEngineStep(base(from, trig, extra));
  results.push(out);
  A(`H:${from}+${trig}->${out.nextState}`, out.nextState === expected, JSON.stringify({ got: out.nextState, kind: out.result.kind }));
  // persist the transition to the append-only event store
  const te: TransitionEvent = {
    transitionId: TransitionId(`tr-${seq + 1}`), familyJourneyId: fjId, threadId: thId,
    fromState: from, trigger: trig as any, toState: out.nextState, actor: 'SYSTEM',
    reasonCode: out.reasonCode, reasonText: 'e2e', ruleVersion: V.ruleVersion, sequence: seq + 1,
    occurredAt: TS, idempotencyKey: IdempotencyKey(`ev-${seq + 1}`),
  };
  const ev: JourneyEvent = { kind: 'TRANSITION', event: te };
  const r = store.append(fjId, ev, IdempotencyKey(`ev-${seq + 1}`), TS, seq);
  A(`H:append seq ${seq + 1} OK`, r.kind === 'OK', r.kind);
  if (r.kind === 'OK') seq = r.value.sequence;
}
A('H:REFLECT+REFLECTED folded ADAPT (adaptation decision produced, outcome CONTINUE)', results[5].adaptation != null && results[5].adaptation.outcome === 'CONTINUE', JSON.stringify(results[5].adaptation && results[5].adaptation.outcome));
A('H:full canonical loop returned to NOTICE', results[results.length - 1].nextState === 'NOTICE');
A('H:DO step selected a real AM primary', results[3].content?.selected && byId(results[3].content.selected.contentId as string).content_type === 'AJAK_MAIN');

// ===== I. Persistence integration: monotonic seq, immutability, projection rebuild =====
console.log('--- I. Persistence integration ---');
const stream = store.read(fjId);
A('I1 event count == loop length', stream.length === loop.length, String(stream.length));
A('I2 sequences strictly monotonic from 1', stream.every((e, i) => e.sequence === i + 1));
A('I3 stored events deep-frozen (immutable)', stream.every((e) => Object.isFrozen(e)));
let mutThrew = false;
try { (stream[0] as any).sequence = 999; } catch { mutThrew = true; }
A('I4 mutating a frozen stored event throws (strict) / no-effect', mutThrew || stream[0].sequence === 1, String(stream[0].sequence));
const proj = rebuildThreadJourneyState(fjId, thId, stream);
A('I5 projection rebuild currentState == last executed state', !!proj && proj.currentState === results[results.length - 1].nextState, JSON.stringify({ proj: proj?.currentState }));
A('I6 projection seq == last stored sequence', !!proj && proj.seq === stream.length);

// ===== J. Idempotency (replay + payload mismatch) =====
console.log('--- J. Idempotency ---');
const te1: TransitionEvent = { ...(JSON.parse(stream[0].payloadJson) as TransitionEvent) };
const replayR = store.append(fjId, { kind: 'TRANSITION', event: te1 }, IdempotencyKey('ev-1'), TS, 0);
A('J1 same key + same payload -> IDEMPOTENT_REPLAY', replayR.kind === 'IDEMPOTENT_REPLAY', replayR.kind);
const teDiff: TransitionEvent = { ...te1, reasonText: 'MUTATED' };
const mismatchR = store.append(fjId, { kind: 'TRANSITION', event: teDiff }, IdempotencyKey('ev-1'), TS, 0);
A('J2 same key + diff payload -> IDEMPOTENCY_PAYLOAD_MISMATCH', mismatchR.kind === 'IDEMPOTENCY_PAYLOAD_MISMATCH', mismatchR.kind);

// ===== K. Optimistic concurrency =====
console.log('--- K. Optimistic concurrency ---');
const teNew: TransitionEvent = { ...te1, transitionId: TransitionId('tr-x'), sequence: 99 };
const conflictR = store.append(fjId, { kind: 'TRANSITION', event: teNew }, IdempotencyKey('ev-new'), TS, /*expectedSeq wrong*/ 0);
A('K1 stale expectedSequence -> CONFLICT', conflictR.kind === 'CONFLICT', conflictR.kind);
const goodR = store.append(fjId, { kind: 'TRANSITION', event: teNew }, IdempotencyKey('ev-new2'), TS, stream.length);
A('K2 correct expectedSequence -> OK', goodR.kind === 'OK', goodR.kind);

// ===== L. Pause / resume from EVERY canonical state =====
console.log('--- L. Pause/resume from every state ---');
let pauseOk = true, resumeOk = true;
for (const s of CANONICAL_STATES) {
  const p = evaluateTransition({ currentState: s, paused: false, resumeState: null, trigger: 'PAUSE', actor: 'SYSTEM', ruleVersion: V.ruleVersion });
  if (!(p.result === 'PAUSED' && p.toState === s && p.resumeState === s && CANONICAL_STATES.indexOf(p.toState) !== -1)) pauseOk = false;
  const r = evaluateTransition({ currentState: s, paused: true, resumeState: s, trigger: 'RESUME', actor: 'SYSTEM', ruleVersion: V.ruleVersion });
  if (!(r.allowed && r.toState === s && r.lifecycle === 'RUNNING')) resumeOk = false;
}
A('L1 PAUSE from every state -> PAUSED, canonical state preserved', pauseOk);
A('L2 RESUME from every state -> exact resumeState, RUNNING', resumeOk);
// orchestrator-level pause
const oPause = journeyEngineStep(base('DO', 'PAUSE'));
A('L3 orchestrator PAUSE yields PAUSED result', oPause.result.kind === 'PAUSED');

// ===== M. Side transitions, NO_MATCH, NO_FOCUS, INVALID_STATE =====
console.log('--- M. Side transitions & no-result contracts ---');
A('M1 INVALID_STATE: GROUND+ACTED', journeyEngineStep(base('GROUND', 'ACTED')).result.kind === 'INVALID_STATE');
A('M2 INSUFFICIENT_CONTEXT: FOCUS dest without focusInput', journeyEngineStep(base('NOTICE', 'OBSERVED')).result.kind === 'INSUFFICIENT_CONTEXT');
const noFocusInput = { ...focusInput, directionValues: [] as any, observations: [] as readonly EffectiveObservation[] };
A('M3 NO_FOCUS: no candidates', journeyEngineStep(base('NOTICE', 'OBSERVED', { focusInput: noFocusInput })).result.kind === 'NO_FOCUS');
const noMatchInput = { ...doContentInput, activeFocusTargets: { domainOrArea: 'Nonexistent', capabilityOrTopic: 'Nope' } as FocusTargets };
A('M4 NO_MATCH: DO with unmatchable focus', journeyEngineStep(base('PREPARE', 'PREPARED', { contentInput: noMatchInput })).result.kind === 'NO_MATCH');
A('M5 OVERRIDE side transition -> PARENT_OVERRIDE', journeyEngineStep(base('DO', 'OVERRIDE')).result.kind === 'PARENT_OVERRIDE');
A('M6 CHANGE_CHILD routes to NOTICE', journeyEngineStep(base('DO', 'CHANGE_CHILD', { activeThreadInput })).nextState === 'NOTICE');
A('M7 NO_MATCH trigger routes (not error)', journeyEngineStep(base('DO', 'NO_MATCH')).result.kind === 'NO_MATCH');

// ===== N. Multi-child + cross-family ownership integrity =====
console.log('--- N. Multi-child / cross-family ---');
const otherFamThread: DevelopmentThread = { threadId: DevelopmentThreadId('th-other'), familyId: FamilyId('fam-2'), childId: ChildId('ch-2'), status: 'ACTIVE', createdAt: TS, activeFocusId: null };
const atCont = resolveActiveThread({ versions: V, family, familyJourney, threads: [thread, otherFamThread] });
A('N1 continuity keeps owned active thread; foreign filtered', atCont.activeThreadId === thId && atCont.outcome === 'ACTIVE_THREAD', JSON.stringify(atCont.activeThreadId));
const foreignJourney: FamilyJourney = { ...familyJourney, familyId: FamilyId('fam-2') };
const atOwn = resolveActiveThread({ versions: V, family, familyJourney: foreignJourney, threads: [thread] });
A('N2 journey of another family -> THREAD_OWNERSHIP_REJECTED', atOwn.reasonCode === 'THREAD_OWNERSHIP_REJECTED' && atOwn.activeThreadId === null);
const atParentForeign = resolveActiveThread({ versions: V, family, familyJourney, threads: [thread, otherFamThread], parentSelectedThreadId: otherFamThread.threadId });
A('N3 parent-selecting a foreign thread rejected', atParentForeign.activeThreadId === null && atParentForeign.reasonCode === 'THREAD_OWNERSHIP_REJECTED');

// ===== O. Family-week dedup =====
console.log('--- O. Family-week dedup ---');
const wk = '2026-W33';
const dk1 = familyPracticeDedupKey('am-ko-regulasi', famId, wk);
const dk2 = familyPracticeDedupKey('am-ko-regulasi', famId, wk);
A('O1 dedup key deterministic (family,week)', dk1 === dk2 && dk1 === `am-ko-regulasi::${famId}::${wk}`);
const deduped = selectContent({ asOf: TS, versions: V, currentState: 'DO', activeFocusTargets: empathyFocus, childAgeMonths: 24, descriptors: ALL_DESC, weeklyDedupContentIds: [doPrimary.selected!.contentId] });
A('O2 weekly-deduped id is not re-selected', deduped.selected?.contentId !== doPrimary.selected?.contentId, JSON.stringify({ first: doPrimary.selected?.contentId, second: deduped.selected?.contentId }));

// ===== P. Parent agency authoritative (never silent SYSTEM->PARENT) =====
console.log('--- P. Parent agency ---');
const parentFocusInput = { ...focusInput, parentSelectedTargets: empathyFocus };
const pf = journeyEngineStep(base('NOTICE', 'OBSERVED', { focusInput: parentFocusInput }));
A('P1 parent-selected focus proposed as PARENT_SELECTED, parentConfirmed', pf.focus?.proposed?.source === 'PARENT_SELECTED' && pf.focus?.proposed?.parentConfirmed === true, JSON.stringify(pf.focus?.proposed));
A('P2 system-suggested focus is NOT auto-confirmed', results[1].focus?.proposed ? results[1].focus.proposed.parentConfirmed === false : true);

// ===== Q. Determinism x50 + golden snapshots =====
console.log('--- Q. Determinism & golden snapshots ---');
const goldenInput = base('PREPARE', 'PREPARED', { contentInput: doContentInput });
const g0 = JSON.stringify(journeyEngineStep(goldenInput));
let det = true; for (let i = 0; i < 50; i++) if (JSON.stringify(journeyEngineStep(goldenInput)) !== g0) det = false;
A('Q1 identical input -> identical output x50', det);
const gp = JSON.parse(g0);
A('Q2 golden: PREPARED->DO nextState', gp.nextState === 'DO', gp.nextState);
A('Q3 golden: DO fallbackStatus PRIMARY (24mo empathy)', gp.content?.fallbackStatus === 'PRIMARY_MATCH', gp.content?.fallbackStatus);
A('Q4 golden: selected id stable & real AM', !!gp.content?.selected && byId(gp.content.selected.contentId).content_type === 'AJAK_MAIN', gp.content?.selected?.contentId);
// golden for age-gap
const gapGolden = selectContent({ asOf: TS, versions: V, currentState: 'DO', activeFocusTargets: empathyFocus, childAgeMonths: 40, descriptors: ALL_DESC });
A('Q5 golden: age-gap selected id is stable KB', byId(gapGolden.selected!.contentId as string).content_type === 'KEBIASAAN_BAIK', String(gapGolden.selected?.contentId));

// ===== R. Type/version reproduction =====
console.log('--- R. Version reproduction ---');
A('R1 orchestrator carries ruleVersion through', results.every((r) => r.ruleVersion === V.ruleVersion));
A('R2 content decision echoes versions', doPrimary.versions.ruleVersion === V.ruleVersion && doPrimary.ruleVersion === V.ruleVersion);

console.log('================ SUMMARY ================');
console.log(`TOTAL ${pass + fail}  PASS ${pass}  FAIL ${fail}`);
if (fail > 0) { console.log('FAILURES:'); failures.forEach((f) => console.log('  - ' + f)); }
console.log(fail === 0 ? 'RESULT: PASS' : 'RESULT: FAIL');
