import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { OnboardingData } from '../onboarding/types';
import KartuPekanIni from './KartuPekanIni';
import KartuSorotan from './KartuSorotan';
// TODO: posisi final BerandaUsia di beranda menunggu keputusan tata letak
import BerandaUsia from '../beranda-usia/BerandaUsia';

function sapaan(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi,';
  if (h < 15) return 'Selamat siang,';
  if (h < 18) return 'Selamat sore,';
  return 'Selamat malam,';
}

interface OutletCtx {
  onboardingData: OnboardingData;
}

export default function BerandaPage() {
  const { onboardingData: d } = useOutletContext<OutletCtx>();
  const navigate = useNavigate();
  // TODO: nama dari profil; sementara "Ayah/Bunda"
  const namaOrangTua = 'Ayah/Bunda';

  const inisial = d.namaAnak.trim().charAt(0).toUpperCase() || '?';
  const bandLabel = `Musim ${d.band + 1}`;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-kanvas pb-20">
      {/* Header */}
      <div className="px-4 pb-4 pt-6 sm:px-6">
        <div className="mx-auto max-w-lg">
          <p className="font-caveat text-[1.3rem] text-pekat/70">
            {sapaan()} <span className="text-pekat">{namaOrangTua}</span>
          </p>

          {/* Chip anak */}
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-mawar/50 bg-white px-3 py-1.5 shadow-sm">
            <span
              style={{ borderRadius: '70% 70% 70% 4px', width: 26, height: 26 }}
              className="flex items-center justify-center bg-rekah text-[11px] font-bold text-white"
            >
              {inisial}
            </span>
            <span className="text-[13px] font-semibold text-pekat">{d.namaAnak}</span>
            <span className="text-[11px] text-pekat/40">{bandLabel}</span>
          </div>
        </div>
      </div>

      {/* Kartu-kartu */}
      <div className="px-4 sm:px-6">
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          <KartuPekanIni
            namaAnak={d.namaAnak}
            band={d.band}
            nilai={d.nilai}
            fokus={d.fokus}
          />

          <KartuSorotan band={d.band} />
        </div>
      </div>

      {/* Panduan Tahun Pertama (dan band usia lain) */}
      <BerandaUsia namaAnak={d.namaAnak} tanggalLahir={d.tanggalLahir} />

      <div className="px-4 sm:px-6">
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          {/* Footer */}
          <p className="py-4 text-center font-fraunces text-[0.9rem] italic text-pekat/40">
            Mekar pada waktunya.
          </p>
        </div>
      </div>
    </div>
  );
}

