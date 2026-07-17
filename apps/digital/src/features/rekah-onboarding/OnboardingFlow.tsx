import React, { useReducer, useRef, useEffect } from 'react';
import {
  NILAI_REKAH,
  hitungUsiaBulan,
  getAgeBand,
  type NilaiId,
  type RekahProfile,
  type ProfilAnak,
  type ProfilCaregiver,
} from '@studiva/shared';
import LogoRekah from '../../components/LogoRekah';
import Kelopak from '../../components/Kelopak';
import KelopakProgress from './KelopakProgress';
import { COPY, NILAI_COPY } from './rekahOnboardingCopy';

// ── Types ──────────────────────────────────────────────────────────────

type NumericStep = 1 | 2 | 3 | 4 | 5;
type Step = NumericStep | 'celebration';

interface FlowState {
  step: Step;
  namaPanggilanAnak: string;
  tanggalLahir: string;
  usiaBulan: number | null;
  temperamen: ProfilAnak['temperamen'] | null;
  tantanganUtama: string;
  namaPanggilanCaregiver: string;
  peranCaregiver: ProfilCaregiver['peran'] | null;
  energiSaatIni: ProfilCaregiver['energiSaatIni'] | null;
  nilaiFokus: NilaiId[];
  nilaiWarning: boolean;
  tanggalError: string | null;
  usiaLunak: boolean;
}

type Action =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SKIP' }
  | { type: 'SET_NAMA_ANAK'; value: string }
  | { type: 'SET_TANGGAL'; value: string }
  | { type: 'SET_TEMPERAMEN'; value: ProfilAnak['temperamen'] | null }
  | { type: 'SET_TANTANGAN'; value: string }
  | { type: 'SET_NAMA_CAREGIVER'; value: string }
  | { type: 'SET_PERAN'; value: ProfilCaregiver['peran'] }
  | { type: 'SET_ENERGI'; value: ProfilCaregiver['energiSaatIni'] }
  | { type: 'TOGGLE_NILAI'; id: NilaiId }
  | { type: 'CELEBRATE' };

const INITIAL: FlowState = {
  step: 1,
  namaPanggilanAnak: '',
  tanggalLahir: '',
  usiaBulan: null,
  temperamen: null,
  tantanganUtama: '',
  namaPanggilanCaregiver: '',
  peranCaregiver: null,
  energiSaatIni: null,
  nilaiFokus: [],
  nilaiWarning: false,
  tanggalError: null,
  usiaLunak: false,
};

function nextNumericStep(s: NumericStep): Step {
  return (s < 5 ? (s + 1) as NumericStep : 'celebration');
}
function prevNumericStep(s: NumericStep): NumericStep {
  return (s > 1 ? (s - 1) as NumericStep : 1);
}

function parseTanggal(val: string): { usiaBulan: number; error: string | null; lunak: boolean } {
  const lahir = new Date(val);
  if (isNaN(lahir.getTime())) return { usiaBulan: 0, error: 'Format tanggal tidak dikenal.', lunak: false };
  const now = new Date();
  if (lahir > now) return { usiaBulan: 0, error: COPY.step2.tanggalMasaDepan, lunak: false };
  const bulan = hitungUsiaBulan(val);
  const lunak = bulan > 36;
  return { usiaBulan: bulan, error: null, lunak };
}

