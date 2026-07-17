import type { NilaiId } from './values';
export type { NilaiId };

export interface ProfilAnak {
  namaPanggilan: string;
  tanggalLahir: string;
  temperamen?: 'tenang' | 'aktif' | 'sensitif' | 'campuran';
  tantanganUtama?: string;
}

export interface ProfilCaregiver {
  namaPanggilan: string;
  peran: 'ibu' | 'ayah' | 'nenek-kakek' | 'pengasuh' | 'lainnya';
  energiSaatIni?: 'penuh' | 'cukup' | 'menipis';
}

export interface AkarKeluarga {
  nilaiFokus: [NilaiId, NilaiId];
  musimMulai: string;
}

export interface RekahProfile {
  anak: ProfilAnak;
  caregiver: ProfilCaregiver;
  akar: AkarKeluarga;
}

export function hitungUsiaBulan(tanggalLahir: string): number {
  const lahir = new Date(tanggalLahir);
  const sekarang = new Date();
  return Math.max(
    0,
    (sekarang.getFullYear() - lahir.getFullYear()) * 12 +
      (sekarang.getMonth() - lahir.getMonth()),
  );
}
