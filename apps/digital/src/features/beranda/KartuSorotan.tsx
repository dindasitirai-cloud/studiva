import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BANDS } from '../akar-keluarga/content';

// TODO: kurasi sorotan per band dari Panduan (link ke kartu Panduan yang relevan)
const SOROTAN_PLACEHOLDER = BANDS.map(b => ({
  judul: `Panduan Musim: ${b.judul}`,
  sub: `Panduan singkat musim ini — 3 menit baca`,
}));

interface Props {
  band: number;
}

export default function KartuSorotan({ band }: Props) {
  const navigate = useNavigate();
  const sorotan = SOROTAN_PLACEHOLDER[band];

  return (
    <button
      type="button"
      onClick={() => navigate('/dashboard/tier2/knowledge')}
      className="w-full rounded-[20px] bg-white p-5 text-left shadow-[0_4px_16px_rgba(224,82,107,0.07)] transition hover:shadow-[0_4px_24px_rgba(224,82,107,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none"
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          aria-hidden
          style={{ borderRadius: '70% 70% 70% 4px', width: 24, height: 36, flexShrink: 0 }}
          className="bg-rekah"
        />
        <div>
          <p className="mb-0.5 text-[13px] font-bold text-pekat">{sorotan.judul}</p>
          <p className="text-[11px] text-pekat/50">{sorotan.sub}</p>
        </div>
      </div>
      <p className="text-[11px] font-semibold text-rekah">Baca panduan →</p>
    </button>
  );
}
