import React from 'react';

export function FigurePreLiteracyPath() {
  const nodes = [
    { label: "Dengar bunyi & rima", sub: "kesadaran fonologis" },
    { label: "Kenal buku & huruf", sub: "print awareness" },
    { label: "Coretan pra-menulis", sub: "latihan motorik halus" },
  ];
  const nodeW = 160; const nodeH = 70; const gap = 30;
  const totalW = nodes.length * nodeW + (nodes.length - 1) * gap;
  const startX = (600 - totalW) / 2;

  return (
    <svg
      viewBox="0 0 600 200"
      width="100%"
      role="img"
      aria-label="Jalur pra-literasi: dari bunyi dan rima menuju coretan pra-menulis"
      style={{ maxWidth: 600 }}
    >
      {/* Ribbon */}
      <rect x="60" y="168" width="480" height="22" rx="6" fill="#F5B942" opacity="0.25" />
      <text x="300" y="183" textAnchor="middle" fontSize="11" fill="#854F0B">
        dibangun di atas bahasa lisan
      </text>

      {/* Nodes + arrows */}
      {nodes.map((n, i) => {
        const x = startX + i * (nodeW + gap);
        const y = 50 + i * 20;
        return (
          <g key={i}>
            <rect x={x} y={y} width={nodeW} height={nodeH} rx="10" fill="#FEF3DC" stroke="#E8A422" strokeWidth="1.5" />
            <text x={x + nodeW / 2} y={y + 28} textAnchor="middle" fontSize="12" fontWeight="600" fill="#854F0B">
              {n.label}
            </text>
            <text x={x + nodeW / 2} y={y + 48} textAnchor="middle" fontSize="10" fill="#A06010">
              {n.sub}
            </text>
            {i < nodes.length - 1 && (
              <>
                <defs>
                  <marker id={`arr-pl-${i}`} markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 z" fill="#E8A422" />
                  </marker>
                </defs>
                <line
                  x1={x + nodeW + 2} y1={y + nodeH / 2}
                  x2={x + nodeW + gap - 2} y2={y + nodeH / 2 + 20}
                  stroke="#E8A422" strokeWidth="2"
                  markerEnd={`url(#arr-pl-${i})`}
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
