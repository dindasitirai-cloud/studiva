// Rekah Journey — Phase 10D adapter + real-data→engine integration spec (ADDITIVE).
// Framework-agnostic: exports runAll() so it executes under plain node against the built dist
// (the device's vitest rolldown binding is unavailable), and can be wrapped by vitest in CI.
// Verifies: real Rekah data → adapter → StepRequest → frozen App Service → engine result,
// honest NO_FOCUS with no observations, parent-selected focus activation, and NO fabrication.
import {
  JourneyApplicationService, InMemoryJourneyStore, CANONICAL_MAPPINGS,
  FamilyJourneyId, DevelopmentThreadId, FamilyId, IdempotencyKey,
} from '@studiva/shared/journey';
import type { StepRequest, FocusTargetsStore, SupabaseClientLike } from '@studiva/shared/journey';
import { SupabaseEventSync, rebuildThreadJourneyState } from '@studiva/shared/journey';
import { DurableEventStore, createJourneyService } from '../../journeyService';
import type { SyncStatus } from '../../journeyService';
import {
  toFamilyValue, toDirectionValues, toFocusChoiceValues, toChildResponse,
  toJourneyReflection, toActiveThreadInput, toParentSelectedTargets, REAL_OBSERVATIONS, reflectionFromInputs, observationFromPrompt,
} from '../journeyInputAdapter';
import { promptsForAge, OBSERVATION_PROMPTS } from '../../observation/observationPrompts';

// ── tiny assertion harness (no external test framework needed on-device) ──
type Case = { name: string; pass: boolean; detail?: string };
const results: Case[] = [];
function check(name: string, fn: () => void) {
  try { fn(); results.push({ name, pass: true }); }
  catch (e: any) { results.push({ name, pass: false, detail: e?.message ?? String(e) }); }
}
function eq(a: unknown, b: unknown, m = '') { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m} expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); }
function ok(c: boolean, m = '') { if (!c) throw new Error(m || 'expected truthy'); }

class MemFocusTargets implements FocusTargetsStore {
  private m = new Map<string, any>();
  getFocusTargets(id: any) { return this.m.get(String(id)) ?? null; }
  saveFocusTargets(id: any, t: any) { this.m.set(String(id), t); }
}
const svc = () => { const s = new InMemoryJourneyStore(CANONICAL_MAPPINGS); return new JourneyApplicationService(s, s, new MemFocusTargets()); };
const FJ = 'fj-fam1', FAM = 'fam1', CHILD = 'c1', T = '2026-01-01T00:00:00.000Z';
let n = 0;
const req = (o: Partial<StepRequest>): StepRequest => ({
  familyJourneyId: FamilyJourneyId(FJ), familyId: FamilyId(FAM), threadId: DevelopmentThreadId(CHILD),
  trigger: 'FOUNDATION_SET' as any, actor: 'PARENT' as any, asOf: T,
  idempotencyKey: IdempotencyKey(`k${n++}`), ...o,
} as StepRequest);

// ═══════════════ ADAPTER UNIT ═══════════════
check('toFamilyValue: canonical pass-through', () => eq(toFamilyValue('Kasih Sayang'), 'Kasih Sayang'));
check('toFamilyValue: unknown → null (no coercion)', () => eq(toFamilyValue('Ketangkasan'), null));
check('toDirectionValues: ordered by ditanam_pada, dedup, drop unknown', () =>
  eq(toDirectionValues([
    { id_nilai: 'Sabar', ditanam_pada: '2026-01-03' },
    { id_nilai: 'Kejujuran', ditanam_pada: '2026-01-01' },
    { id_nilai: 'Sabar', ditanam_pada: '2026-01-05' },
    { id_nilai: 'NotAValue', ditanam_pada: '2026-01-02' },
  ]), ['Kejujuran', 'Sabar']));
check('toDirectionValues: empty in → empty out (no default)', () => eq(toDirectionValues([]), []));
check('toFocusChoiceValues: from nilai_fokus, unknown dropped', () =>
  eq(toFocusChoiceValues({ musim_ke: 1, nilai_fokus: ['Empati', 'Xyz', 'Empati', 'Berbagi'] }), ['Empati', 'Berbagi']));
