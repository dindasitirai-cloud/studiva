import React from 'react';

export function FigureMotorSequence() {
  const stages = [
    { label: 'Kepala', sub: 'menegakkan, menoleh' },
    { label: 'Bahu',   sub: 'meraih, berguling' },
    { label: 'Badan',  sub: 'duduk, berbalik' },
    { label: 'Kaki',   sub: 'merangkak, berjalan' },
  ];

  return (
    <svg
      viewBox="0 0 560 240"
      width="100%"
      role="img"
      aria-label="Arah perkembangan gerak bayi: dari kepala ke kaki (atas ke bawah) dan dari tengah ke tepi (bahu ke jari)"
      style={{ maxWidth: 560 }}
    >
      <defs>
        <marker id="arr-ms-down" markerWidth="8" markerHeight="8" refX="4" refY="2" orient="auto">
          <path d="M0,0 L4,4 L8,0" fill="none" stroke="#0F6E56" strokeWidth="1.4" />
        </marker>
        <marker id="arr-ms-side" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#9B7C2A" />
        </marker>
      </defs>

      {/* Title: cephalocaudal */}
      <text x="140" y="16" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0F6E56">Atas ke bawah (cephalocaudal)</text>

      {/* Vertical chain */}
      {stages.map((s, i) => {
        const y = 30 + i * 52;
        return (
          <g key={s.label}>
            <rect x="30" y={y} width="220" height="40" rx="10" fill="#E1F5EE" />
            <text x="140" y={y + 17} textAnchor="middle" fontSize="13" fontWeight="600" fill="#0F6E56">{s.label}</text>
            <text x="140" y={y + 31} textAnchor="middle" fontSize="10" fill="#0F6E56">{s.sub}</text>
            {i < stages.length - 1 && (
              <line
                x1="140" y1={y + 40}
                x2="140" y2={y + 51}
                stroke="#0F6E56" strokeWidth="1.6"
                markerEnd="url(#arr-ms-down)"
              />
            )}
          </g>
        );
      })}

      {/* Divider */}
      <line x1="270" y1="20" x2="270" y2="220" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,3" />

      {/* Proximodistal panel */}
      <text x="410" y="16" textAnchor="middle" fontSize="11" fontWeight="600" fill="#9B7C2A">Tengah ke tepi (proximodistal)</text>

      {[
        { label: 'Bahu / lengan atas', y: 42  },
        { label: 'Siku / lengan bawah', y: 94  },
        { label: 'Pergelangan tangan',  y: 146 },
        { label: 'Jari-jari halus',     y: 198 },
      ].map((item, i) => (
        <g key={item.label}>
          <rect x="300" y={item.y} width="220" height="34" rx="8" fill="#FFF3CC" />
          <text x="410" y={item.y + 21} textAnchor="middle" fontSize="12" fontWeight="500" fill="#9B7C2A">
            {item.label}
          </text>
          {i < 3 && (
            <line
              x1="410" y1={item.y + 34}
              x2="410" y2={item.y + 44}
              stroke="#9B7C2A" strokeWidth="1.4"
              markerEnd="url(#arr-ms-side)"
            />
          )}
        </g>
      ))}
    </svg>
  );
}
