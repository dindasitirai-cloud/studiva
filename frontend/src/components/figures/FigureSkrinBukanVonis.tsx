import React from 'react';

export function FigureSkrinBukanVonis() {
  const stages = [
    { label: "Semua anak diskrining", w: 320, color: "#EDE9FE", stroke: "#7C3AED", text: "#4C1D95" },
    { label: "Sebagian dievaluasi lebih lanjut", w: 220, color: "#DDD6FE", stroke: "#6D28D9", text: "#3B0764" },
    { label: "Yang membutuhkan mendapat dukungan dini", w: 140, color: "#C4B5FD", stroke: "#5B21B6", text: "#2E1065" },
  ];

  const cx = 290;
  const h = 44;
  const gap = 14;
  const totalH = stages.length * h + (stages.length - 1) * gap;
  const topY = 24;

  return (
    <svg
      viewBox={`0 0 580 ${topY + totalH + 36}`}
      width="100%"
      role="img"
      aria-label="Corong tiga tahap: semua anak diskrining, sebagian dievaluasi, yang membutuhkan mendapat dukungan dini"
      style={{ maxWidth: 580 }}
    >
      {stages.map((s, i) => {
        const x = cx - s.w / 2;
        const y = topY + i * (h + gap);
        return (
          <g key={i}>
            <rect x={x} y={y} width={s.w} height={h} rx="10"
              fill={s.color} stroke={s.stroke} strokeWidth="1.6" />
            <text x={cx} y={y + h / 2 + 5} textAnchor="middle"
              fontSize="11.5" fontWeight="700" fill={s.text}>
              {s.label}
            </text>
          </g>
        );
      })}
      <text x={cx} y={topY + totalH + 22} textAnchor="middle"
        fontSize="11" fontWeight="600" fill="#6B21A8">
        skrining ≠ diagnosis
      </text>
    </svg>
  );
}
