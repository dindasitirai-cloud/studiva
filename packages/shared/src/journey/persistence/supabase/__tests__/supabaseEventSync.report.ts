// Rekah Journey — Supabase sync-backing test (Phase 10C-2 Slice 1) against a FAKE client that
// emulates the rekah_journey_append_event RPC semantics (the same the SQL enforces). Proves the
// adapter maps every DB outcome to the correct result and preserves append-only/monotonic/idempotent
// /concurrency behavior. Live-DB execution of the migration/RLS is a deploy-time gate (NOT_RUN here).
'use strict';
import { SupabaseEventSync } from '../supabaseEventSync';
import type { SupabaseClientLike, SupabaseRpcResult } from '../supabaseClientLike';

let pass = 0, fail = 0; const fails: string[] = [];
const A = (n: string, c: boolean, d = '') => { if (c) pass++; else { fail++; fails.push(`${n} :: ${d}`); } console.log(`${c ? 'PASS' : 'FAIL'} | ${n}${c ? '' : '  <<< ' + d}`); };

// Fake DB emulating the append RPC (idempotency + monotonic sequence + optimistic concurrency + family isolation + immutability).
class FakeDb implements SupabaseClientLike {
  private byKey = new Map<string, { seq: number; payload: string; kind: string }>();
  private tail = new Map<string, number>();
  member = 'fam-1';
  async rpc(fn: string, a: Record<string, unknown>): Promise<SupabaseRpcResult> {
    if (fn !== 'rekah_journey_append_event') return { data: null, error: { message: 'unknown fn' } };
    const fam = a.p_family_id as string, stream = a.p_stream_id as string, key = a.p_idempotency_key as string;
    const kind = a.p_kind as string, payload = JSON.stringify(a.p_payload), exp = a.p_expected_sequence as number | null;
    if (fam !== this.member) return { data: { outcome: 'FORBIDDEN' }, error: null };
    const prior = this.byKey.get(key);
    if (prior) return { data: prior.payload === payload && prior.kind === kind
      ? { outcome: 'IDEMPOTENT_REPLAY', sequence: prior.seq } : { outcome: 'IDEMPOTENCY_PAYLOAD_MISMATCH' }, error: null };
    const last = this.tail.get(stream) ?? 0;
    if (exp != null && exp !== last) return { data: { outcome: 'CONFLICT', expected: exp, actual: last }, error: null };
    const seq = last + 1; this.tail.set(stream, seq); this.byKey.set(key, { seq, payload, kind });
    return { data: { outcome: 'OK', sequence: seq }, error: null };
  }
}

const run = async () => {
  const db = new FakeDb(); const sync = new SupabaseEventSync(db);
  const ev = (key: string, payload: unknown, expected?: number | null) => ({
    streamId: 'fj-1', familyId: 'fam-1', kind: 'TRANSITION', occurredAt: 't', idempotencyKey: key, payload, expectedSequence: expected,
  });
  const r1 = await sync.appendRemote(ev('k1', { a: 1 }, 0));
  A('first append -> OK seq 1', r1.kind === 'OK' && r1.sequence === 1, JSON.stringify(r1));
  const r2 = await sync.appendRemote(ev('k2', { a: 2 }, 1));
  A('second append -> OK seq 2 (monotonic)', r2.kind === 'OK' && r2.sequence === 2, JSON.stringify(r2));
  const r3 = await sync.appendRemote(ev('k1', { a: 1 }, 0));
  A('same key + same payload -> IDEMPOTENT_REPLAY', r3.kind === 'IDEMPOTENT_REPLAY', JSON.stringify(r3));
  const r4 = await sync.appendRemote(ev('k1', { a: 999 }, 0));
  A('same key + diff payload -> IDEMPOTENCY_PAYLOAD_MISMATCH', r4.kind === 'IDEMPOTENCY_PAYLOAD_MISMATCH', JSON.stringify(r4));
  const r5 = await sync.appendRemote(ev('k3', { a: 3 }, 0));
  A('stale expectedSequence -> CONFLICT', r5.kind === 'CONFLICT', JSON.stringify(r5));
  const r6 = await sync.appendRemote(ev('k3b', { a: 3 }, 2));
  A('correct expectedSequence -> OK', r6.kind === 'OK', JSON.stringify(r6));
  const db2 = new FakeDb(); (db2 as unknown as { member: string }).member = 'fam-2';
  const other = new SupabaseEventSync(db2);
  const r7 = await other.appendRemote({ streamId: 'fj-x', familyId: 'fam-1', kind: 'TRANSITION', occurredAt: 't', idempotencyKey: 'kx', payload: {}, expectedSequence: 0 });
  A('cross-family append -> FORBIDDEN (RLS/ownership)', r7.kind === 'FORBIDDEN', JSON.stringify(r7));
  A('no update/delete method on the adapter (append-only surface)', typeof (sync as unknown as Record<string, unknown>)['updateRemote'] === 'undefined' && typeof (sync as unknown as Record<string, unknown>)['deleteRemote'] === 'undefined');

  console.log('======== SUMMARY ========');
  console.log(`TOTAL ${pass + fail}  PASS ${pass}  FAIL ${fail}`);
  if (fail) fails.forEach((f) => console.log('  - ' + f));
  console.log(fail === 0 ? 'RESULT: PASS' : 'RESULT: FAIL');
};
run();
