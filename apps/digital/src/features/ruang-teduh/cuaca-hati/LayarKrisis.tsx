import React from 'react';
import { LAYAR_KRISIS } from '../content';

interface PropsLayarKrisis {
  onTutup: () => void;
}

/**
 * Layar krisis. Hanya satu arah tindakan.
 * Tidak boleh menampilkan tombol chat, kartu bacaan,
 * latihan pernapasan, atau saran perawatan mandiri.
 */
export default function LayarKrisis({ onTutup }: PropsLayarKrisis) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={LAYAR_KRISIS.judul}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(58,37,48,.5)',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '32px 28px 28px',
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 24px 48px -12px rgba(58,37,48,.3)',
        }}
      >
        <h2
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 22,
            fontWeight: 600,
            color: '#3A2530',
            margin: '0 0 16px',
            lineHeight: 1.25,
          }}
        >
          {LAYAR_KRISIS.judul}
        </h2>

        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 15,
            color: '#3A2530',
            margin: '0 0 28px',
            lineHeight: 1.6,
          }}
        >
          {LAYAR_KRISIS.isi}
        </p>

        <button
          type="button"
          onClick={onTutup}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 14,
            border: '1.5px solid #C0A6B7',
            background: '#fff',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: '#8A7A80',
            cursor: 'pointer',
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
