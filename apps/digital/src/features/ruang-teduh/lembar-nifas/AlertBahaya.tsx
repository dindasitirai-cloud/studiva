import React from 'react';
import type { KondisiNifas } from '../types';
import {
  ALERT_BAHAYA_JUDUL,
  ALERT_BAHAYA_MENDESAK,
  ALERT_BAHAYA_CATATAN,
} from '../content';

interface PropsAlertBahaya {
  kondisi: KondisiNifas[];
  onTutup: () => void;
}

/**
 * Respons tanda bahaya masa nifas.
 * Tidak boleh berisi saran perawatan mandiri, kalimat penenang, atau tautan chat.
 * Hanya satu arah tindakan.
 */
export default function AlertBahaya({ kondisi, onTutup }: PropsAlertBahaya) {
  const labelGabung = kondisi
    .map((k, i) => {
      const hurufPertamaKecil = k.label.charAt(0).toLowerCase() + k.label.slice(1);
      return i < kondisi.length - 1 ? hurufPertamaKecil + '; ' : hurufPertamaKecil + '.';
    })
    .join('');

  return (
    <div
      role="alert"
      style={{
        background: '#FFF0F3',
        border: '2px solid #E58BA8',
        borderRadius: 16,
        padding: '18px 18px 14px',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <h3
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 17,
            fontWeight: 600,
            color: '#9B3A52',
            margin: '0 0 8px',
          }}
        >
          {ALERT_BAHAYA_JUDUL}
        </h3>

        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup peringatan"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#A98DA0',
            padding: 2,
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 13,
          color: '#6E3B57',
          margin: '0 0 8px',
          lineHeight: 1.5,
        }}
      >
        Ibu mencatat: {labelGabung}
      </p>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 800,
          color: '#9B3A52',
          margin: '0 0 10px',
        }}
      >
        {ALERT_BAHAYA_MENDESAK}
      </p>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          color: '#C0A6B7',
          margin: 0,
        }}
      >
        {ALERT_BAHAYA_CATATAN}
      </p>
    </div>
  );
}
