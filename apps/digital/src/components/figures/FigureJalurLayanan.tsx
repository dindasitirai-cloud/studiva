import React from 'react';

export function FigureJalurLayanan() {
  const steps = [
    { label: "Posyandu / KPSP", sub: "pintu pertama, gratis" },
    { label: "Puskesmas", sub: "pemeriksaan & rujukan" },
    { label: "DSA / Klinik Tumbuh Kembang", sub: "asesmen mendalam" },
    { label: "Psikolog & Terapis", sub: "wicara · okupasi · fisio" },
  ];

  const W = 580;
  const cardW = 118;
  const cardH = 56;
  const gap = (W - steps.length * cardW) / (steps.length + 1);
  const y = 48;

  return (
    <svg
      viewBox={`0 0 ${W} 130`}
      width="100%"
      role="img"
      aria-label="Empat pintu layanan berjenjang: Posyandu/KPSP, Puskesmas, DSA/Klinik Tumbuh Kembang, dan Psikolog & Terapis"
      style={{ maxWidth: W }}
    >
      <defs>
        <marker id="arr-jl" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#6B21A8" />
        </marker>
      </defs>

      <text x={W / 2} y="16" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6B21A8">
        mulai dari pintu terdekat
      </text>

      {steps.map((s, i) => {
        const x = gap + i * (cardW + gap);
        const cx = x + cardW / 2;
        return (
          <g key={i}>
            <rect x={x} y={y} width={cardW} height={cardH} rx="10"
              fill="#F5F3FF" stroke="#6B21A8" strokeWidth="1.6" />
            <text x={cx} y={y + 22} textAnchor="middle" fontSize="11" fontWeight="700" fill="#4C1D95">
              {s.label}
            </text>
            <text x={cx} y={y + 38} textAnchor="middle" fontSize="9.5" fill="#7C3AED">
              {s.sub}
            </text>
            {i < steps.length - 1 && (
              <line
                x1={x + cardW + 2} y1={y + cardH / 2}
                x2={x + cardW + gap - 4} y2={y + cardH / 2}
                stroke="#6B21A8" strokeWidth="1.8" markerEnd="url(#arr-jl)"
              />
            )}
          </g>
        );
      })}

      <text x={W / 2} y={y + cardH + 22} textAnchor="middle" fontSize="10" fill="#7C3AED">
        Setiap pintu menghubungkan ke pintu berikutnya
      </text>
    </svg>
  );
}
