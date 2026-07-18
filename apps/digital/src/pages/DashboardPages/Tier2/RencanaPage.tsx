// KONTEN: wajib review Psikolog Fitri sebelum rilis.

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NILAI_REKAH, ACTIVITY_MODULES, composeWeeklyPlan, type ActivityModuleId,
} from '@studiva/shared';
import { X } from 'lucide-react';
import { useRekahProfile } from '../../../context/RekahProfileContext';
import { useRekahPlan } from '../../../context/RekahPlanContext';
import LangkahKecilCard from '../../../features/rekah-plan/LangkahKecilCard';
import KelopakProgress from '../../../features/rekah-onboarding/KelopakProgress';
import Kelopak from '../../../components/Kelopak';
import { PLAN_COPY } from '../../../features/rekah-plan/rekahPlanCopy';

export default function RencanaPage() {
  const navigate = useNavigate();
  const { profile } = useRekahProfile();
  const {
    plan, setPlan,
    currentWeek,
    markComplete, markSwap, swapStep, addStep,
    isComplete,
    allDone,
  } = useRekahPlan();

  const [activeIndex, setActiveIndex] = useState(0);

  // ── Bottom-sheet state ────────────────────────────────────────────────
  const [gantiTarget, setGantiTarget] = useState<ActivityModuleId | null>(null);
  const [belumPasOpen, setBelumPasOpen] = useState(false);
  const [tambahPenuhMsg, setTambahPenuhMsg] = useState(false);

  // ── Compose plan dari profil saat pertama kali atau ganti pekan ───────
  useEffect(() => {
    if (!profile) return;
    const composed = composeWeeklyPlan(profile, currentWeek);
    setPlan(composed);
    setActiveIndex(0);
  }, [profile, currentWeek, setPlan]);

  // ── Steps yang belum selesai ──────────────────────────────────────────
  const visibleSteps = useMemo(() => {
    if (!plan) return [];
    return plan.steps.filter(s => !isComplete(s.moduleId));
  }, [plan, isComplete]);

  // ── Kandidat pool untuk Ganti (filter usia + nilai, tidak dalam pekan, belum selesai) ──
  const gantiPool = useMemo(() => {
    if (!plan) return [];
    const inPlanIds = new Set(plan.steps.map(s => s.moduleId));
    return ACTIVITY_MODULES.filter(m => {
      if (inPlanIds.has(m.id)) return false;
      if (isComplete(m.id)) return false;
      if (!m.ageBands.includes(plan.ageBandId)) return false;
      const hasNilai =
        plan.nilaiFokus.includes(m.nilaiUtama) ||
        (m.nilaiPendukung?.some(n => plan.nilaiFokus.includes(n)) ?? false);
      return hasNilai;
    }).sort((a, b) => a.durasiMenit - b.durasiMenit);
  }, [plan, isComplete]);

  // ── 3 alternatif tercepat dari pekan ini (belumPas) ──────────────────
  const belumPasAlternatif = useMemo(() => {
    if (!plan) return [];
    const currentStep = visibleSteps[activeIndex];
    return visibleSteps
      .filter(s => s.moduleId !== currentStep?.moduleId)
      .sort((a, b) => {
        const ma = ACTIVITY_MODULES.find(m => m.id === a.moduleId);
        const mb = ACTIVITY_MODULES.find(m => m.id === b.moduleId);
        return (ma?.durasiMenit ?? 99) - (mb?.durasiMenit ?? 99);
      })
      .slice(0, 3);
  }, [plan, visibleSteps, activeIndex]);

  if (!profile) {
    return (
      <div className="flex h-48 items-center justify-center text-[14px] text-pekat/50">
        Memuat profil...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex h-48 items-center justify-center text-[14px] text-pekat/50">
        Menyusun rencana...
      </div>
    );
  }

  const nilai1 = NILAI_REKAH.find(n => n.id === plan.nilaiFokus[0]);
  const nilai2 = NILAI_REKAH.find(n => n.id === plan.nilaiFokus[1]);
  const totalSteps = plan.steps.length;
  const doneCount = plan.steps.filter(s => isComplete(s.moduleId)).length;

  function handleSelesai(moduleId: ActivityModuleId) {
    markComplete(moduleId);
    setActiveIndex(i => Math.min(i + 1, visibleSteps.length - 1));
  }

  function handleBelumPas() {
    if (belumPasAlternatif.length === 0) {
      // Tidak ada alternatif — lewati saja
      markSwap(visibleSteps[activeIndex]?.moduleId);
      setActiveIndex(i => Math.min(i + 1, visibleSteps.length - 1));
      return;
    }
    setBelumPasOpen(true);
  }

  function handlePilihAlternatif(moduleId: ActivityModuleId) {
    setBelumPasOpen(false);
    const idx = visibleSteps.findIndex(s => s.moduleId === moduleId);
    if (idx !== -1) setActiveIndex(idx);
  }

  function handleTambahLangkah() {
    const result = addStep(gantiPool[0]?.id ?? ('' as ActivityModuleId));
    if (result === 'penuh') {
      setTambahPenuhMsg(true);
      setTimeout(() => setTambahPenuhMsg(false), 4000);
    }
  }

  // ── Semua selesai ─────────────────────────────────────────────────────
  if (allDone) {
    return (
      <div className="relative min-h-[calc(100vh-60px)] overflow-hidden bg-kanvas">
        <Kelopak
          aria-hidden
          rotate={90}
          className="pointer-events-none absolute -right-16 -top-10 h-48 w-48 bg-madu opacity-30"
        />
        <Kelopak
          aria-hidden
          rotate={270}
          className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 bg-mawar opacity-25"
        />
        <div className="relative z-10 mx-auto max-w-lg px-4 py-16 text-center">
          <p className="mb-3 font-bricolage text-[3rem] leading-none" aria-hidden>
            {PLAN_COPY.semuaSelesaiEmoji}
          </p>
          <h2 className="font-bricolage text-[1.5rem] font-extrabold text-pekat">
            {PLAN_COPY.semuaSelesaiJudul}
          </h2>
          <p className="mt-2 text-[15px] text-pekat/55">{PLAN_COPY.semuaSelesaiSub}</p>
          {/* TODO: build 4 — link ke Jejak Mekar */}
        </div>
      </div>
    );
  }

  const currentStep = visibleSteps[activeIndex] ?? visibleSteps[0];
  const previewSteps = visibleSteps.slice(activeIndex + 1, activeIndex + 3);

  return (
    <>
      <div className="relative min-h-[calc(100vh-60px)] overflow-hidden bg-kanvas">
        <Kelopak
          aria-hidden
          rotate={90}
          className="pointer-events-none absolute -right-14 top-12 h-40 w-40 bg-fajar opacity-50"
        />

        <div className="relative z-10 mx-auto max-w-lg px-4 py-6 sm:px-0 sm:py-8">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="mb-6">
            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-widest text-pekat/40">
              {PLAN_COPY.pekanLabel(currentWeek)}
            </p>
            <h1 className="font-bricolage text-[1.35rem] font-extrabold leading-snug text-pekat">
              {nilai1 && nilai2
                ? PLAN_COPY.subJudulMusim(nilai1.label, nilai2.label)
                : PLAN_COPY.judulHalaman}
            </h1>
            <p className="mt-1 text-[13px] text-pekat/50">
              {PLAN_COPY.langkahCount(totalSteps)}
            </p>
          </div>

          {/* ── Progress kelopak ─────────────────────────────────────────── */}
          <div className="mb-6">
            <KelopakProgress currentStep={doneCount} totalSteps={totalSteps} />
          </div>

          {/* ── Pool tipis note ──────────────────────────────────────────── */}
          {plan.poolTipis && (
            <p className="mb-4 rounded-[14px] bg-madu/15 px-4 py-3 text-[13px] text-pekat/65">
              {PLAN_COPY.poolTipisNote}
            </p>
          )}

          {/* ── Tambah penuh message ────────────────────────────────────── */}
          {tambahPenuhMsg && (
            <p
              role="status"
              aria-live="polite"
              className="mb-4 rounded-[14px] bg-fajar px-4 py-3 text-[13px] font-semibold text-rekah"
            >
              {PLAN_COPY.tambahLangkahPenuh}
            </p>
          )}

          {/* ── Kartu langkah aktif ──────────────────────────────────────── */}
          {currentStep && (
            <div className="space-y-2">
              {/* Ganti button above card */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setGantiTarget(currentStep.moduleId)}
                  className="flex min-h-[36px] items-center gap-1.5 rounded-[10px] border border-fajar bg-white px-3 text-[12px] font-semibold text-pekat/55 transition hover:bg-fajar hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                >
                  {PLAN_COPY.gantiLabel}
                </button>
              </div>
              <LangkahKecilCard
                key={currentStep.moduleId}
                moduleId={currentStep.moduleId}
                posisi={currentStep.posisi}
                totalSteps={totalSteps}
                onSelesai={() => handleSelesai(currentStep.moduleId)}
                onBelumPas={handleBelumPas}
                isLast={activeIndex === visibleSteps.length - 1}
              />
            </div>
          )}

          {/* ── Preview langkah berikutnya ───────────────────────────────── */}
          {previewSteps.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[12px] font-bold uppercase tracking-widest text-pekat/35">
                Langkah berikutnya
              </p>
              {previewSteps.map(s => {
                const mod = ACTIVITY_MODULES.find(m => m.id === s.moduleId);
                if (!mod) return null;
                return (
                  <div
                    key={s.moduleId}
                    className="flex items-center gap-3 rounded-[14px] border border-fajar bg-white px-4 py-3 opacity-60"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mawar/60 text-[12px] font-bold text-rekah/60">
                      {s.posisi}
                    </span>
                    <span className="truncate text-[14px] font-semibold text-pekat/65">
                      {mod.judul}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Tambah langkah + ────────────────────────────────────────── */}
          {totalSteps < 7 && (
            <div className="mt-4">
              <button
                type="button"
                aria-label={PLAN_COPY.tambahLangkahAria}
                onClick={() => navigate('/dashboard/tier2/jelajah')}
                className="flex min-h-[44px] w-full items-center justify-center rounded-[14px] border border-dashed border-rekah/40 bg-fajar/50 text-[13px] font-semibold text-rekah/70 transition hover:border-rekah hover:bg-fajar hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                {PLAN_COPY.tambahLangkahCTA}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Ganti langkah bottom-sheet ───────────────────────────────────── */}
      {gantiTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={PLAN_COPY.gantiJudul}
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          <div
            className="absolute inset-0 bg-pekat/40"
            onClick={() => setGantiTarget(null)}
          />
          <div className="relative w-full max-w-lg rounded-t-[24px] bg-white p-5 shadow-[0_-8px_40px_rgba(67,39,46,0.18)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bricolage text-[17px] font-bold text-pekat">
                  {PLAN_COPY.gantiJudul}
                </h2>
                <p className="mt-0.5 text-[13px] text-pekat/50">{PLAN_COPY.gantiSub}</p>
              </div>
              <button
                type="button"
                onClick={() => setGantiTarget(null)}
                aria-label={PLAN_COPY.gantiTutupLabel}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-fajar text-pekat/50 hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            {gantiPool.length === 0 ? (
              <p className="py-4 text-center text-[14px] text-pekat/50">
                {PLAN_COPY.gantiTidakAda}
              </p>
            ) : (
              <ul className="max-h-[55vh] space-y-2 overflow-y-auto">
                {gantiPool.map(m => {
                  const nilai = NILAI_REKAH.find(n => n.id === m.nilaiUtama);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        aria-label={PLAN_COPY.gantiPilihAria(m.judul)}
                        onClick={() => {
                          swapStep(gantiTarget, m.id);
                          setGantiTarget(null);
                        }}
                        className="w-full rounded-[14px] border border-fajar bg-white p-3.5 text-left transition hover:border-rekah/30 hover:bg-fajar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                      >
                        <p className="font-semibold text-[14px] text-pekat">{m.judul}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {nilai && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                              style={{ background: `${nilai.warna}22`, color: nilai.warna }}
                            >
                              {nilai.label}
                            </span>
                          )}
                          <span className="text-[11px] text-pekat/40">{m.durasiMenit} menit</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── Belum pas bottom-sheet ───────────────────────────────────────── */}
      {belumPasOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={PLAN_COPY.belumPasJudul}
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          <div
            className="absolute inset-0 bg-pekat/40"
            onClick={() => setBelumPasOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-t-[24px] bg-white p-5 shadow-[0_-8px_40px_rgba(67,39,46,0.18)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bricolage text-[17px] font-bold text-pekat">
                  {PLAN_COPY.belumPasJudul}
                </h2>
                <p className="mt-0.5 text-[13px] text-pekat/50">{PLAN_COPY.belumPasSub}</p>
              </div>
              <button
                type="button"
                onClick={() => setBelumPasOpen(false)}
                aria-label={PLAN_COPY.belumPasTutupLabel}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-fajar text-pekat/50 hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            <ul className="space-y-2">
              {belumPasAlternatif.map(s => {
                const mod = ACTIVITY_MODULES.find(m => m.id === s.moduleId);
                if (!mod) return null;
                const nilai = NILAI_REKAH.find(n => n.id === mod.nilaiUtama);
                return (
                  <li key={s.moduleId}>
                    <button
                      type="button"
                      onClick={() => handlePilihAlternatif(s.moduleId)}
                      className="w-full rounded-[14px] border border-fajar bg-white p-3.5 text-left transition hover:border-rekah/30 hover:bg-fajar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                    >
                      <p className="font-semibold text-[14px] text-pekat">{mod.judul}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {nilai && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            style={{ background: `${nilai.warna}22`, color: nilai.warna }}
                          >
                            {nilai.label}
                          </span>
                        )}
                        <span className="text-[11px] text-pekat/40">{mod.durasiMenit} menit</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => { setBelumPasOpen(false); navigate('/dashboard/tier2/jelajah'); }}
                className="text-[13px] font-semibold text-rekah hover:text-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah rounded"
              >
                {PLAN_COPY.belumPasJelajahLink}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBelumPasOpen(false);
                  markSwap(currentStep?.moduleId);
                  setActiveIndex(i => Math.min(i + 1, visibleSteps.length - 1));
                }}
                className="text-[13px] font-semibold text-pekat/45 hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah rounded"
              >
                {PLAN_COPY.belumPasTutupLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
