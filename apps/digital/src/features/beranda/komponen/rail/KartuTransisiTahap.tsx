import React from 'react';
import { STAGES } from '../../../beranda-usia/bands/tahun-pertama/content';
import { KARTU_TRANSISI } from '../../copy';

interface Props {
  usiaBulan: number;
}

const BATAS_TAHAP = [3, 6, 9, 12];

function hitungTransisi(usiaBulan: number): { bulanTersisa: number; labelTahap: string } | null {
  if (usiaBulan < 0 || usiaBulan >= 12) return null;
  const nextBatas = BATAS_TAHAP.find(b => b > usiaBulan);
  if (!nextBatas) return null;
  const bulanTersisa = nextBatas - usiaBulan;
  if (bulanTersisa > 2) return null;
  const nextStage = STAGES.find(s => {
    const [, a, b] = s.id.split('-').map(Number);
    return nextBatas >= (a ?? 0) && nextBatas < (b ?? 12) + 3;
  }) ?? STAGES[STAGES.findIndex(s => s.id === 'bulan-10-12')];
  return {
    bulanTersisa,
    labelTahap: nextStage?.ageLabel ?? '',
  };
}

// MENUNGGU REVIEW PSIKOLOG FITRI
export default function KartuTransisiTahap({ usiaBulan }: Props) {
  const data = hitungTransisi(usiaBulan);
  if (!data) return null;

  const body = KARTU_TRANSISI.bodyTemplate
    .replace('{n}', String(data.bulanTersisa))
    .replace('{tahap}', data.labelTahap);

  return (
    <div className="rounded-[16px_16px_16px_4px] border border-kuning/60 bg-kuning/20 p-4">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-pekat/50">
        {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
        {KARTU_TRANSISI.judul}
      </p>
      <p className="text-[13px] text-pekat/70">
        {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
        {body}
      </p>
    </div>
  );
}
