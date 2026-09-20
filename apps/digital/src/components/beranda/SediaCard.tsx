import React from 'react';
import BotanicalStem from '../BotanicalStem';
import { SEDIA } from '../../content/beranda-copy';

// TODO: data Sedia diambil dari tabel konten_sedia sesuai usia anak

interface SediaData {
  hariLagi: number;
  judul: string;
  deskripsi: string;
}

interface Props {
  sedia: SediaData;
}

export default function SediaCard({ sedia }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#FFF2CE 0%,#FCE3EE 100%)',
        borderRadius: 26,
        padding: '22px 24px',
        boxShadow: '0 20px 46px -36px rgba(90,50,70,.5)',
      }}
    >
      {/* Botanical decoration top-right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -8,
          right: 14,
          width: 52,
          height: 82,
          opacity: 0.9,
          transformOrigin: 'bottom center',
          animation: 'sway 7s ease-in-out infinite',
        }}
      >
        <BotanicalStem
          cfg={{ type: 'bell', bloom: '#FFE29A', bloom2: '#F06BA8', center: '#6E3B57', stem: '#6E3B57', stemDark: '#5A2F49', leaf: '#8A5A74', leaf2: '#A87E96' }}
        />
      </div>

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
        {SEDIA.eyebrow(sedia.hariLagi)}
      </p>

      <h2
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 20,
          color: '#6E3B57',
          margin: '5px 0 0',
          maxWidth: '80%',
        }}
      >
        {sedia.judul}
      </h2>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          color: '#7A5A6E',
          margin: '8px 0 0',
          lineHeight: 1.55,
        }}
      >
        {sedia.deskripsi}
      </p>

      <button
        type="button"
        style={{
          marginTop: 16,
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 14,
          color: '#fff',
          background: '#F06BA8',
          border: 'none',
          borderRadius: 999,
          padding: '11px 22px',
          cursor: 'pointer',
          boxShadow: '0 12px 22px -12px rgba(240,107,168,.9)',
          display: 'block',
        }}
      >
        {SEDIA.chipBersama}
      </button>
    </div>
  );
}
