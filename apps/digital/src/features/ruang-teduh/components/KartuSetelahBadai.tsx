import React, { useState } from 'react';
import type { PitaUsia, ButirBadai } from '../types';
import {
  CP_BADAI_JUDUL,
  CP_BADAI_SUBJUDUL_BAYI,
  CP_BADAI_SUBJUDUL_ANAK,
  CP_BADAI_SEKSI_PENCEGAHAN,
  CP_BADAI_SEKSI_PEMULIHAN,
  CP_BADAI_SEKSI_PERLU_DIKETAHUI,
  CP_BADAI_TOMBOL_SELENGKAPNYA,
  CP_BADAI_TOMBOL_TUTUP,
  CP_BADAI_JALUR_BANTUAN_JUDUL,
  CP_BADAI_JALUR_BANTUAN_ISI,
  CP_SUMBER_PEDOMAN_LABEL,
  CP_SUMBER_PRAKTIK_LABEL,
} from '../copy';
import {
  BADAI_BAYI_PENCEGAHAN,
  BADAI_BAYI_KALIMAT_TEGAS,
  BADAI_BAYI_KALIMAT_TEGAS_SUMBER,
  BADAI_BAYI_PEMULIHAN,
  BADAI_BAYI_PERLU_DIKETAHUI,
  BADAI_BAYI_KOTAK_BATAS,
  BADAI_ANAK_PENCEGAHAN,
  BADAI_ANAK_KALIMAT_TEGAS,
  BADAI_ANAK_KALIMAT_TEGAS_SUMBER,
  BADAI_ANAK_PEMULIHAN,
  BADAI_ANAK_PERLU_DIKETAHUI,
  BADAI_ANAK_KOTAK_BATAS,
} from '../data/setelahBadai';

interface PropsKartuSetelahBadai {
  pitaUsia: PitaUsia;
  /** Admin mode — tampilkan penanda sumber dan kotak batas bukti */
  adminMode?: boolean;
  /** Referensi untuk scroll ke kartu ini dari tombol Setelah Badai di respons Langit */
  id?: string;
}

