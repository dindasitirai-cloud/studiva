// =============================================================
// bandUsia — helper tahap usia (band) & teks usia, dipakai bersama oleh
// Kehidupan Keluarga (bidang Anak) dan Perjalanan (Kompas Perkembangan).
// Logika disalin apa adanya dari KompasKeluargaPage (Phase 21 · pindah Arah).
// =============================================================
import { BANDS, type BandInfo } from './content';

// Ambang atas (bulan) tiap band, sejajar urutan BANDS di content.ts.
const AMBANG_BAND = [3, 6, 9, 12, 18, 24, 36, 48, 60, 72];

export function bandDariUsia(usiaBulan: number | null): BandInfo | null {
  if (usiaBulan === null) return null;
  const idx = AMBANG_BAND.findIndex(batas => usiaBulan < batas);
  const i = idx === -1 ? BANDS.length - 1 : idx;
  return BANDS[i] ?? null;
}

export function teksUsia(usiaBulan: number | null): string | null {
  if (usiaBulan === null) return null;
  const th = Math.floor(usiaBulan / 12);
  const bl = usiaBulan % 12;
  if (th <= 0) return `${bl} bulan`;
  return bl === 0 ? `${th} tahun` : `${th} tahun ${bl} bulan`;
}

export function waktuRelatif(iso: string): string {
  const selisih = Date.now() - new Date(iso).getTime();
  const hari = Math.floor(selisih / 86400000);
  if (hari <= 0) return 'hari ini';
  if (hari === 1) return 'kemarin';
  if (hari < 7) return `${hari} hari lalu`;
  const minggu = Math.floor(hari / 7);
  if (minggu === 1) return 'sepekan lalu';
  if (minggu < 5) return `${minggu} pekan lalu`;
  const bulan = Math.floor(hari / 30);
  if (bulan <= 1) return 'sebulan lalu';
  return `${bulan} bulan lalu`;
}