function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case 'NEXT': {
      if (typeof state.step !== 'number') return state;
      return { ...state, step: nextNumericStep(state.step), nilaiWarning: false };
    }
    case 'BACK': {
      if (typeof state.step !== 'number' || state.step === 1) return state;
      return { ...state, step: prevNumericStep(state.step), nilaiWarning: false };
    }
    case 'SKIP': {
      if (typeof state.step !== 'number') return state;
      return { ...state, step: nextNumericStep(state.step), nilaiWarning: false };
    }
    case 'SET_NAMA_ANAK':
      return { ...state, namaPanggilanAnak: action.value };
    case 'SET_TANGGAL': {
      if (!action.value) return { ...state, tanggalLahir: '', usiaBulan: null, tanggalError: null, usiaLunak: false };
      const { usiaBulan, error, lunak } = parseTanggal(action.value);
      return { ...state, tanggalLahir: action.value, usiaBulan, tanggalError: error, usiaLunak: lunak };
    }
    case 'SET_TEMPERAMEN':
      return { ...state, temperamen: action.value };
    case 'SET_TANTANGAN':
      return { ...state, tantanganUtama: action.value };
    case 'SET_NAMA_CAREGIVER':
      return { ...state, namaPanggilanCaregiver: action.value };
    case 'SET_PERAN':
      return { ...state, peranCaregiver: action.value };
    case 'SET_ENERGI':
      return { ...state, energiSaatIni: action.value };
    case 'TOGGLE_NILAI': {
      const { nilaiFokus, nilaiWarning: _w } = state;
      if (nilaiFokus.includes(action.id)) {
        return { ...state, nilaiFokus: nilaiFokus.filter(n => n !== action.id), nilaiWarning: false };
      }
      if (nilaiFokus.length >= 2) {
        return { ...state, nilaiWarning: true };
      }
      return { ...state, nilaiFokus: [...nilaiFokus, action.id], nilaiWarning: false };
    }
    case 'CELEBRATE':
      return { ...state, step: 'celebration' };
    default:
      return state;
  }
}

// ── Shared shell ───────────────────────────────────────────────────────

function StepShell({
  children,
  step,
  onBack,
  showBack,
}: {
  children: React.ReactNode;
  step: number;
  onBack?: () => void;
  showBack: boolean;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-60px)] flex-col items-center justify-start bg-kanvas px-4 py-8 sm:py-12">
      {/* Decorative petals */}
      <Kelopak
        aria-hidden
        rotate={90}
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 bg-fajar opacity-70"
      />
      <Kelopak
        aria-hidden
        rotate={270}
        className="pointer-events-none absolute -bottom-16 -left-12 h-52 w-52 bg-mawar opacity-40"
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-semibold text-pekat/60 transition hover:bg-mawar hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
            >
              ← {COPY.nav.back}
            </button>
          ) : (
            <span />
          )}
          <KelopakProgress currentStep={step} />
        </div>

        {children}
      </div>
    </div>
  );
}

// ── Step 1 — Sambutan ─────────────────────────────────────────────────

function Step1({ dispatch }: { dispatch: React.Dispatch<Action> }) {
  return (
    <StepShell step={1} showBack={false}>
      <div className="flex flex-col items-center py-8 text-center">
        <LogoRekah size={56} withWordmark />
        <h1 className="mt-10 font-bricolage text-[2rem] font-extrabold leading-tight text-pekat sm:text-[2.4rem]">
          {COPY.step1.heading}
        </h1>
        <p className="mt-4 max-w-[30ch] text-[1rem] leading-relaxed text-pekat/65">
          {COPY.step1.body}
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'NEXT' })}
          className="mt-10 flex min-h-[52px] min-w-[180px] items-center justify-center rounded-full bg-rekah px-8 font-bricolage text-[1rem] font-bold text-white shadow-[0_4px_20px_rgba(224,82,107,0.3)] transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
        >
          {COPY.step1.cta}
        </button>
      </div>
    </StepShell>
  );
}

// ── Step 2 — Profil anak ──────────────────────────────────────────────

