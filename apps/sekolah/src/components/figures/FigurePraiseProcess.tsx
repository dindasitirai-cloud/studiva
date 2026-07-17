import React from 'react';

export function FigurePraiseProcess() {
  return (
    <svg
      viewBox="0 0 600 210"
      width="100%"
      role="img"
      aria-label="Dua balon ucapan: kiri pudar bertanda silang 'Kamu memang pintar', kanan menonjol bertanda centang 'Kamu mencoba terus sampai bisa'"
      style={{ maxWidth: 600 }}
    >
      {/* Left bubble — label praise (dimmed) */}
      <rect x="30" y="40" width="230" height="100" rx="14" fill="#F1EFE8" stroke="#C4BFB2" strokeWidth="1.5" />
      {/* Tail */}
      <polygon points="120,140 100,168 145,140" fill="#F1EFE8" stroke="#C4BFB2" strokeWidth="1.5" />
      {/* ✗ badge */}
      <circle cx="48" cy="52" r="10" fill="#E07070" />
      <text x="48" y="57" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">✕</text>
      <text x="145" y="82" textAnchor="middle" fontSize="11" fill="#888780">Pujian label</text>
      <text x="145" y="100" textAnchor="middle" fontSize="12" fontWeight="600" fill="#888780">"Kamu memang</text>
      <text x="145" y="118" textAnchor="middle" fontSize="12" fontWeight="600" fill="#888780">pintar"</text>

      {/* Right bubble — process praise (bold) */}
      <rect x="340" y="40" width="230" height="100" rx="14" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="2" />
      {/* Tail */}
      <polygon points="420,140 395,168 450,140" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="2" />
      {/* ✓ badge */}
      <circle cx="358" cy="52" r="10" fill="#0F6E56" />
      <text x="358" y="57" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">✓</text>
      <text x="455" y="82" textAnchor="middle" fontSize="11" fill="#085041">Pujian proses</text>
      <text x="455" y="100" textAnchor="middle" fontSize="12" fontWeight="600" fill="#085041">"Kamu mencoba</text>
      <text x="455" y="118" textAnchor="middle" fontSize="12" fontWeight="600" fill="#085041">terus sampai bisa"</text>

      {/* Bottom labels */}
      <text x="145" y="185" textAnchor="middle" fontSize="10" fill="#888780">→ menghindari tantangan</text>
      <text x="455" y="185" textAnchor="middle" fontSize="10" fill="#0F6E56">→ berani mencoba hal sulit</text>
    </svg>
  );
}