export default function KartuSetelahBadai({
  pitaUsia,
  adminMode = false,
  id,
}: PropsKartuSetelahBadai) {
  const [terbukaSelengkapnya, setTerbukaSelengkapnya] = useState(false);

  const varianBayi = pitaUsia === 0;

  const pencegahan = varianBayi ? BADAI_BAYI_PENCEGAHAN : BADAI_ANAK_PENCEGAHAN;
  const kalimatTegas = varianBayi ? BADAI_BAYI_KALIMAT_TEGAS : BADAI_ANAK_KALIMAT_TEGAS;
  const kalimatTegasSumber = varianBayi
    ? BADAI_BAYI_KALIMAT_TEGAS_SUMBER
    : BADAI_ANAK_KALIMAT_TEGAS_SUMBER;
  const pemulihan = varianBayi ? BADAI_BAYI_PEMULIHAN : BADAI_ANAK_PEMULIHAN;
  const perluDiketahui = varianBayi ? BADAI_BAYI_PERLU_DIKETAHUI : BADAI_ANAK_PERLU_DIKETAHUI;
  const kotakBatas = varianBayi ? BADAI_BAYI_KOTAK_BATAS : BADAI_ANAK_KOTAK_BATAS;
  const subjudul = varianBayi ? CP_BADAI_SUBJUDUL_BAYI : CP_BADAI_SUBJUDUL_ANAK;

  const pencegahanInti = pencegahan.filter(b => b.inti);
  const pencegahanSisa = pencegahan.filter(b => !b.inti);

  return (
    <div
      id={id}
      style={{
        background: '#FFF5F8',
        borderRadius: 20,
        padding: '18px 20px',
        border: '1.5px solid rgba(240,107,168,.25)',
      }}
    >
      {/* Header */}
      <p
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 17,
          fontWeight: 600,
          color: '#3A2530',
          margin: '0 0 2px',
        }}
      >
        {CP_BADAI_JUDUL}
      </p>
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          color: '#A98DA0',
          margin: '0 0 16px',
        }}
      >
        {subjudul}
      </p>

      {/* Pencegahan — inti (maks 3) selalu tampil */}
      <SeksiBadai
        judul={CP_BADAI_SEKSI_PENCEGAHAN}
        butir={pencegahanInti}
        adminMode={adminMode}
      />

      {/* Kalimat tegas AAP — setelah langkah pencegahan */}
      <div
        style={{
          marginTop: 12,
          background: '#FFF0F3',
          border: '1.5px solid rgba(240,107,168,.3)',
          borderRadius: 12,
          padding: '12px 14px',
        }}
      >
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            color: '#3A2530',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {kalimatTegas}
        </p>
        {adminMode && (
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 11,
              color: '#A98DA0',
              margin: '6px 0 0',
            }}
          >
            Sumber: {kalimatTegasSumber}
          </p>
        )}
      </div>

      {/* Selengkapnya — pemulihan dan yang perlu diketahui */}
      {!terbukaSelengkapnya ? (
        <button
          type="button"
          onClick={() => setTerbukaSelengkapnya(true)}
          aria-expanded={false}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            marginTop: 14,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#F06BA8',
            padding: 0,
          }}
        >
          {CP_BADAI_TOMBOL_SELENGKAPNYA}
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
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      ) : (
        <div style={{ marginTop: 16, borderTop: '1px solid rgba(240,107,168,.1)', paddingTop: 16 }}>
          {/* Butir pencegahan sisa */}
          {pencegahanSisa.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {pencegahanSisa.map((b, i) => (
                <ButirBadaiItem
                  key={i}
                  butir={b}
                  adminMode={adminMode}
                />
              ))}
            </div>
          )}

          {/* Pemulihan */}
          <SeksiBadai
            judul={CP_BADAI_SEKSI_PEMULIHAN}
            butir={pemulihan}
            adminMode={adminMode}
          />

          <div style={{ height: 14 }} />

          {/* Yang perlu diketahui */}
          <SeksiBadai
            judul={CP_BADAI_SEKSI_PERLU_DIKETAHUI}
            butir={perluDiketahui}
            adminMode={adminMode}
          />

          {/* Kotak batas — hanya admin */}
          {adminMode && (
            <div
              style={{
                marginTop: 14,
                background: '#FFF8EC',
                border: '1px solid #F6B86033',
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 12,
                  color: '#7A5C28',
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                <strong>Batas bukti:</strong> {kotakBatas}
              </p>
            </div>
          )}

          {/* Tombol tutup */}
          <button
            type="button"
            onClick={() => setTerbukaSelengkapnya(false)}
            aria-expanded={true}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 14,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: '#A98DA0',
              padding: 0,
            }}
          >
            {CP_BADAI_TOMBOL_TUTUP}
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
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Jalur bantuan — selalu di bawah, tidak tersembunyi */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid rgba(240,107,168,.1)',
        }}
      >
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            color: '#6E3B57',
            margin: '0 0 4px',
          }}
        >
          {CP_BADAI_JALUR_BANTUAN_JUDUL}
        </p>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 12,
            color: '#8A7A80',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {CP_BADAI_JALUR_BANTUAN_ISI}
        </p>
      </div>
    </div>
  );
}

// ─── Komponen internal ────────────────────────────────────────────────────────

function SeksiBadai({
  judul,
  butir,
  adminMode,
}: {
  judul: string;
  butir: ButirBadai[];
  adminMode: boolean;
}) {
  if (!butir.length) return null;
  return (
    <div>
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          color: '#F06BA8',
          margin: '0 0 10px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {judul}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {butir.map((b, i) => (
          <ButirBadaiItem key={i} butir={b} adminMode={adminMode} />
        ))}
      </div>
    </div>
  );
}

function ButirBadaiItem({ butir, adminMode }: { butir: ButirBadai; adminMode: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span
        style={{
          marginTop: 5,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#F06BA8',
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 16,
            color: '#3A2530',
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {butir.teks}
        </p>
        {/* Penanda sumber — hanya admin */}
        {adminMode && (
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            {butir.sumber && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: '#E8F5EE',
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#2E7D50',
                }}
              >
                {butir.sumber}
              </span>
            )}
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                background: butir.tag === 'pedoman' ? '#E8F5EE' : '#FFF3E0',
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                color: butir.tag === 'pedoman' ? '#2E7D50' : '#E65100',
              }}
            >
              {butir.tag === 'pedoman' ? CP_SUMBER_PEDOMAN_LABEL : CP_SUMBER_PRAKTIK_LABEL}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
