// ============================================================================
// useChildProfile — pembungkus tipis di atas AnakContext.
//
// Dulu ini stub berisi TODO yang menerima override lewat props, sehingga data
// anak harus dioper berantai dari shell ke setiap komponen konten. Sekarang
// datanya diambil langsung dari AnakContext, satu-satunya sumber data anak.
//
// Berkas ini dipertahankan supaya komponen konten yang sudah ada tidak perlu
// diubah semua sekaligus. Untuk kode baru, pakai useAnakAktif() langsung.
// ============================================================================

import { useMemo } from 'react';
import { useAnak } from '../../context/AnakContext';
import {
  sapaanDari,
  usiaDalamBulan,
  type JenisKelamin,
  type SapaanSet,
} from '../../types/anak';

export type { SapaanSet };
export type { JenisKelamin };

export type ChildProfile = {
  namaAnak: string;
  jenisKelamin: JenisKelamin | null;
  tanggalLahir: string | null;
};

export { usiaDalamBulan };

export function useChildProfile(): {
  profile: ChildProfile;
  sapaan: SapaanSet;
  usiaBulan: number | null;
} {
  const { anakAktif } = useAnak();

  return useMemo(() => {
    const profile: ChildProfile = {
      namaAnak: anakAktif?.namaAnak ?? '',
      jenisKelamin: anakAktif?.jenisKelamin ?? null,
      tanggalLahir: anakAktif?.tanggalLahir ?? null,
    };

    return {
      profile,
      sapaan: sapaanDari(anakAktif),
      usiaBulan: usiaDalamBulan(profile.tanggalLahir),
    };
  }, [anakAktif]);
}
