import React from 'react';
import { Link } from 'react-router-dom';
import { KEBIASAAN_BAIK_CARD } from '../../content/beranda-copy';
import type { Kebiasaan } from './types';

// TODO: ambil daftar nilai yang dipilih orang tua dari profil keluarga
// TODO: pindahkan pilihNilaiMingguIni ke server agar konsisten lintas perangkat
// TODO: ambil kebiasaan di bawah nilai terpilih dari konten Bekal

interface Props {
  nilai: string;
  kebiasaan: Kebiasaan[];
  onToggle: (id: string) => void;
}

export default function KebiasaanBaikCard({ nilai, kebiasaan, onToggle }: Props) {
  const jumlahTercatat = kebiasaan.filter(k => k.tercatat).length;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 26,
        padding: '22px 26px 20px',
        boxShadow: '0 20px 46px -36px rgba(90,50,70,.5)',
      }}
    >
      {/* Eyebrow + hitung */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
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
          {KEBIASAAN_BAIK_CARD.eyebrow}
        </p>
        {kebiasaan.length > 0 && (
          <span
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 12,
              color: '#B79AAC',
              flexShrink: 0,
            }}
          >
            {KEBIASAAN_BAIK_CARD.hitungTercatat(jumlahTercatat, kebiasaan.length)}
          </span>
        )}
      </div>

      {/* Nama nilai */}
      <h2
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 22,
          color: '#6E3B57',
          margin: '5px 0 0',
        }}
      >
        {nilai}
      </h2>

      {/* Kalimat penjelas */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          color: '#A98DA0',
          margin: '5px 0 0',
          lineHeight: 1.5,
        }}
      >
        {KEBIASAAN_BAIK_CARD.penjelasan}
      </p>

      {/* Grid 2x2 kebiasaan */}
      {kebiasaan.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 16,
          }}
        >
          {kebiasaan.map(item => (
            <ItemKebiasaan key={item.id} item={item} onToggle={onToggle} />
          ))}
        </div>
      )}

      {/* Tautan ke Irama Hari */}
      <div style={{ marginTop: 16 }}>
        <Link
          to="/dashboard/tier2/irama-hari"
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 13,
            color: '#5F84E6',
            textDecoration: 'none',
          }}
        >
          {KEBIASAAN_BAIK_CARD.tombolIramaHari}
        </Link>
      </div>
    </div>
  );
}

function ItemKebiasaan({
  item,
  onToggle,
}: {
  item: Kebiasaan;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#FBF3F8',
        borderRadius: 14,
        padding: '11px 14px',
        cursor: 'pointer',
      }}
      onClick={() => onToggle(item.id)}
    >
      {/* Kotak centang */}
      <button
        type="button"
        role="checkbox"
        aria-checked={item.tercatat}
        aria-label={KEBIASAAN_BAIK_CARD.ariaToggle(item.judul, item.tercatat)}
        onClick={e => { e.stopPropagation(); onToggle(item.id); }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          background: item.tercatat ? '#F06BA8' : '#fff',
          border: item.tercatat ? '2px solid #F06BA8' : '2px solid #E7CFDD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          outline: 'none',
          transition: 'background .15s, border-color .15s',
        }}
      >
        {item.tercatat && (
          <svg
            aria-hidden="true"
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </button>

      {/* Konten */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14.5,
            color: item.tercatat ? '#B79AAC' : '#6E3B57',
            textDecoration: item.tercatat ? 'line-through' : 'none',
            lineHeight: 1.2,
          }}
        >
          {item.judul}
        </div>
        <div
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 11,
            color: '#B79AAC',
            marginTop: 2,
          }}
        >
          {item.waktu}{item.domain ? ` · ${item.domain}` : ''}
        </div>
      </div>
    </div>
  );
}