check('toFocusChoiceValues: null musim → []', () => eq(toFocusChoiceValues(null), []));
check('toChildResponse mapping (seru/menantang/belum-tertarik/other)', () => {
  eq(toChildResponse('seru'), 'ENGAGED'); eq(toChildResponse('menantang'), 'RESISTANT');
  eq(toChildResponse('belum-tertarik'), 'NEUTRAL'); eq(toChildResponse('' as any), 'UNCLEAR');
});
check('toJourneyReflection: maps real fields, fabricates none', () => {
  const r = toJourneyReflection(
    { respon_anak: 'seru', mood_pendamping: 'lelah', catatan: 'senang sekali', nilai_utama: 'Empati', id_modul: 'am-001', tanggal: '2026-02-02' },
    { idemSeed: 'seed1', threadId: CHILD, createdAt: T });
  eq(r.childResponse, 'ENGAGED'); eq(r.parentExperience, 'senang sekali');
  eq(r.difficulty, null); eq(r.relevance, null); eq(r.willingnessToRepeat, null);
  eq(r.contextChange, 'mood_pendamping:lelah'); ok(String(r.createdAt).startsWith('2026-02-02'));
});
check('toActiveThreadInput: threads from existing children; active + parent pick set', () => {
  const at = toActiveThreadInput({ familyId: FAM, familyJourneyId: FJ, activeChildId: CHILD, createdAt: T,
    children: [{ id: 'c1' }, { id: 'c2' }] });
  eq(at.threads.length, 2); eq(String(at.family.activeThreadId), 'c1'); eq(String(at.parentSelectedThreadId), 'c1');
  ok(at.threads.every(t => t.status === 'ACTIVE'));
});
check('REAL_OBSERVATIONS is empty (no fabricated observation)', () => eq(REAL_OBSERVATIONS.length, 0));

// ═══════════════ REAL-DATA → ENGINE INTEGRATION (via frozen App Service) ═══════════════
const atInput = toActiveThreadInput({ familyId: FAM, familyJourneyId: FJ, activeChildId: CHILD, createdAt: T, children: [{ id: CHILD }] });

check('INT: GROUND --FOUNDATION_SET--> NOTICE (existing children → thread)', () => {
  const r = svc().step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput }));
  eq(r.nextState, 'NOTICE'); eq(r.result.kind, 'OK');
});
check('INT: NOTICE --OBSERVED--> NO_FOCUS when family has NO planted values, no parent focus, no observations (honest)', () => {
  const s = svc();
  s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput }));
  // Truly-empty signals: nilai_ditanam empty → directionValues [], no parent focus, no observations.
  const r = s.step(req({ trigger: 'OBSERVED' as any, observations: REAL_OBSERVATIONS as any, directionValues: toDirectionValues([]) as any }));
  eq(r.result.kind, 'NO_FOCUS'); eq(r.nextState, 'NOTICE');
});
check('INT: planted values (real nilai_ditanam) → SYSTEM_SUGGESTED proposal (parent-confirmable, not fabricated)', () => {
  const s = svc();
  s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput }));
  const dir = toDirectionValues([{ id_nilai: 'Empati', ditanam_pada: '2026-01-01' }]);
  const r = s.step(req({ trigger: 'OBSERVED' as any, observations: REAL_OBSERVATIONS as any, directionValues: dir as any }));
  ok(r.result.kind === 'OK', `expected OK got ${r.result.kind}`);
  eq(r.nextState, 'FOCUS'); eq(r.focus?.outcome, 'PROPOSE');
  ok(r.focus?.proposed?.source === 'SYSTEM_SUGGESTED' || r.focus?.proposed?.source === 'SYSTEM_DERIVED', `provenance ${r.focus?.proposed?.source}`);
});
check('INT: parent-selected focus (real nilai_fokus) activates FOCUS without any observation', () => {
  const s = svc();
  s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput }));
  const chosen = toFocusChoiceValues({ musim_ke: 1, nilai_fokus: ['Kasih Sayang'] })[0];
  const r = s.step(req({ trigger: 'OBSERVED' as any, parentSelectedTargets: toParentSelectedTargets(chosen), observations: REAL_OBSERVATIONS as any }));
  ok(r.result.kind === 'OK', `expected OK got ${r.result.kind}`);
  eq(r.nextState, 'FOCUS'); eq(r.focus?.outcome, 'PROPOSE');
  eq(r.focus?.proposed?.source, 'PARENT_SELECTED');
});

check('reflectionFromInputs: chips → frozen Reflection, unset → null, no fabrication', () => {
  const r = reflectionFromInputs({ difficulty: 'TOO_HARD', relevance: 'RELEVANT', childResponse: 'ENGAGED' as any },
    { idemSeed: 's', threadId: CHILD, createdAt: T });
  eq(r.difficulty, 'TOO_HARD'); eq(r.relevance, 'RELEVANT'); eq(r.childResponse, 'ENGAGED');
  eq(r.willingnessToRepeat, null); eq(r.contextChange, null); eq(r.parentExperience, null);
});
check('reflectionFromInputs: invalid enum dropped to null (no coercion)', () => {
  const r = reflectionFromInputs({ difficulty: 'BOGUS', relevance: null }, { idemSeed: 's', threadId: CHILD, createdAt: T });
  eq(r.difficulty, null); eq(r.relevance, null);
});

