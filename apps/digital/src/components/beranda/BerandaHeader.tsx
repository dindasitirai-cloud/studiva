import React from 'react';
import { SAPAAN } from '../../content/beranda-copy';
import type { PeranSingkat, Waktu } from '../../content/beranda-copy';

interface Props {
  peran: PeranSingkat;
  waktu: Waktu;
  namaAnak: string;
  usiaTeks: string;
  inisial: string;
}

// TODO: ambil peran, nama anak, dan usia dari profil aktif

export default function BerandaHeader({ peran, waktu, namaAnak, usiaTeks, inisial }: Props) {
  const sapaan = SAPAAN[peran][waktu];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      {/* Sapaan */}
      <div>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: '.6px',
            textTransform: 'uppercase',
            color: '#C88AAB',
            margin: 0,
          }}
        >
          {sapaan.baris1}
        </p>
        <h1
          style={{
            fontFamily: "'Shantell Sans', cursive",
            fontWeight: 700,
            fontSize: 28,
            color: '#6E3B57',
            margin: '6px 0 0',
            letterSpacing: '-.4px',
            lineHeight: 1.15,
          }}
        >
          {sapaan.baris2}
        </h1>
      </div>

      {/* Baris anak — pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#fff',
          borderRadius: 999,
          padding: '8px 16px 8px 8px',
          boxShadow: '0 14px 34px -30px rgba(90,50,70,.6)',
          flexShrink: 0,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#F06BA8',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {inisial}
        </div>
        <div style={{ lineHeight: 1.15 }}>
          <p
            style={{
              fontFamily: 'Fredoka, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 16,
              color: '#6E3B57',
              margin: 0,
            }}
          >
            {namaAnak}
          </p>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 12,
              color: '#B79AAC',
              margin: 0,
            }}
          >
            {usiaTeks}
          </p>
        </div>
      </div>
    </div>
  );
}
