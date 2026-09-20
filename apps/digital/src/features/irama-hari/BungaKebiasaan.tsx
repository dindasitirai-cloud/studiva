import React, { useState } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { BUNGA_DARI_NAMA } from '../akar-keluarga/registryBunga';
import type { DataBunga } from '../akar-keluarga/registryBunga';
import BungaMekar from './BungaMekar';
import {
  tingkatMekar,
  riwayatSiramNilai,
  disiramPada,
} from '@studiva/shared';
import type { CentangKebiasaan } from '@studiva/shared';
import {
  labelDariMekar,
  CHIP_PITA,
  PRINSIP_PITA,
  KALIMAT_PITA,
} from '../../constants/copy-pita-kebiasaan';
import {
  JUDUL_PITA,
  KEBIASAAN_LIHAT_SEMUA,
  KEBIASAAN_KOSONG,
} from './contentMingguan';

const MAKS_TAMPIL = 6; // max nilai dalam grid sebelum "lihat semua"

// ─── Bunga lencana — full-bloom, untuk sel header ────────────────────────────

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

const BUNGA_FALLBACK: DataBunga = {
  id: 'fallback',
  nama: 'Kasih Sayang',
  kelopak: 5,
  warnaPetal: '#C9B8F0',
  d: 'M0 0 C -19.512 -11.7 -20.29248 -39.6 -10.14624 -45 C -6.24384 -48 -1.17072 -32.58 0 -32.58 C 1.17072 -32.58 6.24384 -48 10.14624 -45 C 20.29248 -39.6 19.512 -11.7 0 0 Z',
  r1: 15.0, r2: 7.5, c1: '#FFE29A', c2: '#FFF3E6',
};

// ─── Helper: bangun riwayat boolean[] untuk tingkatMekar ─────────────────────
// Konsisten dengan pendekatan KartuKebiasaanBaik: gunakan centangKebiasaan
// secara langsung agar status, hitung, dan tracker selalu sinkron.

function hitungMekarDariCentang(
  centang: CentangKebiasaan,
  nilai: NilaiAkar,
  tanggalHariIni: string,
): number {
  const allDates = Object.keys(centang).sort().filter(t => t <= tanggalHariIni);
  if (allDates.length === 0) return 0;
  const riwayat = allDates.map(tgl => disiramPada(centang, nilai, tgl));
  const levels = tingkatMekar(riwayat);
  return levels[levels.length - 1] ?? 0;
}