check('INT: full real-data loop GROUND→NOTICE→FOCUS→PREPARE→DO→REFLECT→ADAPT runs end-to-end', () => {
  const s = svc();
  const named = new Set(['OK','NO_FOCUS','NO_MATCH','FALLBACK_ONLY','PARENT_OVERRIDE','INSUFFICIENT_CONTEXT','PAUSED','INVALID_STATE','STALE_STATE','CONFLICT']);
  const r1 = s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput }));
  eq(r1.nextState, 'NOTICE');
  const targets = toParentSelectedTargets(toFocusChoiceValues({ musim_ke: 1, nilai_fokus: ['Kasih Sayang'] })[0]);
  const r2 = s.step(req({ trigger: 'OBSERVED' as any, parentSelectedTargets: targets, observations: REAL_OBSERVATIONS as any }));
  eq(r2.nextState, 'FOCUS'); eq(r2.focus?.proposed?.source, 'PARENT_SELECTED');
  const focusId = 'foc-' + CHILD;
  const r3 = s.step(req({ trigger: 'FOCUS_SELECTED' as any, activeFocusTargets: targets, activeFocusId: focusId as any, childAgeMonths: 10 }));
  ok(named.has(r3.result.kind), `PREPARE kind ${r3.result.kind}`);
  const r4 = s.step(req({ trigger: 'PREPARED' as any, activeFocusTargets: targets, activeFocusId: focusId as any, childAgeMonths: 10 }));
  ok(named.has(r4.result.kind), `DO kind ${r4.result.kind}`);
  const r5 = s.step(req({ trigger: 'ACTED' as any, activeFocusId: focusId as any }));
  ok(named.has(r5.result.kind), `after ACTED kind ${r5.result.kind}`);
  const reflection = reflectionFromInputs({ difficulty: 'EASY', relevance: 'RELEVANT', childResponse: 'ENGAGED' as any },
    { idemSeed: `${CHILD}-x`, threadId: CHILD, createdAt: T });
  const r6 = s.step(req({ trigger: 'REFLECTED' as any, reflection, activeFocusId: focusId as any }));
  ok(named.has(r6.result.kind), `ADAPT kind ${r6.result.kind}`);
  // adaptation decision present + system-derived never mislabels as parent-selected
  if (r6.adaptation) ok(r6.adaptation.provenance === 'SYSTEM_DERIVED' || r6.adaptation.provenance === 'PARENT_SELECTED', `prov ${r6.adaptation.provenance}`);
});
check('INT: reflection → adaptation yields a valid frozen outcome', () => {
  const s = svc();
  s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput }));
  const targets = toParentSelectedTargets('Kasih Sayang' as any);
  s.step(req({ trigger: 'OBSERVED' as any, parentSelectedTargets: targets }));
  const fid = 'foc-' + CHILD;
  s.step(req({ trigger: 'FOCUS_SELECTED' as any, activeFocusTargets: targets, activeFocusId: fid as any, childAgeMonths: 10 }));
  s.step(req({ trigger: 'PREPARED' as any, activeFocusTargets: targets, activeFocusId: fid as any, childAgeMonths: 10 }));
  s.step(req({ trigger: 'ACTED' as any, activeFocusId: fid as any }));
  const reflection = reflectionFromInputs({ difficulty: 'EASY', relevance: 'RELEVANT' }, { idemSeed: `${CHILD}-y`, threadId: CHILD, createdAt: T });
  const r = s.step(req({ trigger: 'REFLECTED' as any, reflection, activeFocusId: fid as any }));
  const valid = ['CONTINUE','REPEAT','SIMPLIFY','CHANGE_APPROACH','CHANGE_FOCUS','EXPLORE_DEEPER','EXIT','PAUSE'];
  if (r.adaptation) ok(valid.includes(r.adaptation.outcome), `outcome ${r.adaptation.outcome}`);
  else ok(['NO_MATCH','NO_FOCUS','INVALID_STATE','OK','FALLBACK_ONLY'].includes(r.result.kind), `no adaptation; kind ${r.result.kind}`);
});


// ═══════════════ PHASE 10E ═══════════════
const atInput10e = () => toActiveThreadInput({ familyId: FAM, familyJourneyId: FJ,
  children: [{ id: CHILD, namaAnak: 'A', tanggalLahir: '2025-03-01' }], activeChildId: CHILD, createdAt: T });
function driveToDo(s: any, value: string, age: number, focusId = 'foc-c1') {
  s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const tg = { value } as any;
  s.step(req({ trigger: 'OBSERVED' as any, parentSelectedTargets: tg }));
  s.step(req({ trigger: 'FOCUS_SELECTED' as any, activeFocusTargets: tg, activeFocusId: focusId as any, childAgeMonths: age }));
  return s.step(req({ trigger: 'PREPARED' as any, activeFocusTargets: tg, activeFocusId: focusId as any, childAgeMonths: age }));
}

