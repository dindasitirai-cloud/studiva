import React from 'react';
import { NILAI_REKAH, hitungUsiaBulan, type RekahProfile } from '@studiva/shared';
import { useRekahProfile } from '../../../context/RekahProfileContext';
import OnboardingFlow from '../../../features/rekah-onboarding/OnboardingFlow';
import LogoRekah from '../../../components/LogoRekah';
import Kelopak from '../../../components/Kelopak';
import { COPY } from '../../../features/rekah-onboarding/rekahOnboardingCopy';

// ── Beranda Musim ─────────────────────────────────────────────────────

function BerandaMusim({ profile }: { profile: RekahProfile }) {
  const { anak, akar } = profile;
  const usiaBulan = hitungUsiaBulan(anak.tanggalLahir);
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

        {/* ── Langkah Kecil placeholder ──────────────────────────────── */}
        {/* TODO: diganti kartu Langkah Kecil (build 3) */}
        <div className="mb-4 rounded-[20px] border-2 border-dashed border-rekah/20 bg-white p-6">
          <p className="mb-1 text-[12px] font-bold uppercase tracking-widest text-pekat/40">
            {COPY.beranda.langkahKecilJudul}
          </p>
          <p className="font-bricolage text-[1.1rem] font-bold text-pekat/35">
            {COPY.beranda.langkahKecilIsi}
          </p>
        </div>

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
