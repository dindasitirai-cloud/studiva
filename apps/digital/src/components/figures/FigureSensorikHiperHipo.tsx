import React from 'react';

export function FigureSensorikHiperHipo() {
  const W = 580;
  const panelW = 240;
  const panelH = 120;
  const gap = 60;
  const leftX = 20;
  const rightX = leftX + panelW + gap;
  const panelY = 44;
  const cx = W / 2;

  return (
    <svg
      viewBox={`0 0 ${W} 188`}
      width="100%"
      role="img"
      aria-label="Dua panel pemrosesan sensorik: panel kiri hiper-reaktif (mudah terganggu rangsangan) dan panel kanan hipo-reaktif (mencari rangsangan lebih). Keduanya bukan kenakalan."
      style={{ maxWidth: W }}
    >
      {/* Title */}
      <text x={cx} y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="#4C1D95">
        Pemrosesan sensorik: dua arah berbeda
      </text>

      {/* Left panel — hiper-reaktif */}
      <rect x={leftX} y={panelY} width={panelW} height={panelH} rx="12"
        fill="#F5F3FF" stroke="#7C3AED" strokeWidth="1.8" />
      {/* Sound wave icon */}
      <g transform={`translate(${leftX + 20}, ${panelY + 22})`}>
        <path d="M0,14 Q8,2 8,14 Q8,26 0,14" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M12,10 Q22,-2 22,14 Q22,30 12,18" fill="none" stroke="#6B21A8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M26,6 Q40,-6 40,14 Q40,34 26,22" fill="none" stroke="#5B21B6" strokeWidth="1.6" strokeLinecap="round"/>
      </g>
      <text x={leftX + panelW / 2} y={panelY + 78} textAnchor="middle" fontSize="12" fontWeight="700" fill="#4C1D95">
        Hiper-reaktif
      </text>
      <text x={leftX + panelW / 2} y={panelY + 94} textAnchor="middle" fontSize="10" fill="#6B21A8">
        mudah terganggu rangsangan
      </text>
      <text x={leftX + panelW / 2} y={panelY + 109} textAnchor="middle" fontSize="9.5" fill="#7C3AED">
        suara · tekstur · keramaian
      </text>

      {/* Center divider with label */}
      <line x1={cx} y1={panelY + 10} x2={cx} y2={panelY + panelH - 10}
        stroke="#C4B5FD" strokeWidth="1.2" strokeDasharray="4 3" />
      <text x={cx} y={panelY + panelH / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#6B21A8"
        style={{ dominantBaseline: "middle" }}>
        vs
      </text>

      {/* Right panel — hipo-reaktif */}
      <rect x={rightX} y={panelY} width={panelW} height={panelH} rx="12"
        fill="#EDE9FE" stroke="#6B21A8" strokeWidth="1.8" />
      {/* Jumping/bouncing child icon */}
      <g transform={`translate(${rightX + 20}, ${panelY + 10})`}>
        {/* simple figure jumping */}
        <circle cx="20" cy="14" r="9" fill="none" stroke="#5B21B6" strokeWidth="2"/>
        <line x1="20" y1="23" x2="20" y2="44" stroke="#5B21B6" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="20" y1="32" x2="10" y2="44" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="32" x2="30" y2="44" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="27" x2="8" y2="22" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="27" x2="32" y2="22" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round"/>
        {/* motion lines */}
        <path d="M36,30 Q44,24 36,18" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M40,32 Q50,24 40,16" fill="none" stroke="#A78BFA" strokeWidth="1.2" strokeLinecap="round"/>
      </g>
      <text x={rightX + panelW / 2} y={panelY + 78} textAnchor="middle" fontSize="12" fontWeight="700" fill="#3B0764">
        Hipo-reaktif
      </text>
      <text x={rightX + panelW / 2} y={panelY + 94} textAnchor="middle" fontSize="10" fill="#5B21B6">
        mencari rangsangan lebih
      </text>
      <text x={rightX + panelW / 2} y={panelY + 109} textAnchor="middle" fontSize="9.5" fill="#6B21A8">
        berputar · membentur · menggigit
      </text>

      {/* Bottom note */}
      <text x={cx} y={panelY + panelH + 28} textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B21A8">
        keduanya bukan kenakalan
      </text>
      <text x={cx} y={panelY + panelH + 44} textAnchor="middle" fontSize="9.5" fill="#7C3AED">
        variasi sensorik adalah bagian dari keberagaman manusia
      </text>
    </svg>
  );
}