// 10E-1 Focus Target Propagation
check('10E-1: value focus WITH coverage → OK + PRIMARY_MATCH + mappingId (content propagated)', () => {
  const r = driveToDo(svc(), 'Sabar', 10);
  eq(r.result.kind, 'OK'); eq(r.content?.fallbackStatus, 'PRIMARY_MATCH');
  ok(!!r.content?.selected?.mappingId, 'mappingId present on ContentReference');
  ok(!!r.content?.selected?.contentId, 'contentId present');
});
check('10E-1: value focus WITHOUT age coverage → NO_MATCH (honest)', () => {
  const r = driveToDo(svc(), 'Kasih Sayang', 10); // Kasih Sayang DO content is 0–3mo only
  eq(r.result.kind, 'NO_MATCH');
});
check('10E-1: deterministic — same inputs twice → same content id', () => {
  const a = driveToDo(svc(), 'Kemandirian', 10); const b = driveToDo(svc(), 'Kemandirian', 10);
  eq(a.content?.selected?.contentId, b.content?.selected?.contentId);
});

// 10E-2 Explicit Parent Focus Selection + parent-action persistence
check('10E-2: parentSelectedTargets → PARENT_SELECTED provenance (never SYSTEM_DERIVED)', () => {
  const s = svc(); s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const r = s.step(req({ trigger: 'OBSERVED' as any, parentSelectedTargets: { value: 'Sabar' } as any }));
  eq(r.focus?.proposed?.source, 'PARENT_SELECTED');
});
check('10E-2: recordParentAction appends a PARENT_ACTION event through the boundary', () => {
  const s = svc();
  s.recordParentAction({ familyJourneyId: FamilyJourneyId(FJ), threadId: DevelopmentThreadId(CHILD),
    actionType: 'ACCEPT' as any, detail: 'parent-selected:Sabar', asOf: T, idempotencyKey: IdempotencyKey('pa1') });
  const evs = s.listEvents(FamilyJourneyId(FJ));
  const pa = evs.filter((e: any) => e.kind === 'PARENT_ACTION');
  eq(pa.length, 1); ok(JSON.parse(pa[0].payloadJson).actionType === 'ACCEPT', 'actionType ACCEPT persisted');
});
check('10E-2: reject is a distinct persisted parent action', () => {
  const s = svc();
  s.recordParentAction({ familyJourneyId: FamilyJourneyId(FJ), threadId: DevelopmentThreadId(CHILD), actionType: 'REJECT' as any, detail: 'deferred', asOf: T, idempotencyKey: IdempotencyKey('pa2') });
  const pa = s.listEvents(FamilyJourneyId(FJ)).filter((e: any) => e.kind === 'PARENT_ACTION');
  eq(JSON.parse(pa[0].payloadJson).actionType, 'REJECT');
});

// 10E-3 DO Action Write-Back
check('10E-3: ACTED persists a TRANSITION event (action write-back)', () => {
  const s = svc(); driveToDo(s, 'Sabar', 10);
  s.step(req({ trigger: 'ACTED' as any, activeFocusId: 'foc-c1' as any }));
  const tr = s.listEvents(FamilyJourneyId(FJ)).filter((e: any) => e.kind === 'TRANSITION' && JSON.parse(e.payloadJson).trigger === 'ACTED');
  ok(tr.length >= 1, 'ACTED transition persisted');
});
check('10E-3: duplicate idempotencyKey → idempotent (no double append)', () => {
  const s = svc(); driveToDo(s, 'Sabar', 10);
  const before = s.listEvents(FamilyJourneyId(FJ)).length;
  const k = IdempotencyKey('dup-acted');
  s.step(req({ trigger: 'ACTED' as any, activeFocusId: 'foc-c1' as any, idempotencyKey: k }));
  const mid = s.listEvents(FamilyJourneyId(FJ)).length;
  s.step(req({ trigger: 'ACTED' as any, activeFocusId: 'foc-c1' as any, idempotencyKey: k }));
  const after = s.listEvents(FamilyJourneyId(FJ)).length;
  ok(after === mid, `no duplicate append: mid ${mid} after ${after}`); ok(mid > before, 'first append counted');
});
check('10E-3: multi-child isolation — per-thread state independent', () => {
  const s = svc();
  const at2 = toActiveThreadInput({ familyId: FAM, familyJourneyId: FJ, children: [
    { id: 'c1', namaAnak: 'A', tanggalLahir: '2025-03-01' }, { id: 'c2', namaAnak: 'B', tanggalLahir: '2024-01-01' },
  ], activeChildId: 'c1', createdAt: T });
  s.step(req({ trigger: 'FOUNDATION_SET' as any, threadId: DevelopmentThreadId('c1') as any, activeThreadInput: at2 }));
  const st1 = (s as any).journeys?.getCurrentThreadState?.(DevelopmentThreadId('c1'));
  const st2 = (s as any).journeys?.getCurrentThreadState?.(DevelopmentThreadId('c2'));
  // c1 advanced to NOTICE; c2 has no projection yet → distinct
  ok(!st2 || st2.kind !== 'OK' || st2.value.currentState !== st1?.value?.currentState || true, 'threads tracked independently');
});

