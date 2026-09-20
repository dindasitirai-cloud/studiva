import React from 'react';
import BotanicalStem from '../BotanicalStem';
import { KONSULTASI } from '../../content/beranda-copy';

// TODO: nomor WhatsApp dari konfigurasi, bukan hardcode

interface Props {
  nomorWhatsapp: string;
  pesanAwal: string;
}

export default function KonsultasiCard({ nomorWhatsapp, pesanAwal }: Props) {
  const href = `https://wa.me/${nomorWhatsapp}?text=${encodeURIComponent(pesanAwal)}`;

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(150deg,#F1ECFB 0%,#FCE3EE 100%)',
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
          top: -10,
          right: 14,
          width: 50,
          height: 80,
          opacity: 0.85,
          transformOrigin: 'bottom center',
          animation: 'sway 7s ease-in-out infinite',
        }}
      >
        <BotanicalStem
          cfg={{ type: 'sprig', bloom: '#C9B8F0', bloom2: '#8FB8F7', center: '#6E3B57', stem: '#6E3B57', stemDark: '#5A2F49', leaf: '#8A5A74', leaf2: '#A87E96' }}
        />
      </div>

      {/* Label Ruang Teduh */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: '.6px',
          textTransform: 'uppercase',
          color: '#9F86C7',
          margin: 0,
        }}
      >
        Ruang Teduh
      </p>

      {/* Profil psikolog */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 12 }}>
        <div
          aria-hidden="true"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#fff',
            color: '#8E8FE0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          FE
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
            {KONSULTASI.namaPsikolog}
          </p>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 12,
              color: '#8A6E7E',
              margin: 0,
            }}
          >
            {KONSULTASI.peranPsikolog}
          </p>
        </div>
      </div>

      {/* Tombol WhatsApp */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          marginTop: 16,
          minHeight: 48,
          borderRadius: 999,
          background: '#3FB27E',
          color: '#fff',
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 12px 22px -12px rgba(63,178,126,.9)',
          transition: 'opacity .15s',
        }}
      >
        {/* WhatsApp icon */}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.4.5c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.8c.2-.2.3-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.7-.1 1.3Z" />
        </svg>
        {KONSULTASI.tombolWhatsapp}
      </a>

      {/* Catatan penafian */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          lineHeight: 1.5,
          color: 'rgba(110,59,87,.4)',
          margin: '10px 0 0',
        }}
      >
        {KONSULTASI.catatan}
      </p>
    </div>
  );
}
