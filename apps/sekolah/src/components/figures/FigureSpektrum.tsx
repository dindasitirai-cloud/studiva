import React from 'react';

export function FigureSpektrum() {
  const W = 560;
  const gradH = 30;
  const topY = 30;
  const gradY = topY + 22;

  // Dots: each represents a child at a different position on the spectrum
  const dots = [
    { cx: 48,  label: "Anak A" },
    { cx: 132, label: "Anak B" },
    { cx: 210, label: "Anak C" },
    { cx: 300, label: "Anak D" },
    { cx: 390, label: "Anak E" },
    { cx: 468, label: "Anak F" },
    { cx: 530, label: "Anak G" },
  ];

  const gradId = "dk-spektrum-grad";

  return (
    <svg
      viewBox={`0 0 ${W} 130`}
      width="100%"
      role="img"
      aria-label="Pita gradien horizontal menggambarkan spektrum autisme: satu spektrum dengan tampilan yang sangat beragam, ditunjukkan oleh titik-titik anak di posisi berbeda"
      style={{ maxWidth: W }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#EDE9FE" />
          <stop offset="40%"  stopColor="#C4B5FD" />
          <stop offset="70%"  stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      <text x={W / 2} y={topY} textAnchor="middle" fontSize="12" fontWeight="600" fill="#4C1D95">
        satu spektrum, tampilan yang sangat beragam
      </text>

      {/* Gradient bar */}
      <rect x="20" y={gradY} width={W - 40} height={gradH} rx="8"
        fill={`url(#${gradId})`} />

      {/* Dots for each child */}
      {dots.map((d, i) => (
        <g key={i}>
          <circle cx={d.cx} cy={gradY + gradH / 2} r="7"
            fill="white" stroke="#5B21B6" strokeWidth="2" />
          <text x={d.cx} y={gradY + gradH + 16} textAnchor="middle"
            fontSize="9" fill="#4C1D95" fontWeight="600">
            {d.label}
          </text>
        </g>
      ))}

      {/* Label bawah */}
      <text x="20" y={gradY + gradH + 32} fontSize="9.5" fill="#7C3AED">
        variasi lebih ringan
      </text>
      <text x={W - 20} y={gradY + gradH + 32} textAnchor="end" fontSize="9.5" fill="#5B21B6">
        kebutuhan dukungan lebih intensif
      </text>
    </svg>
  );
}