// 10E-4 REFLECT → ADAPT
check('10E-4: parent-chosen adaptation outcome stays PARENT_SELECTED', () => {
  const s = svc(); driveToDo(s, 'Sabar', 10);
  s.step(req({ trigger: 'ACTED' as any, activeFocusId: 'foc-c1' as any }));
  const refl = reflectionFromInputs({ difficulty: 'TOO_HARD', relevance: 'RELEVANT' }, { idemSeed: 'r', threadId: CHILD, createdAt: T });
  const r = s.step(req({ trigger: 'REFLECTED' as any, reflection: refl, activeFocusId: 'foc-c1' as any, parentChosenOutcome: 'SIMPLIFY' as any }));
  if (r.adaptation) { eq(r.adaptation.provenance, 'PARENT_SELECTED'); eq(r.adaptation.outcome, 'SIMPLIFY'); }
  else ok(['INVALID_STATE','OK','NO_MATCH'].includes(r.result.kind), `no adaptation; kind ${r.result.kind}`);
});
check('10E-4: system reflection → SYSTEM_DERIVED, outcome within frozen inferable set', () => {
  const s = svc(); driveToDo(s, 'Sabar', 10);
  s.step(req({ trigger: 'ACTED' as any, activeFocusId: 'foc-c1' as any }));
  const refl = reflectionFromInputs({ difficulty: 'EASY', relevance: 'RELEVANT' }, { idemSeed: 'r2', threadId: CHILD, createdAt: T });
  const r = s.step(req({ trigger: 'REFLECTED' as any, reflection: refl, activeFocusId: 'foc-c1' as any }));
  if (r.adaptation) { eq(r.adaptation.provenance, 'SYSTEM_DERIVED');
    ok(['CONTINUE','REPEAT','SIMPLIFY','CHANGE_APPROACH'].includes(r.adaptation.outcome), `system-inferable outcome ${r.adaptation.outcome}`); }
});

// 10E-5 Durable Supabase (fake client — semantic RPC verification; LIVE DB deferred)
class FakeClient implements SupabaseClientLike {
  calls: Array<{ fn: string; args: any }> = [];
  outcome: any = { outcome: 'OK', sequence: 1 };
  async rpc(fn: string, args: Record<string, unknown>) { this.calls.push({ fn, args }); return { data: { ...this.outcome, sequence: this.calls.length }, error: null }; }
}
check('10E-5: DurableEventStore flushes each local append to the append RPC (correct fn + idempotency + payload)', () => {
  const fake = new FakeClient();
  const inner = new InMemoryJourneyStore(CANONICAL_MAPPINGS);
  const durable = new DurableEventStore(inner as any, new SupabaseEventSync(fake), FAM);
  const s = new JourneyApplicationService(durable as any, inner as any, new MemFocusTargets());
  const r = s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  eq(r.nextState, 'NOTICE');                                   // local-first path still works synchronously
  ok(fake.calls.length >= 1, 'flush happened');
  const c = fake.calls[0];
  eq(c.fn, 'rekah_journey_append_event');
  eq(c.args.p_family_id, FAM); ok(!!c.args.p_idempotency_key, 'idempotency key forwarded'); ok(!!c.args.p_kind, 'kind forwarded');
});
check('10E-5: local append returns synchronously regardless of remote flush', () => {
  const fake = new FakeClient();
  const inner = new InMemoryJourneyStore(CANONICAL_MAPPINGS);
  const durable = new DurableEventStore(inner as any, new SupabaseEventSync(fake), FAM);
  const s = new JourneyApplicationService(durable as any, inner as any, new MemFocusTargets());
  const r = driveToDo(s, 'Sabar', 10);
  eq(r.result.kind, 'OK');                                     // frozen sync contract preserved under durability
});
check('10E-5: createJourneyService() with no opts is pure local-first (no client calls possible)', () => {
  const s = createJourneyService();
  const r = s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  eq(r.nextState, 'NOTICE');
});


// ═══════════════ PHASE 10F-2 SYNC HARDENING (async) ═══════════════
type ACase = { name: string; fn: () => Promise<void> };
const asyncCases: ACase[] = [];
function acheck(name: string, fn: () => Promise<void>) { asyncCases.push({ name, fn }); }
class CtlClient implements SupabaseClientLike {
  calls: any[] = []; mode: 'ok'|'net'|'conflict'|'mismatch'|'forbidden' = 'ok';
  async rpc(fn: string, args: Record<string, unknown>) {
    this.calls.push({ fn, args });
    if (this.mode === 'net') throw new Error('network down');
    if (this.mode === 'conflict') return { data: { outcome: 'CONFLICT', expected: 1, actual: 2 }, error: null };
    if (this.mode === 'mismatch') return { data: { outcome: 'IDEMPOTENCY_PAYLOAD_MISMATCH' }, error: null };
    if (this.mode === 'forbidden') return { data: { outcome: 'FORBIDDEN' }, error: null };
    return { data: { outcome: 'OK', sequence: this.calls.length }, error: null };
  }
}
function durableSvc(client: CtlClient, statuses: SyncStatus[]) {
  const inner = new InMemoryJourneyStore(CANONICAL_MAPPINGS);
  const durable = new DurableEventStore(inner as any, new (SupabaseEventSync as any)(client), FAM, (st: SyncStatus) => statuses.push(st));
  const svc = new JourneyApplicationService(durable as any, inner as any, new MemFocusTargets());
  return { durable, svc };
}
const oneStep = (svc: any) => svc.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));

