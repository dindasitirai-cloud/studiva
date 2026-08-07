import { hitungHariNifas, cuacaGelap, perluCerminPola } from '../logika';
import type { CatatanHarianIbu } from '../types';

// ─── hitungHariNifas ─────────────────────────────────────────────────────────

describe('hitungHariNifas', () => {
  it('hari melahirkan dihitung sebagai hari ke 1', () => {
    expect(hitungHariNifas('2026-08-01', '2026-08-01')).toEqual({
      hariKe: 1,
      dalamMasaNifas: true,
    });
  });

  it('hari ke 2', () => {
    expect(hitungHariNifas('2026-08-01', '2026-08-02')).toEqual({
      hariKe: 2,
      dalamMasaNifas: true,
    });
  });

  it('hari ke 42 masih dalam masa nifas', () => {
    // Jun 26 → Aug 6: 4 (sisa Jun) + 31 (Jul) + 6 (Agt) = 41 selisih, hariKe = 42
    expect(hitungHariNifas('2026-06-26', '2026-08-06')).toEqual({
      hariKe: 42,
      dalamMasaNifas: true,
    });
  });

  it('hari ke 43 sudah keluar masa nifas', () => {
    // Jun 25 → Aug 6: 5 (sisa Jun) + 31 (Jul) + 6 (Agt) = 42 selisih, hariKe = 43
    const hasil = hitungHariNifas('2026-06-25', '2026-08-06');
    expect(hasil.hariKe).toBe(43);
    expect(hasil.dalamMasaNifas).toBe(false);
  });

  it('hari ke 0 (sebelum melahirkan) tidak dalam masa nifas', () => {
    const hasil = hitungHariNifas('2026-08-07', '2026-08-06');
    expect(hasil.hariKe).toBe(0);
    expect(hasil.dalamMasaNifas).toBe(false);
  });
});

// ─── cuacaGelap ──────────────────────────────────────────────────────────────

describe('cuacaGelap', () => {
  it('mendung adalah gelap', () => expect(cuacaGelap('mendung')).toBe(true));
  it('hujan adalah gelap',   () => expect(cuacaGelap('hujan')).toBe(true));
  it('badai adalah gelap',   () => expect(cuacaGelap('badai')).toBe(true));
  it('cerah bukan gelap',    () => expect(cuacaGelap('cerah')).toBe(false));
  it('berawan bukan gelap',  () => expect(cuacaGelap('berawan')).toBe(false));
});

// ─── perluCerminPola ─────────────────────────────────────────────────────────

function catatanBerurutan(
  hariIni: string,
  panjang: number,
  cuacaFn: (i: number) => CatatanHarianIbu['cuacaHati'],
): CatatanHarianIbu[] {
  const hariIniMs = new Date(hariIni + 'T00:00:00Z').getTime();
  return Array.from({ length: panjang }, (_, i) => {
    const tgl = new Date(hariIniMs - i * 86400000).toISOString().slice(0, 10);
    const cuacaHati = cuacaFn(i);
    if (cuacaHati === undefined) return { tanggal: tgl };
    return { tanggal: tgl, cuacaHati };
  });
}

describe('perluCerminPola', () => {
  const HARI_INI = '2026-08-06';

  it('14 hari gelap berturut turut mengembalikan true', () => {
    const catatan = catatanBerurutan(HARI_INI, 14, () => 'badai');
    expect(perluCerminPola(catatan, HARI_INI)).toBe(true);
  });

  it('13 hari gelap berturut turut mengembalikan false', () => {
    const catatan = catatanBerurutan(HARI_INI, 13, () => 'mendung');
    expect(perluCerminPola(catatan, HARI_INI)).toBe(false);
  });

  it('hari kosong memutus rentetan gelap', () => {
    // 10 hari gelap, lalu 1 hari kosong, lalu 3 hari gelap
    const catatan = catatanBerurutan(HARI_INI, 14, i => {
      if (i === 10) return undefined; // hari kosong
      return 'hujan';
    });
    expect(perluCerminPola(catatan, HARI_INI)).toBe(false);
  });

  it('1 hari cerah memutus rentetan gelap', () => {
    // 10 hari gelap, lalu 1 hari cerah, lalu 3 hari gelap
    const catatan = catatanBerurutan(HARI_INI, 14, i => {
      if (i === 10) return 'cerah';
      return 'badai';
    });
    expect(perluCerminPola(catatan, HARI_INI)).toBe(false);
  });

  it('tanpa catatan sama sekali mengembalikan false', () => {
    expect(perluCerminPola([], HARI_INI)).toBe(false);
  });

  it('campuran cerah dan mendung tidak memenuhi ambang', () => {
    const catatan = catatanBerurutan(HARI_INI, 14, i =>
      i % 2 === 0 ? 'mendung' : 'cerah',
    );
    expect(perluCerminPola(catatan, HARI_INI)).toBe(false);
  });

  it('14 hari berawan (bukan gelap) mengembalikan false', () => {
    const catatan = catatanBerurutan(HARI_INI, 14, () => 'berawan');
    expect(perluCerminPola(catatan, HARI_INI)).toBe(false);
  });

  it('20 hari gelap berturut turut mengembalikan true', () => {
    // Jendela hanya 14 hari; 20 hari gelap berarti 14 hari dalam jendela semuanya gelap
    const catatan = catatanBerurutan(HARI_INI, 20, () => 'hujan');
    expect(perluCerminPola(catatan, HARI_INI)).toBe(true);
  });
});
