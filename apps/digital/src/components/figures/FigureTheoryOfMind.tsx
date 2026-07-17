import React from 'react';

export function FigureTheoryOfMind() {
  return (
    <svg
      viewBox="0 0 600 220"
      width="100%"
      role="img"
      aria-label="Theory of mind: dua kepala berhadapan dengan balon pikiran berbeda, menggambarkan bahwa isi kepala orang lain bisa berbeda"
      style={{ maxWidth: 600 }}
    >
      {/* Left head (teal) */}
      <circle cx="145" cy="110" r="42" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="2" />
      <circle cx="145" cy="85" r="22" fill="#0F6E56" opacity="0.15" />
      {/* Left thought bubble */}
      <circle cx="80" cy="50" r="5" fill="#0F6E56" opacity="0.4" />
      <circle cx="65" cy="35" r="7" fill="#0F6E56" opacity="0.5" />
      <rect x="30" y="8" width="68" height="44" rx="10" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="1.5" />
      {/* Ball icon */}
      <circle cx="64" cy="30" r="13" fill="#0F6E56" opacity="0.7" />
      <text x="64" y="35" textAnchor="middle" fontSize="14" fill="#fff">⚽</text>
      <text x="64" y="64" textAnchor="middle" fontSize="9" fill="#085041">pikirannya</text>

      {/* Right head (amber) */}
      <circle cx="455" cy="110" r="42" fill="#FEF3DC" stroke="#E8A422" strokeWidth="2" />
      <circle cx="455" cy="85" r="22" fill="#E8A422" opacity="0.15" />
      {/* Right thought bubble */}
      <circle cx="520" cy="50" r="5" fill="#E8A422" opacity="0.4" />
      <circle cx="535" cy="35" r="7" fill="#E8A422" opacity="0.5" />
      <rect x="502" y="8" width="68" height="44" rx="10" fill="#FEF3DC" stroke="#E8A422" strokeWidth="1.5" />
      {/* Box icon */}
      <rect x="515" y="17" width="26" height="26" rx="3" fill="#E8A422" opacity="0.8" />
      <text x="536" y="64" textAnchor="middle" fontSize="9" fill="#854F0B">pikirannya</text>

      {/* Label heads */}
      <text x="145" y="168" textAnchor="middle" fontSize="11" fontWeight="600" fill="#085041">Anak A</text>
      <text x="455" y="168" textAnchor="middle" fontSize="11" fontWeight="600" fill="#854F0B">Anak B</text>

      {/* Central label */}
      <rect x="195" y="95" width="210" height="34" rx="8" fill="#085041" />
      <text x="300" y="117" textAnchor="middle" fontSize="12" fontWeight="600" fill="#FFFFFF">
        pikiran orang lain bisa berbeda
      </text>

      {/* Arrows facing each other */}
      <defs>
        <marker id="arr-tom-l" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#0F6E56" />
        </marker>
        <marker id="arr-tom-r" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L6,3 L0,6 z" fill="#E8A422" />
        </marker>
      </defs>
      <line x1="193" y1="112" x2="155" y2="112" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr-tom-l)" />
      <line x1="407" y1="112" x2="445" y2="112" stroke="#E8A422" strokeWidth="1.5" markerEnd="url(#arr-tom-r)" />

      <text x="300" y="205" textAnchor="middle" fontSize="11" fill="#444441">
        fondasi empati, kerja sama, dan memahami cerita
      </text>
    </svg>
  );
}