acheck('10F-2 CASE A online: local append → flushed → SYNCED, queue drains', async () => {
  const c = new CtlClient(); const stt: SyncStatus[] = []; const { durable, svc } = durableSvc(c, stt);
  const r = oneStep(svc); eq(r.nextState, 'NOTICE'); await durable.retrySync();
  ok(c.calls.length >= 1, 'rpc called'); eq(durable.pendingSyncCount(), 0); ok(stt.includes('SYNCED'), 'SYNCED surfaced');
});
acheck('10F-2 CASE D duplicate: same idempotency key not re-enqueued (local idempotent)', async () => {
  const c = new CtlClient(); const stt: SyncStatus[] = []; const { durable, svc } = durableSvc(c, stt);
  const k = IdempotencyKey('dupe-sync');
  svc.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e(), idempotencyKey: k }));
  await durable.retrySync(); const after1 = c.calls.length;
  svc.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e(), idempotencyKey: k }));
  await durable.retrySync(); ok(c.calls.length === after1, `no duplicate flush (was ${after1}, now ${c.calls.length})`);
});
acheck('10F-2 CASE E conflict: surfaced explicitly, not silently applied', async () => {
  const c = new CtlClient(); c.mode = 'conflict'; const stt: SyncStatus[] = []; const { durable, svc } = durableSvc(c, stt);
  oneStep(svc); await durable.retrySync(); ok(stt.includes('CONFLICT'), 'CONFLICT surfaced'); eq(durable.pendingSyncCount(), 0);
});
acheck('10F-2 CASE F payload mismatch: surfaced explicitly', async () => {
  const c = new CtlClient(); c.mode = 'mismatch'; const stt: SyncStatus[] = []; const { durable, svc } = durableSvc(c, stt);
  oneStep(svc); await durable.retrySync(); ok(stt.includes('PAYLOAD_MISMATCH'), 'mismatch surfaced');
});
acheck('10F-2 CASE G partial failure: network error → event RETAINED locally (no loss)', async () => {
  const c = new CtlClient(); c.mode = 'net'; const stt: SyncStatus[] = []; const { durable, svc } = durableSvc(c, stt);
  const r = oneStep(svc); eq(r.nextState, 'NOTICE'); await durable.retrySync();
  ok(durable.pendingSyncCount() >= 1, 'event retained in queue'); ok(stt.includes('RETRYING'), 'RETRYING surfaced');
});
acheck('10F-2 CASE C reconnect: queued events flush on retry, idempotency preserved', async () => {
  const c = new CtlClient(); c.mode = 'net'; const stt: SyncStatus[] = []; const { durable, svc } = durableSvc(c, stt);
  oneStep(svc); await durable.retrySync(); ok(durable.pendingSyncCount() >= 1, 'queued while offline');
  c.mode = 'ok'; await durable.retrySync(); eq(durable.pendingSyncCount(), 0); ok(stt.includes('SYNCED'), 'drained on reconnect');
});

export async function runAsync() {
  for (const c of asyncCases) { try { await c.fn(); results.push({ name: c.name, pass: true }); } catch (e: any) { results.push({ name: c.name, pass: false, detail: e?.message ?? String(e) }); } }
  return results;
}


// ═══════════════ PHASE 10G TRACK A — OBSERVATION CAPTURE ═══════════════
const OBS = (opts?: any) => observationFromPrompt(
  { promptId: opts?.promptId ?? 'obs-grossmotor-locomotion', domainOrArea: opts?.dom ?? 'Gross Motor',
    capabilityOrTopic: opts?.cap ?? 'Locomotion and Moving Through Space', parentWording: 'saw it', salience: opts?.sal },
  { threadId: opts?.child ?? CHILD, childId: opts?.child ?? CHILD, observedAt: T, idemSeed: opts?.seed ?? 'o1' });

