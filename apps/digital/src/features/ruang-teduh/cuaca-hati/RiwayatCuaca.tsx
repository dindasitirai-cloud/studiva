import React, { useId } from 'react';
import type { CuacaHati } from '../types';
import { RIWAYAT_JUDUL, RIWAYAT_KETERANGAN, RIWAYAT_KUTIPAN, CUACA_LABEL } from '../content';
import { perluCerminPola } from '../logika';
import { usePenyimpanan, useRiwayat } from '../penyimpanan/PenyimpananProvider';
import CerminPola from './CerminPola';

const WARNA_CUACA: Record<CuacaHati, string> = {
  cerah:   '#F6B860',
  berawan: '#9BB8E8',
  mendung: '#C9B6E4',
  hujan:   '#8FB8F7',
  badai:   '#E58BA8',
};

// Warna titik untuk hari kosong: abu lembut, bukan merah
const WARNA_KOSONG = '#E8DFEA';

interface PropsRiwayatCuaca {
  hariIni: string;
  onScrollKeJadwal: () => void;
  onTutup: () => void;
}

function tanggalMinus(hariIni: string, selisih: number): string {
  const ms = new Date(hariIni + 'T00:00:00Z').getTime();
  return new Date(ms - selisih * 86400000).toISOString().slice(0, 10);
}

const NAMA_HARI_SINGKAT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function RiwayatCuaca({
  hariIni,
  onScrollKeJadwal,
  onTutup,
}: PropsRiwayatCuaca) {
  const labelId = useId();
  const { caregiverId } = usePenyimpanan();

  const dariTanggal = tanggalMinus(hariIni, 13);
  const { catatan } = useRiwayat(caregiverId, dariTanggal, hariIni);

  // Bangun map tanggal → catatan untuk lookup O(1) saat merender hari
  const catatanMap = Object.fromEntries(catatan.map(c => [c.tanggal, c]));

  const tampilCermin = perluCerminPola(catatan, hariIni);

  // 14 hari urut terlama ke terbaru
  const hari14 = Array.from({ length: 14 }, (_, i) => tanggalMinus(hariIni, 13 - i));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button
          type="button"
          onClick={onTutup}
          aria-label="Kembali ke Cuaca Hati"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#8A7A80',
            padding: 4,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg
            width="18"
            height="18"
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
        </button>

        <h2
          id={labelId}
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 20,
            fontWeight: 600,
            color: '#3A2530',
            margin: 0,
          }}
        >
          {RIWAYAT_JUDUL}
        </h2>
      </div>

      <p
        style={{
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          fontSize: 14,
          color: '#8A7A80',
          margin: '0 0 16px',
          lineHeight: 1.5,
        }}
      >
        {RIWAYAT_KUTIPAN}
      </p>

      {/* 14 kolom hari */}
      <div
        role="list"
        aria-label="Langit 14 hari"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(14, 1fr)',
          gap: 4,
          marginBottom: 6,
        }}
      >
        {hari14.map(tgl => {
          const catatan14 = catatanMap[tgl];
          const cuaca = catatan14?.cuacaHati;
          const warna = cuaca ? WARNA_CUACA[cuaca] : WARNA_KOSONG;
          const label = cuaca
            ? `${tgl}: ${CUACA_LABEL[cuaca]}`
            : `${tgl}: tidak ada catatan`;

          return (
            <div
              key={tgl}
              role="listitem"
              aria-label={label}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  background: warna,
                }}
                title={label}
              />
              <span
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 9,
                  color: '#C0A6B7',
                }}
                aria-hidden="true"
              >
                {NAMA_HARI_SINGKAT[new Date(tgl + 'T00:00:00Z').getUTCDay()]}
              </span>
            </div>
          );
        })}
      </div>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          color: '#C0A6B7',
          margin: '0 0 4px',
          lineHeight: 1.5,
        }}
      >
        {RIWAYAT_KETERANGAN}
      </p>

      {/* Legenda warna */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 10 }}>
        {(Object.entries(WARNA_CUACA) as [CuacaHati, string][]).map(([c, warna]) => (
          <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{ width: 10, height: 10, borderRadius: '50%', background: warna, flexShrink: 0 }}
              aria-hidden="true"
            />
            <span
              style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 11,
                color: '#8A7A80',
              }}
            >
              {CUACA_LABEL[c]}
            </span>
          </div>
        ))}
      </div>

      {/* Cermin pola — datanya sudah dari useRiwayat, dihitung oleh perluCerminPola */}
      {tampilCermin && (
        <CerminPola onScrollKeJadwal={onScrollKeJadwal} />
      )}
    </div>
  );
}
