-- Rekah Journey — additive persistence (Phase 10C-2 Slice 1). AUTHORIZED by Phase 10C-2A §J.
-- ADDITIVE ONLY. No existing table/column/constraint is modified. All objects are namespaced
-- `rekah_journey_*`. Realizes the FROZEN Phase 9B-2 repository semantics at the database level.
-- Assumption (implementer to confirm): orang_tua.id = auth.uid() (Supabase profile pattern), so
-- family_id = auth.uid(). family_id is denormalized onto every table for strong, simple RLS.

-- ---------- helper: family membership ----------
create or replace function rekah_journey_is_family_member(p_family_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select p_family_id = auth.uid();
$$;

-- ---------- 1. EVENT STORE (append-only source of truth) ----------
create table if not exists rekah_journey_event (
  id             uuid primary key default gen_random_uuid(),
  stream_id      uuid not null,                 -- family_journey_id
  family_id      uuid not null,
  sequence       bigint not null,               -- monotonic per stream
  kind           text not null check (kind in ('TRANSITION','PARENT_ACTION','FOCUS','OBSERVATION','EXPOSURE','ADAPTATION','ENGINE_DECISION')),
  occurred_at    timestamptz not null,
  idempotency_key text not null,
  payload_json   jsonb not null,
  created_at     timestamptz not null default now(),
  unique (stream_id, sequence),                 -- monotonicity enforced by DB
  unique (idempotency_key)                       -- idempotency enforced by DB
);
create index if not exists idx_rje_stream_seq on rekah_journey_event (stream_id, sequence);
create index if not exists idx_rje_kind on rekah_journey_event (stream_id, kind);

-- immutability: reject any UPDATE/DELETE on the event log
create or replace function rekah_journey_block_mutation() returns trigger language plpgsql as $$
begin raise exception 'rekah_journey: historical events are immutable (append-only)'; end; $$;
drop trigger if exists trg_rje_immutable on rekah_journey_event;
create trigger trg_rje_immutable before update or delete on rekah_journey_event
  for each row execute function rekah_journey_block_mutation();

-- ---------- 2. PROJECTIONS / AGGREGATES ----------
create table if not exists rekah_journey_family (
  family_id uuid primary key,
  status text not null default 'ACTIVE',
  active_thread_id uuid,
  content_type_lean jsonb not null default '[]',
  excluded_content_ids jsonb not null default '[]',
  cadence text,
  seq int not null default 0
);
create table if not exists rekah_journey_family_direction (
  family_id uuid primary key,
  values jsonb not null default '[]',            -- ordered Nilai Akar refs
  effective_from timestamptz not null default now(),
  effective_until timestamptz,
  active boolean not null default true
);
create table if not exists rekah_journey_thread (
  thread_id uuid primary key,
  family_id uuid not null,
  child_id uuid not null,                         -- soft ref to anak.id (no FK: production table untouched)
  status text not null default 'ACTIVE',
  active_focus_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_rjt_family on rekah_journey_thread (family_id);
create table if not exists rekah_journey_family_journey (
  family_journey_id uuid primary key,
  family_id uuid not null,
  status text not null default 'ACTIVE',
  started_at timestamptz not null default now(),
  started_under_versions jsonb not null,
  seq int not null default 0
);
create table if not exists rekah_journey_thread_state (
  thread_id uuid primary key,
  family_journey_id uuid not null,
  family_id uuid not null,
  active_focus_id uuid,
  current_state text not null,
  current_stage_action_id uuid,
  resume_state text,
  pause_reason text,
  state_entered_at timestamptz not null,
  state_updated_at timestamptz not null,
  seq int not null default 0,                     -- optimistic concurrency (projection)
  last_transition_id text
);
create table if not exists rekah_journey_focus (
  focus_id uuid primary key,
  family_journey_id uuid not null,
  family_id uuid not null,
  thread_id uuid,
  scope text not null,
  source text not null check (source in ('PARENT_SELECTED','SYSTEM_SUGGESTED','SYSTEM_DERIVED')),
  status text not null,
  parent_confirmed boolean not null default false,
  priority_rank int not null default 0,
  rationale_text text,
  informed_by_observation_ids jsonb not null default '[]',
  targets jsonb,                                  -- additive: focus semantic targets (frozen Focus has none)
  started_at timestamptz, target_end_at timestamptz, completed_at timestamptz,
  paused_at timestamptz, abandoned_at timestamptz,
  seq int not null default 0
);
create index if not exists idx_rjf_thread on rekah_journey_focus (thread_id);
create table if not exists rekah_journey_observation (
  observation_id uuid primary key,
  family_id uuid not null,
  thread_id uuid not null,
  child_id uuid not null,
  source text not null,
  signal jsonb not null,                          -- {axis, domainOrArea, capabilityOrTopic}
  salience_initial text not null,
  parent_wording text,
  observed_at timestamptz not null,
  retracted boolean not null default false,
  retracted_at timestamptz
);
create index if not exists idx_rjo_thread on rekah_journey_observation (thread_id, observed_at);
create table if not exists rekah_journey_action (
  action_id uuid primary key,
  family_journey_id uuid not null,
  family_id uuid not null,
  thread_id uuid not null,
  focus_id uuid,
  origin text not null,
  content_ref jsonb,                              -- {content_id, mapping_id} ONLY — never body/title/taxonomy
  parent_action_text text,
  sizing jsonb,
  stage text,
  fallback_status text,                           -- PRIMARY_MATCH | FALLBACK_MATCH | NO_MATCH
  status text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  seq int not null default 0
);
create index if not exists idx_rja_focus on rekah_journey_action (focus_id);
create table if not exists rekah_journey_reflection (
  reflection_id uuid primary key,
  family_id uuid not null,
  action_id uuid not null,
  thread_id uuid not null,
  child_response text, parent_experience text, difficulty text, relevance text,
  willingness_to_repeat boolean, context_change text,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create table if not exists rekah_journey_engine_decision (
  decision_id uuid primary key,
  family_journey_id uuid not null,
  family_id uuid not null,
  thread_id uuid,
  occurred_at timestamptz not null,
  current_state text not null,
  decision_type text not null,
  input_ref text,
  rules_evaluated jsonb not null default '[]',
  selected_content_id text,                       -- reference only
  mapping_id text,                                -- reference only
  fallback_status text,
  reason_code text not null,
  reason_text text,
  versions jsonb not null,                        -- {metadata_version, mapping_version, rule_version}
  idempotency_key text not null unique
);
drop trigger if exists trg_rjed_immutable on rekah_journey_engine_decision;
create trigger trg_rjed_immutable before update or delete on rekah_journey_engine_decision
  for each row execute function rekah_journey_block_mutation();

-- ---------- 3. APPEND RPC (atomic, DB-enforced idempotency + sequence + concurrency) ----------
create or replace function rekah_journey_append_event(
  p_stream_id uuid, p_family_id uuid, p_kind text, p_occurred_at timestamptz,
  p_idempotency_key text, p_payload jsonb, p_expected_sequence bigint default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_prior rekah_journey_event; v_last bigint; v_seq bigint;
begin
  if not rekah_journey_is_family_member(p_family_id) then
    return jsonb_build_object('outcome','FORBIDDEN');
  end if;
  -- idempotency: same key already stored?
  select * into v_prior from rekah_journey_event where idempotency_key = p_idempotency_key;
  if found then
    if v_prior.payload_json = p_payload and v_prior.kind = p_kind then
      return jsonb_build_object('outcome','IDEMPOTENT_REPLAY','sequence',v_prior.sequence,'id',v_prior.id);
    else
      return jsonb_build_object('outcome','IDEMPOTENCY_PAYLOAD_MISMATCH','idempotency_key',p_idempotency_key);
    end if;
  end if;
  -- optimistic concurrency on the stream tail
  select coalesce(max(sequence),0) into v_last from rekah_journey_event where stream_id = p_stream_id;
  if p_expected_sequence is not null and p_expected_sequence <> v_last then
    return jsonb_build_object('outcome','CONFLICT','expected',p_expected_sequence,'actual',v_last);
  end if;
  v_seq := v_last + 1;
  insert into rekah_journey_event (stream_id, family_id, sequence, kind, occurred_at, idempotency_key, payload_json)
  values (p_stream_id, p_family_id, v_seq, p_kind, p_occurred_at, p_idempotency_key, p_payload);
  return jsonb_build_object('outcome','OK','sequence',v_seq);
end; $$;

-- ---------- 4. RLS (family isolation) ----------
do $$ declare t text; begin
  foreach t in array array[
    'rekah_journey_event','rekah_journey_family','rekah_journey_family_direction','rekah_journey_thread',
    'rekah_journey_family_journey','rekah_journey_thread_state','rekah_journey_focus','rekah_journey_observation',
    'rekah_journey_action','rekah_journey_reflection','rekah_journey_engine_decision']
  loop execute format('alter table %I enable row level security;', t); end loop;
end $$;

-- SELECT + INSERT for own family on every table; UPDATE for projections only; DELETE nowhere.
do $$ declare t text; begin
  foreach t in array array[
    'rekah_journey_event','rekah_journey_family','rekah_journey_family_direction','rekah_journey_thread',
    'rekah_journey_family_journey','rekah_journey_thread_state','rekah_journey_focus','rekah_journey_observation',
    'rekah_journey_action','rekah_journey_reflection','rekah_journey_engine_decision']
  loop
    execute format('drop policy if exists %I_sel on %I;', t, t);
    execute format('create policy %I_sel on %I for select using (family_id = auth.uid());', t, t);
    execute format('drop policy if exists %I_ins on %I;', t, t);
    execute format('create policy %I_ins on %I for insert with check (family_id = auth.uid());', t, t);
  end loop;
end $$;
-- UPDATE only on projection tables (never on immutable event/decision logs)
do $$ declare t text; begin
  foreach t in array array[
    'rekah_journey_family','rekah_journey_family_direction','rekah_journey_thread',
    'rekah_journey_family_journey','rekah_journey_thread_state','rekah_journey_focus',
    'rekah_journey_observation','rekah_journey_action','rekah_journey_reflection']
  loop
    execute format('drop policy if exists %I_upd on %I;', t, t);
    execute format('create policy %I_upd on %I for update using (family_id = auth.uid()) with check (family_id = auth.uid());', t, t);
  end loop;
end $$;
-- No DELETE policy anywhere → deletes are denied for all client roles.
-- Engine-only/provenance columns (source, fallback_status, versions, reason_code) are written by the
-- Application Service via this RPC / service role; parent JWT can only set parent-intent columns.
