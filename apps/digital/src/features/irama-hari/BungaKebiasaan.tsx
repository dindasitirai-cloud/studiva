import React, { useState } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { BUNGA_DARI_NAMA } from '../akar-keluarga/registryBunga';
import type { DataBunga } from '../akar-keluarga/registryBunga';
import { tingkatMekar, TINGKAT_MAKS, tambahHari } from '@studiva/shared';
import {
  JUDUL_PITA,
  KEBIASAAN_DISIRAM,
  KEBIASAAN_ISTIRAHAT,
  KEBIASAAN_LIHAT_SEMUA,
  KEBIASAAN_KOSONG,
  KEBIASAAN_MEKAR_PENUH_LABEL,
  KEBIASAAN_LEGENDA,
} from './contentMingguan';

const MAKS_BARIS_TAMPIL = 3;
const GRACE_WINDOW_HARI = 2;
const NAMA_HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const CHIP_ISTIRAHAT  = { ink: '#A98DA0', bg: '#F3E8EF',  label: 'Istirahat'    };
const CHIP_AKTIF      = { ink: '#B98900', bg: '#FFF3D0',  label: 'Sedang mekar' };
const CHIP_PENUH      = { ink: '#B98900', bg: '#FFF3D0',  label: KEBIASAAN_MEKAR_PENUH_LABEL };

// ─── Reusable Flower SVG ──────────────────────────────────────────────────────
// Props: bunga (from REGISTRY_BUNGA), lit (how many petals are lit 0..n), size (px)
// Lit petals: opacity 1. Unlit: opacity 0.5. Same fill color for both.
// Center dims (0.62) only when fully at rest (lit === 0).

export function BungaSVG({
  bunga,
  lit,
  size,
}: {
  bunga: DataBunga;
  lit: number;
  size: number;
}) {
  const n = bunga.kelopak;
  const anyLit = lit > 0;

  return (
    <svg
      viewBox="-74 -74 148 148"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {Array.from({ length: n }, (_, i) => (
        <path
          key={i}
          d={bunga.d}
          fill={bunga.warnaPetal}
          opacity={i < lit ? 1 : 0.5}
          transform={`rotate(${((i * 360) / n).toFixed(2)})`}
        />
      ))}
      <circle cx={0} cy={0} r={bunga.r1} fill={bunga.c1} opacity={anyLit ? 1 : 0.62} />
      <circle cx={0} cy={0} r={bunga.r2} fill={bunga.c2} opacity={anyLit ? 1 : 0.62} />
    </svg>
  );
}

// Fallback flower for unknown NilaiAkar
const BUNGA_FALLBACK: DataBunga = {
  id: 'fallback',
  nama: 'Kasih Sayang',
  kelopak: 5,
  warnaPetal: '#C9B8F0',
  d: 'M0 0 C -19.512 -11.7 -20.29248 -39.6 -10.14624 -45 C -6.24384 -48 -1.17072 -32.58 0 -32.58 C 1.17072 -32.58 6.24384 -48 10.14624 -45 C 20.29248 -39.6 19.512 -11.7 0 0 Z',
  r1: 15.0, r2: 7.5, c1: '#FFE29A', c2: '#FFF3E6',
};

// ─── One row per tracked value ────────────────────────────────────────────────

interface PropsBarisNilai {
  nilai: NilaiAkar;
  riwayatSiram: Record<string, NilaiAkar[]>;
  mulaiSenin: string;
  tanggalHariIni: string;
  onToggleSiram?: (nilai: NilaiAkar, tanggal: string) => void;
  gerak: boolean;
}

