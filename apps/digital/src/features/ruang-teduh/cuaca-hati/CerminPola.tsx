import React, { useState } from 'react';
import {
  CERMIN_POLA_JUDUL,
  CERMIN_POLA_ISI,
  CERMIN_TOMBOL_PENDAMPING,
  CERMIN_TOMBOL_JADWAL,
  CERMIN_CATATAN_KAKI,
  CERMIN_PENDAMPING_SEMENTARA,
} from '../content';

interface PropsCerminPola {
  onScrollKeJadwal: () => void;
}

export default function CerminPola({ onScrollKeJadwal }: PropsCerminPola) {
  const [pesanPendamping, setPesanPendamping] = useState(false);

  return (
    <div
      style={{
        background: '#FFF5F7',
        border: '1.5px solid #F7C9D3',
        borderRadius: 18,
        padding: '20px 20px 16px',
        marginTop: 20,
      }}
    >
      <h3
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 17,
          fontWeight: 600,
          color: '#3A2530',
          margin: '0 0 10px',
          lineHeight: 1.3,
        }}
      >
        {CERMIN_POLA_JUDUL}
      </h3>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 13,
          color: '#6E3B57',
          margin: '0 0 16px',
          lineHeight: 1.6,
        }}
      >
        {CERMIN_POLA_ISI}
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setPesanPendamping(p => !p)}
          style={{
            padding: '9px 16px',
            borderRadius: 999,
            border: '1.5px solid #E0526B',
            background: '#fff',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#E0526B',
            cursor: 'pointer',
          }}
        >
          {CERMIN_TOMBOL_PENDAMPING}
        </button>

        <button
          type="button"
          onClick={onScrollKeJadwal}
          style={{
            padding: '9px 16px',
            borderRadius: 999,
            border: '1.5px solid rgba(224,82,107,.3)',
            background: '#FFF0F3',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#9B3A52',
            cursor: 'pointer',
          }}
        >
          {CERMIN_TOMBOL_JADWAL}
        </button>
      </div>

      {pesanPendamping && (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 12,
            border: '1px solid rgba(224,82,107,.15)',
          }}
        >
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              color: '#8A7A80',
              margin: 0,
            }}
          >
            {/* TODO: backend — hubungkan ke fitur Partner Orang Tua */}
            {CERMIN_PENDAMPING_SEMENTARA}
          </p>
        </div>
      )}

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          color: '#C0A6B7',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {CERMIN_CATATAN_KAKI}
      </p>
    </div>
  );
}
