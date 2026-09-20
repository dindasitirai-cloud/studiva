import React from 'react';
import { Link } from 'react-router-dom';
import { WAJAR_ATAU_CEK } from '../../content/beranda-copy';
import type { WajarItem } from './types';

// TODO: item dipilih sesuai age band anak dari konten Ruang Teduh

interface Props {
  item: WajarItem;
}

export default function WajarAtauCekCard({ item }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#fff',
        borderRadius: 26,
        padding: '22px 24px 20px',
        boxShadow: '0 20px 46px -36px rgba(90,50,70,.5)',
      }}
    >
      {/* Big ? watermark */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -16,
          bottom: -46,
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 170,
          lineHeight: 1,
          color: '#F5EBFA',
          pointerEvents: 'none',
          transform: 'rotate(8deg)',
          userSelect: 'none',
        }}
      >
        ?
      </div>

      {/* Decorative dots */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 16,
          right: 64,
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: '#F8B9D4',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 36,
          right: 48,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#FFD36B',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative' }}>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: '.6px',
            textTransform: 'uppercase',
            color: '#C88AAB',
            margin: 0,
          }}
        >
          {WAJAR_ATAU_CEK.eyebrow}
        </p>

        <h2
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 18,
            color: '#6E3B57',
            margin: '6px 0 14px',
            lineHeight: 1.2,
            maxWidth: '88%',
          }}
        >
          {item.pertanyaan}
        </h2>

        <Link
          to="/dashboard/tier2/ruang-teduh"
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 13,
            color: '#5F84E6',
            textDecoration: 'none',
          }}
        >
          {WAJAR_ATAU_CEK.lihatSelengkapnya}
        </Link>
      </div>
    </div>
  );
}
