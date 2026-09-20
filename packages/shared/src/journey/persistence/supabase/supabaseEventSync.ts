// Rekah Journey — Supabase durable SYNC-BACKING for the event log (Phase 10C-2 Slice 1). ADDITIVE.
//
// CONTRACT-GAP NOTE (Phase 10C-2A / Part 13): the FROZEN 9B-2 EventStore interface is SYNCHRONOUS
// (returns RepoResult<T>), while Supabase network I/O is asynchronous (Promise). A DIRECT synchronous
// Supabase adapter is therefore impossible WITHOUT changing the frozen interface (forbidden, STOP #4).
// Resolution (no interface change): the synchronous EventStore stays LOCAL-first (served by the
// local store the Application Service already uses); THIS async backing flushes local events to
// Supabase via the DB-enforced append RPC and maps the outcome. This preserves the frozen sync
// contract and matches the Phase 9B offline/sync model (LOCAL→QUEUED→SYNCING→SYNCED→CONFLICT→RECONCILED).
import type { SupabaseClientLike } from './supabaseClientLike';

export type SyncOutcome =
  | { kind: 'OK'; sequence: number }
  | { kind: 'IDEMPOTENT_REPLAY'; sequence: number }
  | { kind: 'IDEMPOTENCY_PAYLOAD_MISMATCH' }
  | { kind: 'CONFLICT'; expected: number; actual: number }
  | { kind: 'FORBIDDEN' }
  | { kind: 'ERROR'; message: string };

export interface RemoteAppend {
  streamId: string; familyId: string; kind: string; occurredAt: string;
  idempotencyKey: string; payload: unknown; expectedSequence?: number | null;
}

/** Flush one local event to Supabase; the DB RPC re-enforces idempotency/sequence/concurrency. */
export class SupabaseEventSync {
  constructor(private readonly client: SupabaseClientLike) {}

  async appendRemote(e: RemoteAppend): Promise<SyncOutcome> {
    const res = await this.client.rpc('rekah_journey_append_event', {
      p_stream_id: e.streamId, p_family_id: e.familyId, p_kind: e.kind, p_occurred_at: e.occurredAt,
      p_idempotency_key: e.idempotencyKey, p_payload: e.payload,
      p_expected_sequence: e.expectedSequence ?? null,
    });
    if (res.error) return { kind: 'ERROR', message: res.error.message };
    const d = res.data as { outcome: string; sequence?: number; expected?: number; actual?: number };
    switch (d.outcome) {
      case 'OK': return { kind: 'OK', sequence: d.sequence! };
      case 'IDEMPOTENT_REPLAY': return { kind: 'IDEMPOTENT_REPLAY', sequence: d.sequence! };
      case 'IDEMPOTENCY_PAYLOAD_MISMATCH': return { kind: 'IDEMPOTENCY_PAYLOAD_MISMATCH' };
      case 'CONFLICT': return { kind: 'CONFLICT', expected: d.expected!, actual: d.actual! };
      case 'FORBIDDEN': return { kind: 'FORBIDDEN' };
      default: return { kind: 'ERROR', message: `unknown outcome ${d.outcome}` };
    }
  }
}
