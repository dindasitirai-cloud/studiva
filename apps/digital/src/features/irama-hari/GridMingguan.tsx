import React, { useRef, useCallback } from 'react';
import type { MingguIrama, HariIrama, ItemIrama, BlokWaktu } from '@studiva/shared';
import { BLOK_URUTAN } from '@studiva/shared';
import KotakIrama, { KotakKosong, ChipLebih } from './KotakIrama';
import { LABEL_BLOK } from './contentMingguan';

const NAMA_HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const NAMA_HARI_PENUH  = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

// Latar sel: hari ini vs hari lain.
const BG_SEL_HARI_INI = '#FFF7EE';
const BG_SEL_LAIN     = '#FBF3E8';

// Warna titik penanda per blok waktu.
const DOT_BLOK: Record<string, string> = {
  pagi:        '#F06BA8',
  siang:       '#FFC94D',
  sore:        '#C9B8F0',
  jelangTidur: '#5F84E6',
};

interface PropsGridMingguan {
  minggu: MingguIrama;
  tanggalHariIni: string;
  tanggalDaftarAnak?: string;
  kotakUkuran?: number;
  onKetukItem?: (item: ItemIrama, tanggal: string, blok: BlokWaktu) => void;
  onKetukHari?: (tanggal: string) => void;
  onKetukSlotKosong?: (tanggal: string, blok: BlokWaktu) => void;
  onKetukLebih?: (hari: HariIrama, blok: BlokWaktu) => void;
}

export default function GridMingguan({
  minggu,
  tanggalHariIni,
  tanggalDaftarAnak,
  kotakUkuran = 46,
  onKetukItem,
  onKetukHari,
  onKetukLebih,
}: PropsGridMingguan) {
  const gridRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement;
    const cells = gridRef.current
      ? Array.from(gridRef.current.querySelectorAll<HTMLElement>('[role="gridcell"]'))
      : [];
    const idx = cells.indexOf(el);
    if (idx === -1) return;

    const COLS = 7;
    let nextIdx = -1;
    if (e.key === 'ArrowRight') nextIdx = idx + 1;
    else if (e.key === 'ArrowLeft') nextIdx = idx - 1;
    else if (e.key === 'ArrowDown') nextIdx = idx + COLS;
    else if (e.key === 'ArrowUp') nextIdx = idx - COLS;

    if (nextIdx >= 0 && nextIdx < cells.length) {
      e.preventDefault();
      cells[nextIdx].focus();
    }
  }, []);

  return (
    <div
      role="grid"
      aria-label="Grid Irama Hari Mingguan"
      ref={gridRef}
      onKeyDown={handleKeyDown}
      style={{ width: '100%', overflowX: 'hidden' }}
    >
      {/* Header hari */}
      <div role="row" style={{ display: 'flex', marginLeft: 74, marginBottom: 6 }}>
        {minggu.hari.map((hari, i) => {
          const isHariIni = hari.tanggal === tanggalHariIni;
          const tglAngka = parseInt(hari.tanggal.split('-')[2] ?? '0', 10);
          return (
            <div
              key={hari.tanggal}
              role="columnheader"
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => onKetukHari?.(hari.tanggal)}
                aria-label={`${NAMA_HARI_PENUH[i]}, buka Irama Hari harian`}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  ...(isHariIni
                    ? {
                        width: 40, height: 44,
                        borderRadius: 14,
                        background: '#F06BA8',
                        color: '#FFFFFF',
                      }
                    : {
                        background: 'transparent',
                        color: '#A98DA0',
                        gap: 1,
                      }),
                }}
              >
                <span style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                }}>
                  {NAMA_HARI_PENDEK[i]}
                </span>
                <span style={{
                  fontFamily: 'Fredoka, system-ui, sans-serif',
                  fontSize: isHariIni ? 16 : 15,
                  fontWeight: isHariIni ? 700 : 600,
                  lineHeight: 1,
                  color: isHariIni ? '#FFFFFF' : '#C7A9BE',
                }}>
                  {tglAngka}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Baris per blok waktu */}
      {BLOK_URUTAN.map(blok => (
        <div
          key={blok}
          role="row"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            borderTop: '1px solid rgba(110,59,87,.09)',
            padding: '12px 0',
          }}
        >
          {/* Label blok waktu */}
          <div
            style={{
              width: 74,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 7,
              paddingTop: 2,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: DOT_BLOK[blok] ?? '#C7A9BE',
                flexShrink: 0,
                marginTop: 3,
              }}
            />
            <span
              style={{
                fontFamily: 'Fredoka, system-ui, sans-serif',
                fontSize: 13.5,
                fontWeight: 600,
                color: '#6E3B57',
                lineHeight: 1.05,
              }}
            >
              {LABEL_BLOK[blok]}
            </span>
          </div>

          {/* 7 kolom sel */}
          {minggu.hari.map((hari, indeksHari) => {
            const isHariIni = hari.tanggal === tanggalHariIni;
            const sebelumDaftar =
              tanggalDaftarAnak !== undefined && hari.tanggal < tanggalDaftarAnak;
            const items = hari.slot[blok];

            const tampil = items.slice(0, 2);
            const sisa = items.length > 2 ? items.length - 2 : 0;

            return (
              <div
                key={hari.tanggal}
                role="gridcell"
                tabIndex={0}
                aria-label={`${NAMA_HARI_PENUH[indeksHari]} ${LABEL_BLOK[blok]}`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 66,
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '6px 4px',
                  backgroundColor: isHariIni ? BG_SEL_HARI_INI : BG_SEL_LAIN,
                  opacity: sebelumDaftar ? 0.4 : 1,
                  pointerEvents: sebelumDaftar ? 'none' : undefined,
                }}
              >
                {tampil.map(item => (
                  <KotakIrama
                    key={item.id}
                    item={item}
                    blok={blok}
                    indeksHari={indeksHari}
                    ukuran={kotakUkuran}
                    onKetuk={() => onKetukItem?.(item, hari.tanggal, blok)}
                  />
                ))}
                {sisa > 0 && (
                  <ChipLebih
                    n={sisa}
                    ukuran={kotakUkuran}
                    onKetuk={() => onKetukLebih?.(hari, blok)}
                  />
                )}
                {items.length === 0 && <KotakKosong ukuran={kotakUkuran} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