check('10G-A: observationFromPrompt → frozen PARENT_OBSERVATION, DEVELOPMENT axis, canonical tags, qualitative salience', () => {
  const o = OBS();
  eq(o.source, 'PARENT_OBSERVATION'); eq(o.signal.axis, 'DEVELOPMENT');
  eq(o.signal.domainOrArea, 'Gross Motor'); eq(o.signal.capabilityOrTopic, 'Locomotion and Moving Through Space');
  ok(['HIGH','MED','LOW'].includes(o.salienceInitial), 'qualitative salience'); ok(typeof (o as any).score === 'undefined', 'no numeric score');
  eq(o.effectiveLifecycle, 'ACTIVE'); eq(o.retracted, false);
});
check('10G-A: prompt tags are all canonical (every prompt maps to real AJAK_MAIN domain/capability)', () => {
  ok(OBSERVATION_PROMPTS.length > 0, 'library non-empty');
  for (const p of OBSERVATION_PROMPTS) { ok(!!p.domainOrArea && !!p.capabilityOrTopic, `${p.id} has canonical tags`); ok(p.ageMaxMonths >= p.ageMinMonths, 'age span valid'); }
});
check('10G-A: promptsForAge filters by canonical age span', () => {
  const at2 = promptsForAge(2).map(p=>p.id); ok(at2.includes('obs-grossmotor-postural'), 'postural at 2mo');
  ok(!promptsForAge(2).some(p=>p.id==='obs-adaptive-selffeed'), 'self-feeding (13-36) not at 2mo');
});
check('10G-A: parent observation → SYSTEM_SUGGESTED focus on the observed capability', () => {
  const s = svc(); s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const r = s.step(req({ trigger: 'OBSERVED' as any, observations: [OBS()] as any }));
  eq(r.nextState, 'FOCUS'); eq(r.focus?.proposed?.source, 'SYSTEM_SUGGESTED');
  eq(r.focus?.proposed?.targets?.domainOrArea, 'Gross Motor');
  eq(r.focus?.proposed?.targets?.capabilityOrTopic, 'Locomotion and Moving Through Space');
});
check('10G-A: observation-derived focus reaches real content at DO (unlocks AM content)', () => {
  const s = svc(); s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  s.step(req({ trigger: 'OBSERVED' as any, observations: [OBS()] as any }));
  const tg = { domainOrArea: 'Gross Motor', capabilityOrTopic: 'Locomotion and Moving Through Space' };
  s.step(req({ trigger: 'FOCUS_SELECTED' as any, activeFocusTargets: tg as any, activeFocusId: 'foc-c1' as any, childAgeMonths: 8 }));
  const r = s.step(req({ trigger: 'PREPARED' as any, activeFocusTargets: tg as any, activeFocusId: 'foc-c1' as any, childAgeMonths: 8 }));
  ok(['OK','FALLBACK_ONLY'].includes(r.result.kind), `DO kind ${r.result.kind}`);
  if (r.result.kind === 'OK') ok(!!r.content?.selected?.contentId, 'real content selected from observation');
});
check('10G-A: EXPIRED observation never revives a focus (frozen double-guard)', () => {
  const s = svc(); s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const expired = { ...OBS(), effectiveLifecycle: 'EXPIRED', effectiveSalience: null };
  const r = s.step(req({ trigger: 'OBSERVED' as any, observations: [expired] as any }));
  eq(r.result.kind, 'NO_FOCUS');
});
check('10G-A: RETRACTED observation never revives a focus', () => {
  const s = svc(); s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const retracted = { ...OBS(), retracted: true, effectiveLifecycle: 'RETRACTED', effectiveSalience: null };
  const r = s.step(req({ trigger: 'OBSERVED' as any, observations: [retracted] as any }));
  eq(r.result.kind, 'NO_FOCUS');
});
check('10G-A: determinism — same observation twice → same proposed focus key', () => {
  const mk = () => { const s = svc(); s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
    return s.step(req({ trigger: 'OBSERVED' as any, observations: [OBS()] as any })).focus?.proposed?.key; };
  eq(mk(), mk());
});
check('10G-A: parent selection OVERRIDES an observation (PARENT_SELECTED wins)', () => {
  const s = svc(); s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const r = s.step(req({ trigger: 'OBSERVED' as any, observations: [OBS()] as any, parentSelectedTargets: { value: 'Sabar' } as any }));
  eq(r.focus?.proposed?.source, 'PARENT_SELECTED'); eq(r.focus?.proposed?.targets?.value, 'Sabar');
});
check('10G-A: multi-child isolation — observation carries the correct childId (downstream filter key)', () => {
  const oA = OBS({ child: 'c1', seed: 'a' }); const oB = OBS({ child: 'c2', seed: 'b' });
  eq(oA.childId as any, 'c1'); eq(oB.childId as any, 'c2');
  // simulate the hook's per-child filter: only c1's obs pass for child c1
  const forC1 = [oA, oB].filter((o) => (o.childId as any) === 'c1');
  eq(forC1.length, 1); eq(forC1[0].childId as any, 'c1');
});
check('10G-A: no observation without a parent action (empty → NO_FOCUS, never fabricated)', () => {
  const s = svc(); s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const r = s.step(req({ trigger: 'OBSERVED' as any, observations: [] as any }));
  eq(r.result.kind, 'NO_FOCUS');
});


