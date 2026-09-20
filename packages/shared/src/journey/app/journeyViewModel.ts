// Rekah Journey — UI View-Model / copy mapper (Phase 10C-2 Slice 2). ADDITIVE, PURE.
// Translates a JourneyStepResult (from the Application Service) into a parent-facing UI view.
// This is the UI<->engine boundary translation: it maps engine result kinds to HONEST states and
// Indonesian copy, exposes provenance distinctly, and keeps AM age-gap fallback TRANSPARENT.
// It contains NO decision logic (no ranking/focus/content/adaptation/FSM). It never invents content.
import type { JourneyStepResult } from '../orchestrator/types';
import type { CanonicalState } from '../engine/types';
import type { JourneyRole, ContentStage, AdaptationOutcome } from '../enums';

export type ViewProvenance = 'PARENT' | 'SYSTEM_SUGGESTED' | 'SYSTEM_DERIVED';
export interface ViewCopy { title: string; body: string; primaryCta: string; secondaryCtas: readonly string[]; }
export interface ViewStep { contentId: string; mappingId?: string; role: JourneyRole | null; stage: ContentStage | null; fallback: boolean; }
export interface ViewFocus { provenance: ViewProvenance; parentConfirmed: boolean; }

export type JourneyView =
  | { kind: 'READY'; nextState: CanonicalState; whereWeAre: string; focus: ViewFocus | null; step: ViewStep | null; copy: ViewCopy }
  | { kind: 'FALLBACK'; nextState: CanonicalState; step: ViewStep; copy: ViewCopy }        // transparent AM age-gap
  | { kind: 'NO_FOCUS'; copy: ViewCopy }
  | { kind: 'NO_MATCH'; copy: ViewCopy }
  | { kind: 'INSUFFICIENT_CONTEXT'; missing: readonly string[]; copy: ViewCopy }
  | { kind: 'PAUSED'; resumeState: CanonicalState | null; copy: ViewCopy }
  | { kind: 'CONFLICT'; copy: ViewCopy }
  | { kind: 'ADAPT'; outcome: AdaptationOutcome; provenance: ViewProvenance; undoable: boolean; copy: ViewCopy }
  | { kind: 'UNAVAILABLE'; copy: ViewCopy };                                                // INVALID_STATE etc.

export interface ViewContext { childName: string; focusLabel?: string | null; }

const sentence = (child: string, focus?: string | null, step?: string | null): string => {
  if (!focus) return `Hari ini, cukup bersama ${child}.`;
  if (!step) return `Hari ini bersama ${child}, kita sedang mendampingi ${focus}.`;
  return `Hari ini bersama ${child}, kita sedang mendampingi ${focus} — satu langkah kecil.`;
};
const provOf = (src?: string): ViewProvenance =>
  src === 'PARENT_SELECTED' ? 'PARENT' : src === 'SYSTEM_DERIVED' ? 'SYSTEM_DERIVED' : 'SYSTEM_SUGGESTED';

const ADAPT_COPY: Record<AdaptationOutcome, string> = {
  CONTINUE: 'Kita lanjutkan pelan-pelan.', REPEAT: 'Layak dicoba lagi dengan lembut.',
  SIMPLIFY: 'Kita buat sedikit lebih sederhana.', CHANGE_APPROACH: 'Tujuan sama, cara berbeda.',
  CHANGE_CONTEXT: 'Coba di momen yang lebih tenang.', EXPLORE_DEEPER: 'Siap melangkah sedikit lebih jauh.',
  CHANGE_FOCUS: 'Mari pilih fokus baru.', EXIT: 'Fokus ini terasa selesai — bagus sekali.', PAUSE: 'Dijeda — lanjutkan kapan pun.',
};
const SYSTEM_INFERABLE: readonly AdaptationOutcome[] = ['CONTINUE', 'REPEAT', 'SIMPLIFY', 'CHANGE_APPROACH'];

