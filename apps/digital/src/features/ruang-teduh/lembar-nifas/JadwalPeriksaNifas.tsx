import React from 'react';
import {
  JADWAL_NIFAS,
  JADWAL_NIFAS_JUDUL,
  JADWAL_NIFAS_CATATAN,
} from '../content';

type StatusJadwal = 'sudah' | 'berikutnya' | 'netral';

function hitungStatus(
  hariKe: number,
  hariMulai: number,
  hariAkhir: number,
): StatusJadwal {
  if (hariKe > hariAkhir) return 'sudah';
  if (hariKe >= hariMulai) return 'berikutnya';
  return 'netral';
}

const GAYA_STATUS: Record<StatusJadwal, {
  bg: string;
  border: string;
  dotBg: string;
  dotBorder: string;
  labelColor: string;
}> = {
  sudah: {
    bg:          '#FAFAFA',
    border:      'rgba(0,0,0,.06)',
    dotBg:       '#E8DFEA',
    dotBorder:   'transparent',
    labelColor:  '#C0A6B7',
  },
  berikutnya: {
    bg:          '#FFF5F7',
    border:      'rgba(224,82,107,.25)',
    dotBg:       '#E0526B',
    dotBorder:   'transparent',
    labelColor:  '#9B3A52',
  },
  netral: {
    bg:          '#FAFAFA',
    border:      'rgba(0,0,0,.06)',
    dotBg:       '#fff',
    dotBorder:   '#C0A6B7',
    labelColor:  '#8A7A80',
  },
};

interface PropsJadwalPeriksaNifas {
  hariKe: number;
}

// TODO: backend — konfirmasi kunjungan nyata akan menggantikan status otomatis ini
export default function JadwalPeriksaNifas({ hariKe }: PropsJadwalPeriksaNifas) {
  return (
    <div>
      <h3
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          color: '#3A2530',
          margin: '0 0 10px',
        }}
      >
        {JADWAL_NIFAS_JUDUL}
      </h3>

      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {JADWAL_NIFAS.map((j, idx) => {
          const status = hitungStatus(hariKe, j.hariMulai, j.hariAkhir);
          const g = GAYA_STATUS[status];
          return (
            <li
              key={j.label}
              style={{
                background: g.bg,
                border: `1.5px solid ${g.border}`,
                borderRadius: 12,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {/* Nomor kunjungan / indikator status */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: g.dotBg,
                  border: `1.5px solid ${g.dotBorder}`,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-hidden="true"
              >
                {status === 'sudah' ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#A98DA0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontFamily: 'Fredoka, system-ui, sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      color: status === 'berikutnya' ? '#fff' : '#C0A6B7',
                    }}
                  >
                    {idx + 1}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontSize: 13,
                    fontWeight: status === 'berikutnya' ? 700 : 600,
                    color: g.labelColor,
                    margin: 0,
                  }}
                >
                  {j.label}
                </p>
                {j.catatan && (
                  <p
                    style={{
                      fontFamily: 'Nunito, system-ui, sans-serif',
                      fontSize: 11,
                      color: '#C0A6B7',
                      margin: '2px 0 0',
                    }}
                  >
                    {j.catatan}
                  </p>
                )}
              </div>

              {status === 'berikutnya' && (
                <span
                  style={{
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#E0526B',
                    background: 'rgba(224,82,107,.1)',
                    padding: '2px 8px',
                    borderRadius: 999,
                    flexShrink: 0,
                  }}
                >
                  Sekarang
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          color: '#C0A6B7',
          margin: '10px 0 0',
          lineHeight: 1.5,
        }}
      >
        {JADWAL_NIFAS_CATATAN}
      </p>
    </div>
  );
}
