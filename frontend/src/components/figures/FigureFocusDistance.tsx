import React from 'react';

export function FigureFocusDistance() {
  return (
    <svg
      viewBox="0 0 500 180"
      width="100%"
      role="img"
      aria-label="Jarak fokus bayi baru lahir sekitar 20–30 cm, persis jarak wajah pengasuh saat menggendong"
      style={{ maxWidth: 500 }}
    >
      {/* Caregiver face (left) */}
      <circle cx="80" cy="90" r="52" fill="#FFF3CC" stroke="#D4A017" strokeWidth="2" />
      <text x="80" y="80" textAnchor="middle" fontSize="26">😊</text>
      <text x="80" y="108" textAnchor="middle" fontSize="11" fontWeight="600" fill="#9B7C2A">Pengasuh</text>
      <text x="80" y="122" textAnchor="middle" fontSize="10" fill="#9B7C2A">(wajah Anda)</text>

      {/* Baby face (right) */}
      <circle cx="420" cy="90" r="52" fill="#FFF3CC" stroke="#D4A017" strokeWidth="2" />
      <text x="420" y="80" textAnchor="middle" fontSize="26">👶</text>
      <text x="420" y="108" textAnchor="middle" fontSize="11" fontWeight="600" fill="#9B7C2A">Bayi</text>
      <text x="420" y="122" textAnchor="middle" fontSize="10" fill="#9B7C2A">(mata baru)</text>

      {/* Distance line */}
      <line x1="135" y1="90" x2="365" y2="90" stroke="#D4A017" strokeWidth="1.8" strokeDasharray="6,4" />
      {/* Tick marks */}
      <line x1="135" y1="80" x2="135" y2="100" stroke="#D4A017" strokeWidth="2" />
      <line x1="365" y1="80" x2="365" y2="100" stroke="#D4A017" strokeWidth="2" />

      {/* Label */}
      <rect x="190" y="72" width="120" height="36" rx="8" fill="#FFF3CC" stroke="#D4A017" strokeWidth="1.5" />
      <text x="250" y="89" textAnchor="middle" fontSize="15" fontWeight="700" fill="#9B7C2A">±20–30 cm</text>
      <text x="250" y="103" textAnchor="middle" fontSize="10" fill="#9B7C2A">zona fokus terbaik</text>

      {/* Caption */}
      <text x="250" y="160" textAnchor="middle" fontSize="11" fill="#888">
        Bayi baru lahir hanya bisa fokus pada jarak ini — persis jarak wajah Anda
      </text>
    </svg>
  );
}
