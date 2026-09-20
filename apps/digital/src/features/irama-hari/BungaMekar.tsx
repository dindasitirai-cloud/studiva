import React from 'react';
import type { DataBunga } from '../akar-keluarga/registryBunga';
import { TAHAP_MAKS } from '../../lib/mekar';

/**
 * Bunga dengan kelopak yang mencerah secara bertahap sesuai tingkat mekar.
 *
 * Formula opacity per kelopak i:
 *   n          = mekar / TAHAP_MAKS          // rasio 0–1
 *   isiKelopak = clamp(n * jumlahKelopak - i, 0, 1)
 *   opacity    = 0.35 + 0.65 * isiKelopak
 *
 * Pada mekar=0: semua kelopak pada opacity 0.35 — tetap utuh (Istirahat).
 * Pada mekar=TAHAP_MAKS: semua kelopak pada opacity 1.0 — Mekar penuh.
 */
export default function BungaMekar({
  bunga,
  mekar,
  size,
}: {
  bunga: DataBunga;
  mekar: number;
  size: number;
}) {
  const n = bunga.kelopak;
  const ratio = Math.min(1, Math.max(0, mekar / TAHAP_MAKS));

  return (
    <svg
      viewBox="-74 -74 148 148"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {Array.from({ length: n }, (_, i) => {
        const isi = Math.min(1, Math.max(0, ratio * n - i));
        const op = 0.35 + 0.65 * isi;
        return (
          <path
            key={i}
            d={bunga.d}
            fill={bunga.warnaPetal}
            opacity={op}
            transform={`rotate(${((i * 360) / n).toFixed(2)})`}
          />
        );
      })}
      <circle cx={0} cy={0} r={bunga.r1} fill={bunga.c1} />
      <circle cx={0} cy={0} r={bunga.r2} fill={bunga.c2} />
    </svg>
  );
}
