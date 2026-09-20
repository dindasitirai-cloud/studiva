// Rekah Journey — Phase 10D Journey Input Adapter (ADDITIVE, PURE).
// Translates EXISTING Rekah data into the frozen Application Service `StepRequest` fields.
// It ASSEMBLES inputs only. It makes NO journey decision: it never ranks, never chooses a focus,
// never selects content, never infers an adaptation, never calls the engine/FSM. The frozen engine
// (via JourneyApplicationService.step) remains the sole decision-maker. No I/O here — callers pass
// already-loaded rows from the EXISTING repositories (lib/supabase/rekah.ts, rekahMusim.ts).
import {
  CANONICAL_FAMILY_VALUES, REKAH_VERSIONS,
  FamilyId, ChildId, DevelopmentThreadId, FamilyJourneyId, ReflectionId, ActionInstanceId,
} from '@studiva/shared/journey';
import type {
  FamilyValue, Reflection, FocusTargets, EffectiveObservation,
  DevelopmentThread, Family, FamilyJourney, ActiveThreadInput, ReflectionChildResponse,
} from '@studiva/shared/journey';

// ── Raw shapes from the EXISTING Rekah repositories (mirrors of the real rows; no new schema) ──
export interface RekahChildLike { readonly id: string; readonly namaAnak?: string; readonly tanggalLahir?: string; }
export interface NilaiDitanamLike { readonly id_nilai: string; readonly ditanam_pada?: string; }
export interface MusimLike { readonly musim_ke: number; readonly nilai_fokus: readonly string[]; }
export type ReponAnak = 'seru' | 'menantang' | 'belum-tertarik';
export type MoodPendamping = 'lega' | 'biasa' | 'lelah';
export interface RefleksiLike {
  readonly respon_anak: ReponAnak;
  readonly mood_pendamping?: MoodPendamping | null;
  readonly catatan?: string | null;
  readonly nilai_utama?: string | null;
  readonly id_modul?: string | null;
  readonly tanggal?: string | null;
}

const CANON = CANONICAL_FAMILY_VALUES as readonly string[];

/** Value pass-through with validation. Returns null for anything not one of the frozen 12 Nilai Akar
 *  — an unknown value is DROPPED, never coerced. (nilai_ditanam.id_nilai / rekah_musim.nilai_fokus
 *  already store these exact canonical strings.) */
export function toFamilyValue(idNilai: string): FamilyValue | null {
  return CANON.includes(idNilai) ? (idNilai as unknown as FamilyValue) : null;
}

/** Direction ← nilai_ditanam (active child's planted Nilai Akar), ordered by planting time, de-duped,
 *  unknowns dropped. Empty in → empty out (NEVER a default). The adapter does not rank; it preserves
 *  the parent's own order and lets the frozen focus resolver weigh Direction. */
export function toDirectionValues(rows: readonly NilaiDitanamLike[]): FamilyValue[] {
  const ordered = [...rows].sort((a, b) => String(a.ditanam_pada ?? '').localeCompare(String(b.ditanam_pada ?? '')));
  const out: FamilyValue[] = [];
  const seen = new Set<string>();
  for (const r of ordered) {
    const v = toFamilyValue(r.id_nilai);
    if (v && !seen.has(r.id_nilai)) { seen.add(r.id_nilai); out.push(v); }
  }
  return out;
}

/** The season's chosen focus values (rekah_musim.nilai_fokus), presented to the PARENT as choices in
 *  the Focus screen. This is NOT an auto-selected focus — the parent confirms one (see
 *  toParentSelectedTargets). Unknowns dropped; order preserved. */
export function toFocusChoiceValues(musim: MusimLike | null | undefined): FamilyValue[] {
  if (!musim) return [];
  const out: FamilyValue[] = [];
  const seen = new Set<string>();
  for (const raw of musim.nilai_fokus ?? []) {
    const v = toFamilyValue(raw);
    if (v && !seen.has(raw)) { seen.add(raw); out.push(v); }
  }
  return out;
}

/** A parent's explicit focus choice → FocusTargets (value-scoped). PARENT_SELECTED authority is applied
 *  by the frozen resolver, not here. */
export function toParentSelectedTargets(value: FamilyValue): FocusTargets {
  return { value };
}

/** respon_anak → frozen ReflectionChildResponse. Honest, documented mapping (Phase 10D §D-3):
 *  seru→ENGAGED, menantang→RESISTANT, belum-tertarik→NEUTRAL; anything else→UNCLEAR. */
export function toChildResponse(r: ReponAnak | string | null | undefined): ReflectionChildResponse {
  switch (r) {
    case 'seru': return 'ENGAGED' as ReflectionChildResponse;
    case 'menantang': return 'RESISTANT' as ReflectionChildResponse;
    case 'belum-tertarik': return 'NEUTRAL' as ReflectionChildResponse;
    default: return 'UNCLEAR' as ReflectionChildResponse;
  }
}

/** rekah_refleksi row → frozen Reflection. difficulty/relevance/willingnessToRepeat have NO existing
 *  source → null (all optional). mood_pendamping is surfaced verbatim as contextChange (a label, not a
 *  score). No field is invented. */
export function toJourneyReflection(
  row: RefleksiLike,
  ctx: { readonly idemSeed: string; readonly threadId: string; readonly createdAt: string },
): Reflection {
  return {
    reflectionId: ReflectionId(`${ctx.idemSeed}:refl`),
    actionId: ActionInstanceId(`${ctx.idemSeed}:act`),
    threadId: DevelopmentThreadId(ctx.threadId),
    childResponse: toChildResponse(row.respon_anak),
    parentExperience: row.catatan ?? null,
    difficulty: null,
    relevance: null,
    willingnessToRepeat: null,
    contextChange: row.mood_pendamping ? `mood_pendamping:${row.mood_pendamping}` : null,
    createdAt: row.tanggal ? new Date(row.tanggal).toISOString() : ctx.createdAt,
    editedAt: null,
  };
}

