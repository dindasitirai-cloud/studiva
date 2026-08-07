import React, { useMemo } from 'react';
import { useAnakAktif } from '../../context/AnakContext';
import { CatatanHarianSupabase } from './penyimpanan/supabase';
import type { SubTahapRuangTeduh, RingkasNifas } from './types';
import { TEKS_DILUAR_RENTANG } from './content';
import { hitungHariNifas } from './logika';
import BerandaRuangTeduh from './BerandaRuangTeduh';
import { PenyimpananProvider } from './penyimpanan/PenyimpananProvider';

function resolveSubTahap(usiaBulan: number): SubTahapRuangTeduh | null {
  if (usiaBulan < 0 || usiaBulan >= 12) return null;
  return usiaBulan < 6 ? 'menyusui-eksklusif' : 'mpasi-berlanjut';
}

export default function RuangTeduh() {
  // Anak aktif dari AnakContext, sumber tunggal data anak.
  const { anak, sapaan, usiaBulan } = useAnakAktif();

  // Dibuat sekali agar identitasnya stabil; PenyimpananProvider menyimpannya
  // di useRef dan hanya mengganti bila instansnya berubah.
  const repo = useMemo(() => new CatatanHarianSupabase(), []);

  const hariIni = new Date().toISOString().slice(0, 10);

  // TODO: backend — tanggalMelahirkan seharusnya dari profil pendamping, bukan diproxy dari
  // tanggalLahir anak. Sementara pakai tanggalLahir sebagai perkiraan kasar sampai profil
  // ibu tersedia di sistem.
  const ringkasNifas: RingkasNifas | null = anak.tanggalLahir
    ? hitungHariNifas(anak.tanggalLahir, hariIni)
    : null;

  // Usia belum diketahui atau di luar 0 sampai 12 bulan
  if (usiaBulan === null) {
    return (
      <div style={{ paddingTop: 40, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 15,
            color: '#8A7A80',
          }}
        >
          {TEKS_DILUAR_RENTANG}
        </p>
      </div>
    );
  }

  const subTahap = resolveSubTahap(usiaBulan);

  if (!subTahap) {
    return (
      <div style={{ paddingTop: 40, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 15,
            color: '#8A7A80',
          }}
        >
          {TEKS_DILUAR_RENTANG}
        </p>
      </div>
    );
  }

  // caregiverId = id ANAK.
  //
  // Sempat diubah ke id orang tua di migrasi 013 dengan alasan "catatan nifas
  // milik ibu". Alasan itu terbalik: nifas adalah peristiwa per-KELAHIRAN.
  // Lembar Nifas menghitung 42 hari sejak melahirkan, Piring Ibu soal masa
  // menyusui bayi tertentu, dan Menyambut Si Kecil adalah persiapan satu
  // kelahiran. Kunci per orang tua membuat data anak pertama muncul di layar
  // anak kedua. Dikoreksi di migrasi 014.
  //
  // Cakupan layar ini memang sudah per-anak: hanya tampil untuk 0–12 bulan,
  // dan tanggalMelahirkan di atas diturunkan dari tanggal lahir anak aktif.
  //
  // Masih TODO: CaregiverProfile penuh (peran, tanggalMelahirkan sungguhan).
  const caregiverId = anak.id;

  return (
    <PenyimpananProvider caregiverId={caregiverId} repository={repo}>
      <BerandaRuangTeduh
        subTahap={subTahap}
        sapaan={sapaan}
        hariIni={hariIni}
        ringkasNifas={ringkasNifas}
      />
    </PenyimpananProvider>
  );
}
