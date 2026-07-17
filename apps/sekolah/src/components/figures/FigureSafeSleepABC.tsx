import React from 'react';

export function FigureSafeSleepABC() {
  const cards = [
    { letter: 'A', title: 'Alone / Sendiri', sub1: 'Bayi tidur sendiri', sub2: 'di tempatnya', note: 'Kamar sama, kasur terpisah', emoji: '🛏️' },
    { letter: 'B', title: 'Back / Telentang', sub1: 'Selalu tidurkan', sub2: 'telentang', note: '"Back to sleep, tummy to play"', emoji: '👶' },
    { letter: 'C', title: 'Crib / Boks', sub1: 'Alas datar & keras,', sub2: 'tanpa barang ekstra', note: 'Tanpa bantal, boneka, selimut', emoji: '🪹' },
  ];

  return (
    <svg
      viewBox="0 0 560 210"
      width="100%"
      role="img"
      aria-label="Prinsip tidur aman bayi: Alone (sendiri), Back (telentang), Crib (boks datar)"
      style={{ maxWidth: 560 }}
    >
      {/* Header */}
      <text x="280" y="18" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0C447C">
        Prinsip Tidur Aman Bayi
      </text>

      {cards.map((card, i) => {
        const x = 15 + i * 182;
        return (
          <g key={card.letter}>
            {/* Card bg */}
            <rect x={x} y={28} width="170" height="170" rx="14" fill="#E6F1FB" stroke="#C0D8F0" strokeWidth="1.5" />
            {/* Letter badge */}
            <circle cx={x + 26} cy={52} r="16" fill="#2E8BC9" />
            <text x={x + 26} y={52 + 6} textAnchor="middle" fontSize="16" fontWeight="800" fill="white">{card.letter}</text>
            {/* Emoji */}
            <text x={x + 122} y={62} textAnchor="middle" fontSize="28">{card.emoji}</text>
            {/* Title */}
            <text x={x + 85} y={94} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0C447C">{card.title}</text>
            {/* Sub-text lines */}
            <text x={x + 85} y={112} textAnchor="middle" fontSize="11" fill="#1a4f7a">{card.sub1}</text>
            <text x={x + 85} y={126} textAnchor="middle" fontSize="11" fill="#1a4f7a">{card.sub2}</text>
            {/* Note box */}
            <rect x={x + 8} y={148} width="154" height="38" rx="8" fill="#C0D8F0" />
            <text x={x + 85} y={163} textAnchor="middle" fontSize="9.5" fill="#0C447C">{card.note.length > 26 ? card.note.slice(0, 26) : card.note}</text>
            {card.note.length > 26 && (
              <text x={x + 85} y={179} textAnchor="middle" fontSize="9.5" fill="#0C447C">{card.note.slice(26)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
