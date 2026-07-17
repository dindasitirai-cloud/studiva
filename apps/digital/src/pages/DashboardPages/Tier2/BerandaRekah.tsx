import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NILAI_REKAH, ACTIVITY_MODULES, hitungUsiaBulan, composeWeeklyPlan, type RekahProfile } from '@studiva/shared';
import { useRekahProfile } from '../../../context/RekahProfileContext';
import { useRekahPlan } from '../../../context/RekahPlanContext';
import OnboardingFlow from '../../../features/rekah-onboarding/OnboardingFlow';
import LogoRekah from '../../../components/LogoRekah';
import Kelopak from '../../../components/Kelopak';
import { COPY } from '../../../features/rekah-onboarding/rekahOnboardingCopy';
import { ChevronRight } from 'lucide-react';

// ── Beranda Musim ─────────────────────────────────────────────────────

function BerandaMusim({ profile }: { profile: RekahProfile }) {
  const navigate = useNavigate();
  const { plan, setPlan, currentWeek } = useRekahPlan();
  const { anak, akar } = profile;
  const usiaBulan = hitungUsiaBulan(anak.tanggalLahir);

  // Compose plan saat beranda dimuat agar preview tersedia
  useEffect(() => {
    if (plan) return; // sudah ada plan, jangan re-compose
    const composed = composeWeeklyPlan(profile, currentWeek);
    setPlan(composed);
  }, [profile, currentWeek, plan, setPlan]);
  const nilai1 = NILAI_REKAH.find(n => n.id === akar.nilaiFokus[0])!;
  const nilai2 = NILAI_REKAH.find(n => n.id === akar.nilaiFokus[1])!;

  return (
    <div className="relative min-h-[calc(100vh-60px)] overflow-hidden bg-kanvas">
      {/* Decorative petals */}
      <Kelopak
        aria-hidden
        rotate={90}
        className="pointer-events-none absolute -right-16 -top-10 h-52 w-52 bg-fajar opacity-60"
      />
      <Kelopak
        aria-hidden
        rotate={270}
        className="pointer-events-none absolute -bottom-20 -left-14 h-64 w-64 bg-mawar opacity-35"
      />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-8 sm:px-0 sm:py-10">

        {/* ── Header Musim ───────────────────────────────────────────── */}
        <div className="mb-8 rounded-[24px] bg-white p-6 shadow-[0_4px_24px_rgba(224,82,107,0.08)]">
          <p className="mb-1 text-[12px] font-bold uppercase tracking-widest text-rekah/70">
            Musim ini
          </p>
          <h1 className="mb-1 font-bricolage text-[1.45rem] font-extrabold leading-snug text-pekat">
            {COPY.beranda.musimHeader(nilai1.label, nilai2.label)}
          </h1>
          <p className="text-[14px] text-pekat/55">
            {COPY.beranda.usiaAnak(anak.namaPanggilan, usiaBulan)}
          </p>

          {/* Nilai pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[nilai1, nilai2].map(n => (
              <span
                key={n.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-mawar px-3 py-1 text-[13px] font-semibold text-pekat/80"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: n.warna }}
                />
                {n.label}
              </span>
            ))}
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-pekat/50">
            {nilai1.deskripsi}
          </p>
        </div>

        {/* ── Langkah Kecil — preview rencana pekan ini ─────────────── */}
        <button
          type="button"
          onClick={() => navigate('/dashboard/tier2/rencana')}
          className="mb-4 w-full rounded-[20px] bg-white p-5 text-left shadow-[0_4px_20px_rgba(224,82,107,0.08)] transition hover:shadow-[0_4px_24px_rgba(224,82,107,0.15)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12px] font-bold uppercase tracking-widest text-rekah/70">
              {COPY.beranda.langkahKecilJudul}
            </p>
            <ChevronRight className="h-4 w-4 text-rekah/40" strokeWidth={2} />
          </div>
          {plan && plan.steps[0] ? (
            <>
              {(() => {
                const mod = ACTIVITY_MODULES.find(m => m.id === plan.steps[0].moduleId);
                if (!mod) return null;
                const nilai = NILAI_REKAH.find(n => n.id === mod.nilaiUtama);
                return (
                  <>
                    <p className="font-bricolage text-[16px] font-bold leading-snug text-pekat">
                      {mod.judul}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {nilai && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
                          style={{ background: `${nilai.warna}22`, color: nilai.warna }}
                        >
                          {nilai.label}
                        </span>
                      )}
                      <span className="text-[12px] text-pekat/40">{mod.durasiMenit} menit</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-pekat/55">
                      {mod.deskripsi}
                    </p>
                  </>
                );
              })()}
            </>
          ) : (
            <p className="font-bricolage text-[15px] font-semibold text-pekat/40">
              {COPY.beranda.langkahKecilIsi}
            </p>
          )}
        </button>

        {/* ── Jejak Mekar (disabled) ─────────────────────────────────── */}
        {/* TODO: build 4 */}
        <div className="flex items-center justify-between rounded-[18px] border border-fajar bg-white px-5 py-4 opacity-50">
          <div className="flex items-center gap-3">
            <LogoRekah size={28} />
            <span className="font-bricolage text-[15px] font-bold text-pekat/60">
              {COPY.beranda.jejakMekarLabel}
            </span>
          </div>
          <span className="rounded-full bg-fajar px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-pekat/40">
            {COPY.beranda.jejakMekarSoon}
          </span>
        </div>

      </div>
    </div>
  );
}

// ── BerandaRekah — decides onboarding vs beranda musim ───────────────

export default function BerandaRekah() {
  const { profile, setProfile } = useRekahProfile();

  if (!profile) {
    // TODO: hilang setelah profil dimuat dari backend (GET /api/me/rekah-profile)
    return <OnboardingFlow onComplete={setProfile} />;
  }

  return <BerandaMusim profile={profile} />;
}
