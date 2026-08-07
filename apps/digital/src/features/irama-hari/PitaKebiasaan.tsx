import React, { useState } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { REGISTRY_BUNGA } from '../akar-keluarga/registryBunga';
import {
  JUDUL_PITA,
  KEBIASAAN_DISIRAM,
  KEBIASAAN_ISTIRAHAT,
  KEBIASAAN_LIHAT_SEMUA,
  KEBIASAAN_KOSONG,
} from './contentMingguan';
import { tambahHari } from '@studiva/shared';

// Nama hari pendek untuk 7 kelopak, Senin pertama.
const NAMA_HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

// Radius kelopak — tanda tangan brand Rekah. Hanya dipakai di sini dan RingkasanMinggu.
const RADIUS_KELOPAK = '70% 70% 70% 4px';

// Warna penanda hari ini.
const REKAH_AKTIF = '#E0526B';
const REKAH_AKTIF_RING = '2px solid ' + REKAH_AKTIF;

// Grace window untuk menandai menyusul: berapa hari lalu masih boleh ditandai.
const GRACE_WINDOW_HARI = 2;

interface PropsBarisNilai {
  nilai: NilaiAkar;
  /** Tanggal-tanggal (ISO) minggu ini yang sudah disiram untuk nilai ini. */
  hariDisiram: Set<string>;
  mulaiSenin: string;
  tanggalHariIni: string;
  onToggleSiram: (nilai: NilaiAkar, tanggal: string) => void;
  onKetukLabel: (nilai: NilaiAkar) => void;
}

function BarisNilai({
  nilai,
  hariDisiram,
  mulaiSenin,
  tanggalHariIni,
  onToggleSiram,
  onKetukLabel,
}: PropsBarisNilai) {
  const bunga = REGISTRY_BUNGA.find(b => b.nama === nilai);
  const warnaKelopak = bunga?.warnaPetal ?? '#C9B8F0';

  const jumlahDisiram = hariDisiram.size;
  const kalimatInfo =
    jumlahDisiram > 0
      ? KEBIASAAN_DISIRAM(nilai, jumlahDisiram)
      : KEBIASAAN_ISTIRAHAT(nilai);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Label nilai */}
        <button
          type="button"
          onClick={() => onKetukLabel(nilai)}
          style={{
            width: 96,
            flexShrink: 0,
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#6E3B57',
            textAlign: 'left',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            padding: 0,
          }}
          title={nilai}
          aria-label={`Buka ${nilai} di Akar Keluarga`}
        >
          {nilai}
        </button>

        {/* 7 kelopak */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const tgl = tambahHari(mulaiSenin, i);
            const disiram = hariDisiram.has(tgl);
            const isHariIni = tgl === tanggalHariIni;
            const selisihHari = Math.floor(
              (new Date(tanggalHariIni + 'T00:00:00Z').getTime() -
                new Date(tgl + 'T00:00:00Z').getTime()) /
                86400000,
            );
            const bisaToggle = selisihHari >= 0 && selisihHari <= GRACE_WINDOW_HARI;
            const namaHari = NAMA_HARI_PENDEK[i] ?? '';

            const ariaLabel = `${nilai}, ${namaHari}, ${disiram ? 'sudah disiram' : 'belum disiram'}`;

            return (
              <button
                key={tgl}
                type="button"
                role="checkbox"
                aria-checked={disiram}
                aria-label={ariaLabel}
                disabled={!bisaToggle}
                onClick={() => bisaToggle && onToggleSiram(nilai, tgl)}
                style={{
                  // Area sentuh 44×44px; kelopak visual 28×28px di tengah
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: bisaToggle ? 'pointer' : 'default',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: RADIUS_KELOPAK,
                    backgroundColor: disiram ? warnaKelopak : 'transparent',
                    border: disiram
                      ? `1.5px solid ${warnaKelopak}`
                      : '1.5px solid #EADFDA',
                    outline: isHariIni ? REKAH_AKTIF_RING : undefined,
                    outlineOffset: 2,
                    transition: 'background-color 180ms ease, transform 120ms ease',
                    transform: 'scale(1)',
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Kalimat info di bawah baris */}
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 12,
          color: '#8A7080',
          marginLeft: 104,
          marginTop: 0,
        }}
      >
        {kalimatInfo}
      </p>
    </div>
  );
}

interface PropsPitaKebiasaan {
  /** Nilai yang sudah ditanam keluarga, urutan = urutan ditanam. */
  nilaiFokus: readonly NilaiAkar[];
  /** Map tanggal ISO → daftar NilaiAkar yang disiram pada hari itu. TODO: backend */
  riwayatSiram: Record<string, NilaiAkar[]>;
  mulaiSenin: string;
  tanggalHariIni: string;
  onToggleSiram: (nilai: NilaiAkar, tanggal: string) => void;
  onKetukLabel: (nilai: NilaiAkar) => void;
  onKetukAkarKeluarga: () => void;
}

const MAKS_BARIS_TAMPIL = 3;

export default function PitaKebiasaan({
  nilaiFokus,
  riwayatSiram,
  mulaiSenin,
  tanggalHariIni,
  onToggleSiram,
  onKetukLabel,
  onKetukAkarKeluarga,
}: PropsPitaKebiasaan) {
  const [lihatSemua, setLihatSemua] = useState(false);

  // Sembunyikan seluruh blok bila tidak ada nilai yang ditanam.
  if (nilaiFokus.length === 0) {
    return (
      <div style={{ paddingTop: 8 }}>
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

  const tampilNilai = lihatSemua
    ? nilaiFokus
    : nilaiFokus.slice(0, MAKS_BARIS_TAMPIL);
  const adaSisa = nilaiFokus.length > MAKS_BARIS_TAMPIL;

  return (
    <section aria-labelledby="pita-kebiasaan-judul">
      <h3
        id="pita-kebiasaan-judul"
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          color: '#6E3B57',
          marginBottom: 12,
        }}
      >
        {JUDUL_PITA}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tampilNilai.map(nilai => {
          // Kumpulkan hari-hari minggu ini di mana nilai ini disiram.
          const hariDisiram = new Set<string>();
          for (const [tgl, nilaiList] of Object.entries(riwayatSiram)) {
            if (nilaiList.includes(nilai)) hariDisiram.add(tgl);
          }

          return (
            <BarisNilai
              key={nilai}
              nilai={nilai}
              hariDisiram={hariDisiram}
              mulaiSenin={mulaiSenin}
              tanggalHariIni={tanggalHariIni}
              onToggleSiram={onToggleSiram}
              onKetukLabel={onKetukLabel}
            />
          );
        })}
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
          }}
        >
          {KEBIASAAN_LIHAT_SEMUA}
        </button>
      )}
    </section>
  );
}
