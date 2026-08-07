import React, { useState } from 'react';
import { renderRichText } from '../beranda-usia/renderRichText';
import {
  TEKS_SAPAAN_BERANDA,
  TEKS_PERAN_AYAH,
  TEKS_CATATAN_POSISI,
} from './content';
import type { SubTahapRuangTeduh, RingkasNifas } from './types';
import CuacaHati from './cuaca-hati/CuacaHati';
import PiringIbu from './PiringIbu';
import MenyambutSiKecil from './MenyambutSiKecil';
import KartuEdukasi from './KartuEdukasi';
import LembarNifas from './lembar-nifas/LembarNifas';

type HalamanRuangTeduh = 'beranda' | 'piring-ibu' | 'menyambut' | 'lembar-nifas';

interface PropsBerandaRuangTeduh {
  subTahap: SubTahapRuangTeduh;
  sapaan: { low: string; cap: string };
  hariIni: string;
  ringkasNifas: RingkasNifas | null;
}

export default function BerandaRuangTeduh({
  subTahap,
  sapaan,
  hariIni,
  ringkasNifas,
}: PropsBerandaRuangTeduh) {
  const [halaman, setHalaman] = useState<HalamanRuangTeduh>('beranda');

  if (halaman === 'lembar-nifas' && ringkasNifas?.dalamMasaNifas) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setHalaman('beranda')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 20,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: '#8A7A80',
            padding: 0,
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
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Kembali
        </button>
        <LembarNifas hariKe={ringkasNifas.hariKe} hariIni={hariIni} />
      </div>
    );
  }

  if (halaman === 'piring-ibu') {
    return (
      <div>
        <button
          type="button"
          onClick={() => setHalaman('beranda')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 20,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: '#8A7A80',
            padding: 0,
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
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Kembali
        </button>
        <h1
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 26,
            fontWeight: 600,
            color: '#3A2530',
            margin: '0 0 20px',
          }}
        >
          Piring Ibu
        </h1>
        <PiringIbu subTahap={subTahap} hariIni={hariIni} />
      </div>
    );
  }

  if (halaman === 'menyambut') {
    return (
      <div>
        <button
          type="button"
          onClick={() => setHalaman('beranda')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 20,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: '#8A7A80',
            padding: 0,
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
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Kembali
        </button>
        <h1
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 26,
            fontWeight: 600,
            color: '#3A2530',
            margin: '0 0 20px',
          }}
        >
          Menyambut Si Kecil
        </h1>
        <MenyambutSiKecil sapaan={sapaan} />
      </div>
    );
  }

  // Beranda
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Sapaan */}
      <div>
        <h1
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 26,
            fontWeight: 600,
            color: '#3A2530',
            margin: '0 0 6px',
          }}
        >
          {TEKS_SAPAAN_BERANDA.judul}
        </h1>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 15,
            color: '#8A7A80',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {renderRichText(TEKS_SAPAAN_BERANDA.subjudul, sapaan)}
        </p>
      </div>

      {/* Dua kolom utama */}
      <div className="grid grid-cols-1 gap-4 min-[1180px]:grid-cols-2">
        {/* Kolom kiri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CuacaHati
            sapaan={sapaan}
            hariIni={hariIni}
            onScrollKeJadwal={() => setHalaman('lembar-nifas')}
          />

          {/* Kartu ringkas Piring Ibu */}
          <button
            type="button"
            onClick={() => setHalaman('piring-ibu')}
            style={{
              textAlign: 'left',
              background: '#fff',
              border: '1.5px solid rgba(224,82,107,.15)',
              borderRadius: 20,
              padding: '18px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'box-shadow 150ms ease',
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 6px 20px -4px rgba(224,82,107,.18)')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLButtonElement).style.boxShadow = 'none')
            }
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '70% 70% 70% 4px',
                background: '#FFF0F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E0526B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: 'Fredoka, system-ui, sans-serif',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#3A2530',
                  margin: '0 0 3px',
                }}
              >
                Piring Ibu
              </p>
              <p
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 13,
                  color: '#A98DA0',
                  margin: 0,
                }}
              >
                Catat gizi, air, dan suplemen hari ini
              </p>
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C0A6B7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Kolom kanan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Kartu ringkas Lembar Nifas — hanya saat masih dalam 42 hari */}
          {ringkasNifas?.dalamMasaNifas && (
            <button
              type="button"
              onClick={() => setHalaman('lembar-nifas')}
              style={{
                textAlign: 'left',
                background: '#FFF5F7',
                border: '1.5px solid rgba(224,82,107,.3)',
                borderRadius: 20,
                padding: '18px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'box-shadow 150ms ease',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 6px 20px -4px rgba(224,82,107,.2)')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLButtonElement).style.boxShadow = 'none')
              }
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '70% 70% 70% 4px',
                  background: '#FFF0F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E0526B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: 'Fredoka, system-ui, sans-serif',
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#3A2530',
                    margin: '0 0 3px',
                  }}
                >
                  Lembar Nifas
                </p>
                <p
                  style={{
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontSize: 13,
                    color: '#A98DA0',
                    margin: 0,
                  }}
                >
                  Hari ke {ringkasNifas.hariKe} masa nifas
                </p>
              </div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C0A6B7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Kartu Menyambut Si Kecil */}
          <button
            type="button"
            onClick={() => setHalaman('menyambut')}
            style={{
              textAlign: 'left',
              background: '#fff',
              border: '1.5px solid rgba(246,184,96,.25)',
              borderRadius: 20,
              padding: '18px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'box-shadow 150ms ease',
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 6px 20px -4px rgba(246,184,96,.3)')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLButtonElement).style.boxShadow = 'none')
            }
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '70% 70% 70% 4px',
                background: '#FBE3A8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#B07A20"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: 'Fredoka, system-ui, sans-serif',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#3A2530',
                  margin: '0 0 3px',
                }}
              >
                Menyambut Si Kecil
              </p>
              <p
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 13,
                  color: '#A98DA0',
                  margin: 0,
                }}
              >
                Checklist kesiapan dan barang
              </p>
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C0A6B7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Kartu peran ayah */}
          <div
            style={{
              background: '#F7F3FB',
              borderRadius: 20,
              padding: '18px 20px',
              border: '1px solid #E6DCEF',
            }}
          >
            <p
              style={{
                fontFamily: 'Fredoka, system-ui, sans-serif',
                fontSize: 16,
                fontWeight: 600,
                color: '#3A2530',
                margin: '0 0 8px',
              }}
            >
              {TEKS_PERAN_AYAH.judul}
            </p>
            <p
              style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 13,
                color: '#6E3B57',
                margin: '0 0 8px',
                lineHeight: 1.55,
              }}
            >
              {renderRichText(TEKS_PERAN_AYAH.isi, sapaan)}
            </p>
            <p
              style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 11,
                color: '#C0A6B7',
                margin: 0,
              }}
            >
              KIA hal. {TEKS_PERAN_AYAH.sumberHalamanKIA.join(' dan ')}
            </p>
          </div>
        </div>
      </div>

      {/* Rak kartu edukasi */}
      <div>
        <h2
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: '#3A2530',
            margin: '0 0 12px',
          }}
        >
          Bacaan untuk Ibu
        </h2>
        <KartuEdukasi />
      </div>

      {/* Catatan posisi produk */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          color: '#C0A6B7',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        {TEKS_CATATAN_POSISI}
      </p>
    </div>
  );
}
