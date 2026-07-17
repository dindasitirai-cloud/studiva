import React from 'react';

export function FigureMpasiTexture() {
  const stages = [
    { x: 30,  label: 'Lumat / saring',  sub: 'mulai ~6 bulan', bg: '#E1F5EE', border: '#0F6E56', fg: '#0F6E56' },
    { x: 215, label: 'Cincang lembek',  sub: '~7–8 bulan',     bg: '#FFF3CC', border: '#9B7C2A', fg: '#9B7C2A' },
    { x: 400, label: 'Finger food',     sub: '~8–9 bulan',     bg: '#FAEEDA', border: '#633806', fg: '#633806' },
  ];

  return (
    <svg
      viewBox="0 0 560 170"
      width="100%"
      role="img"
      aria-label="Tekstur MPASI naik bertahap dari lumat hingga finger food, ASI tetap dilanjutkan"
      style={{ maxWidth: 560 }}
    >
      <defs>
        <marker id="arr-mp" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#9B7C2A" />
        </marker>
      </defs>

      {/* Title */}
      <text x="280" y="16" textAnchor="middle" fontSize="12" fontWeight="600" fill="#9B7C2A">
        Tekstur MPASI dinaikkan bertahap
      </text>

      {/* Rising baseline to show progression */}
      <path d="M 30 100 L 215 85 L 400 70" fill="none" stroke="#D4A017" strokeWidth="1.2" strokeDasharray="4,3" />

      {/* Nodes */}
      {stages.map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={22 + i * 14} width="145" height="58" rx="10"
            fill={s.bg} stroke={s.border} strokeWidth="1.5" />
          <text x={s.x + 72} y={22 + i * 14 + 26} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={s.fg}>
            {s.label}
          </text>
          <text x={s.x + 72} y={22 + i * 14 + 43} textAnchor="middle" fontSize="10.5" fill={s.fg}>
            {s.sub}
          </text>
        </g>
      ))}

      {/* Arrows */}
      <line x1="177" y1="57" x2="211" y2="57" stroke="#9B7C2A" strokeWidth="1.8" markerEnd="url(#arr-mp)" />
      <line x1="362" y1="57" x2="396" y2="57" stroke="#9B7C2A" strokeWidth="1.8" markerEnd="url(#arr-mp)" />

      {/* Iron priority badge */}
      <rect x="30" y="118" width="160" height="24" rx="7" fill="#FAEEDA" stroke="#633806" strokeWidth="1.2" />
      <text x="110" y="133" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#633806">
        Utamakan makanan kaya zat besi
      </text>

      {/* ASI continues banner */}
      <rect x="210" y="118" width="340" height="24" rx="7" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="1.2" />
      <text x="380" y="133" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#0F6E56">
        ASI tetap dilanjutkan berdampingan
      </text>

      <text x="280" y="158" textAnchor="middle" fontSize="10" fill="#888">
        Ikuti isyarat lapar dan kenyang bayi (responsive feeding)
      </text>
    </svg>
  );
}
