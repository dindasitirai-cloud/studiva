import React from 'react';

export function FigureCauseEffect() {
  const nodes = [
    { x: 30,  label: 'Bayi bertindak',    sub: 'menggoyang kerincingan' },
    { x: 210, label: 'Sesuatu terjadi',   sub: 'bunyi / gerak / senyum' },
    { x: 390, label: 'Bayi mengulang',    sub: 'belajar sebab-akibat'   },
  ];

  return (
    <svg
      viewBox="0 0 560 170"
      width="100%"
      role="img"
      aria-label="Siklus sebab-akibat: bayi bertindak, sesuatu terjadi, bayi mengulang, lalu kembali"
      style={{ maxWidth: 560 }}
    >
      <defs>
        <marker id="arr-ce-right" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#0F6E56" />
        </marker>
        <marker id="arr-ce-back" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#BA7517" />
        </marker>
      </defs>

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x} y={30} width="160" height="62" rx="12" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="1.5" />
          <text x={n.x + 80} y={56} textAnchor="middle" fontSize="13" fontWeight="600" fill="#0F6E56">
            {n.label}
          </text>
          <text x={n.x + 80} y={74} textAnchor="middle" fontSize="10.5" fill="#0F6E56">
            {n.sub}
          </text>
        </g>
      ))}

      {/* Forward arrows */}
      <line x1="192" y1="61" x2="206" y2="61" stroke="#0F6E56" strokeWidth="2" markerEnd="url(#arr-ce-right)" />
      <line x1="372" y1="61" x2="386" y2="61" stroke="#0F6E56" strokeWidth="2" markerEnd="url(#arr-ce-right)" />

      {/* Return arc: node 3 bottom -> node 1 bottom */}
      <path
        d="M 550 92 Q 300 148 30 92"
        fill="none"
        stroke="#BA7517"
        strokeWidth="1.8"
        strokeDasharray="6,4"
        markerEnd="url(#arr-ce-back)"
      />
      <rect x="224" y="128" width="112" height="22" rx="6" fill="#FFF3CC" />
      <text x="280" y="143" textAnchor="middle" fontSize="11" fontWeight="600" fill="#9B7C2A">
        ulangi dan perkuat
      </text>
    </svg>
  );
}
