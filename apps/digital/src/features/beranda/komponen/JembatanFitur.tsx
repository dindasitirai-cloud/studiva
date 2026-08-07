import React from 'react';
import { Link } from 'react-router-dom';
import { MENU_UTAMA } from '../../../config/fiturRekah';
import type { Jembatan } from '../../beranda-usia/bands/tahun-pertama/content';
import { renderRichText } from '../../beranda-usia/renderRichText';
import { JEMBATAN_SEKSI } from '../copy';
import type { SapaanSet } from '../../beranda-usia/useChildProfile';

interface Props {
  jembatan: Jembatan[];
  sapaan: SapaanSet;
}

// MENUNGGU REVIEW PSIKOLOG FITRI
export default function JembatanFitur({ jembatan, sapaan }: Props) {
  return (
    <div className="mt-5 border-t border-dashed border-rekah/15 pt-4">
      <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-pekat/40">
        {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
        {JEMBATAN_SEKSI.judul}
      </p>
      <ul className="flex flex-col gap-2.5">
        {jembatan.map((j) => {
          const fitur = MENU_UTAMA.find(f => f.id === j.fitur);
          if (!fitur) return null;
          const Icon = fitur.icon;
          const judulNode = renderRichText(j.judul, sapaan);
          const badanNode = renderRichText(j.badan, sapaan);
          return (
            <li key={j.fitur}>
              <Link
                to={fitur.to}
                aria-label={`${j.judul} — buka ${fitur.label}`}
                className="flex items-start gap-3 rounded-[16px_16px_16px_4px] border border-rekah/10 bg-white p-3 text-left no-underline transition hover:border-rekah/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none"
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center ${fitur.bgToken}`}
                  style={{ borderRadius: '70% 70% 70% 4px' }}
                >
                  <Icon
                    aria-hidden="true"
                    className={`h-4 w-4 ${fitur.fgToken}`}
                    strokeWidth={2}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-pekat">{judulNode}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-pekat/55">{badanNode}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
