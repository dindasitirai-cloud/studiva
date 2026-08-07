import React from 'react';
import { Link } from 'react-router-dom';
import type { SapaanSet } from '../../beranda-usia/useChildProfile';
import { HERO_BERANDA } from '../copy';
import { CERITA_TAHAP } from '../copy';

interface Props {
  salam: string;
  namaPendamping: string;
  namaAnak: string;
  sapaan: SapaanSet;
  usiaBulan: number;
  labelTahap: string | null;
}

// MENUNGGU REVIEW PSIKOLOG FITRI
export default function HeroBeranda({ salam, namaPendamping, namaAnak, usiaBulan, labelTahap }: Props) {
  const judul = usiaBulan >= 0
    ? HERO_BERANDA.judulTemplate
        .replace('{bulan}', String(usiaBulan + 1))
        .replace('{anak}', namaAnak)
    : HERO_BERANDA.judulFallback.replace('{anak}', namaAnak);

  return (
    <section className="pb-2 pt-6 px-0">
      <p className="font-caveat text-[1.25rem] text-pekat/60">
        {salam} <span className="text-pekat">{namaPendamping}</span>
      </p>

      <h1 className="mt-1 font-fredoka text-[1.7rem] font-semibold leading-tight text-pekat">
        {judul}
      </h1>

      <p className="mt-2 max-w-[48ch] text-[14.5px] leading-relaxed text-pekat/60">
        {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
        {HERO_BERANDA.lead}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {labelTahap && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rekah/25 bg-fajar px-3 py-1 text-[12px] font-semibold text-rekah">
            <span aria-hidden="true">🌸</span>
            {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
            {HERO_BERANDA.chipTahap}: {labelTahap}
          </span>
        )}
        <Link
          to="/dashboard/tier2/panduan"
          className="text-[12px] font-semibold text-rekah underline underline-offset-2 hover:text-rekah-tua motion-reduce:transition-none"
        >
          {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
          {CERITA_TAHAP.tautanPanduan}
        </Link>
      </div>
    </section>
  );
}
