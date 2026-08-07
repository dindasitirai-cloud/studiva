/**
 * Perhitungan usia murni — tanpa efek samping, tanpa Date.now() atau
 * new Date() tanpa argumen. Tanggal acuan selalu diterima sebagai parameter
 * agar setiap fungsi bisa diuji secara deterministik.
 *
 * Memakai komponen tanggal LOKAL (getFullYear/getMonth/getDate), bukan UTC,
 * agar tidak meleset satu hari bagi pengguna di WIB / WITA / WIT.
 */

/**
 * Menghitung usia dalam bulan penuh.
 *
 * Rumus:
 *   bulan = (tahunAcuan - tahunLahir) * 12 + (bulanAcuan - bulanLahir)
 *   jika tanggalAcuan < tanggalLahir, maka bulan -= 1
 *
 * Nilai bisa negatif jika acuan sebelum tanggalLahir — resolver yang
 * menangani kasus ini.
 */
export function hitungUsiaBulan(tanggalLahir: Date, acuan: Date): number {
  const bulan =
    (acuan.getFullYear() - tanggalLahir.getFullYear()) * 12 +
    (acuan.getMonth() - tanggalLahir.getMonth());
  return acuan.getDate() < tanggalLahir.getDate() ? bulan - 1 : bulan;
}

/**
 * Usia koreksi untuk anak lahir lebih awal dari perkiraan.
 *
 * Anak yang lahir pada 30 minggu berbeda 10 minggu dari 40 minggu.
 * Tanpa koreksi, orang tua akan disodori konten yang belum sesuai dan
 * merasa anaknya tertinggal — persis hal yang produk ini dirancang untuk cegah.
 *
 * Koreksi diterapkan sampai usia kronologis 24 bulan, lalu berhenti.
 *
 * @param tanggalLahir tanggal lahir anak (tanggal aktual, bukan perkiraan)
 * @param acuan        tanggal acuan perhitungan
 * @param mingguGestasi usia kehamilan saat lahir. Jika >= 37, tidak ada koreksi.
 */
export function hitungUsiaKoreksiBulan(
  tanggalLahir: Date,
  acuan: Date,
  mingguGestasi: number,
): number {
  const usiaBulanKronologis = hitungUsiaBulan(tanggalLahir, acuan);

  // Tidak ada koreksi jika cukup bulan (>= 37 minggu)
  if (mingguGestasi >= 37) return usiaBulanKronologis;

  // Koreksi berhenti setelah usia kronologis 24 bulan
  if (usiaBulanKronologis >= 24) return usiaBulanKronologis;

  const mingguKoreksi = 40 - mingguGestasi;
  // 1 bulan ≈ 4.345 minggu (365.25 / 12 / 7)
  const koreksiInBulan = Math.floor(mingguKoreksi / 4.345);

  return usiaBulanKronologis - koreksiInBulan;
}