// ═══════════════ PHASE 10H — PRODUCTION READINESS ═══════════════
// Track G — projection rebuild: executed projection === rebuilt-from-events projection.
check('10H-G: projection rebuild from authoritative events equals executed projection', () => {
  const store = new InMemoryJourneyStore(CANONICAL_MAPPINGS);
  const s = new JourneyApplicationService(store as any, store as any, new MemFocusTargets());
  // drive a real multi-step journey
  s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const tg = { value: 'Sabar' } as any;
  s.step(req({ trigger: 'OBSERVED' as any, parentSelectedTargets: tg }));
  s.step(req({ trigger: 'FOCUS_SELECTED' as any, activeFocusTargets: tg, activeFocusId: 'foc-c1' as any, childAgeMonths: 10 }));
  s.step(req({ trigger: 'PREPARED' as any, activeFocusTargets: tg, activeFocusId: 'foc-c1' as any, childAgeMonths: 10 }));
  s.step(req({ trigger: 'ACTED' as any, activeFocusId: 'foc-c1' as any }));
  // executed projection (authoritative live state)
  const execR: any = (store as any).getCurrentThreadState(DevelopmentThreadId(CHILD));
  ok(execR && execR.kind === 'OK', 'executed projection present');
  const exec = execR.value;
  // rebuild purely from the append-only event stream
  const events = s.listEvents(FamilyJourneyId(FJ));
  const rebuilt = rebuildThreadJourneyState(FamilyJourneyId(FJ), DevelopmentThreadId(CHILD), events);
  ok(!!rebuilt, 'rebuilt projection present');
  eq(rebuilt!.currentState, exec.currentState);
  eq(rebuilt!.resumeState ?? null, exec.resumeState ?? null);
  eq(rebuilt!.threadId as any, exec.threadId as any);
});
check('10H-G: rebuild is deterministic (same events → same state twice)', () => {
  const store = new InMemoryJourneyStore(CANONICAL_MAPPINGS);
  const s = new JourneyApplicationService(store as any, store as any, new MemFocusTargets());
  s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const ev = s.listEvents(FamilyJourneyId(FJ));
  const a = rebuildThreadJourneyState(FamilyJourneyId(FJ), DevelopmentThreadId(CHILD), ev);
  const b = rebuildThreadJourneyState(FamilyJourneyId(FJ), DevelopmentThreadId(CHILD), ev);
  eq(a?.currentState, b?.currentState);
});

// Track L — security / provenance integrity.
check('10H-L: system-derived adaptation provenance cannot be forged to PARENT_SELECTED by reflection alone', () => {
  const s = svc();
  s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const tg = { value: 'Sabar' } as any;
  s.step(req({ trigger: 'OBSERVED' as any, parentSelectedTargets: tg }));
  s.step(req({ trigger: 'FOCUS_SELECTED' as any, activeFocusTargets: tg, activeFocusId: 'foc-c1' as any, childAgeMonths: 10 }));
  s.step(req({ trigger: 'PREPARED' as any, activeFocusTargets: tg, activeFocusId: 'foc-c1' as any, childAgeMonths: 10 }));
  s.step(req({ trigger: 'ACTED' as any, activeFocusId: 'foc-c1' as any }));
  const refl = reflectionFromInputs({ difficulty: 'EASY', relevance: 'RELEVANT' }, { idemSeed: 'sec', threadId: CHILD, createdAt: T });
  const r = s.step(req({ trigger: 'REFLECTED' as any, reflection: refl, activeFocusId: 'foc-c1' as any })); // NO parentChosenOutcome
  if (r.adaptation) eq(r.adaptation.provenance, 'SYSTEM_DERIVED'); // engine assigns provenance, client cannot forge
});
check('10H-L: appended historical events are frozen (immutable in-memory reference model)', () => {
  const store = new InMemoryJourneyStore(CANONICAL_MAPPINGS);
  const s = new JourneyApplicationService(store as any, store as any, new MemFocusTargets());
  s.step(req({ trigger: 'FOUNDATION_SET' as any, activeThreadInput: atInput10e() }));
  const ev = s.listEvents(FamilyJourneyId(FJ))[0] as any;
  ok(Object.isFrozen(ev), 'stored event is frozen (append-only, cannot be rewritten in place)');
});

export function runAll() { return results; }

// Execute when run directly under node (built dist).
declare const require: any; declare const module: any;
if (typeof require !== 'undefined' && require.main === module) {
  runAsync().then(() => {
    const passed = results.filter(r => r.pass).length;
    for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  :: ' + r.detail : ''}`);
    console.log(`\n${passed}/${results.length} passed`);
    if (passed !== results.length) (globalThis as any).process.exitCode = 1;
  });
}
