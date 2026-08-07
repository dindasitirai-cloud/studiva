import React from 'react';

// Five domains arranged around a central label
const DOMAINS = [
  { label: "Fisik-motorik",         x: 300, y: 42,  fill: "#E1F5EE", stroke: "#0F6E56", text: "#085041" },
  { label: "Sosial-emosional",      x: 510, y: 135, fill: "#FEF3DC", stroke: "#E8A422", text: "#854F0B" }, // amber accent
  { label: "Bahasa",                x: 430, y: 295, fill: "#E1F5EE", stroke: "#0F6E56", text: "#085041" },
  { label: "Kognitif &\ncara belajar", x: 170, y: 295, fill: "#E1F5EE", stroke: "#0F6E56", text: "#085041" },
  { label: "Kemandirian",           x: 90,  y: 135, fill: "#E1F5EE", stroke: "#0F6E56", text: "#085041" },
];

export function FigureSchoolReadinessDomains() {
  const cx = 300; const cy = 190;

  return (
    <svg
      viewBox="0 0 600 360"
      width="100%"
      role="img"
      aria-label="Lima ranah kesiapan sekolah: fisik-motorik, sosial-emosional, bahasa, kognitif, dan kemandirian"
      style={{ maxWidth: 600 }}
    >
      {/* Spoke lines */}
      {DOMAINS.map((d, i) => (
        <line key={`l-${i}`} x1={cx} y1={cy} x2={d.x} y2={d.y} stroke="#C8C5BE" strokeWidth="1.2" strokeDasharray="4 3" />
      ))}

      {/* Domain cards */}
      {DOMAINS.map((d, i) => {
        const lines = d.label.split('\n');
        const w = 140; const h = lines.length > 1 ? 56 : 40;
        return (
          <g key={`d-${i}`}>
            <rect x={d.x - w / 2} y={d.y - h / 2} width={w} height={h} rx="10" fill={d.fill} stroke={d.stroke} strokeWidth="1.6" />
            {lines.map((line, li) => (
              <text
                key={li}
                x={d.x}
                y={d.y + (lines.length > 1 ? -8 + li * 18 : 5)}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={d.text}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {/* Centre label */}
      <ellipse cx={cx} cy={cy} rx={72} ry={44} fill="#085041" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill="#FFFFFF">Siap</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="13" fontWeight="700" fill="#FFFFFF">sekolah</text>
    </svg>
  );
}
