import React from 'react';
import type { ItemIrama } from '@studiva/shared';
import { rasioKontras, gelapkan } from './kontras';
import { LATAR_DOMAIN, warnaIkonDomain } from './domainWarnaIrama';
import { LABEL_BLOK, LABEL_DOMAIN } from './contentMingguan';
import type { BlokWaktu } from './PilihanHarianContext';

const NAMA_HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const WAWASAN_BG = '#FFF3F6';
const WAWASAN_BORDER = '#F3E3E8';

// SVG pohon kustom — lebih lembut dari ikon garis lucide.
function IkonPohon({ warna }: { warna: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21v-7" stroke={warna} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="8.4" r="5.3" fill={warna} />
      <circle cx="7.4" cy="11.2" r="3.7" fill={warna} />
      <circle cx="16.6" cy="11.2" r="3.7" fill={warna} />
    </svg>
  );
}

// SVG buku kustom — cover diisi warna buku, garis halaman putih transparan.
function IkonBuku({ warna }: { warna: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4.5h10a2 2 0 0 1 2 2V19a1 1 0 0 1-1 1H7a1.5 1.5 0 0 1-1.5-1.5z"
        fill={warna}
      />
      <path
        d="M9 8.5h6M9 11.5h6"
        stroke="rgba(255,255,255,.75)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface PropsKotakIrama {
  item: ItemIrama;
  blok: BlokWaktu;
  /** Indeks hari dalam minggu: 0=Senin, ..., 6=Minggu. */
  indeksHari: number;
  /** Ukuran kotak dalam px (36–46). Default 46. */
  ukuran?: number;
  onKetuk?: () => void;
}

export default function KotakIrama({ item, blok, indeksHari, ukuran = 46, onKetuk }: PropsKotakIrama) {
  const namaHari = NAMA_HARI[indeksHari] ?? '';
  const namaBlok = LABEL_BLOK[blok];
  const sz = ukuran;

  if (item.jenis === 'ajakMain') {
    const dk = item.domainKey;
    const latarWarna = dk ? LATAR_DOMAIN[dk] : '#EADFDA';
    const warnaIkon = dk ? warnaIkonDomain(dk) : '#6E3B57';
    const namaDomain = dk ? LABEL_DOMAIN[dk] : '';
    const statusLabel = item.selesai ? 'Selesai' : 'Terjadwal';

    const ariaLabel = `${namaHari} ${namaBlok}. Ajak Main: ${item.judul}. ${namaDomain}. ${statusLabel}.`;

    const style: React.CSSProperties = item.selesai
      ? {
          width: sz, height: sz,
          borderRadius: 14,
          backgroundColor: latarWarna,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          border: 'none',
        }
      : {
          width: sz, height: sz,
          borderRadius: 14,
          backgroundColor: latarWarna + '2E',
          border: `1.5px dashed ${latarWarna}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
        };

    return (
      <button type="button" style={style} aria-label={ariaLabel} onClick={onKetuk}>
        <IkonPohon warna={warnaIkon} />
      </button>
    );
  }

  // Wawasan Tumbuh
  const warnaCover = item.warnaCover ?? '#6F3B57';
  const warnaBuku = rasioKontras(warnaCover, WAWASAN_BG) < 3 ? gelapkan(warnaCover) : warnaCover;
  const statusLabel = item.selesai ? 'Selesai' : 'Terjadwal';
  const ariaLabel = `${namaHari} ${namaBlok}. Wawasan Tumbuh: ${item.judul}. ${statusLabel}.`;

  const styleWawasan: React.CSSProperties = item.selesai
    ? {
        width: sz, height: sz,
        borderRadius: 14,
        backgroundColor: WAWASAN_BG,
        border: `1px solid ${WAWASAN_BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
      }
    : {
        width: sz, height: sz,
        borderRadius: 14,
        backgroundColor: WAWASAN_BG,
        border: `1.5px dashed ${WAWASAN_BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
      };

  return (
    <button type="button" style={styleWawasan} aria-label={ariaLabel} onClick={onKetuk}>
      <IkonBuku warna={warnaBuku} />
    </button>
  );
}

export function KotakKosong({ ukuran = 46 }: { ukuran?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: ukuran, height: ukuran,
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div style={{ width: 14, height: 3, borderRadius: 99, backgroundColor: '#DFCDBE' }} />
    </div>
  );
}

export function ChipLebih({ n, ukuran = 46, onKetuk }: { n: number; ukuran?: number; onKetuk?: () => void }) {
  return (
    <button
      type="button"
      style={{
        width: ukuran, height: ukuran,
        borderRadius: 14,
        backgroundColor: '#EADFDA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
        border: 'none',
      }}
      aria-label={`${n} kegiatan lainnya`}
      onClick={onKetuk}
    >
      <span
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 700,
          color: '#6E3B57',
        }}
      >
        +{n}
      </span>
    </button>
  );
}
