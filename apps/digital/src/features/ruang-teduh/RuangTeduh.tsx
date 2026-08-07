import React, { useMemo } from 'react';
import { useAnakAktif } from '../../context/AnakContext';
import { useAuth } from '../../context/AuthContext';
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
  const { supabaseUser } = useAuth();

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

  // caregiverId = id ORANG TUA, bukan id anak.
  //
  // Sebelumnya diproksi dari idAnak dengan tanda TODO. Catatan nifas adalah
  // data ibu: memakai id anak akan membelah riwayat ibu yang punya lebih dari
  // satu anak, dan — karena ini data kesehatan — memperbaikinya belakangan
  // berarti memigrasikan data kesehatan. Diperbaiki sebelum data pertama
  // tersimpan, bukan sesudah.
  //
  // Masih TODO: CaregiverProfile penuh (peran, tanggalMelahirkan sungguhan).
  // tanggalMelahirkan masih diproksi dari tanggal lahir anak di atas — tepat
  // untuk kelahiran tunggal, dan itulah yang menghitung 42 hari Lembar Nifas.
  const caregiverId = supabaseUser?.id ?? null;

  if (!caregiverId) {
    return (
      <div style={{ paddingTop: 40, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 15,
            color: '#8A7A80',
          }}
        >
          Memuat...
        </p>
      </div>
    );
  }

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
