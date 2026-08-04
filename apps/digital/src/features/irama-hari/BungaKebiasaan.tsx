import React, { useState } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { REGISTRY_BUNGA } from '../akar-keluarga/registryBunga';
import { tingkatMekar, TINGKAT_MAKS } from '@studiva/shared';
import { tambahHari } from '@studiva/shared';
import {
  JUDUL_PITA,
  KEBIASAAN_DISIRAM,
  KEBIASAAN_ISTIRAHAT,
  KEBIASAAN_LIHAT_SEMUA,
  KEBIASAAN_KOSONG,
} from './contentMingguan';

// Radius kelopak — tanda tangan brand Rekah.
const RADIUS_KELOPAK = '70% 70% 70% 4px';
const MAKS_BARIS_TAMPIL = 3;

// State chip: istirahat vs sedang mekar.
const CHIP_ISTIRAHAT = { ink: '#A98DA0', bg: '#F3E8EF', label: 'Istirahat' };
const CHIP_AKTIF     = { ink: '#B98900', bg: '#FFF3D0', label: 'Sedang mekar' };

interface BungaIkonProps {
  warna: string;
  mekar: number;
  gerak: boolean;
}

function BungaIkon({ warna, mekar, gerak }: BungaIkonProps) {
  const fraksi = mekar / TINGKAT_MAKS;
  const ukuran = Math.round(10 + fraksi * 20); // 10px pada 0, 30px pada 7
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
  gerak: boolean;
}

function BarisNilai({ nilai, riwayatSiram, mulaiSenin, gerak }: PropsBarisNilai) {
  const bunga = REGISTRY_BUNGA.find(b => b.nama === nilai);
  const warna = bunga?.warnaPetal ?? '#C9B8F0';

  const riwayat = Array.from({ length: 7 }, (_, i) => {
    const tgl = tambahHari(mulaiSenin, i);
    return (riwayatSiram[tgl] ?? []).includes(nilai);
  });

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

      {/* 7 slot mekar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginLeft: 44,
          gap: 4,
        }}
      >
        {Array.from({ length: 7 }, (_, i) => (
          <BungaIkon key={i} warna={warna} mekar={levels[i] ?? 0} gerak={gerak} />
        ))}
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
  onKetukAkarKeluarga: () => void;
}

export default function BungaKebiasaan({
  nilaiFokus,
  riwayatSiram,
  mulaiSenin,
  tanggalHariIni,
  onKetukAkarKeluarga,
}: PropsBungaKebiasaan) {
  const [lihatSemua, setLihatSemua] = useState(false);

  // Hormati prefers-reduced-motion — hanya boleh diakses di browser.
  const gerak =
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (nilaiFokus.length === 0) {
    return (
      <div style={{ padding: '8px 0' }}>
        <button
          type="button"
          onClick={onKetukAkarKeluarga}
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
