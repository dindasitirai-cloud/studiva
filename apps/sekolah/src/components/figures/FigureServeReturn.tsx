import React from 'react';

export function FigureServeReturn() {
  return (
    <svg
      viewBox="0 0 600 250"
      width="100%"
      role="img"
      aria-label="Siklus serve and return empat langkah"
      style={{ maxWidth: 600 }}
    >
      <defs>
        <marker id="ah-sr" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#888780" />
        </marker>
      </defs>
      {/* Center label */}
      <text x="300" y="130" textAnchor="middle" fontSize="13" fill="#854F0B" fontWeight="500">
        otak berkembang
      </text>
      {/* Nodes */}
      {[
        { x: 30,  y: 18,  t: "1 · Bayi memberi sinyal",  s: "menatap · mengoceh · menangis" },
        { x: 370, y: 18,  t: "2 · Anda menanggapi",      s: "tatapan · kata · gendongan" },
        { x: 370, y: 174, t: "3 · Bayi merespons",        s: "bersuara · tersenyum" },
        { x: 30,  y: 174, t: "4 · Koneksi otak menguat", s: "bahasa · emosi · sosial" },
      ].map((n, i) => (
        <g key={i}>
          <rect x={n.x} y={n.y} width="200" height="58" rx="10" fill="#E1F5EE" />
          <text x={n.x + 100} y={n.y + 24} textAnchor="middle" fontSize="13" fontWeight="500" fill="#0F6E56">
            {n.t}
          </text>
          <text x={n.x + 100} y={n.y + 42} textAnchor="middle" fontSize="11" fill="#0F6E56">
            {n.s}
          </text>
        </g>
      ))}
      {/* Arrows */}
      <line x1="230" y1="47"  x2="366" y2="47"  stroke="#888780" strokeWidth="1.6" markerEnd="url(#ah-sr)" />
      <line x1="470" y1="76"  x2="470" y2="170" stroke="#888780" strokeWidth="1.6" markerEnd="url(#ah-sr)" />
      <line x1="370" y1="203" x2="234" y2="203" stroke="#888780" strokeWidth="1.6" markerEnd="url(#ah-sr)" />
      <line x1="130" y1="174" x2="130" y2="80"  stroke="#888780" strokeWidth="1.6" markerEnd="url(#ah-sr)" />
    </svg>
  );
}
