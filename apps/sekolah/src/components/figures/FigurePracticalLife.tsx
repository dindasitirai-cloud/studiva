import React from 'react';

const CARDS = [
  { icon: "👕", label: "Berpakaian\nsendiri" },
  { icon: "🧸", label: "Merapikan\nmainan" },
  { icon: "🍽️", label: "Membantu\nmenata meja" },
];

export function FigurePracticalLife() {
  const W = 150; const GAP = 24;
  const total = CARDS.length * W + (CARDS.length - 1) * GAP;
  const sx = (600 - total) / 2;

  return (
    <svg
      viewBox="0 0 600 200"
      width="100%"
      role="img"
      aria-label="Tiga tugas kemandirian praktis: berpakaian sendiri, merapikan mainan, membantu menata meja"
      style={{ maxWidth: 600 }}
    >
      <text x="300" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fill="#854F0B">
        Tugas nyata membangun rasa mampu
      </text>

      {CARDS.map((c, i) => {
        const x = sx + i * (W + GAP);
        const lines = c.label.split('\n');
        return (
          <g key={i}>
            <rect x={x} y={44} width={W} height={120} rx="12" fill="#FEF3DC" stroke="#E8A422" strokeWidth="1.8" />
            <text x={x + W / 2} y={96} textAnchor="middle" fontSize="28">{c.icon}</text>
            {lines.map((line, li) => (
              <text
                key={li}
                x={x + W / 2}
                y={120 + li * 18}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#854F0B"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      <text x="300" y="186" textAnchor="middle" fontSize="10" fill="#A06010">
        bisa dilakukan usia 4–5 tahun bila alat dibuat terjangkau
      </text>
    </svg>
  );
}
