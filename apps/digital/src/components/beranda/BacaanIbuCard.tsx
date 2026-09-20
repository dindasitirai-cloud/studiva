import React from 'react';
import { Link } from 'react-router-dom';
import { BACAAN } from '../../content/beranda-copy';
import type { Bacaan } from './types';
import type { PeranSingkat } from '../../content/beranda-copy';

// TODO: pemilihan bacaan berdasarkan peran, usia anak, dan mood terakhir

interface Props {
  peran: PeranSingkat;
  utama: Bacaan;
  lainnya: Bacaan[];
  alasan?: string;
}

export default function BacaanIbuCard({ peran, utama, lainnya, alasan }: Props) {
  const judul = peran === 'ibu' ? BACAAN.judulIbu : BACAAN.judulAyah;
  const tampilanLainnya = lainnya.slice(0, 2);

  return (
    <div className="rounded-[20px_20px_20px_4px] bg-white p-5 shadow-sm">
      <p className="mb-3 font-nunito text-[11px] font-[800] uppercase tracking-widest text-pekat/40">
        {judul}
      </p>

      {/* Bacaan utama */}
      <div className="mb-4 rounded-[14px_14px_14px_3px] bg-kanvas px-4 py-3">
        <h3 className="mb-2 font-fredoka text-[15px] font-semibold leading-snug text-pekat">
          {utama.judul}
        </h3>
        {utama.kutipan && (
          <p className="mb-2 font-fraunces italic text-[13px] leading-relaxed text-pekat/60">
            {utama.kutipan}
          </p>
        )}
        <p className="font-nunito text-[11px] text-pekat/40">{utama.estimasiBaca}</p>
        {alasan && (
          <p className="mt-1 font-nunito text-[11px] text-pekat/35">
            {BACAAN.dipilihKarena(alasan)}
          </p>
        )}
      </div>

      {/* Bacaan lainnya */}
      {tampilanLainnya.length > 0 && (
        <ul className="mb-4 space-y-2">
          {tampilanLainnya.map(b => (
            <li
              key={b.id}
              className="border-b border-mawar/10 pb-2 last:border-0 last:pb-0"
            >
              <p className="font-nunito text-[13px] font-semibold text-pekat/75">{b.judul}</p>
              <p className="font-nunito text-[11px] text-pekat/40">{b.estimasiBaca}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Tautan */}
      <Link
        to="/dashboard/tier2/ruang-teduh"
        className="font-nunito text-[13px] font-semibold text-rekah hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
      >
        {BACAAN.bukaTeduh}
      </Link>
    </div>
  );
}
