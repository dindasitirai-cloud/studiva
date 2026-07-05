import React from 'react';

export function FigureObjectPermanence() {
  const nodes = [
    { x: 30,  label: 'Mainan terlihat',        sub: 'bayi memperhatikan' },
    { x: 210, label: 'Ditutup kain',            sub: 'mainan menghilang'  },
    { x: 390, label: 'Bayi menyingkap',         sub: 'mencari dan menemukan' },
  ];

  return (
    <svg
      viewBox="0 0 560 140"
      width="100%"
      role="img"
      aria-label="Tiga tahap object permanence: mainan terlihat, ditutup kain, bayi menyingkap dan mencari"
      style={{ maxWidth: 560 }}
    >
      <defs>
        <marker id="arr-op" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#0F6E56" />
        </marker>
      </defs>

      {/* Header */}
      <text x="280" y="16" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0F6E56">
        Object permanence: benda tetap ada meski tak terlihat
      </text>

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x} y={26} width="160" height="70" rx="12" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="1.5" />
          {/* Number badge */}
          <circle cx={n.x + 20} cy={44} r="13" fill="#0F6E56" />
          <text x={n.x + 20} y={44 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="white">{i + 1}</text>
          <text x={n.x + 80} y={60} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F6E56">{n.label}</text>
          <text x={n.x + 80} y={78} textAnchor="middle" fontSize="10.5" fill="#0F6E56">{n.sub}</text>
        </g>
      ))}

      {/* Arrows */}
      <line x1="192" y1="61" x2="206" y2="61" stroke="#0F6E56" strokeWidth="2" markerEnd="url(#arr-op)" />
      <line x1="372" y1="61" x2="386" y2="61" stroke="#0F6E56" strokeWidth="2" markerEnd="url(#arr-op)" />

      {/* Footer note */}
      <text x="280" y="120" textAnchor="middle" fontSize="11" fill="#888">
        Ciluk-ba dan permainan menyembunyikan benda melatih kemampuan ini
      </text>
    </svg>
  );
}