function Step2({
  state,
  dispatch,
}: {
  state: FlowState;
  dispatch: React.Dispatch<Action>;
}) {
  const { namaPanggilanAnak, tanggalLahir, usiaBulan, tanggalError, usiaLunak } = state;
  const namaRef = useRef<HTMLInputElement>(null);
  useEffect(() => { namaRef.current?.focus(); }, []);

  const canNext =
    namaPanggilanAnak.trim().length > 0 &&
    tanggalLahir.length > 0 &&
    !tanggalError;

  function handleNext() {
    if (!canNext) return;
    dispatch({ type: 'NEXT' });
  }

  return (
    <StepShell step={2} showBack onBack={() => dispatch({ type: 'BACK' })}>
      <h2 className="mb-6 font-bricolage text-[1.7rem] font-extrabold leading-snug text-pekat">
        {COPY.step2.heading}
      </h2>

      <div className="flex flex-col gap-5">
        {/* Nama panggilan */}
        <div>
          <label
            htmlFor="nama-anak"
            className="mb-1.5 block text-[14px] font-semibold text-pekat"
          >
            {COPY.step2.labelNama}
          </label>
          <input
            ref={namaRef}
            id="nama-anak"
            type="text"
            value={namaPanggilanAnak}
            onChange={e => dispatch({ type: 'SET_NAMA_ANAK', value: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleNext()}
            placeholder={COPY.step2.placeholderNama}
            autoComplete="off"
            className="w-full rounded-[14px] border border-daun/20 bg-white px-4 py-3 text-[15px] text-pekat placeholder:text-pekat/35 transition focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20 min-h-[52px]"
          />
        </div>

        {/* Tanggal lahir */}
        <div>
          <label
            htmlFor="tanggal-lahir"
            className="mb-1.5 block text-[14px] font-semibold text-pekat"
          >
            {COPY.step2.labelTanggal}
          </label>
          <input
            id="tanggal-lahir"
            type="date"
            value={tanggalLahir}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => dispatch({ type: 'SET_TANGGAL', value: e.target.value })}
            className="w-full rounded-[14px] border border-daun/20 bg-white px-4 py-3 text-[15px] text-pekat transition focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20 min-h-[52px]"
          />

          {/* Konfirmasi usia */}
          {usiaBulan !== null && !tanggalError && namaPanggilanAnak.trim() && (
            <p
              className="mt-2 text-[13px] font-semibold"
              style={{ color: usiaLunak ? '#F6B860' : '#4E9C6E' }}
            >
              {usiaLunak
                ? COPY.step2.usiaLunak(namaPanggilanAnak.trim())
                : COPY.step2.konfirmasiUsia(namaPanggilanAnak.trim(), usiaBulan)}
            </p>
          )}

          {/* Error tanggal masa depan */}
          {tanggalError && (
            <p className="mt-2 text-[13px] text-rekah-tua">{tanggalError}</p>
          )}

          {/* TODO: tangkap minat usia >36 bln untuk Musim selanjutnya */}
        </div>
      </div>

      <button
        type="button"
        disabled={!canNext}
        onClick={handleNext}
        className="mt-8 flex min-h-[52px] w-full items-center justify-center rounded-full bg-rekah font-bricolage text-[1rem] font-bold text-white shadow-[0_4px_16px_rgba(224,82,107,0.25)] transition hover:bg-rekah-tua disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
      >
        {COPY.step2.cta}
      </button>
    </StepShell>
  );
}

// ── Step 3 — Tentang si kecil (opsional) ─────────────────────────────

const TEMPERAMEN_KEYS = ['tenang', 'aktif', 'sensitif', 'campuran'] as const;

function Step3({
  state,
  dispatch,
}: {
  state: FlowState;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <StepShell step={3} showBack onBack={() => dispatch({ type: 'BACK' })}>
      <h2 className="mb-1 font-bricolage text-[1.7rem] font-extrabold leading-snug text-pekat">
        {COPY.step3.heading}
      </h2>
      <p className="mb-6 text-[14px] text-pekat/55">{COPY.step3.subheading}</p>

      {/* Temperamen cards */}
      <fieldset>
        <legend className="mb-3 text-[14px] font-semibold text-pekat">
          {COPY.step3.labelTemperamen}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {TEMPERAMEN_KEYS.map(key => {
            const { label, emoji, deskripsi } = COPY.step3.temperamen[key];
            const selected = state.temperamen === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  dispatch({ type: 'SET_TEMPERAMEN', value: selected ? null : key })
                }
                aria-pressed={selected}
                className={`flex flex-col gap-1 rounded-2xl border-2 p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 min-h-[80px] ${
                  selected
                    ? 'border-rekah bg-mawar'
                    : 'border-fajar bg-white hover:border-rekah/40'
                }`}
              >
                <span className="text-[22px] leading-none">{emoji}</span>
                <span className="text-[14px] font-bold text-pekat">{label}</span>
                <span className="text-[12px] leading-snug text-pekat/60">{deskripsi}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Tantangan utama */}
      <div className="mt-5">
        <label
          htmlFor="tantangan"
          className="mb-1.5 block text-[14px] font-semibold text-pekat"
        >
          {COPY.step3.labelTantangan}
        </label>
        <textarea
          id="tantangan"
          rows={3}
          value={state.tantanganUtama}
          onChange={e => dispatch({ type: 'SET_TANTANGAN', value: e.target.value })}
          placeholder={COPY.step3.placeholderTantangan}
          className="w-full resize-none rounded-[14px] border border-daun/20 bg-white px-4 py-3 text-[15px] text-pekat placeholder:text-pekat/35 transition focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20"
        />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SKIP' })}
          className="flex min-h-[48px] flex-1 items-center justify-center rounded-full border-2 border-rekah/25 font-bricolage text-[15px] font-semibold text-pekat/65 transition hover:border-rekah/50 hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1"
        >
          {COPY.step3.ctaLewati}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'NEXT' })}
          className="flex min-h-[48px] flex-[2] items-center justify-center rounded-full bg-rekah font-bricolage text-[15px] font-bold text-white shadow-[0_4px_16px_rgba(224,82,107,0.25)] transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
        >
          {COPY.step3.cta}
        </button>
      </div>
    </StepShell>
  );
}

