import React from 'react';

export function FigureExecutiveFunction() {
  const cards = [
    { label: "Memori kerja", sub: "simpan & pakai info" },
    { label: "Kontrol diri", sub: "tahan dorongan" },
    { label: "Fleksibilitas", sub: "berpindah sudut pandang" },
  ];
  const W = 180; const GAP = 20; const totalW = cards.length * W + (cards.length - 1) * GAP;
  const startX = (600 - totalW) / 2;

  return (
    <svg
      viewBox="0 0 600 230"
      width="100%"
      role="img"
      aria-label="Tiga keterampilan inti fungsi eksekutif: memori kerja, kontrol diri, fleksibilitas"
      style={{ maxWidth: 600 }}
    >
      {/* Header */}
      <text x="300" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0F6E56">
        Menara kontrol otak
      </text>
      {/* Cards */}
      {cards.map((c, i) => {
        const x = startX + i * (W + GAP);
        return (
          <g key={i}>
            <rect x={x} y={50} width={W} height={80} rx="10" fill="#E1F5EE" />
            <text x={x + W / 2} y={88} textAnchor="middle" fontSize="13" fontWeight="600" fill="#085041">
              {c.label}
            </text>
            <text x={x + W / 2} y={108} textAnchor="middle" fontSize="11" fill="#085041">
              {c.sub}
            </text>
          </g>
        );
      })}
      {/* Brace line under cards */}
      <line x1={startX + W / 2} y1={138} x2={startX + 2 * (W + GAP) + W / 2} y2={138} stroke="#0F6E56" strokeWidth="2" />
      <line x1="300" y1="138" x2="300" y2="158" stroke="#0F6E56" strokeWidth="2" />
      {/* Bottom label */}
      <rect x="160" y="162" width="280" height="40" rx="8" fill="#085041" />
      <text x="300" y="187" textAnchor="middle" fontSize="13" fontWeight="600" fill="#FFFFFF">
        Fondasi belajar & kesiapan sekolah
      </text>
    </svg>
  );
}
