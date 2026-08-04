import { describe, it, expect } from 'vitest';
import { tingkatMekar, LANGKAH_NAIK, LANGKAH_TURUN, TINGKAT_MAKS } from './mekar';

describe('tingkatMekar', () => {
  it('1. semua 7 hari disiram → naik 1 per hari hingga 7', () => {
    const riwayat = Array(7).fill(true) as boolean[];
    expect(tingkatMekar(riwayat)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('2. tidak ada hari disiram → tetap 0', () => {
    const riwayat = Array(7).fill(false) as boolean[];
    expect(tingkatMekar(riwayat)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it('3. hanya hari pertama disiram → turun 0.5 per hari sesudahnya', () => {
    const riwayat = [true, false, false, false, false, false, false];
    expect(tingkatMekar(riwayat)).toEqual([1, 0.5, 0, 0, 0, 0, 0]);
  });

  it('4. tingkat tidak pernah di bawah 0 meski banyak hari tidak disiram', () => {
    const riwayat = Array(14).fill(false) as boolean[];
    const hasil = tingkatMekar(riwayat);
    expect(hasil.every(v => v >= 0)).toBe(true);
    expect(hasil).toEqual(Array(14).fill(0));
  });

  it('5. tingkat tidak pernah melebihi TINGKAT_MAKS meski banyak hari disiram', () => {
    const riwayat = Array(14).fill(true) as boolean[];
    const hasil = tingkatMekar(riwayat);
    expect(hasil.every(v => v <= TINGKAT_MAKS)).toBe(true);
    // Setelah 7 hari maks, hari ke-8 dst tetap 7
    expect(hasil[6]).toBe(7);
    expect(hasil[7]).toBe(7);
  });

  it('6. pola selang-seling: disiram-tidak-disiram-tidak ...', () => {
    const riwayat = [true, false, true, false, true, false, true];
    // D0: +1=1, D1: -0.5=0.5, D2: +1=1.5, D3: -0.5=1, D4: +1=2, D5: -0.5=1.5, D6: +1=2.5
    expect(tingkatMekar(riwayat)).toEqual([1, 0.5, 1.5, 1, 2, 1.5, 2.5]);
  });

  it('7. array kosong → array kosong', () => {
    expect(tingkatMekar([])).toEqual([]);
  });
});

describe('konstanta tingkatMekar', () => {
  it('LANGKAH_NAIK = 1, LANGKAH_TURUN = 0.5, TINGKAT_MAKS = 7', () => {
    expect(LANGKAH_NAIK).toBe(1);
    expect(LANGKAH_TURUN).toBe(0.5);
    expect(TINGKAT_MAKS).toBe(7);
  });
});
