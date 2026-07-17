import React from 'react';

export function FigureInjuryByAge() {
  const cards = [
    { age: "0–1 thn", risks: "Jatuh & tersedak", color: "#E6F1FB", border: "#185FA5", text: "#0C447C" },
    { age: "1–3 thn", risks: "Air, panas & racun", color: "#E1F5EE", border: "#0F6E56", text: "#085041" },
    { age: "3–6 thn", risks: "Jalan raya & sepeda", color: "#FEF3DC", border: "#E8A422", text: "#854F0B" },
  ];
  const W = 160; const GAP = 22;
  const total = cards.length * W + (cards.length - 1) * GAP;
  const sx = (600 - total) / 2;

  return (
    <svg
      viewBox="0 0 600 200"
      width="100%"
      role="img"
      aria-label="Tiga kartu risiko cedera per kelompok usia: 0-1 tahun, 1-3 tahun, 3-6 tahun"
      style={{ maxWidth: 600 }}
    >
      <text x="300" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fill="#444441">
        Risiko cedera bergeser seiring usia
      </text>
      {cards.map((c, i) => {
        const x = sx + i * (W + GAP);
        return (
          <g key={i}>
            <rect x={x} y={44} width={W} height={110} rx="12" fill={c.color} stroke={c.border} strokeWidth="1.8" />
            <text x={x + W / 2} y={72} textAnchor="middle" fontSize="11" fontWeight="700" fill={c.text}>
              {c.age}
            </text>
            <line x1={x + 20} y1={80} x2={x + W - 20} y2={80} stroke={c.border} strokeWidth="1" opacity="0.5" />
            <text x={x + W / 2} y={104} textAnchor="middle" fontSize="12" fontWeight="600" fill={c.text}>
              {c.risks}
            </text>
          </g>
        );
      })}
      <text x="300" y="178" textAnchor="middle" fontSize="11" fill="#444441">
        Pencegahan selalu selangkah di depan kemampuan baru anak
      </text>
    </svg>
  );
}
