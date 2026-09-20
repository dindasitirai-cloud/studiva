import React, { useState } from 'react';
import type { PitaUsia } from '../types';
import {
  CP_SEDIA_JUDUL,
  CP_SEDIA_SUBJUDUL,
  CP_SEDIA_KELOMPOK_KESEHATAN,
  CP_SEDIA_KELOMPOK_RUMAH,
  CP_SEDIA_CATATAN_STATUS,
} from '../copy';
import { SEDIA_KESEHATAN, SEDIA_RUMAH } from '../data/sedia';

// TODO: kirim ke WhatsApp kedua orang tua dengan isi identik — MANUAL dulu, jangan bangun sekarang

interface PropsKartuSedia {
  pitaUsia: PitaUsia;
  /** Admin mode — tampilkan label sumber dan catatan batas bukti */
  adminMode?: boolean;
}

export default function KartuSedia({ pitaUsia, adminMode = false }: PropsKartuSedia) {
  const butirKesehatan = SEDIA_KESEHATAN[pitaUsia];
  const butirRumah = SEDIA_RUMAH[pitaUsia];

  // Simpan status centang per id butir — mencatat keadaan urusan, bukan pelaku
  const [tercentang, setTercentang] = useState<Record<string, boolean>>({});

  function toggleCentang(id: string) {
    setTercentang(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '18px 20px',
        border: '1px solid rgba(78,156,110,.18)',
      }}
    >
      <p
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 17,
          fontWeight: 600,
          color: '#3A2530',
          margin: '0 0 2px',
        }}
      >
        {CP_SEDIA_JUDUL}
      </p>
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          color: '#A98DA0',
          margin: '0 0 16px',
        }}
      >
        {CP_SEDIA_SUBJUDUL}
      </p>

      {/* Kelompok kesehatan */}
      <GrupSedia
        judul={CP_SEDIA_KELOMPOK_KESEHATAN}
        warna="#4E9C6E"
        butir={butirKesehatan}
        tercentang={tercentang}
        onToggle={toggleCentang}
        adminMode={adminMode}
      />

      <div style={{ height: 16 }} />

      {/* Kelompok rumah tangga */}
      <GrupSedia
        judul={CP_SEDIA_KELOMPOK_RUMAH}
        warna="#8A7A80"
        butir={butirRumah}
        tercentang={tercentang}
        onToggle={toggleCentang}
        adminMode={adminMode}
      />

      {/* Catatan status */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          color: '#C0A6B7',
          margin: '12px 0 0',
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}
      >
        {CP_SEDIA_CATATAN_STATUS}
      </p>
    </div>
  );
}

// ─── Komponen internal: satu kelompok butir ───────────────────────────────────

interface PropsGrupSedia {
  judul: string;
  warna: string;
  butir: ReturnType<typeof SEDIA_KESEHATAN[0]['slice']> extends never
    ? import('../types').ButirSedia[]
    : import('../types').ButirSedia[];
  tercentang: Record<string, boolean>;
  onToggle: (id: string) => void;
  adminMode: boolean;
}

function GrupSedia({ judul, warna, butir, tercentang, onToggle, adminMode }: PropsGrupSedia) {
  return (
    <div>
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          color: warna,
          margin: '0 0 10px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {judul}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {butir.map(b => (
          <div key={b.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* Area sentuh minimal 44×44 px — centang visualnya 20px tapi area klik lebih besar */}
            <button
              type="button"
              role="checkbox"
              aria-checked={!!tercentang[b.id]}
              onClick={() => onToggle(b.id)}
              aria-label={b.judul}
              style={{
                flexShrink: 0,
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                marginTop: -12,
                marginLeft: -12,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  border: `2px solid ${tercentang[b.id] ? warna : '#D4C4CC'}`,
                  background: tercentang[b.id] ? warna : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 120ms ease, border-color 120ms ease',
                }}
                aria-hidden="true"
              >
                {tercentang[b.id] && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>
            </button>

            <div style={{ flex: 1, paddingTop: 1 }}>
              <p
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: tercentang[b.id] ? '#A98DA0' : '#3A2530',
                  margin: '0 0 2px',
                  textDecoration: tercentang[b.id] ? 'line-through' : 'none',
                }}
              >
                {b.judul}
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
                {b.penjelasan}
              </p>
              {/* Rujukan ringkas — tampil ke semua pengguna */}
              {b.sumber && (
                <p
                  style={{
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontSize: 11,
                    color: '#C0A6B7',
                    margin: '3px 0 0',
                  }}
                >
                  {b.sumber}
                </p>
              )}
              {/* Label kekuatan sumber — hanya admin */}
              {adminMode && b.kelompok === 'kesehatan' && (
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: 4,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#E8F5EE',
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#2E7D50',
                  }}
                >
                  Pedoman
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
