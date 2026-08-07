import React, { useState, useEffect, useRef, useCallback } from 'react';
import { STAGES } from '../../beranda-usia/bands/tahun-pertama/content';
import { renderRichText } from '../../beranda-usia/renderRichText';
import StageIllustration from '../../beranda-usia/bands/tahun-pertama/illustrations/StageIllustration';
import type { SapaanSet } from '../../beranda-usia/useChildProfile';
import { CERITA_TAHAP } from '../copy';
import JembatanFitur from './JembatanFitur';

interface Props {
  tahapAktifId: string | null;
  sapaan: SapaanSet;
}

// MENUNGGU REVIEW PSIKOLOG FITRI
export default function CeritaTahap({ tahapAktifId, sapaan }: Props) {
  const initialIdx = Math.max(0, STAGES.findIndex(s => s.id === tahapAktifId));
  const [selectedIdx, setSelectedIdx] = useState(initialIdx);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Sync jika tahapAktifId berubah (mis. profil anak diganti)
  useEffect(() => {
    const idx = STAGES.findIndex(s => s.id === tahapAktifId);
    if (idx >= 0) setSelectedIdx(idx);
  }, [tahapAktifId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') {
      const next = (idx + 1) % STAGES.length;
      setSelectedIdx(next);
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = (idx - 1 + STAGES.length) % STAGES.length;
      setSelectedIdx(prev);
      tabRefs.current[prev]?.focus();
    }
  }, []);

  const stage = STAGES[selectedIdx];
  if (!stage) return null;

  return (
    <section className="py-4" aria-label={CERITA_TAHAP.judulSeksi}>
      {/* Tab list sub-tahap */}
      <div
        role="tablist"
        aria-label={CERITA_TAHAP.judulSeksi}
        className="mb-4 flex gap-1.5 overflow-x-auto pb-1"
      >
        {STAGES.map((s, idx) => {
          const isActive = idx === selectedIdx;
          const isCurrent = s.id === tahapAktifId;
          return (
            <button
              key={s.id}
              role="tab"
              ref={el => { tabRefs.current[idx] = el; }}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setSelectedIdx(idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              style={{ minHeight: 44 }}
              className={`relative flex-shrink-0 rounded-[12px_12px_12px_3px] px-3 py-1.5 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none ${
                isActive
                  ? 'bg-rekah text-white'
                  : 'bg-white text-pekat/60 hover:bg-fajar hover:text-pekat'
              }`}
            >
              {s.ageLabel}
              {isCurrent && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-rekah/15 text-rekah'
                  }`}
                >
                  {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
                  {CERITA_TAHAP.labelSekarang}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Konten tahap */}
      <div role="tabpanel" aria-live="polite">
        <div className="grid gap-5 md:grid-cols-[1fr_200px]">
          {/* Teks kiri */}
          <div className="flex flex-col gap-3">
            <span
              className="inline-block self-start bg-rekah px-3 py-1 text-[12px] font-bold uppercase tracking-[0.04em] text-white"
              style={{ borderRadius: '70% 70% 70% 4px' }}
            >
              {stage.ageLabel}
            </span>

            <h2 className="font-fredoka text-[1.25rem] font-semibold leading-tight text-pekat">
              {stage.title}
            </h2>

            <p className="text-[14.5px] leading-[1.8] text-pekat/65">
              {renderRichText(stage.story, sapaan, 'bg-kuning/60 font-extrabold')}
            </p>

            {/* Jembatan fitur — inside the card, above the details line */}
            <JembatanFitur jembatan={stage.jembatan} sapaan={sapaan} />

            {/* Rincian per ranah — native details, tertutup by default */}
            <details className="overflow-hidden rounded-[14px_14px_14px_4px] border border-rekah/15 bg-white">
              <summary className="flex cursor-pointer select-none list-none items-center gap-2 px-4 py-3 text-[13px] font-semibold text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah [&::-webkit-details-marker]:hidden">
                {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
                <span>{CERITA_TAHAP.labelDetailRanah}</span>
                <span className="ml-auto text-[18px] transition-transform duration-200 [[open]_&]:rotate-45">+</span>
              </summary>
              <div className="grid gap-3 px-4 pb-4">
                {stage.domains.map(d => (
                  <div key={d.label} className="text-[13.5px]">
                    <b className="mb-0.5 block text-[12px] font-bold uppercase tracking-[0.04em] text-pekat">
                      {d.label}
                    </b>
                    <span className="text-pekat/60">{d.detail}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Ilustrasi kanan */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[200px]">
              <StageIllustration type={stage.illustration} variant={sapaan.variant} />
              <p className="mt-1.5 text-center font-caveat text-[16px] text-rekah/70">
                {stage.captionText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
