import React from 'react';
import type { CuacaHati as Cuaca } from '../types';
import { CP_RIWAYAT_JUDUL, CP_RIWAYAT_KETERANGAN, CP_RIWAYAT_TOMBOL_TUTUP } from '../copy';

// TODO: ambil data langit_harian dari Supabase (user_id, tanggal, cuaca) — 28 baris terakhir

const WARNA_TITIK: Record<Cuaca, string> = {
  cerah:   '#F6B860',
  berawan: '#9BB8E8',
  mendung: '#C9B6E4',
  hujan:   '#8FB8F7',
  badai:   '#F06BA8',
};

const LEGENDA: Array<{ cuaca: Cuaca; label: string }> = [
  { cuaca: 'cerah',   label: 'Cerah' },
  { cuaca: 'berawan', label: 'Berawan' },
  { cuaca: 'mendung', label: 'Mendung' },
  { cuaca: 'hujan',   label: 'Hujan' },
  { cuaca: 'badai',   label: 'Badai' },
];

interface PropsRiwayatLangit {
  hariIni: string;
  onTutup: () => void;
}

export default function RiwayatLangit({ hariIni, onTutup }: PropsRiwayatLangit) {
  // TODO: ganti stub ini dengan data Supabase tabel langit_harian
  const riwayatStub: Record<string, Cuaca> = {};

  // Hasilkan 28 hari ke belakang dari hariIni
  const hari28: string[] = [];
  const base = new Date(hariIni);
  for (let i = 27; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    hari28.push(d.toISOString().slice(0, 10));
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '18px 20px',
        border: '1px solid rgba(240,107,168,.12)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <p
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: '#3A2530',
            margin: 0,
          }}
        >
          {CP_RIWAYAT_JUDUL}
        </p>
        <button
          type="button"
          onClick={onTutup}
          aria-label={CP_RIWAYAT_TOMBOL_TUTUP}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            color: '#A98DA0',
            display: 'flex',
            alignItems: 'center',
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
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Grid 28 hari — 7 kolom */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
          marginBottom: 12,
        }}
        aria-label="Kalender 28 hari terakhir"
      >
        {hari28.map(tgl => {
          const cuaca = riwayatStub[tgl];
          const isHariIni = tgl === hariIni;
          return (
            <div
              key={tgl}
              title={tgl}
              aria-label={cuaca ? `${tgl}: ${cuaca}` : `${tgl}: tidak dicatat`}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 8,
                background: cuaca ? WARNA_TITIK[cuaca] + '40' : '#F5F0F3',
                border: isHariIni
                  ? '2px solid #F06BA8'
                  : '1.5px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cuaca && (
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: WARNA_TITIK[cuaca],
                    display: 'block',
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 12px',
          marginBottom: 12,
        }}
        aria-label="Legenda warna"
      >
        {LEGENDA.map(({ cuaca, label }) => (
          <div key={cuaca} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: WARNA_TITIK[cuaca],
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <span
              style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 11,
                color: '#8A7A80',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Keterangan — tidak ada rangkuman, hitungan, atau tren */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          color: '#A98DA0',
          margin: 0,
          lineHeight: 1.55,
          fontStyle: 'italic',
        }}
      >
        {CP_RIWAYAT_KETERANGAN}
      </p>
    </div>
  );
}