/** Pure translation. NEVER exposes internal codes; NEVER shows a score/%/rank; fallback stays visible. */
export const toJourneyView = (r: JourneyStepResult, ctx: ViewContext): JourneyView => {
  const child = ctx.childName;
  const focusLabel = ctx.focusLabel ?? null;
  const stepOf = (fallback: boolean): ViewStep | null => r.content && r.content.selected ? {
    contentId: r.content.selected.contentId as unknown as string,
    mappingId: r.content.selected.mappingId as unknown as string | undefined,
    role: r.content.role, stage: r.content.stage, fallback,
  } : null;
  const focusView = (): ViewFocus | null => r.focus && r.focus.proposed
    ? { provenance: provOf(r.focus.proposed.source), parentConfirmed: r.focus.proposed.parentConfirmed } : null;

  switch (r.result.kind) {
    case 'PAUSED':
      return { kind: 'PAUSED', resumeState: (r.transition.resumeState ?? null),
        copy: { title: 'Perjalanan dijeda', body: 'Lanjutkan kapan pun kamu siap.', primaryCta: 'Lanjutkan', secondaryCtas: [] } };
    case 'NO_FOCUS':
      return { kind: 'NO_FOCUS', copy: { title: `Hari ini, cukup bersama ${child}`, body: 'Tidak ada yang perlu dipilih hari ini.', primaryCta: 'Sekadar bersama', secondaryCtas: ['Pilih sendiri'] } };
    case 'NO_MATCH':
      return { kind: 'NO_MATCH', copy: { title: 'Belum ada yang pas untuk ini', body: `Di usia ${child}, belum ada aktivitas yang cocok untuk fokus ini.`, primaryCta: 'Istirahat dulu', secondaryCtas: ['Ganti fokus'] } };
    case 'INSUFFICIENT_CONTEXT':
      return { kind: 'INSUFFICIENT_CONTEXT', missing: r.result.missing,
        copy: { title: 'Kami perlu sedikit lagi', body: `Boleh atur fokus atau tambahkan usia ${child}?`, primaryCta: 'Atur sekarang', secondaryCtas: ['Nanti'] } };
    case 'CONFLICT': case 'STALE_STATE':
      return { kind: 'CONFLICT', copy: { title: 'Kami menyelaraskan perjalananmu', body: 'Kamu juga aktif di perangkat lain.', primaryCta: 'Lanjutkan', secondaryCtas: [] } };
    case 'INVALID_STATE':
      return { kind: 'UNAVAILABLE', copy: { title: 'Tindakan ini belum tersedia di sini', body: 'Mari kembali ke langkah hari ini.', primaryCta: 'Kembali', secondaryCtas: [] } };
    case 'FALLBACK_ONLY': {
      const step = stepOf(true);
      return { kind: 'FALLBACK', nextState: r.nextState, step: step ?? { contentId: '', role: null, stage: null, fallback: true },
        copy: { title: 'Sebuah kebiasaan lembut', body: `Belum ada ajakan main untuk ini di usia ${child} — ini bisa jadi gantinya.`, primaryCta: 'Coba ini', secondaryCtas: ['Lewati'] } };
    }
    case 'PARENT_OVERRIDE':
      return { kind: 'READY', nextState: r.nextState, whereWeAre: sentence(child, focusLabel), focus: focusView(), step: stepOf(false),
        copy: { title: 'Pilihanmu diterapkan', body: '', primaryCta: 'Lanjutkan', secondaryCtas: [] } };
    case 'OK':
    default: {
      // AM age-gap fallback surfaced within an OK content step stays TRANSPARENT.
      if (r.content && r.content.fallbackStatus === 'FALLBACK_MATCH') {
        const step = stepOf(true)!;
        return { kind: 'FALLBACK', nextState: r.nextState, step,
          copy: { title: 'Sebuah kebiasaan lembut', body: `Belum ada ajakan main untuk ini di usia ${child} — ini bisa jadi gantinya.`, primaryCta: 'Coba ini', secondaryCtas: ['Lewati'] } };
      }
      if (r.adaptation) {
        const outcome = r.adaptation.outcome;
        const provenance = r.adaptation.provenance === 'PARENT_SELECTED' ? 'PARENT' : 'SYSTEM_DERIVED';
        const undoable = provenance === 'SYSTEM_DERIVED' && SYSTEM_INFERABLE.includes(outcome);
        return { kind: 'ADAPT', outcome, provenance, undoable,
          copy: { title: ADAPT_COPY[outcome], body: '', primaryCta: 'Oke, lanjutkan', secondaryCtas: undoable ? ['Urungkan'] : [] } };
      }
      const step = stepOf(false);
      const stepLabel = step ? 'langkah' : null;
      return { kind: 'READY', nextState: r.nextState, whereWeAre: sentence(child, focusLabel, stepLabel), focus: focusView(), step,
        copy: { title: sentence(child, focusLabel, stepLabel), body: '', primaryCta: focusLabel ? 'Lanjutkan' : 'Mulai', secondaryCtas: ['Ganti anak', 'Jeda'] } };
    }
  }
};
