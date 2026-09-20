// Rekah Journey — STAGING-ONLY durable wiring helper (ADDITIVE; non-frozen).
// Gated by REACT_APP_JOURNEY_DURABLE so a normal PRODUCTION build behaves exactly as before.
// Drop at: apps/digital/src/features/rekah-journey/journeyDurableStaging.ts

import { supabase } from '../../lib/supabase/client';
import { createJourneyService } from './journeyService';
import type { SyncStore } from './journeyService';
import type { SupabaseClientLike } from '@studiva/shared/journey';

type Pending = {
  streamId: string; familyId: string; kind: string; occurredAt: string;
  idempotencyKey: string; payload: unknown; expectedSequence?: number | null;
};

const LS_KEY = 'rekah_journey_sync_queue_v1';

export const localStorageSyncStore: SyncStore = {
  load(): Pending[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } },
  save(q: Pending[]): void { try { localStorage.setItem(LS_KEY, JSON.stringify(q)); } catch { /* ignore */ } },
};

export function makeJourneyService(userId: string | null | undefined, onStatus?: (s: string, extra?: unknown) => void) {
  const flag = process.env.REACT_APP_JOURNEY_DURABLE;
  const durable = flag === '1' && !!userId;
  // Visible diagnostic — remove after the test. Tells us exactly why durability is on/off.
  // eslint-disable-next-line no-console
  console.log('[Rekah durability]', { flag, userId: userId ?? null, durable });
  if (!durable) return createJourneyService(); // unchanged production behavior (no Supabase writes)
  return createJourneyService({
    client: supabase as unknown as SupabaseClientLike, // type-only cast; runtime .rpc is real
    familyId: userId as string,
    persist: localStorageSyncStore,
    onStatus: (s, extra) => { /* eslint-disable-next-line no-console */ console.log('[Rekah sync]', s, extra); onStatus?.(String(s), extra); },
  });
}
