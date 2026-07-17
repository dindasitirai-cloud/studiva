// KONTEN: wajib review Psikolog Fitri sebelum rilis.

import React, { useEffect, useMemo, useState } from 'react';
import { NILAI_REKAH, ACTIVITY_MODULES, composeWeeklyPlan, type ActivityModuleId } from '@studiva/shared';
import { useRekahProfile } from '../../../context/RekahProfileContext';
import { useRekahPlan } from '../../../context/RekahPlanContext';
import LangkahKecilCard from '../../../features/rekah-plan/LangkahKecilCard';
import KelopakProgress from '../../../features/rekah-onboarding/KelopakProgress';
import Kelopak from '../../../components/Kelopak';
import { PLAN_COPY } from '../../../features/rekah-plan/rekahPlanCopy';

export default function RencanaPage() {
  const { profile } = useRekahProfile();
  const {
    plan, setPlan,
    currentWeek,
    markComplete, markSwap,
    isComplete,
    allDone,
  } = useRekahPlan();

  const [activeIndex, setActiveIndex] = useState(0);

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

  function handleBelumPas(moduleId: ActivityModuleId) {
    markSwap(moduleId);
    setActiveIndex(i => Math.min(i + 1, visibleSteps.length - 1));
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
  const previewSteps = visibleSteps.slice(
    activeIndex + 1,
    activeIndex + 3,
  );

  return (
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

        {/* ── Kartu langkah aktif ──────────────────────────────────────── */}
        {currentStep && (
          <LangkahKecilCard
            key={currentStep.moduleId}
            moduleId={currentStep.moduleId}
            posisi={currentStep.posisi}
            totalSteps={totalSteps}
            onSelesai={() => handleSelesai(currentStep.moduleId)}
            onBelumPas={() => handleBelumPas(currentStep.moduleId)}
            isLast={activeIndex === visibleSteps.length - 1}
          />
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

      </div>
    </div>
  );
}
