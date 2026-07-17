import React from 'react';

export function FigureTemperamentFit() {
  return (
    <svg
      viewBox="0 0 600 210"
      width="100%"
      role="img"
      aria-label="Goodness of fit: dua potongan puzzle saling mengunci antara temperamen anak dan gaya pengasuhan"
      style={{ maxWidth: 600 }}
    >
      {/* Left puzzle piece — temperamen anak */}
      <path
        d="M 90,50 L 220,50 L 220,90 Q 240,80 260,90 Q 240,100 220,90 L 220,150 L 90,150 Z"
        fill="#E1F5EE" stroke="#0F6E56" strokeWidth="2"
      />
      <text x="155" y="96" textAnchor="middle" fontSize="13" fontWeight="600" fill="#085041">Temperamen</text>
      <text x="155" y="114" textAnchor="middle" fontSize="11" fill="#085041">anak</text>

      {/* Right puzzle piece — gaya pengasuhan */}
      <path
        d="M 260,50 L 510,50 L 510,150 L 260,150 L 260,100 Q 240,110 220,100 Q 240,90 260,100 Z"
        fill="#FEF3DC" stroke="#E8A422" strokeWidth="2"
      />
      <text x="385" y="96" textAnchor="middle" fontSize="13" fontWeight="600" fill="#854F0B">Gaya pengasuhan</text>

      {/* Bottom label */}
      <rect x="165" y="165" width="270" height="34" rx="8" fill="#085041" />
      <text x="300" y="187" textAnchor="middle" fontSize="13" fontWeight="600" fill="#FFFFFF">
        goodness of fit
      </text>
    </svg>
  );
}