function BarisNilai({
  nilai,
  riwayatSiram,
  mulaiSenin,
  tanggalHariIni,
  onToggleSiram,
  gerak,
}: PropsBarisNilai) {
  const bunga = BUNGA_DARI_NAMA.get(nilai) ?? BUNGA_FALLBACK;
  const n = bunga.kelopak;

  // 7-day boolean riwayat and cumulative bloom levels
  const tanggalMinggu = Array.from({ length: 7 }, (_, i) => tambahHari(mulaiSenin, i));
  const riwayat = tanggalMinggu.map(tgl => (riwayatSiram[tgl] ?? []).includes(nilai));
  const levels = tingkatMekar(riwayat);

  // Index of today within this week (0–6); clamps to range for past/future weeks
  const todayMs = new Date(tanggalHariIni + 'T00:00:00Z').getTime();
  const seninMs = new Date(mulaiSenin + 'T00:00:00Z').getTime();
  const todayIndex = Math.max(0, Math.min(6, Math.floor((todayMs - seninMs) / 86400000)));

  // Bloom level for today → drives chip state
  const levelHariIni = levels[todayIndex] ?? 0;

  const chip =
    levelHariIni === 0           ? CHIP_ISTIRAHAT :
    levelHariIni >= TINGKAT_MAKS ? CHIP_PENUH     :
                                   CHIP_AKTIF;

  const jumlahDisiram = riwayat.filter(Boolean).length;
  const kalimat = jumlahDisiram > 0
    ? KEBIASAAN_DISIRAM(nilai, jumlahDisiram)
    : KEBIASAAN_ISTIRAHAT(nilai);

  return (
    <div style={{ paddingTop: 14, paddingBottom: 10, borderTop: '1px solid rgba(110,59,87,.09)' }}>
      {/* Header: 34px badge (soft circle + 26px full-bloom flower) + name + chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
        <div
          style={{
            width: 34, height: 34,
            borderRadius: '50%',
            backgroundColor: bunga.warnaPetal + '28',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* Always full-bloom in the badge */}
          <BungaSVG bunga={bunga} lit={n} size={26} />
        </div>

        <span
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 17,
            fontWeight: 600,
            color: '#6E3B57',
            flex: 1,
            minWidth: 0,
          }}
        >
          {nilai}
        </span>

        <span
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 11.5,
            fontWeight: 700,
            color: chip.ink,
            backgroundColor: chip.bg,
            borderRadius: 999,
            padding: '4px 11px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {chip.label}
        </span>
      </div>

      {/* 7-slot ribbon — each slot is a 30px flower blooming left→right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginLeft: 44,
        }}
      >
        {tanggalMinggu.map((tgl, i) => {
          const disiram = riwayat[i] ?? false;
          const selisihHari = Math.floor(
            (new Date(tanggalHariIni + 'T00:00:00Z').getTime() -
              new Date(tgl + 'T00:00:00Z').getTime()) / 86400000,
          );
          const bisaToggle = selisihHari >= 0 && selisihHari <= GRACE_WINDOW_HARI;
          const namaHari = NAMA_HARI_PENDEK[i] ?? '';

          // Bloom stage opacity:
          // - future (i > todayIndex): full-bloom at 0.4 — "not yet reached"
          // - level=0 (istirahat): lit=0, BungaSVG dims per-petal, outer 1.0
          // - level X.5 (half-step): full-bloom at 0.7 — meredup / setengah tahapan
          // - integer level > 0 (settled): full-bloom at 1.0
          const isFuture = i > todayIndex;
          const level = isFuture ? null : (levels[i] ?? 0);
          const litKelopak = level === 0 ? 0 : n;
          const outerOpacity =
            level === null  ? 0.4 :
            level === 0     ? 1.0 :
            level % 1 !== 0 ? 0.7 :
            1.0;

          return (
            <button
              key={tgl}
              type="button"
              role="checkbox"
              aria-checked={disiram}
              aria-label={`${nilai}, ${namaHari}, ${disiram ? 'sudah disiram' : 'belum disiram'}`}
              disabled={!bisaToggle}
              onClick={() => onToggleSiram?.(nilai, tgl)}
              style={{
                flex: 1,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: bisaToggle ? 'pointer' : 'default',
                padding: 0,
                opacity: outerOpacity,
                transition: gerak ? 'opacity 300ms ease' : 'none',
              }}
            >
              <BungaSVG bunga={bunga} lit={litKelopak} size={30} />
            </button>
          );
        })}
      </div>

      {/* Legend: Istirahat · Mulai mekar · Mekar penuh */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          color: '#C0A6B7',
          marginLeft: 44,
          marginTop: 4,
          marginBottom: 0,
        }}
      >
        {KEBIASAAN_LEGENDA}
      </p>

      {/* Descriptive sentence */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          color: '#A98DA0',
          marginLeft: 44,
          marginTop: 6,
          marginBottom: 0,
        }}
      >
        {kalimat}
      </p>
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

interface PropsBungaKebiasaan {
  nilaiFokus: readonly NilaiAkar[];
  riwayatSiram: Record<string, NilaiAkar[]>;
  mulaiSenin: string;
  tanggalHariIni: string;
  onToggleSiram?: (nilai: NilaiAkar, tanggal: string) => void;
  onTanamNilai: () => void;
}

export default function BungaKebiasaan({
  nilaiFokus,
  riwayatSiram,
  mulaiSenin,
  tanggalHariIni,
  onToggleSiram,
  onTanamNilai,
}: PropsBungaKebiasaan) {
  const [lihatSemua, setLihatSemua] = useState(false);

  const gerak =
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (nilaiFokus.length === 0) {
    return (
      <div style={{ padding: '8px 0' }}>
        <button
          type="button"
          onClick={onTanamNilai}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 13,
            color: '#E0526B',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          {KEBIASAAN_KOSONG}
        </button>
      </div>
    );
  }

  const tampilNilai = lihatSemua ? nilaiFokus : nilaiFokus.slice(0, MAKS_BARIS_TAMPIL);
  const adaSisa = nilaiFokus.length > MAKS_BARIS_TAMPIL;

  return (
    <section
      aria-labelledby="bunga-kebiasaan-judul"
      style={{
        background: '#fff',
        borderRadius: 28,
        padding: '24px 24px 22px',
        boxShadow: '0 14px 34px -26px rgba(90,50,70,.55)',
      }}
    >
      <h3
        id="bunga-kebiasaan-judul"
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          color: '#6E3B57',
          margin: '0 0 4px',
        }}
      >
        {JUDUL_PITA}
      </h3>

      {/* Principle line — "sedang mekar" italicized */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 13.5,
          lineHeight: 1.5,
          color: '#A98DA0',
          marginBottom: 4,
        }}
      >
        Pertumbuhan terbaca sebagai{' '}
        <em>sedang mekar</em>
        , bukan skor — kelopak mencerah satu per satu. Istirahat bukan layu: tetap
        utuh, menunggu waktunya.
      </p>

      {tampilNilai.map(nilai => (
        <BarisNilai
          key={nilai}
          nilai={nilai}
          riwayatSiram={riwayatSiram}
          mulaiSenin={mulaiSenin}
          tanggalHariIni={tanggalHariIni}
          onToggleSiram={onToggleSiram}
          gerak={gerak}
        />
      ))}

      {adaSisa && !lihatSemua && (
        <button
          type="button"
          onClick={() => setLihatSemua(true)}
          style={{
            marginTop: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#E0526B',
            padding: 0,
          }}
        >
          {KEBIASAAN_LIHAT_SEMUA}
        </button>
      )}
    </section>
  );
}
