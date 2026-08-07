import React from 'react';
import { MENU_UTAMA } from '../../../config/fiturRekah';
import { ALUR_EKOSISTEM } from '../copy';

interface Props {
  namaAnak: string;
}

const LANGKAH = MENU_UTAMA.filter(f => f.id !== 'beranda');

// MENUNGGU REVIEW PSIKOLOG FITRI
export default function AlurEkosistem({ namaAnak }: Props) {
  const penutup = ALUR_EKOSISTEM.penutup.replace('{anak}', namaAnak);

  return (
    <section className="py-6" aria-label={ALUR_EKOSISTEM.judul}>
      <h2 className="mb-4 font-fredoka text-[1.1rem] font-semibold text-pekat">
        {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
        {ALUR_EKOSISTEM.judul}
      </h2>

      {/* Desktop: horizontal row. Mobile: vertical stack. */}
      <ol className="flex flex-col gap-0 xl:flex-row xl:items-stretch xl:gap-0">
        {LANGKAH.map((fitur, idx) => {
          const Icon = fitur.icon;
          const isLast = idx === LANGKAH.length - 1;
          return (
            <React.Fragment key={fitur.id}>
              <li className="flex flex-row items-center gap-3 py-2 xl:flex-col xl:items-center xl:gap-2 xl:py-0 xl:flex-1">
                {/* Ikon */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center ${fitur.bgToken}`}
                  style={{ borderRadius: '70% 70% 70% 4px' }}
                >
                  <Icon
                    aria-hidden="true"
                    className={`h-5 w-5 ${fitur.fgToken}`}
                    strokeWidth={2}
                  />
                </div>
                {/* Teks */}
                <div className="xl:text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-pekat/40">
                    {fitur.kapan}
                  </p>
                  <p className="text-[13px] font-bold text-pekat">{fitur.label}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-pekat/55">{fitur.ringkas}</p>
                </div>
              </li>
              {/* Garis penghubung putus-putus */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className="ml-5 w-px self-stretch border-l-2 border-dashed border-rekah/20 xl:ml-0 xl:w-auto xl:h-px xl:self-auto xl:border-l-0 xl:border-t-2 xl:border-dashed xl:border-rekah/20 xl:flex-1 xl:mt-5"
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>

      <p className="mt-4 text-[13px] leading-relaxed text-pekat/50">
        {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
        {penutup}
      </p>
    </section>
  );
}