/** Build the multi-child ActiveThreadInput from the EXISTING children list + the active child.
 *  One thread per child (childId === threadId by construction here). Archived/inactive children are
 *  NOT invented as active. The frozen resolveActiveThread remains the sole active-thread authority;
 *  parentSelectedThreadId carries the parent's pick from the existing picker. */
export function toActiveThreadInput(args: {
  readonly familyId: string;
  readonly familyJourneyId: string;
  readonly children: readonly RekahChildLike[];
  readonly activeChildId: string;
  readonly createdAt: string;
}): ActiveThreadInput {
  const familyId = FamilyId(args.familyId);
  const activeThreadId = DevelopmentThreadId(args.activeChildId);
  const threads: DevelopmentThread[] = args.children.map((c) => ({
    threadId: DevelopmentThreadId(c.id),
    familyId,
    childId: ChildId(c.id),
    status: 'ACTIVE',
    createdAt: args.createdAt,
    activeFocusId: null,
  }));
  const family: Family = {
    familyId,
    createdAt: args.createdAt,
    status: 'ACTIVE',
    activeThreadId,
    seq: 0,
  };
  const familyJourney: FamilyJourney = {
    familyJourneyId: FamilyJourneyId(args.familyJourneyId),
    familyId,
    status: 'ACTIVE',
    startedAt: args.createdAt,
    startedUnderVersions: REKAH_VERSIONS,
    seq: 0,
  };
  return {
    versions: REKAH_VERSIONS,
    family,
    familyJourney,
    threads,
    parentSelectedThreadId: activeThreadId,
  };
}

/** Observations: Rekah has NO developmental-observation capture surface (Phase 10D §D-4).
 *  We supply an empty list — absence of data is NOT a negative observation, and none is fabricated.
 *  Consequence: with no parent-selected focus, the engine honestly returns NO_FOCUS. */
export const REAL_OBSERVATIONS: readonly EffectiveObservation[] = [];

// ── Phase 10D (continuation): reflection from the in-UI chips (parent inputs), not a stored row.
// Produces the frozen Reflection domain object (Step 11). Reflection is navigation input, not a score.
// Unmapped fields are null (never fabricated). difficulty/relevance already use the frozen enum values.
import type { ReflectionDifficulty, ReflectionRelevance } from '@studiva/shared/journey';
const DIFFS = ['EASY', 'OK', 'TOO_HARD'];
const RELS = ['RELEVANT', 'NEUTRAL', 'NOT_RELEVANT'];
export function reflectionFromInputs(
  input: {
    readonly difficulty?: string | null;
    readonly relevance?: string | null;
    readonly childResponse?: ReflectionChildResponse | null;
    readonly parentExperience?: string | null;
  },
  ctx: { readonly idemSeed: string; readonly threadId: string; readonly createdAt: string },
): Reflection {
  const diff = input.difficulty && DIFFS.includes(input.difficulty) ? (input.difficulty as ReflectionDifficulty) : null;
  const rel = input.relevance && RELS.includes(input.relevance) ? (input.relevance as ReflectionRelevance) : null;
  return {
    reflectionId: ReflectionId(`${ctx.idemSeed}:refl`),
    actionId: ActionInstanceId(`${ctx.idemSeed}:act`),
    threadId: DevelopmentThreadId(ctx.threadId),
    childResponse: input.childResponse ?? null,
    parentExperience: input.parentExperience ?? null,
    difficulty: diff,
    relevance: rel,
    willingnessToRepeat: null,
    contextChange: null,
    createdAt: ctx.createdAt,
    editedAt: null,
  };
}

// ── Phase 10G (Track A): parent observation → frozen EffectiveObservation.
// source = PARENT_OBSERVATION (exact frozen enum). signal tags are canonical (from the prompt library,
// which copies frozen content's own domain/capability). salience is qualitative (never numeric). A fresh
// observation is ACTIVE; expired/retracted are handled by the frozen lifecycle, never revived here.
import type { SignalAxis, SalienceLevel } from '@studiva/shared/journey';
import { ObservationId } from '@studiva/shared/journey';
export interface ObservationInput {
  readonly promptId: string;
  readonly domainOrArea: string;
  readonly capabilityOrTopic: string;
  readonly parentWording?: string | null;
  readonly salience?: SalienceLevel;        // parent-implied; default MED. NEVER a score.
}
export function observationFromPrompt(
  input: ObservationInput,
  ctx: { readonly threadId: string; readonly childId: string; readonly observedAt: string; readonly idemSeed: string },
): EffectiveObservation {
  const salience: SalienceLevel = input.salience ?? 'MED';
  return {
    observationId: ObservationId(`${ctx.idemSeed}:${input.promptId}`),
    threadId: DevelopmentThreadId(ctx.threadId),
    childId: ChildId(ctx.childId),
    source: 'PARENT_OBSERVATION',
    signal: { axis: 'DEVELOPMENT' as SignalAxis, domainOrArea: input.domainOrArea, capabilityOrTopic: input.capabilityOrTopic },
    parentWording: input.parentWording ?? null,
    salienceInitial: salience,
    observedAt: ctx.observedAt,
    createdAt: ctx.observedAt,
    retracted: false,
    retractedAt: null,
    // Fresh parent report → ACTIVE. Effective lifecycle/salience are the frozen model's; a stored
    // observation's effective state is recomputed by the repository's listEffective(now), not here.
    effectiveLifecycle: 'ACTIVE',
    effectiveSalience: salience,
  };
}
