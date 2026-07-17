// TODO: ganti dengan logo final
import React from 'react';

interface LogoRekahProps {
  size?: number;
  withWordmark?: boolean;
  /** Light variant for dark backgrounds */
  light?: boolean;
}

const OPEN_PETAL  = 'M 22 22 C 15 16 15 7 22 4 C 29 7 29 16 22 22 Z';
const BUD_PETAL   = 'M 22 22 C 19 18 19 12 22 10 C 25 12 25 18 22 22 Z';
const OPEN_ANGLES = [0, 72, 144];
const BUD_ANGLES  = [216, 288];

export default function LogoRekah({ size = 36, withWordmark = false, light = false }: LogoRekahProps) {
  const petalColor  = light ? '#F7C9CE' : '#E0526B';
  const centerColor = '#F6B860';
  const textColor   = light ? '#F7C9CE' : '#E0526B';

  return (
    <div className="flex items-center gap-2.5" role="img" aria-label="Rekah">
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* 3 open petals */}
        {OPEN_ANGLES.map(angle => (
          <path
            key={angle}
            d={OPEN_PETAL}
            fill={petalColor}
            fillOpacity="0.92"
            transform={`rotate(${angle}, 22, 22)`}
          />
        ))}
        {/* 2 bud petals — slightly smaller, lower opacity */}
        {BUD_ANGLES.map(angle => (
          <path
            key={angle}
            d={BUD_PETAL}
            fill={petalColor}
            fillOpacity="0.55"
            transform={`rotate(${angle}, 22, 22)`}
          />
        ))}
        {/* Center */}
        <circle cx="22" cy="22" r="4.5" fill={centerColor} />
        <circle cx="22" cy="22" r="2"   fill="white" fillOpacity="0.45" />
      </svg>

      {withWordmark && (
        <span
          className="font-bricolage font-extrabold tracking-tight leading-none select-none"
          style={{ fontSize: size * 0.65, color: textColor }}
          aria-hidden="true"
        >
          rekah
        </span>
      )}
    </div>
  );
}
