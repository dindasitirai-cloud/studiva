import { hitungBand } from '../band';

function tgl(tahun: number, bulan: number, hari = 1): Date {
  return new Date(tahun, bulan - 1, hari);
}

// sekarang = 2026-07-19 (referensi tetap agar tes deterministik)
const SEKARANG = tgl(2026, 7, 19);

function band(lahir: Date) {
  return hitungBand(lahir, SEKARANG);
}

describe('hitungBand', () => {
  it('usia 0 bulan → band 0', () => {
    expect(band(tgl(2026, 7, 1)).band).toBe(0);
  });

  it('usia 2 bulan → band 0 (batas atas 0-2)', () => {
    expect(band(tgl(2026, 5, 19)).band).toBe(0);
  });

  it('usia 3 bulan → band 1', () => {
    expect(band(tgl(2026, 4, 19)).band).toBe(1);
  });

  it('usia 5 bulan → band 1 (batas atas 3-5)', () => {
    expect(band(tgl(2026, 2, 19)).band).toBe(1);
  });

  it('usia 6 bulan → band 2', () => {
    expect(band(tgl(2026, 1, 19)).band).toBe(2);
  });

  it('usia 11 bulan → band 3', () => {
    expect(band(tgl(2025, 8, 19)).band).toBe(3);
  });

  it('usia 12 bulan → band 4', () => {
    expect(band(tgl(2025, 7, 19)).band).toBe(4);
  });

  it('usia 17 bulan → band 4', () => {
    expect(band(tgl(2025, 2, 19)).band).toBe(4);
  });

  it('usia 18 bulan → band 5', () => {
    expect(band(tgl(2025, 1, 19)).band).toBe(5);
  });

  it('usia 23 bulan → band 5', () => {
    expect(band(tgl(2024, 8, 19)).band).toBe(5);
  });

  it('usia 24 bulan → band 6', () => {
    expect(band(tgl(2024, 7, 19)).band).toBe(6);
  });

  it('usia 36 bulan → band 7', () => {
    expect(band(tgl(2023, 7, 19)).band).toBe(7);
  });

  it('usia 48 bulan → band 8', () => {
    expect(band(tgl(2022, 7, 19)).band).toBe(8);
  });

  it('usia 60 bulan → band 9', () => {
    expect(band(tgl(2021, 7, 19)).band).toBe(9);
  });

  it('usia 72 bulan → band 9, tidak diLuarRentang', () => {
    const r = band(tgl(2020, 7, 19));
    expect(r.band).toBe(9);
    expect(r.diLuarRentang).toBe(false);
  });

  it('usia 73 bulan → band 9 + diLuarRentang', () => {
    const r = band(tgl(2020, 6, 19));
    expect(r.band).toBe(9);
    expect(r.diLuarRentang).toBe(true);
  });
});
