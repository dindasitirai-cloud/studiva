import React from 'react';
import { REGISTRY_BUNGA } from '../features/akar-keluarga/registryBunga';

/**
 * Rekah canonical value flower (Keluarga 12 Bunga Nilai, arah 1a).
 * value: kebab-case bunga id (e.g. 'kasih-sayang', 'kemandirian').
 * state: 'mekar' (full) | 'istirahat' (resting, muted opacity).
 */
export default function BungaNilai({
  value,
  state = 'mekar',
  size = 24,
}: {
  value: string;
  state?: 'mekar' | 'istirahat';
  size?: number;
}) {
  const bunga = REGISTRY_BUNGA.find(b => b.id === value) ?? REGISTRY_BUNGA[2]; // fallback: kasih-sayang
  const isIstirahat = state === 'istirahat';
  const petalOp = isIstirahat ? 0.5 : 1;
  const centerOp = isIstirahat ? 0.62 : 1;
  const n = bunga.kelopak;

  return (
    <svg
      viewBox="-74 -74 148 148"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
    >
      {Array.from({ length: n }, (_, i) => (
        <path
          key={i}
          d={bunga.d}
          fill={bunga.warnaPetal}
          opacity={petalOp}
          transform={`rotate(${((360 / n) * i).toFixed(2)})`}
        />
      ))}
      <circle cx={0} cy={0} r={bunga.r1} fill={bunga.c1} opacity={centerOp} />
      <circle cx={0} cy={0} r={bunga.r2} fill={bunga.c2} opacity={centerOp} />
    </svg>
  );
}