// ── Step 4 — Tentang kamu ─────────────────────────────────────────────

const PERAN_KEYS: ProfilCaregiver['peran'][] = [
  'ibu', 'ayah', 'nenek-kakek', 'pengasuh', 'lainnya',
];
const ENERGI_KEYS: Array<NonNullable<ProfilCaregiver['energiSaatIni']>> = [
  'penuh', 'cukup', 'menipis',
];

function Step4({
  state,
  dispatch,
}: {
  state: FlowState;
  dispatch: React.Dispatch<Action>;
}) {
  const namaRef = useRef<HTMLInputElement>(null);
  useEffect(() => { namaRef.current?.focus(); }, []);

  const canNext =
    state.namaPanggilanCaregiver.trim().length > 0 && state.peranCaregiver !== null;

  return (
    <StepShell step={4} showBack onBack={() => dispatch({ type: 'BACK' })}>
      <h2 className="mb-6 font-bricolage text-[1.7rem] font-extrabold leading-snug text-pekat">
        {COPY.step4.heading}
      </h2>

      {/* Nama caregiver */}
      <div className="mb-5">
        <label
          htmlFor="nama-caregiver"
          className="mb-1.5 block text-[14px] font-semibold text-pekat"
        >
          {COPY.step4.labelNama}
        </label>
        <input
          ref={namaRef}
          id="nama-caregiver"
          type="text"
          value={state.namaPanggilanCaregiver}
          onChange={e => dispatch({ type: 'SET_NAMA_CAREGIVER', value: e.target.value })}
          placeholder={COPY.step4.placeholderNama}
          autoComplete="off"
          className="w-full rounded-[14px] border border-daun/20 bg-white px-4 py-3 text-[15px] text-pekat placeholder:text-pekat/35 transition focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20 min-h-[52px]"
        />
      </div>

      {/* Peran */}
      <fieldset className="mb-5">
        <legend className="mb-2.5 text-[14px] font-semibold text-pekat">
          {COPY.step4.labelPeran}
        </legend>
        <div className="flex flex-wrap gap-2">
          {PERAN_KEYS.map(key => {
            const selected = state.peranCaregiver === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => dispatch({ type: 'SET_PERAN', value: key })}
                aria-pressed={selected}
                className={`min-h-[44px] rounded-full border-2 px-4 py-2 text-[14px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 ${
                  selected
                    ? 'border-rekah bg-rekah text-white'
                    : 'border-fajar bg-white text-pekat hover:border-rekah/40'
                }`}
              >
                {COPY.step4.peran[key]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Energi */}
      <fieldset>
        <legend className="mb-1 text-[14px] font-semibold text-pekat">
          {COPY.step4.labelEnergi}
        </legend>
        <p className="mb-3 text-[12px] text-pekat/50">{COPY.step4.energiNote}</p>
        <div className="grid grid-cols-3 gap-3">
          {ENERGI_KEYS.map(key => {
            const { label, emoji, deskripsi } = COPY.step4.energi[key];
            const selected = state.energiSaatIni === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => dispatch({ type: 'SET_ENERGI', value: key })}
                aria-pressed={selected}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 min-h-[80px] ${
                  selected
                    ? 'border-rekah bg-mawar'
                    : 'border-fajar bg-white hover:border-rekah/40'
                }`}
              >
                <span className="text-[22px] leading-none">{emoji}</span>
                <span className="text-[13px] font-bold text-pekat">{label}</span>
                <span className="text-[11px] leading-snug text-pekat/55">{deskripsi}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        type="button"
        disabled={!canNext}
        onClick={() => dispatch({ type: 'NEXT' })}
        className="mt-8 flex min-h-[52px] w-full items-center justify-center rounded-full bg-rekah font-bricolage text-[1rem] font-bold text-white shadow-[0_4px_16px_rgba(224,82,107,0.25)] transition hover:bg-rekah-tua disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
      >
        {COPY.step2.cta}
      </button>
    </StepShell>
  );
}

// ── Step 5 — Akar Keluarga ────────────────────────────────────────────

function Step5({
  state,
  dispatch,
  onSubmit,
}: {
  state: FlowState;
  dispatch: React.Dispatch<Action>;
  onSubmit: () => void;
}) {
  const canSubmit = state.nilaiFokus.length === 2;

  return (
    <StepShell step={5} showBack onBack={() => dispatch({ type: 'BACK' })}>
      <h2 className="mb-1 font-bricolage text-[1.65rem] font-extrabold leading-snug text-pekat">
        {COPY.step5.heading}
      </h2>
      <p className="mb-6 text-[14px] leading-relaxed text-pekat/60">
        {COPY.step5.subheading}
      </p>

      {/* Nilai warning */}
      {state.nilaiWarning && (
        <div
          role="alert"
          className="mb-4 rounded-[14px] bg-mawar px-4 py-3 text-[13px] font-semibold text-pekat/70"
        >
          {COPY.step5.warningDua}
        </div>
      )}

      {/* 6 nilai cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {NILAI_REKAH.map(nilai => {
          const { emoji, deskripsiSingkat } = NILAI_COPY[nilai.id];
          const selected = state.nilaiFokus.includes(nilai.id);
          return (
            <button
              key={nilai.id}
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_NILAI', id: nilai.id })}
              aria-pressed={selected}
              className={`flex flex-col gap-1.5 rounded-2xl border-2 p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 min-h-[90px] ${
                selected
                  ? 'border-rekah bg-mawar shadow-sm'
                  : 'border-fajar bg-white hover:border-rekah/40'
              }`}
            >
              <span className="text-[24px] leading-none">{emoji}</span>
              <span className="text-[14px] font-bold text-pekat">{nilai.label}</span>
              <span className="text-[12px] leading-snug text-pekat/60">{deskripsiSingkat}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
        className="mt-8 flex min-h-[52px] w-full items-center justify-center rounded-full bg-rekah font-bricolage text-[1rem] font-bold text-white shadow-[0_4px_20px_rgba(224,82,107,0.3)] transition hover:bg-rekah-tua disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
      >
        {COPY.step5.cta}
      </button>
    </StepShell>
  );
}

// ── Celebration screen ────────────────────────────────────────────────

function CelebrationScreen({
  profile,
  onDone,
}: {
  profile: RekahProfile;
  onDone: () => void;
}) {
  const nilai1 = NILAI_REKAH.find(n => n.id === profile.akar.nilaiFokus[0])!;
  const nilai2 = NILAI_REKAH.find(n => n.id === profile.akar.nilaiFokus[1])!;

  return (
    <div className="relative flex min-h-[calc(100vh-60px)] flex-col items-center justify-center overflow-hidden bg-kanvas px-6 py-16 text-center">
      {/* Decorative petals */}
      <Kelopak
        aria-hidden
        rotate={90}
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 bg-fajar"
      />
      <Kelopak
        aria-hidden
        rotate={270}
        className="pointer-events-none absolute -bottom-20 -left-12 h-64 w-64 bg-mawar opacity-50"
      />

      {/* Animated bloom kelopak */}
      <div
        className="relative z-10 mb-8"
        style={{
          animation: 'rekah-bloom-in 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        <style>{`
          @keyframes rekah-bloom-in {
            from { opacity: 0; transform: scale(0.4) rotate(-15deg); }
            to   { opacity: 1; transform: scale(1) rotate(0deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .celebration-bloom { animation: none !important; }
          }
        `}</style>
        <div className="celebration-bloom flex items-center justify-center">
          {/* Flower made of 5 kelopak shapes + madu center */}
          <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
            {[0, 72, 144, 216, 288].map((deg, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 24,
                  height: 38,
                  borderRadius: '70% 70% 70% 4px',
                  background: '#F6B860',
                  transform: `rotate(${deg}deg) translateY(-20px)`,
                  opacity: 0.85,
                }}
              />
            ))}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#F6B860',
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-xs">
        <h1
          className="font-fraunces text-[2.2rem] font-semibold italic leading-tight text-pekat"
          style={{ fontStyle: 'italic' }}
        >
          {COPY.celebration.heading}
        </h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-pekat/65">
          {COPY.celebration.subheading(nilai1.label, nilai2.label)}
        </p>

        <button
          type="button"
          onClick={onDone}
          className="mt-8 flex min-h-[52px] w-full items-center justify-center rounded-full bg-rekah font-bricolage text-[1rem] font-bold text-white shadow-[0_4px_20px_rgba(224,82,107,0.3)] transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
        >
          {COPY.celebration.cta}
        </button>
      </div>
    </div>
  );
}

// ── Main OnboardingFlow export ────────────────────────────────────────

export default function OnboardingFlow({
  onComplete,
}: {
  onComplete: (profile: RekahProfile) => void;
}) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [completedProfile, setCompletedProfile] = React.useState<RekahProfile | null>(null);

  function handleSubmit() {
    if (state.nilaiFokus.length !== 2) return;

    const profile: RekahProfile = {
      anak: {
        namaPanggilan: state.namaPanggilanAnak.trim(),
        tanggalLahir: state.tanggalLahir,
        ...(state.temperamen ? { temperamen: state.temperamen } : {}),
        ...(state.tantanganUtama.trim() ? { tantanganUtama: state.tantanganUtama.trim() } : {}),
      },
      caregiver: {
        namaPanggilan: state.namaPanggilanCaregiver.trim(),
        peran: state.peranCaregiver!,
        ...(state.energiSaatIni ? { energiSaatIni: state.energiSaatIni } : {}),
      },
      akar: {
        nilaiFokus: [state.nilaiFokus[0], state.nilaiFokus[1]],
        musimMulai: new Date().toISOString().split('T')[0],
      },
    };

    // TODO: endpoint simpan RekahProfile (POST /api/me/rekah-profile)
    setCompletedProfile(profile);
    dispatch({ type: 'CELEBRATE' });
  }

  function handleCelebrationDone() {
    if (completedProfile) onComplete(completedProfile);
  }

  if (state.step === 'celebration' && completedProfile) {
    return (
      <CelebrationScreen
        profile={completedProfile}
        onDone={handleCelebrationDone}
      />
    );
  }

  switch (state.step) {
    case 1:
      return <Step1 dispatch={dispatch} />;
    case 2:
      return <Step2 state={state} dispatch={dispatch} />;
    case 3:
      return <Step3 state={state} dispatch={dispatch} />;
    case 4:
      return <Step4 state={state} dispatch={dispatch} />;
    case 5:
      return <Step5 state={state} dispatch={dispatch} onSubmit={handleSubmit} />;
    default:
      return null;
  }
}
