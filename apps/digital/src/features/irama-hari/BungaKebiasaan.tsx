import React, { useState } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { REGISTRY_BUNGA } from '../akar-keluarga/registryBunga';
import { tingkatMekar, TINGKAT_MAKS, tambahHari } from '@studiva/shared';
import {
  JUDUL_PITA,
  KEBIASAAN_DISIRAM,
  KEBIASAAN_ISTIRAHAT,
  KEBIASAAN_LIHAT_SEMUA,
  KEBIASAAN_KOSONG,
} from './contentMingguan';

const RADIUS_KELOPAK = '70% 70% 70% 4px';
const MAKS_BARIS_TAMPIL = 3;
const GRACE_WINDOW_HARI = 2;
const NAMA_HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const CHIP_ISTIRAHAT = { ink: '#A98DA0', bg: '#F3E8EF', label: 'Istirahat' };
const CHIP_AKTIF     = { ink: '#B98900', bg: '#FFF3D0', label: 'Sedang mekar' };

interface BungaIkonProps {
  warna: string;
  mekar: number;
  gerak: boolean;
}

function BungaIkon({ warna, mekar, gerak }: BungaIkonProps) {
  const fraksi = mekar / TINGKAT_MAKS;
  const ukuran = Math.round(10 + fraksi * 20); // 10px saat 0, 30px saat 7
  const opacity = mekar === 0 ? 0.12 : 0.3 + fraksi * 0.7;

  return (
    <div
      style={{
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: ukuran,
          height: ukuran,
          borderRadius: RADIUS_KELOPAK,
          backgroundColor: warna,
          opacity,
          transition: gerak ? 'width 400ms ease, height 400ms ease, opacity 400ms ease' : 'none',
        }}
      />
    </div>
  );
}

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
  const bunga = REGISTRY_BUNGA.find(b => b.nama === nilai);
  const warna = bunga?.warnaPetal ?? '#C9B8F0';

  // Susun riwayat boolean 7 hari untuk tingkatMekar.
  const tanggalMinggu = Array.from({ length: 7 }, (_, i) => tambahHari(mulaiSenin, i));
  const riwayat = tanggalMinggu.map(tgl => (riwayatSiram[tgl] ?? []).includes(nilai));
  const levels = tingkatMekar(riwayat);

  const jumlahDisiram = riwayat.filter(Boolean).length;
  const chip = jumlahDisiram === 0 ? CHIP_ISTIRAHAT : CHIP_AKTIF;

  const kalimat = jumlahDisiram > 0
    ? KEBIASAAN_DISIRAM(nilai, jumlahDisiram)
    : KEBIASAAN_ISTIRAHAT(nilai);

  return (
    <div style={{ paddingTop: 14, paddingBottom: 2, borderTop: '1px solid rgba(110,59,87,.09)' }}>
      {/* Baris atas: lingkaran bunga + nama + chip state */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
        <div
          style={{
            width: 34, height: 34,
            borderRadius: '50%',
            backgroundColor: warna + '28',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: RADIUS_KELOPAK, backgroundColor: warna }} />
        </div>
        <span
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 17,
            fontWeight: 600,
            color: '#6E3B57',
            flex: 1,
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
          }}
        >
          {chip.label}
        </span>
      </div>

      {/* 7 slot toggle — area sentuh 44×44px, ikon bunga 30×30 di tengah */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
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
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 4,
                background: 'none',
                border: 'none',
                cursor: bisaToggle ? 'pointer' : 'default',
              }}
            >
              <BungaIkon warna={warna} mekar={levels[i] ?? 0} gerak={gerak} />
            </button>
          );
        })}
      </div>

      {/* Kalimat info */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          color: '#A98DA0',
          marginLeft: 44,
          marginTop: 8,
        }}
      >
        {kalimat}
      </p>
    </div>
  );
}

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
        <em>sedang mekar</em>, bukan skor — kelopak mencerah satu per satu.
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
