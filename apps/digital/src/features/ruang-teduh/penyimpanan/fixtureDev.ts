/**
 * Alat bantu lihat untuk pengembangan. Bukan data sungguhan.
 *
 * Mengisi repository dengan 14 hari catatan bercuaca gelap berturut turut
 * sehingga perluCerminPola bernilai true dan cermin pola bisa dilihat
 * tanpa menunggu 14 hari sungguhan.
 *
 * Untuk mengaktifkan: ubah SEED_CERMIN_POLA ke true, muat ulang halaman.
 * Kembalikan ke false sebelum commit.
 */
import type { CatatanHarianRepository } from './kontrak';

// Default mati. Ubah ke true hanya saat perlu melihat tampilan cermin pola.
export const SEED_CERMIN_POLA = false;

export async function seedCerminPola(
  repo: CatatanHarianRepository,
  caregiverId: string,
  hariIni: string,
): Promise<void> {
  if (process.env.NODE_ENV === 'production') return;
  if (!SEED_CERMIN_POLA) return;

  const hariIniMs = new Date(hariIni + 'T00:00:00Z').getTime();
  for (let i = 0; i < 14; i++) {
    const tgl = new Date(hariIniMs - i * 86400000).toISOString().slice(0, 10);
    await repo.simpanDiff(caregiverId, { tanggal: tgl, cuacaHati: 'badai' });
  }
}
