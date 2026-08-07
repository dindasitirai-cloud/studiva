// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React from 'react';
import { usePilihanHarian } from './PilihanHarianContext';
import { JALUR_ORANGTUA } from './content';
import BotanicalStem from '../../components/BotanicalStem';

const SPRIG_CFG = { type: 'sprig' as const, bloom: '#C79020', bloom2: '#FFE29A' };

export default function JalurOrangTua() {
  const { panduanOrangTua } = usePilihanHarian();

  return (
    <section
      className="relative overflow-hidden rounded-[20px] bg-madu/40 p-5"
      aria-labelledby="jalur-orangtua-judul"
    >
      {/* Sprig botanical decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-4 opacity-40"
        style={{ width: '52px', height: '82px' }}
      >
        <BotanicalStem cfg={SPRIG_CFG} />
      </div>

      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <p className="font-nunito text-[11px] font-[800] uppercase tracking-widest text-pekat/50">
          Untuk Bunda/Ayah
        </p>
        <span className="rounded-full bg-madu px-2.5 py-0.5 font-nunito text-[11px] font-[800] text-pekat">
          Belajar bareng
        </span>
      </div>

      {panduanOrangTua === null ? (
        <p className="font-nunito text-[14px] text-pekat/60">{JALUR_ORANGTUA.kosong}</p>
      ) : (
        <div className="flex items-start gap-3 pr-14">
          <div
            aria-hidden
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-white/70"
          >
            {/* Book SVG — stroke #E0A21F */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#E0A21F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" stroke="#E0A21F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="jalur-orangtua-judul"
              className="font-fredoka text-[16px] font-semibold leading-snug text-pekat"
            >
              {panduanOrangTua.judul}
            </h2>
            <p className="mt-1 font-nunito text-[12px] leading-relaxed text-pekat/60">
              {panduanOrangTua.domain}
            </p>
            <button
              type="button"
              className="mt-3 rounded-full bg-[#E0A21F] px-4 py-2 font-nunito text-[13px] font-bold text-white transition hover:bg-[#C79020]"
            >
              Pelajari · 2 menit →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
