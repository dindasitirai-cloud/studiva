import { resolveTahapId } from '../useTahapAktif';

describe('resolveTahapId', () => {
  // Batas [min, max) — anak tepat 3 bulan masuk tahap kedua
  it('0 → bulan-0-3', () => expect(resolveTahapId(0)).toBe('bulan-0-3'));
  it('2 → bulan-0-3', () => expect(resolveTahapId(2)).toBe('bulan-0-3'));
  it('3 → bulan-4-6 (bukan bulan-0-3 — 3 bulan penuh masuk tahap berikutnya)', () => {
    expect(resolveTahapId(3)).toBe('bulan-4-6');
  });
  it('5 → bulan-4-6', () => expect(resolveTahapId(5)).toBe('bulan-4-6'));
  it('6 → bulan-7-9', () => expect(resolveTahapId(6)).toBe('bulan-7-9'));
  it('9 → bulan-10-12', () => expect(resolveTahapId(9)).toBe('bulan-10-12'));
  it('11 → bulan-10-12', () => expect(resolveTahapId(11)).toBe('bulan-10-12'));
  it('12 → null (di luar Tahun Pertama)', () => expect(resolveTahapId(12)).toBeNull());
  it('null → null', () => expect(resolveTahapId(null)).toBeNull());
  it('-1 → null', () => expect(resolveTahapId(-1)).toBeNull());
});
