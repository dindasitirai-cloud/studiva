// Rekah Journey — minimal STRUCTURAL Supabase client interface (Phase 10C-2 Slice 1).
// Defined structurally so @studiva/shared adds NO dependency on @supabase/supabase-js.
// apps/digital injects its real Supabase client (which satisfies this shape).
export interface SupabaseRpcResult { data: unknown; error: { message: string } | null; }
export interface SupabaseClientLike {
  rpc(fn: string, args: Record<string, unknown>): Promise<SupabaseRpcResult>;
}
