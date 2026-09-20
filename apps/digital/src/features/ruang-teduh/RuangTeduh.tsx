import React, { useMemo, useState } from 'react';
import { useAnakAktif } from '../../context/AnakContext';
import { CatatanHarianSupabase } from './penyimpanan/supabase';
import type { PitaUsia, Peran, RingkasNifas } from './types';
import { CP_DILUAR_RENTANG } from './copy';
import { hitungHariNifas } from './logika';
import { PenyimpananProvider } from './penyimpanan/PenyimpananProvider';
import BerandaRuangTeduhBaru from './BerandaRuangTeduhBaru';
import PiringIbu from './PiringIbu';
import MenyambutSiKecil from './MenyambutSiKecil';
import LembarNifas from './lembar-nifas/LembarNifas';
import type { SubTahapRuangTeduh } from './types';

type HalamanRuangTeduh = 'beranda' | 'piring-ibu' | 'menyambut' | 'lembar-nifas';

/** Konversi usiaBulan (0–71) → PitaUsia (0–5). Null kalau di luar rentang. */
function hitungPitaUsia(usiaBulan: number): PitaUsia | null {
  if (usiaBulan < 0 || usiaBulan >= 72) return null;
  return Math.floor(usiaBulan / 12) as PitaUsia;
}

function resolveSubTahap(usiaBulan: number): SubTahapRuangTeduh | null {
  if (usiaBulan < 0 || usiaBulan >= 12) return null;
  return usiaBulan < 6 ? 'menyusui-eksklusif' : 'mpasi-berlanjut';
}

export default function RuangTeduh() {
  const { anak, sapaan, usiaBulan } = useAnakAktif();
  const [halaman, setHalaman] = useState<HalamanRuangTeduh>('beranda');

  const repo = useMemo(() => new CatatanHarianSupabase(), []);

  const hariIni = new Date().toISOString().slice(0, 10);

  // TODO: backend — tanggalMelahirkan seharusnya dari profil pendamping, bukan diproxy dari
  // tanggalLahir anak. Sementara pakai tanggalLahir sebagai perkiraan kasar sampai profil
  // ibu tersedia di sistem.
  const ringkasNifas: RingkasNifas | null = anak.tanggalLahir
    ? hitungHariNifas(anak.tanggalLahir, hariIni)
    : null;

  // TODO: ambil dari CaregiverProfile.peran saat tersedia.
  // Sementara default ke 'ibu'. Pengguna dengan peran ayah belum bisa dibedakan.
  const peran: Peran = 'ibu';

  const pitaUsia = hitungPitaUsia(usiaBulan);

  if (pitaUsia === null) {
    return (
      <div style={{ paddingTop: 40, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 15,
            color: '#8A7A80',
          }}
        >
          {CP_DILUAR_RENTANG}
        </p>
      </div>
    );
  }

  // caregiverId = id ANAK (lihat komentar panjang di versi sebelumnya untuk alasannya).
  const caregiverId = anak.id;

  // subTahap hanya dipakai oleh PiringIbu (yang masih bergantung padanya)
  const subTahap = resolveSubTahap(usiaBulan) ?? 'menyusui-eksklusif';

  // ── Sub-halaman dengan tombol kembali ──────────────────────────────────────
  if (halaman !== 'beranda') {
    return (
      <div>
        <TombolKembali onClick={() => setHalaman('beranda')} />
        {halaman === 'lembar-nifas' && ringkasNifas?.dalamMasaNifas && (
          <LembarNifas hariKe={ringkasNifas.hariKe} hariIni={hariIni} />
        )}
        {halaman === 'piring-ibu' && (
          <>
            <h1
              style={{
                fontFamily: 'Fredoka, system-ui, sans-serif',
                fontSize: 26,
                fontWeight: 600,
                color: '#3A2530',
                margin: '0 0 20px',
              }}
            >
              Piring Ibu
            </h1>
            <PenyimpananProvider caregiverId={caregiverId} repository={repo}>
              <PiringIbu subTahap={subTahap} hariIni={hariIni} />
            </PenyimpananProvider>
          </>
        )}
        {halaman === 'menyambut' && (
          <>
            <h1
              style={{
                fontFamily: 'Fredoka, system-ui, sans-serif',
                fontSize: 26,
                fontWeight: 600,
                color: '#3A2530',
                margin: '0 0 20px',
              }}
            >
              Menyambut Si Kecil
            </h1>
            <MenyambutSiKecil sapaan={sapaan} />
          </>
        )}
      </div>
    );
  }

  // ── Beranda utama ──────────────────────────────────────────────────────────
  return (
    <BerandaRuangTeduhBaru
      pitaUsia={pitaUsia}
      peran={peran}
      sapaan={sapaan}
      hariIni={hariIni}
      ringkasNifas={ringkasNifas}
      onNavigasi={tujuan => setHalaman(tujuan)}
    />
  );
}

// ─── Komponen internal ────────────────────────────────────────────────────────

function TombolKembali({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontSize: 14,
        fontWeight: 700,
        color: '#8A7A80',
        padding: 0,
      }}
    >
      <svg
        width="16"
        height="16"
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
      Kembali
    </button>
  );
}
