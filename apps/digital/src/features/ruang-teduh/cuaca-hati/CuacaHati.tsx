import React, { useState } from 'react';
import { renderRichText } from '../../beranda-usia/renderRichText';
import type { CuacaHati as CuacaHatiType } from '../types';
import {
  CUACA_PERTANYAAN,
  CUACA_SUBTEKS,
  CUACA_LABEL,
  RESPONS_CUACA,
  KARTU_PEMICU_KRISIS,
} from '../content';
import { JALUR_KRISIS_AKTIF } from '../flags';
import { usePenyimpanan, useCatatanHari } from '../penyimpanan/PenyimpananProvider';
import LayarKrisis from './LayarKrisis';
import RiwayatCuaca from './RiwayatCuaca';

const URUTAN_CUACA: CuacaHatiType[] = ['cerah', 'berawan', 'mendung', 'hujan', 'badai'];

const WARNA_TOMBOL: Record<CuacaHatiType, { bg: string; border: string; dot: string }> = {
  cerah:   { bg: '#FBE3A8', border: '#F6B860', dot: '#F6B860' },
  berawan: { bg: '#EFF5FD', border: '#9BB8E8', dot: '#9BB8E8' },
  mendung: { bg: '#F7F3FB', border: '#C9B6E4', dot: '#C9B6E4' },
  hujan:   { bg: '#EBF3FE', border: '#8FB8F7', dot: '#8FB8F7' },
  badai:   { bg: '#FFF0F3', border: '#E58BA8', dot: '#E58BA8' },
};

interface PropsCuacaHati {
  sapaan: { low: string; cap: string };
  hariIni: string;
  onScrollKeJadwal: () => void;
}

export default function CuacaHati({ sapaan, hariIni, onScrollKeJadwal }: PropsCuacaHati) {
  const { caregiverId } = usePenyimpanan();
  const { catatan, simpan } = useCatatanHari(caregiverId, hariIni);
  const [layarKrisisTerbuka, setLayarKrisisTerbuka] = useState(false);
  const [tampilRiwayat, setTampilRiwayat] = useState(false);

  const pilihanHariIni = catatan?.cuacaHati;

  function pilihCuaca(c: CuacaHatiType) {
    simpan({ cuacaHati: c });
  }

  if (tampilRiwayat) {
    return (
      <RiwayatCuaca
        hariIni={hariIni}
        onScrollKeJadwal={() => { setTampilRiwayat(false); onScrollKeJadwal(); }}
        onTutup={() => setTampilRiwayat(false)}
      />
    );
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '18px 20px 16px',
        border: '1px solid rgba(224,82,107,.12)',
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
        {CUACA_PERTANYAAN}
      </p>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          color: '#A98DA0',
          margin: '0 0 14px',
        }}
      >
        {CUACA_SUBTEKS}
      </p>

      {/* Lima tombol cuaca */}
      <div
        role="group"
        aria-label="Pilih cuaca hati hari ini"
        style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
      >
        {URUTAN_CUACA.map(c => {
          const dipilih = pilihanHariIni === c;
          const warna = WARNA_TOMBOL[c];
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
                padding: '7px 12px',
                borderRadius: 999,
                border: `1.5px solid ${dipilih ? warna.border : 'rgba(224,82,107,.15)'}`,
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
              {CUACA_LABEL[c]}
            </button>
          );
        })}
      </div>

      {/* Respons setelah memilih */}
      {pilihanHariIni && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid rgba(224,82,107,.08)',
          }}
          aria-live="polite"
        >
          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 14,
              color: '#6E3B57',
              margin: '0 0 4px',
            }}
          >
            {RESPONS_CUACA[pilihanHariIni].penanda}
          </p>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              color: '#6E3B57',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {renderRichText(RESPONS_CUACA[pilihanHariIni].isi, sapaan)}
          </p>
        </div>
      )}

      {/* Tombol riwayat */}
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
        Langit 14 hari terakhir
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

      {/*
        Kartu pemicu krisis.
        Tunduk pada JALUR_KRISIS_AKTIF — saat false, tidak dirender sama sekali.
      */}
      {JALUR_KRISIS_AKTIF && (
        <div
          style={{
            marginTop: 16,
            background: '#FFF5F7',
            border: '1.5px solid #F7C9D3',
            borderRadius: 14,
            padding: '14px 16px',
          }}
        >
          <p
            style={{
              fontFamily: 'Fredoka, system-ui, sans-serif',
              fontSize: 15,
              fontWeight: 600,
              color: '#3A2530',
              margin: '0 0 6px',
            }}
          >
            {KARTU_PEMICU_KRISIS.judul}
          </p>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              color: '#6E3B57',
              margin: '0 0 12px',
              lineHeight: 1.5,
            }}
          >
            {KARTU_PEMICU_KRISIS.isi}
          </p>
          <button
            type="button"
            onClick={() => setLayarKrisisTerbuka(true)}
            style={{
              padding: '8px 16px',
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
            {KARTU_PEMICU_KRISIS.tombol}
          </button>
        </div>
      )}

      {JALUR_KRISIS_AKTIF && layarKrisisTerbuka && (
        <LayarKrisis onTutup={() => setLayarKrisisTerbuka(false)} />
      )}
    </div>
  );
}
