// Rekah Journey — repository result types (Phase 9B-2)
// Persistence outcomes as a discriminated union (never success:boolean). NO engine logic.
import type { IdempotencyKey } from '../ids';

export type RepoResult<T> =
  | { readonly kind: 'OK'; readonly value: T }
  | { readonly kind: 'IDEMPOTENT_REPLAY'; readonly value: T }               // same key + same payload → prior result
  | { readonly kind: 'IDEMPOTENCY_PAYLOAD_MISMATCH'; readonly idempotencyKey: IdempotencyKey } // same key, different payload
  | { readonly kind: 'CONFLICT'; readonly expectedSeq: number; readonly actualSeq: number }     // optimistic-concurrency clash
  | { readonly kind: 'NOT_FOUND'; readonly id: string };

export const ok = <T>(value: T): RepoResult<T> => ({ kind: 'OK', value });
export const replay = <T>(value: T): RepoResult<T> => ({ kind: 'IDEMPOTENT_REPLAY', value });
export const idempotencyMismatch = <T>(idempotencyKey: IdempotencyKey): RepoResult<T> => ({ kind: 'IDEMPOTENCY_PAYLOAD_MISMATCH', idempotencyKey });
export const conflict = <T>(expectedSeq: number, actualSeq: number): RepoResult<T> => ({ kind: 'CONFLICT', expectedSeq, actualSeq });
export const notFound = <T>(id: string): RepoResult<T> => ({ kind: 'NOT_FOUND', id });

export const isOk = <T>(r: RepoResult<T>): r is { kind: 'OK'; value: T } => r.kind === 'OK';
