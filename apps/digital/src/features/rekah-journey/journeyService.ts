// Rekah Journey — app-side service factory (Phase 10F-2 sync hardening). ADDITIVE.
// Local-first synchronous store (what the FROZEN Application Service sees). When a durable client is
// supplied, a DurableEventStore decorator flushes each local append to the authorized Supabase append
// RPC ASYNCHRONOUSLY via a retrying SyncQueue. The frozen synchronous EventStore interface is unchanged
// (append still returns synchronously, local-first). Durability is OFF by default → no production write.
import {
  JourneyApplicationService, InMemoryJourneyStore, CANONICAL_MAPPINGS, SupabaseEventSync,
} from '@studiva/shared/journey';
import type {
  FocusTargetsStore, EventStore, JourneyEvent, StoredEvent, SupabaseClientLike,
} from '@studiva/shared/journey';

class LocalFocusTargets implements FocusTargetsStore {
  private m = new Map<string, ReturnType<FocusTargetsStore['getFocusTargets']>>();
  getFocusTargets(id: Parameters<FocusTargetsStore['getFocusTargets']>[0]) { return this.m.get(id as unknown as string) ?? null; }
  saveFocusTargets(id: Parameters<FocusTargetsStore['saveFocusTargets']>[0], t: Parameters<FocusTargetsStore['saveFocusTargets']>[1]) { this.m.set(id as unknown as string, t); }
}

type Pending = { streamId: string; familyId: string; kind: string; occurredAt: string; idempotencyKey: string; payload: unknown; expectedSequence?: number | null };
export type SyncStatus = 'SYNCED' | 'QUEUED' | 'CONFLICT' | 'PAYLOAD_MISMATCH' | 'FORBIDDEN' | 'RETRYING';
export interface SyncStore { load(): Pending[]; save(q: Pending[]): void; } // optional restart-durable backing (e.g. localStorage)

/** Retrying, non-lossy sync queue (10F-2). Network errors are retained & retried (no data loss).
 *  CONFLICT / PAYLOAD_MISMATCH / FORBIDDEN are surfaced EXPLICITLY (never silent last-write-wins). */
export class SyncQueue {
  private q: Pending[] = [];
  private inflight: Promise<void> | null = null;
  constructor(private readonly sync: SupabaseEventSync, private readonly onStatus?: (s: SyncStatus, e: Pending, extra?: unknown) => void, private readonly persist?: SyncStore) {
    if (persist) { try { this.q = persist.load() ?? []; } catch { this.q = []; } }
  }
  pendingCount() { return this.q.length; }
  enqueue(e: Pending) { this.q.push(e); this.onStatus?.('QUEUED', e); this.save(); void this.flush(); }
  private save() { if (this.persist) { try { this.persist.save(this.q); } catch { /* best-effort */ } } }
  /** Idempotent, awaitable flush: concurrent callers await the SAME in-flight drain. */
  flush(): Promise<void> {
    if (this.inflight) return this.inflight;
    this.inflight = this.run().finally(() => { this.inflight = null; });
    return this.inflight;
  }
  private async run(): Promise<void> {
    while (this.q.length) {
      const e = this.q[0];
      let out; try { out = await this.sync.appendRemote(e); } catch { this.onStatus?.('RETRYING', e); break; } // network → keep, retry later
      if (out.kind === 'OK' || out.kind === 'IDEMPOTENT_REPLAY') { this.q.shift(); this.save(); this.onStatus?.('SYNCED', e); continue; }
      if (out.kind === 'CONFLICT') { this.q.shift(); this.save(); this.onStatus?.('CONFLICT', e, out); continue; }       // surfaced, not silently overwritten
      if (out.kind === 'IDEMPOTENCY_PAYLOAD_MISMATCH') { this.q.shift(); this.save(); this.onStatus?.('PAYLOAD_MISMATCH', e); continue; }
      if (out.kind === 'FORBIDDEN') { this.q.shift(); this.save(); this.onStatus?.('FORBIDDEN', e); continue; }
      this.onStatus?.('RETRYING', e); break;                                                                            // ERROR → keep, retry later
    }
  }
}

export class DurableEventStore implements EventStore {
  private readonly queue: SyncQueue;
  constructor(private readonly inner: EventStore, sync: SupabaseEventSync, private readonly familyId: string,
              onStatus?: (s: SyncStatus, extra?: unknown) => void, persist?: SyncStore) {
    this.queue = new SyncQueue(sync, (s, _e, extra) => onStatus?.(s, extra), persist);
  }
  pendingSyncCount() { return this.queue.pendingCount(); }
  retrySync() { return this.queue.flush(); }
  append(...args: Parameters<EventStore['append']>): ReturnType<EventStore['append']> {
    const [streamId, ev, idempotencyKey, occurredAt, expectedSequence] = args;
    const local = this.inner.append(streamId, ev, idempotencyKey, occurredAt, expectedSequence); // sync, local-first, authoritative
    if (local.kind === 'OK') {
      this.queue.enqueue({
        streamId: streamId as unknown as string, familyId: this.familyId, kind: (ev as JourneyEvent).kind,
        occurredAt: occurredAt as unknown as string, idempotencyKey: idempotencyKey as unknown as string,
        payload: (ev as JourneyEvent).event, expectedSequence: expectedSequence ?? null,
      });
    }
    return local;
  }
  read(streamId: Parameters<EventStore['read']>[0]): readonly StoredEvent[] { return this.inner.read(streamId); }
  readByKind(...a: Parameters<EventStore['readByKind']>): readonly StoredEvent[] { return this.inner.readByKind(...a); }
  lastSequence(streamId: Parameters<EventStore['lastSequence']>[0]): number { return this.inner.lastSequence(streamId); }
}

export interface DurableOpts { client: SupabaseClientLike; familyId: string; onStatus?: (s: SyncStatus, extra?: unknown) => void; persist?: SyncStore; }

/** One journey service per family session. Local-first by default; durable when opts supplied. */
export function createJourneyService(opts?: DurableOpts): JourneyApplicationService {
  const store = new InMemoryJourneyStore(CANONICAL_MAPPINGS);
  const events: EventStore = opts
    ? new DurableEventStore(store, new SupabaseEventSync(opts.client), opts.familyId, opts.onStatus, opts.persist)
    : store;
  return new JourneyApplicationService(events, store, new LocalFocusTargets());
}