// ─── Format tanggal pendek (YYYY-MM-DD → "10 Agu 2026") ─────────────────────
const NAMA_BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function formatTanggalPendek(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${parseInt(d, 10)} ${NAMA_BULAN[parseInt(m, 10) - 1]} ${y}`;
}

// ─── Satu sel bunga ──────────────────────────────────────────────────────────

function SelBunga({
  nilai,
  centangKebiasaan,
  tanggalHariIni,
  size = 80,
}: {
  nilai: NilaiAkar;
  centangKebiasaan: CentangKebiasaan;
  tanggalHariIni: string;
  size?: number;
}) {
  const bunga = BUNGA_DARI_NAMA.get(nilai) ?? BUNGA_FALLBACK;
  const [riwayatBuka, setRiwayatBuka] = useState(false);

  // Gunakan pendekatan sama persis dengan KartuKebiasaanBaik agar selalu sinkron
  const mekar = hitungMekarDariCentang(centangKebiasaan, nilai, tanggalHariIni);
  const label = labelDariMekar(mekar);
  const chip = CHIP_PITA[label];

  // Riwayat tanggal disiram (s.d. hari ini), terbaru duluan
  const riwayatDisiram = riwayatSiramNilai(centangKebiasaan, nilai)
    .filter(t => t <= tanggalHariIni)
    .reverse();
  const totalDisiram = riwayatDisiram.length;

  const hitungLabel = KALIMAT_PITA.hitungPendek(totalDisiram);
  const belumDisiram = totalDisiram === 0;

  const compact = size < 70;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: compact ? 4 : 8,
        padding: compact ? '8px 6px 6px' : '14px 8px 12px',
      }}
    >
      {/* Bunga mekar — pusat visual */}
      <BungaMekar bunga={bunga} mekar={mekar} size={size} />

      {/* Nama nilai */}
      <span
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: compact ? 12 : 15,
          fontWeight: 600,
          color: '#6E3B57',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {nilai}
      </span>

      {/* Chip label tahap mekar */}
      <span
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: compact ? 9.5 : 11,
          fontWeight: 700,
          color: chip.ink,
          backgroundColor: chip.bg,
          borderRadius: 999,
          padding: compact ? '2px 7px' : '3px 10px',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>

      {/* Hitung disiram — klikable jika sudah pernah disiram */}
      {belumDisiram ? (
        <span
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: compact ? 9.5 : 11,
            color: '#DFCDBE',
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          {hitungLabel}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setRiwayatBuka(true)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: compact ? 9.5 : 11,
            color: '#C0A6B7',
            textDecoration: 'underline dotted',
            textAlign: 'center',
          }}
        >
          {hitungLabel}
        </button>
      )}

      {/* Popup riwayat tanggal disiram */}
      {riwayatBuka && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(110,59,87,.25)', backdropFilter: 'blur(3px)',
            padding: '24px 16px',
          }}
          onClick={() => setRiwayatBuka(false)}
        >
          <div
            style={{
              position: 'relative', backgroundColor: '#fff', borderRadius: 20,
              padding: '22px 20px', width: '100%', maxWidth: 300,
              boxShadow: '0 20px 50px rgba(90,50,70,.25)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontSize: 18, fontWeight: 700, color: '#6E3B57', marginBottom: 3 }}>
              {nilai}
            </div>
            <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontSize: 11.5, color: '#C0A6B7', marginBottom: 14 }}>
              Tanggal bunga disiram
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 220, overflowY: 'auto' }}>
              {riwayatDisiram.map(tgl => (
                <div
                  key={tgl}
                  style={{
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontSize: 13, fontWeight: 600, color: '#6E3B57',
                    padding: '7px 10px', background: '#FFF3F8', borderRadius: 10,
                  }}
                >
                  {formatTanggalPendek(tgl)}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRiwayatBuka(false)}
              style={{
                marginTop: 16, width: '100%', background: '#F3E8EF', border: 'none',
                borderRadius: 12, padding: '9px 0',
                fontFamily: 'Nunito, system-ui, sans-serif', fontSize: 13, fontWeight: 700,
                color: '#6E3B57', cursor: 'pointer',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

interface PropsBungaKebiasaan {
  nilaiFokus: readonly NilaiAkar[];
  /** Sumber kebenaran tunggal — sama dengan yang dipakai KartuKebiasaanBaik. */
  centangKebiasaan: CentangKebiasaan;
  /** Senin minggu yang sedang ditampilkan — dipakai untuk tracker 7 hari. */
  mulaiSenin: string;
  tanggalHariIni: string;
  /** Dipertahankan untuk kompatibilitas — toggle harian dilakukan di layar harian. */
  onToggleSiram?: (nilai: NilaiAkar, tanggal: string) => void;
  onTanamNilai: () => void;
  /** Mode kompak: sembunyikan subtitle, susun bunga horizontal */
  kompak?: boolean;
  /** Render hanya isi (bunga) tanpa card wrapper — untuk embedding di BerandaPage */
  noCard?: boolean;
}

export default function BungaKebiasaan({
  nilaiFokus,
  centangKebiasaan,
  mulaiSenin,
  tanggalHariIni,
  onTanamNilai,
  kompak = false,
  noCard = false,
}: PropsBungaKebiasaan) {
  const [lihatSemua, setLihatSemua] = useState(false);

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

  const tampilNilai = lihatSemua ? nilaiFokus : nilaiFokus.slice(0, MAKS_TAMPIL);
  const adaSisa = nilaiFokus.length > MAKS_TAMPIL;

  const bungaSize = kompak ? 58 : 80;

  if (kompak) {
    const flowerRow = (
      <>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0 2px',
          }}
        >
          {tampilNilai.map(nilai => (
            <SelBunga
              key={nilai}
              nilai={nilai}
              centangKebiasaan={centangKebiasaan}
              tanggalHariIni={tanggalHariIni}
              size={bungaSize}
            />
          ))}
        </div>

        {adaSisa && !lihatSemua && (
          <button
            type="button"
            onClick={() => setLihatSemua(true)}
            style={{
              marginTop: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: '#E0526B',
              padding: 0,
              width: '100%',
              textAlign: 'center',
            }}
          >
            {KEBIASAAN_LIHAT_SEMUA}
          </button>
        )}
      </>
    );

    if (noCard) return <>{flowerRow}</>;

    return (
      <section
        aria-labelledby="bunga-kebiasaan-judul"
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '12px 16px 8px',
          boxShadow: '0 8px 22px -18px rgba(90,50,70,.45)',
        }}
      >
        <h3
          id="bunga-kebiasaan-judul"
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            color: '#6E3B57',
            margin: '0 0 4px',
          }}
        >
          {JUDUL_PITA}
        </h3>
        {flowerRow}
      </section>
    );
  }

  return (
    <section
      aria-labelledby="bunga-kebiasaan-judul"
      style={{
        background: '#fff',
        borderRadius: 28,
        padding: '24px 20px 20px',
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

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12.5,
          lineHeight: 1.5,
          color: '#C0A6B7',
          marginBottom: 12,
        }}
      >
        {PRINSIP_PITA}
      </p>

      {/* Grid 2 kolom — bunga berdampingan */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0 4px',
        }}
      >
        {tampilNilai.map((nilai, idx) => (
          <div
            key={nilai}
            style={{
              borderTop: idx >= 2 ? '1px solid rgba(110,59,87,.08)' : 'none',
            }}
          >
            <SelBunga
              nilai={nilai}
              centangKebiasaan={centangKebiasaan}
              tanggalHariIni={tanggalHariIni}
              size={bungaSize}
            />
          </div>
        ))}
      </div>

      {adaSisa && !lihatSemua && (
        <button
          type="button"
          onClick={() => setLihatSemua(true)}
          style={{
            marginTop: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#E0526B',
            padding: 0,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {KEBIASAAN_LIHAT_SEMUA}
        </button>
      )}
    </section>
  );
}
