import React from 'react';

export function FigureJointAttention() {
  return (
    <svg
      viewBox="0 0 520 220"
      width="100%"
      role="img"
      aria-label="Segitiga joint attention: bayi dan pengasuh sama-sama menatap satu benda, dihubungkan oleh garis pandang"
      style={{ maxWidth: 520 }}
    >
      <defs>
        <marker id="arr-ja-point" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#0F6E56" />
        </marker>
        <marker id="arr-ja-gaze" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 z" fill="#88C4B0" />
        </marker>
      </defs>

      {/* Title */}
      <text x="260" y="18" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0F6E56">
        Berbagi perhatian (joint attention)
      </text>

      {/* Benda — top center */}
      <rect x="190" y="28" width="140" height="54" rx="12" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="1.8" />
      <text x="260" y="51" textAnchor="middle" fontSize="22">🎯</text>
      <text x="260" y="70" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0F6E56">Benda / objek</text>

      {/* Bayi — bottom left */}
      <rect x="20" y="148" width="140" height="54" rx="12" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="1.8" />
      <text x="90" y="171" textAnchor="middle" fontSize="22">👶</text>
      <text x="90" y="190" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0F6E56">Bayi</text>

      {/* Pengasuh — bottom right */}
      <rect x="360" y="148" width="140" height="54" rx="12" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="1.8" />
      <text x="430" y="171" textAnchor="middle" fontSize="22">👨‍👩‍👧</text>
      <text x="430" y="190" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0F6E56">Anda / pengasuh</text>

      {/* Gaze line: Bayi -> Benda (dashed, lighter) */}
      <line x1="140" y1="160" x2="196" y2="74"
        stroke="#88C4B0" strokeWidth="1.6" strokeDasharray="5,3"
        markerEnd="url(#arr-ja-gaze)" />

      {/* Gaze line: Pengasuh -> Benda (dashed, lighter) */}
      <line x1="370" y1="160" x2="324" y2="74"
        stroke="#88C4B0" strokeWidth="1.6" strokeDasharray="5,3"
        markerEnd="url(#arr-ja-gaze)" />

      {/* Pointing arrow: Bayi -> Benda (solid, more prominent) */}
      <line x1="152" y1="152" x2="204" y2="86"
        stroke="#0F6E56" strokeWidth="2.2"
        markerEnd="url(#arr-ja-point)" />

      {/* "menunjuk" label */}
      <rect x="60" y="108" width="78" height="20" rx="6" fill="#FFF3CC" />
      <text x="99" y="122" textAnchor="middle" fontSize="10" fontWeight="600" fill="#9B7C2A">
        menunjuk
      </text>

      {/* Social connection: Bayi <-> Pengasuh */}
      <line x1="162" y1="175" x2="358" y2="175"
        stroke="#0F6E56" strokeWidth="1.4" strokeDasharray="4,4" />
      <text x="260" y="172" textAnchor="middle" fontSize="10" fill="#0F6E56" fontWeight="600">
        kontak mata
      </text>
    </svg>
  );
}
