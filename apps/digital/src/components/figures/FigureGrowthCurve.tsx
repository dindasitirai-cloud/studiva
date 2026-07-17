import React from 'react';

export function FigureGrowthCurve() {
  // Axis
  const ox = 80; const oy = 170; const aw = 460; const ah = 130;

  // Growth band (area) — upper and lower bounds
  const upper = "M80,170 Q160,100 280,80 Q370,65 540,50";
  const lower = "M80,170 Q160,130 280,115 Q370,100 540,88";
  const band  = `M80,170 Q160,100 280,80 Q370,65 540,50 L540,88 Q370,100 280,115 Q160,130 80,170 Z`;

  // Child's dotted line (within band)
  const child = "M80,170 Q160,120 280,98 Q370,82 540,69";

  return (
    <svg
      viewBox="0 0 600 210"
      width="100%"
      role="img"
      aria-label="Grafik pertumbuhan sederhana: pita jalur pertumbuhan hijau dan garis titik-titik anak di dalamnya"
      style={{ maxWidth: 600 }}
    >
      {/* Band */}
      <path d={band} fill="#E1F5EE" opacity="0.7" />
      {/* Band border lines */}
      <path d={upper} fill="none" stroke="#0F6E56" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.5" />
      <path d={lower} fill="none" stroke="#0F6E56" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.5" />
      {/* Child's line */}
      <path d={child} fill="none" stroke="#085041" strokeWidth="2.5" strokeDasharray="6 4" />

      {/* Axes */}
      <line x1={ox} y1={oy - ah} x2={ox} y2={oy} stroke="#888780" strokeWidth="1.5" />
      <line x1={ox} y1={oy} x2={ox + aw} y2={oy} stroke="#888780" strokeWidth="1.5" />
      <text x={ox - 10} y={oy - ah + 10} textAnchor="end" fontSize="10" fill="#444">BB</text>
      <text x={ox + aw + 8} y={oy + 4} fontSize="10" fill="#444">Usia</text>

      {/* Annotation */}
      <rect x="310" y="30" width="250" height="28" rx="6" fill="#085041" />
      <text x="435" y="49" textAnchor="middle" fontSize="11" fontWeight="600" fill="#FFFFFF">
        arah kurva {">"} angka tunggal
      </text>

      {/* Legend */}
      <rect x={ox + 10} y={oy - ah + 10} width="12" height="12" rx="2" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="1" />
      <text x={ox + 26} y={oy - ah + 21} fontSize="10" fill="#444">jalur normal (WHO)</text>
      <line x1={ox + 10} y1={oy - ah + 38} x2={ox + 22} y2={oy - ah + 38} stroke="#085041" strokeWidth="2" strokeDasharray="5 3" />
      <text x={ox + 26} y={oy - ah + 42} fontSize="10" fill="#444">kurva anak</text>
    </svg>
  );
}
