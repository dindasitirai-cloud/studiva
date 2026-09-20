import React, { useState } from 'react';
import type { CuacaHati as Cuaca, Peran } from '../types';
import {
  CP_LANGIT_PERTANYAAN_IBU,
  CP_LANGIT_PERTANYAAN_AYAH,
  CP_LANGIT_SUBTEKS,
  CP_LANGIT_LABEL,
  CP_LANGIT_TOMBOL_RIWAYAT,
  CP_RESPONS_CUACA,
} from '../copy';
import RiwayatLangit from './RiwayatLangit';

// TODO: simpan ke Supabase tabel langit_harian (user_id, tanggal, cuaca)

const URUTAN_CUACA: Cuaca[] = ['cerah', 'berawan', 'mendung', 'hujan', 'badai'];

const WARNA_CUACA: Record<Cuaca, { bg: string; border: string; dot: string }> = {
  cerah:   { bg: '#FBE3A8', border: '#F6B860', dot: '#F6B860' },
  berawan: { bg: '#EFF5FD', border: '#9BB8E8', dot: '#9BB8E8' },
  mendung: { bg: '#F7F3FB', border: '#C9B6E4', dot: '#C9B6E4' },
  hujan:   { bg: '#EBF3FE', border: '#8FB8F7', dot: '#8FB8F7' },
  badai:   { bg: '#FFF0F3', border: '#F06BA8', dot: '#F06BA8' },
};

interface PropsLangitHariIni {
  peran: Peran;
  hariIni: string;
  /** Dipanggil saat respons badai ingin menggulir ke kartu Setelah Badai */
  onBukaSetelahBadai?: () => void;
}

export default function LangitHariIni({ peran, hariIni, onBukaSetelahBadai }: PropsLangitHariIni) {
  const [pilihan, setPilihan] = useState<Cuaca | null>(null);
  const [tampilRiwayat, setTampilRiwayat] = useState(false);

  // TODO: simpan ke Supabase tabel langit_harian (user_id, tanggal, cuaca)
  function pilihCuaca(c: Cuaca) {
    // Ketuk yang sama = batal; ganti pilihan = timpa
    setPilihan(prev => (prev === c ? null : c));
  }

  if (tampilRiwayat) {
    return (
      <RiwayatLangit
        hariIni={hariIni}
        onTutup={() => setTampilRiwayat(false)}
      />
    );
  }

  const pertanyaan =
    peran === 'ayah' ? CP_LANGIT_PERTANYAAN_AYAH : CP_LANGIT_PERTANYAAN_IBU;

  const respons = pilihan ? CP_RESPONS_CUACA[pilihan] : null;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '18px 20px 16px',
        border: '1px solid rgba(240,107,168,.12)',
      }}
    >
      <p
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 17,
          fontWeight: 600,
          color: '#3A2530',
          margin: '0 0 4px',
        }}
      >
        {pertanyaan}
      </p>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          color: '#A98DA0',
          margin: '0 0 14px',
        }}
      >
        {CP_LANGIT_SUBTEKS}
      </p>

      {/* Lima tombol cuaca */}
      <div
        role="group"
        aria-label="Pilih cuaca hati hari ini"
        style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
      >
        {URUTAN_CUACA.map(c => {
          const dipilih = pilihan === c;
          const warna = WARNA_CUACA[c];
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={dipilih}
              onClick={() => pilihCuaca(c)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 14px',
                minHeight: 44,
                borderRadius: 999,
                border: `1.5px solid ${dipilih ? warna.border : 'rgba(240,107,168,.15)'}`,
                background: dipilih ? warna.bg : '#FAFAFA',
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 13,
                fontWeight: dipilih ? 700 : 600,
                color: dipilih ? '#3A2530' : '#8A7A80',
                cursor: 'pointer',
                transition: 'background 140ms ease, border-color 140ms ease',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: dipilih ? warna.dot : '#C0A6B7',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              {CP_LANGIT_LABEL[c]}
            </button>
          );
        })}
      </div>

      {/* Respons setelah memilih */}
      {respons && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid rgba(240,107,168,.08)',
          }}
          aria-live="polite"
        >
          <p
            style={{
              fontFamily: 'Shantell Sans, cursive',
              fontStyle: 'italic',
              fontSize: 14,
              color: '#6E3B57',
              margin: '0 0 4px',
            }}
          >
            {respons.penanda}
          </p>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              color: '#6E3B57',
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {respons.isi}
          </p>

          {/* Tautan ke Setelah Badai — hanya saat badai dipilih */}
          {pilihan === 'badai' && onBukaSetelahBadai && (
            <button
              type="button"
              onClick={onBukaSetelahBadai}
              style={{
                marginTop: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'none',
                border: '1.5px solid #F06BA8',
                borderRadius: 999,
                padding: '7px 14px',
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: '#F06BA8',
                cursor: 'pointer',
              }}
            >
              Buka Setelah Badai
            </button>
          )}
        </div>
      )}

      {/* Tombol riwayat — tidak pernah terbuka otomatis */}
      <button
        type="button"
        onClick={() => setTampilRiwayat(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          marginTop: 14,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 700,
          color: '#A98DA0',
          padding: 0,
        }}
      >
        {CP_LANGIT_TOMBOL_RIWAYAT}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
