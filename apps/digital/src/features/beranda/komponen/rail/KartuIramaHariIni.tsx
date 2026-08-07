import React from 'react';
import { Link } from 'react-router-dom';
import { SUSUNAN_HARI } from '../../../irama-hari/content';
import { RAIL_IRAMA } from '../../copy';

// TODO: KartuIramaHariIni perlu PilihanHarianProvider di atas DashboardShellTier2
// agar bisa membaca pilihanEfektif. Saat ini provider hanya ada di dalam IramaHariPage,
// sehingga beranda selalu merender empty state 4 blok.
// MENUNGGU REVIEW PSIKOLOG FITRI
export default function KartuIramaHariIni() {
  const blok: Array<{ key: string; label: string; teks: string }> = [
    { key: 'pagi',        label: SUSUNAN_HARI.blokLabel.pagi,        teks: SUSUNAN_HARI.blokKosongPertama },
    { key: 'siang',       label: SUSUNAN_HARI.blokLabel.siang,       teks: SUSUNAN_HARI.blokKosongLainnya },
    { key: 'sore',        label: SUSUNAN_HARI.blokLabel.sore,        teks: SUSUNAN_HARI.blokKosongLainnya },
    { key: 'jelangTidur', label: SUSUNAN_HARI.blokLabel.jelangTidur, teks: SUSUNAN_HARI.blokKosongLainnya },
  ];

  return (
    <div className="rounded-[16px_16px_16px_4px] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-fredoka text-[0.95rem] font-semibold text-pekat">
          {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
          {RAIL_IRAMA.judul}
        </h3>
        <Link
          to="/dashboard/tier2/irama-hari"
          className="text-[12px] font-semibold text-rekah hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
          {RAIL_IRAMA.tautanLihat}
        </Link>
      </div>
      <ul className="flex flex-col gap-1.5">
        {blok.map(b => (
          <li key={b.key} className="flex items-baseline gap-2">
            <span className="w-[68px] flex-shrink-0 text-[11px] font-bold uppercase tracking-wider text-pekat/40">
              {b.label}
            </span>
            <span className="text-[12.5px] text-pekat/55">{b.teks}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
