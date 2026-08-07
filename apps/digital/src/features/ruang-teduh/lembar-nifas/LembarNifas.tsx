import React, { useState } from 'react';
import type { TingkatKondisi } from '../types';
import {
  LEMBAR_NIFAS_JUDUL,
  LEMBAR_NIFAS_SUBTEKS,
  KONDISI_NIFAS,
  TIDAK_PERLU_JUDUL,
  TIDAK_PERLU_BUTIR,
} from '../content';
import { usePenyimpanan, useCatatanHari } from '../penyimpanan/PenyimpananProvider';
import AlertBahaya from './AlertBahaya';
import JadwalPeriksaNifas from './JadwalPeriksaNifas';

const BAHAYA_GAYA = {
  bg:         '#FFF5F7',
  dot:        '#E58BA8',
  labelColor: '#6E3B57',
};
const DICATAT_GAYA = {
  bg:         '#FBF7EE',
  dot:        '#C9A86A',
  labelColor: '#6E5A3B',
};

interface PropsLembarNifas {
  hariKe: number;
  hariIni: string;
}

/**
 * Hanya dirender kalau dalamMasaNifas adalah true (dijaga oleh pemanggil).
 * Tidak berisi saran perawatan mandiri.
 */
export default function LembarNifas({ hariKe, hariIni }: PropsLembarNifas) {
  const { caregiverId } = usePenyimpanan();
  const { catatan, simpan } = useCatatanHari(caregiverId, hariIni);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const dipilih = new Set(catatan?.kondisiNifas ?? []);

  function toggleKondisi(id: string) {
    const next = new Set(dipilih);
    if (next.has(id)) next.delete(id); else next.add(id);
    // Mengirim array kosong secara eksplisit mengosongkan kondisiNifas di repo
    simpan({ kondisiNifas: Array.from(next) });
    setAlertDismissed(false);
  }

  const bahayaDipilih = KONDISI_NIFAS.filter(
    k => k.tingkat === 'bahaya' && dipilih.has(k.id),
  );
  const tampilAlert = bahayaDipilih.length > 0 && !alertDismissed;

  return (
    <div>
      <h2
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 22,
          fontWeight: 600,
          color: '#3A2530',
          margin: '0 0 4px',
        }}
      >
        {LEMBAR_NIFAS_JUDUL}
      </h2>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 13,
          color: '#8A7A80',
          margin: '0 0 6px',
          lineHeight: 1.5,
        }}
      >
        Hari ke {hariKe} masa nifas
      </p>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 13,
          color: '#8A7A80',
          margin: '0 0 16px',
          lineHeight: 1.5,
        }}
      >
        {LEMBAR_NIFAS_SUBTEKS}
      </p>

      {tampilAlert && (
        <AlertBahaya
          kondisi={bahayaDipilih}
          onTutup={() => setAlertDismissed(true)}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kolom kiri: daftar kondisi */}
        <div>
          <KelompokKondisi
            tingkat="bahaya"
            dipilih={dipilih}
            onToggle={toggleKondisi}
          />

          <div style={{ height: 16 }} />

          <KelompokKondisi
            tingkat="dicatat"
            dipilih={dipilih}
            onToggle={toggleKondisi}
          />
        </div>

        {/* Kolom kanan: jadwal + tidak perlu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '20px 18px',
              border: '1px solid rgba(224,82,107,.12)',
            }}
          >
            <JadwalPeriksaNifas hariKe={hariKe} />
          </div>

          <TidakPerluCard />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-komponen internal ────────────────────────────────────────────────────

interface PropsKelompokKondisi {
  tingkat: TingkatKondisi;
  dipilih: Set<string>;
  onToggle: (id: string) => void;
}

function KelompokKondisi({ tingkat, dipilih, onToggle }: PropsKelompokKondisi) {
  const items = KONDISI_NIFAS.filter(k => k.tingkat === tingkat);
  const g = tingkat === 'bahaya' ? BAHAYA_GAYA : DICATAT_GAYA;

  const judul =
    tingkat === 'bahaya'
      ? 'Tanda bahaya (segera periksa)'
      : 'Yang bisa dicatat';

  return (
    <div>
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 800,
          color: g.labelColor,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: '0 0 8px',
        }}
      >
        {judul}
      </p>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        {items.map(k => {
          const checked = dipilih.has(k.id);
          return (
            <li key={k.id}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 12,
                  background: checked ? g.bg : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 130ms ease',
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    border: `2px solid ${checked ? g.dot : '#C0A6B7'}`,
                    background: checked ? g.dot : 'transparent',
                    flexShrink: 0,
                    marginTop: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 130ms ease, border-color 130ms ease',
                  }}
                  aria-hidden="true"
                >
                  {checked && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>

                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(k.id)}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  aria-label={k.label}
                />

                <span
                  style={{
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontSize: 13,
                    color: checked ? g.labelColor : '#6E5A6E',
                    lineHeight: 1.5,
                    fontWeight: checked ? 700 : 600,
                  }}
                >
                  {k.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TidakPerluCard() {
  return (
    <div
      style={{
        background: '#F7F3FB',
        borderRadius: 18,
        padding: '18px 18px 16px',
        border: '1px solid #E6DCEF',
      }}
    >
      <p
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          color: '#3A2530',
          margin: '0 0 10px',
        }}
      >
        {TIDAK_PERLU_JUDUL}
      </p>

      <ul
        style={{
          margin: 0,
          padding: '0 0 0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {TIDAK_PERLU_BUTIR.map((b, i) => (
          <li
            key={i}
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              color: '#6E3B57',
              lineHeight: 1.55,
            }}
          >
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
