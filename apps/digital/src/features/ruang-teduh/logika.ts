import type { CatatanHarianIbu, CuacaHati, RingkasNifas } from './types';

/** Hitung hari nifas. Hari melahirkan dihitung sebagai hari ke 1. */
export function hitungHariNifas(tanggalMelahirkan: string, hariIni: string): RingkasNifas {
  const lahir = new Date(tanggalMelahirkan + 'T00:00:00Z').getTime();
  const hari  = new Date(hariIni         + 'T00:00:00Z').getTime();
  const selisihHari = Math.floor((hari - lahir) / 86400000);
  const hariKe = selisihHari + 1; // hari melahirkan = hari ke 1
  return {
    hariKe,
    dalamMasaNifas: hariKe >= 1 && hariKe <= 42,
  };
}

/** Cuaca yang dianggap gelap untuk keperluan cermin pola. */
export function cuacaGelap(c: CuacaHati): boolean {
  // mendung, hujan, badai = gelap. cerah dan berawan = tidak gelap.
  return c === 'mendung' || c === 'hujan' || c === 'badai';
}

/**
 * Ambang cermin pola dari Buku KIA hal. 26.
 * MASIH MENUNGGU keputusan Psikolog Fitri — sedang mempertimbangkan
 * alternatif 10 dari 14 hari terakhir (tidak harus berturut turut).
 * Ditulis sebagai konstanta bernama agar bisa diubah dari satu tempat.
 */
export const AMBANG_CERMIN_POLA = { jendelaHari: 14, minimalGelap: 14 };

/**
 * Cermin pola. Mengembalikan true hanya jika dalam 14 hari terakhir
 * terdapat minimal 14 catatan bercuaca gelap berturut turut.
 *
 * Hari tanpa catatan MEMUTUS hitungan — tidak dianggap gelap
 * dan tidak dianggap terang. Ini keputusan produk: hari istirahat
 * tidak memberi sinyal apa pun, sehingga rentetan harus dilanjutkan
 * secara eksplisit dari catatan nyata ibu.
 */
export function perluCerminPola(
  catatan: CatatanHarianIbu[],
  hariIni: string,
): boolean {
  const { jendelaHari, minimalGelap } = AMBANG_CERMIN_POLA;

  // Bangun map tanggal → cuacaHati untuk pencarian O(1)
  const peta = new Map<string, CuacaHati>();
  for (const c of catatan) {
    if (c.cuacaHati !== undefined) peta.set(c.tanggal, c.cuacaHati);
  }

  // Hitung rentetan gelap berturut turut mundur dari hariIni
  const hariIniMs = new Date(hariIni + 'T00:00:00Z').getTime();
  let rentetan = 0;

  for (let i = 0; i < jendelaHari; i++) {
    const tgl = new Date(hariIniMs - i * 86400000).toISOString().slice(0, 10);
    const cuaca = peta.get(tgl);
    if (cuaca === undefined) {
      // Hari tanpa catatan memutus hitungan — lihat komentar di atas
      break;
    }
    if (cuacaGelap(cuaca)) {
      rentetan++;
    } else {
      // Cuaca terang juga memutus rentetan
      break;
    }
  }

  return rentetan >= minimalGelap;
}
