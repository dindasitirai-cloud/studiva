import React from 'react';
import { Link } from 'react-router-dom';
import { LAPISAN_TAHUN_PERTAMA } from '../../content/beranda-copy';

// Hanya render saat usia anak < 12 bulan — dikendalikan dari BerandaPage, bukan di sini.

export default function LapisanTahunPertama() {
  return (
    <div className="rounded-[20px_20px_20px_4px] bg-kuning/40 p-5">
      <p className="mb-3 font-nunito text-[11px] font-[800] uppercase tracking-widest text-pekat/50">
        {LAPISAN_TAHUN_PERTAMA.eyebrow}
      </p>
      <div className="flex flex-col gap-2">
        {/* TODO: buat halaman /dashboard/tier2/panduan/piring-ibu */}
        <Link
          to="/dashboard/tier2/panduan/piring-ibu"
          className="flex min-h-[44px] items-center justify-center rounded-[14px_14px_14px_3px] bg-white/70 px-4 font-nunito text-[13px] font-semibold text-pekat/75 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          {LAPISAN_TAHUN_PERTAMA.tombolPiringIbu}
        </Link>
        {/* TODO: buat halaman /dashboard/tier2/panduan/lembar-nifas */}
        <Link
          to="/dashboard/tier2/panduan/lembar-nifas"
          className="flex min-h-[44px] items-center justify-center rounded-[14px_14px_14px_3px] bg-white/70 px-4 font-nunito text-[13px] font-semibold text-pekat/75 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          {LAPISAN_TAHUN_PERTAMA.tombolLembarNifas}
        </Link>
        {/* TODO: buat halaman /dashboard/tier2/panduan/menyambut-si-kecil */}
        <Link
          to="/dashboard/tier2/panduan/menyambut-si-kecil"
          className="flex min-h-[44px] items-center justify-center rounded-[14px_14px_14px_3px] bg-white/70 px-4 font-nunito text-[13px] font-semibold text-pekat/75 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          {LAPISAN_TAHUN_PERTAMA.tombolMenyambut}
        </Link>
      </div>
    </div>
  );
}
