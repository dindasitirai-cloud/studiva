import React from 'react';
import { AnakDef } from '../data/mockJurnalData';

interface Props {
  anak: AnakDef;
  onOpen: () => void;
}

export default function BookCover({ anak, onOpen }: Props) {
  const year = new Date().getFullYear();

  return (
    <div
      className="jp-face"
      role="button"
      tabIndex={0}
      aria-label="Buka buku jurnal"
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
      style={{
        background: 'radial-gradient(circle at 82% 12%, rgba(255,255,255,.14), transparent 42%), linear-gradient(150deg, #5b6c9e, #46557f)',
        boxShadow: '0 18px 40px rgba(70,80,120,.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#fff',
        textAlign: 'center',
        padding: '34px',
        position: 'relative',
      }}
    >
      {/* Spine stitching */}
      <span
        style={{
          position: 'absolute',
          left: 14,
          top: 10,
          bottom: 10,
          width: 2,
          background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.35) 0 7px, transparent 7px 15px)',
        }}
      />
      {/* Elastic strap */}
      <span
        style={{
          position: 'absolute',
          right: 26,
          top: 0,
          bottom: 0,
          width: 9,
          background: 'rgba(240,135,106,.85)',
          borderRadius: 3,
        }}
      />

      {/* Label card */}
      <div
        style={{
          background: '#fdf8ef',
          borderRadius: 12,
          padding: '22px 26px',
          maxWidth: 300,
          boxShadow: '0 6px 16px rgba(0,0,0,.22), 0 0 0 5px rgba(253,248,239,.25)',
          transform: 'rotate(-1.5deg)',
          position: 'relative',
        }}
      >
        {/* Washi tape on label */}
        <span
          className="jp-washi-pink absolute -top-3 left-1/2 block rounded-sm"
          style={{ width: 92, height: 26, opacity: 0.95, transform: 'translateX(-50%) rotate(2deg)' }}
        />
        <h2
          className="font-caveat"
          style={{ fontSize: 38, color: '#3a4a6b', lineHeight: 1.02 }}
        >
          Catatan Harian<br />{anak.name}
        </h2>
        <div
          className="font-hand mt-1"
          style={{ fontSize: 18, color: '#7c88ab' }}
        >
          ✿ Tahun {year} ✿
        </div>
      </div>

      <div className="mt-4" style={{ fontSize: 26, letterSpacing: 10 }}>
        🌷 ⭐ 🦋
      </div>

      <div
        className="jp-bounce font-caveat mt-4"
        style={{ fontSize: 20, color: '#fdf8ef', opacity: 0.92 }}
      >
        ketuk untuk membuka 📖
      </div>
    </div>
  );
}
