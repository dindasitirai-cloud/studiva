/**
 * Menghitung perkiraan waktu baca dari teks.
 * @param teks - Konten yang akan dibaca; boleh string kosong.
 * @returns Waktu baca dalam menit, minimum 1.
 */
export function hitungWaktuBaca(teks: string): number {
  const KATA_PER_MENIT = 200;
  const jumlahKata = teks.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(jumlahKata / KATA_PER_MENIT));
}
