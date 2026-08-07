import {
  tingkatMekar,
  rangkaiRiwayatPerawatan,
  TINGKAT_PENUH,
  WINDOW_HARI,
} from '../mekarUtils';

// Fixed reference date for deterministic tests
const REF = new Date(2026, 6, 27); // 2026-07-27

function hariLalu(n: number): Date {
  const d = new Date(REF);
  d.setDate(d.getDate() - n);
  return d;
}

// ─── tingkatMekar ─────────────────────────────────────────────────────────────

describe('tingkatMekar', () => {
  test('riwayat kosong → 0', () => {
    expect(tingkatMekar([], REF)).toBe(0);
  });

  test('satu hari dalam window → 1', () => {
    expect(tingkatMekar([hariLalu(5)], REF)).toBe(1);
  });

  test('kejadian pada hari yang sama dihitung satu kali', () => {
    const hari = hariLalu(3);
    expect(tingkatMekar([hari, hari, hari], REF)).toBe(1);
  });

  test(`${TINGKAT_PENUH} hari unik dalam window → TINGKAT_PENUH`, () => {
    const riwayat = [1, 3, 5, 7, 9].map(hariLalu);
    expect(tingkatMekar(riwayat, REF)).toBe(TINGKAT_PENUH);
  });

  test(`lebih dari ${TINGKAT_PENUH} hari unik dikap ke TINGKAT_PENUH`, () => {
    const riwayat = [1, 2, 3, 4, 5, 6, 7].map(hariLalu);
    expect(tingkatMekar(riwayat, REF)).toBe(TINGKAT_PENUH);
  });

  test(`hari tepat di batas ${WINDOW_HARI} hari dihitung`, () => {
    expect(tingkatMekar([hariLalu(WINDOW_HARI)], REF)).toBe(1);
  });

  test(`hari ${WINDOW_HARI + 1} hari lalu tidak dihitung`, () => {
    expect(tingkatMekar([hariLalu(WINDOW_HARI + 1)], REF)).toBe(0);
  });

  test('campuran dalam dan luar window hanya hitung yang dalam', () => {
    const riwayat = [hariLalu(2), hariLalu(WINDOW_HARI + 5)];
    expect(tingkatMekar(riwayat, REF)).toBe(1);
  });
});

// ─── rangkaiRiwayatPerawatan ──────────────────────────────────────────────────

describe('rangkaiRiwayatPerawatan', () => {
  const t = REF;

  test('catatan kosong → hasil kosong', () => {
    expect(rangkaiRiwayatPerawatan([])).toEqual({});
  });

  test('satu catatan satu nilai', () => {
    const hasil = rangkaiRiwayatPerawatan([{ tanggal: t, nilaiTercapai: ['Sabar'] }]);
    expect(hasil['Sabar']).toHaveLength(1);
    expect(hasil['Sabar']![0]).toBe(t);
  });

  test('nilai yang sama di dua hari → dua entri', () => {
    const hasil = rangkaiRiwayatPerawatan([
      { tanggal: t, nilaiTercapai: ['Kejujuran'] },
      { tanggal: hariLalu(1), nilaiTercapai: ['Kejujuran'] },
    ]);
    expect(hasil['Kejujuran']).toHaveLength(2);
  });

  test('dua nilai dalam satu catatan mendapat entri masing-masing', () => {
    const hasil = rangkaiRiwayatPerawatan([
      { tanggal: t, nilaiTercapai: ['Sabar', 'Syukur'] },
    ]);
    expect(hasil['Sabar']).toHaveLength(1);
    expect(hasil['Syukur']).toHaveLength(1);
  });

  test('nilai yang tidak muncul tidak ada di hasil', () => {
    const hasil = rangkaiRiwayatPerawatan([
      { tanggal: t, nilaiTercapai: ['Empati'] },
    ]);
    expect(hasil['Sabar']).toBeUndefined();
  });
});
