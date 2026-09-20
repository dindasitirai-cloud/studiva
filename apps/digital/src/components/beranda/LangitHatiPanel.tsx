import React from 'react';
import { LANGIT_HATI, LABEL_PERAN_PASANGAN } from '../../content/beranda-copy';
import type { Cuaca } from './types';
import type { PeranSingkat } from '../../content/beranda-copy';

// TODO: simpan mood ke tabel mood harian, dan baca mood pasangan
// TODO: cek apakah akun punya pasangan tertaut

interface Props {
  peranAktif: PeranSingkat;
  langitSaya: Cuaca | null;
  langitPasangan: Cuaca | null;
  adaPasangan: boolean;
  onPilih: (c: Cuaca) => void;
}

const URUTAN_CUACA: Cuaca[] = ['cerah', 'berawan', 'mendung', 'hujan', 'badai'];

function IkonCuaca({ jenis, size = 36 }: { jenis: Cuaca; size?: number }) {
  if (jenis === 'cerah') {
    return (
      <svg viewBox="0 0 48 48" style={{ width: size, height: size, display: 'block' }}>
        <g stroke="#FFD36B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1="24" y1="6" x2="24" y2="10" />
          <line x1="24" y1="38" x2="24" y2="42" />
          <line x1="6" y1="24" x2="10" y2="24" />
          <line x1="38" y1="24" x2="42" y2="24" />
          <line x1="11.5" y1="11.5" x2="14.5" y2="14.5" />
          <line x1="33.5" y1="33.5" x2="36.5" y2="36.5" />
          <line x1="36.5" y1="11.5" x2="33.5" y2="14.5" />
          <line x1="14.5" y1="33.5" x2="11.5" y2="36.5" />
        </g>
        <circle cx="24" cy="24" r="10.5" fill="#FFD36B" />
        <circle cx="20.5" cy="23" r="1.6" fill="#6E3B57" />
        <circle cx="27.5" cy="23" r="1.6" fill="#6E3B57" />
        <path d="M21 26.5 Q24 29.5 27 26.5" fill="none" stroke="#6E3B57" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="26.5" r="1.4" fill="#F49CC6" />
        <circle cx="30" cy="26.5" r="1.4" fill="#F49CC6" />
      </svg>
    );
  }
  if (jenis === 'berawan') {
    return (
      <svg viewBox="0 0 48 48" style={{ width: size, height: size, display: 'block' }}>
        <g stroke="#FFD36B" strokeWidth="2" strokeLinecap="round" fill="none">
          <line x1="14" y1="4" x2="14" y2="7" />
          <line x1="5" y1="13" x2="8" y2="13" />
          <line x1="7" y1="6.5" x2="9" y2="8.5" />
          <line x1="21" y1="6.5" x2="19" y2="8.5" />
        </g>
        <circle cx="14" cy="13" r="5.5" fill="#FFD36B" />
        <path d="M14 34 C8.5 34 6.5 27.5 11.5 25.5 C10.5 19.5 17.5 17 21 21.5 C23.5 16 32 16.5 33 23 C39 21.5 42 28.5 37 33 C38.5 34.5 16 34 14 34 Z" fill="#8FB8F7" />
        <circle cx="19.5" cy="26" r="1.6" fill="#6E3B57" />
        <circle cx="28" cy="26" r="1.6" fill="#6E3B57" />
        <path d="M21 29 Q24 32 27 29" fill="none" stroke="#6E3B57" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (jenis === 'mendung') {
    return (
      <svg viewBox="0 0 48 48" style={{ width: size, height: size, display: 'block' }}>
        <path d="M14 32 C8.5 32 6.5 25.5 11.5 23.5 C10.5 17.5 17.5 15 21 19.5 C23.5 14 32 14.5 33 21 C39 19.5 42 26.5 37 31 C38.5 32.5 16 32 14 32 Z" fill="#C9B8F0" />
        <circle cx="19.5" cy="24" r="1.6" fill="#6E3B57" />
        <circle cx="28" cy="24" r="1.6" fill="#6E3B57" />
        <path d="M21 27 Q24 30 27 27" fill="none" stroke="#6E3B57" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16.5" cy="27" r="1.4" fill="#B79AD8" />
        <circle cx="31" cy="27" r="1.4" fill="#B79AD8" />
      </svg>
    );
  }
  if (jenis === 'hujan') {
    return (
      <svg viewBox="0 0 48 48" style={{ width: size, height: size, display: 'block' }}>
        <path d="M14 29 C8.5 29 6.5 22.5 11.5 20.5 C10.5 14.5 17.5 12 21 16.5 C23.5 11 32 11.5 33 18 C39 16.5 42 23.5 37 28 C38.5 29.5 16 29 14 29 Z" fill="#8FB8F7" />
        <circle cx="19.5" cy="21" r="1.6" fill="#6E3B57" />
        <circle cx="28" cy="21" r="1.6" fill="#6E3B57" />
        <path d="M21 24 Q24 27 27 24" fill="none" stroke="#6E3B57" strokeWidth="2" strokeLinecap="round" />
        <g stroke="#5F84E6" strokeWidth="2.6" strokeLinecap="round">
          <line x1="17" y1="34" x2="15.5" y2="38.5" />
          <line x1="24" y1="34" x2="22.5" y2="38.5" />
          <line x1="31" y1="34" x2="29.5" y2="38.5" />
        </g>
      </svg>
    );
  }
  // badai
  return (
    <svg viewBox="0 0 48 48" style={{ width: size, height: size, display: 'block' }}>
      <path d="M14 28 C8.5 28 6.5 21.5 11.5 19.5 C10.5 13.5 17.5 11 21 15.5 C23.5 10 32 10.5 33 17 C39 15.5 42 22.5 37 27 C38.5 28.5 16 28 14 28 Z" fill="#B7A6D0" />
      <circle cx="19.5" cy="20" r="1.6" fill="#6E3B57" />
      <circle cx="28" cy="20" r="1.6" fill="#6E3B57" />
      <path d="M20.5 24 H27.5" fill="none" stroke="#6E3B57" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 31 L20 38 L23.5 38 L21 44 L29 36 L24.5 36 Z" fill="#FFD36B" />
    </svg>
  );
}

export default function LangitHatiPanel({
  peranAktif,
  langitSaya,
  langitPasangan,
  adaPasangan,
  onPilih,
}: Props) {
  const labelPasangan = LABEL_PERAN_PASANGAN[peranAktif];

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 26,
        padding: '22px 24px 20px',
        boxShadow: '0 20px 46px -36px rgba(90,50,70,.5)',
      }}
    >
      <p
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 19,
          color: '#6E3B57',
          margin: 0,
        }}
      >
        {peranAktif === 'ibu' ? 'Langit hati Bunda hari ini?' : 'Langit hati Ayah hari ini?'}
      </p>
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          color: '#A98DA0',
          margin: '3px 0 0',
        }}
      >
        Satu ketuk. Boleh dilewati.
      </p>

      {/* Baris pengguna aktif */}
      <div style={{ marginTop: 18 }}>
        {langitSaya === null ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
            {URUTAN_CUACA.map(cuaca => (
              <button
                key={cuaca}
                type="button"
                onClick={() => onPilih(cuaca)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 7,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  minWidth: 0,
                }}
                className="mood-btn"
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#FBF3F8',
                    border: '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background .2s, border-color .2s, transform .2s',
                  }}
                  className="mood-chip"
                >
                  <IkonCuaca jenis={cuaca} size={36} />
                </div>
                <span
                  style={{
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontWeight: 700,
                    fontSize: 11.5,
                    color: '#8A6E7E',
                  }}
                >
                  {LANGIT_HATI.cuacaLabel[cuaca]}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#FCE3EE',
                border: '2px solid #F4B4D2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IkonCuaca jenis={langitSaya} size={36} />
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#6E3B57',
                  margin: 0,
                }}
              >
                {LANGIT_HATI.cuacaLabel[langitSaya]} · {LANGIT_HATI.sudahTercatat}
              </p>
              <button
                type="button"
                onClick={() => onPilih(langitSaya)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 12,
                  color: '#F06BA8',
                  textDecoration: 'underline',
                }}
              >
                {LANGIT_HATI.lihatRiwayat}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Baris pasangan — read-only */}
      {adaPasangan && (
        <>
          <hr style={{ margin: '16px 0 14px', border: 'none', borderTop: '1px solid rgba(110,59,87,.08)' }} />
          <div>
            <p
              style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 12,
                color: '#A98DA0',
                margin: '0 0 8px',
              }}
            >
              {LANGIT_HATI.judulPasangan(labelPasangan)}
            </p>
            {langitPasangan === null ? (
              <p style={{ fontFamily: 'Nunito', fontSize: 13, color: 'rgba(110,59,87,.45)', margin: 0 }}>
                {LANGIT_HATI.belumMencatat(labelPasangan)}
              </p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#F0E8F4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Nunito',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'rgba(110,59,87,.6)',
                    flexShrink: 0,
                  }}
                >
                  {labelPasangan[0]}
                </div>
                <IkonCuaca jenis={langitPasangan} size={28} />
                <span style={{ fontFamily: 'Nunito', fontSize: 13, color: 'rgba(110,59,87,.6)' }}>
                  {LANGIT_HATI.cuacaLabel[langitPasangan]}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
