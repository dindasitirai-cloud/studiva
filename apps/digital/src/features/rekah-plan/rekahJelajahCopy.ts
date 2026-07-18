// KONTEN: wajib review Psikolog Fitri sebelum rilis.

export const JELAJAH_COPY = {
  // ── Halaman ──────────────────────────────────────────────────────────
  judulHalaman: 'Jelajah Aktivitas',
  subjudul: 'Temukan aktivitas yang pas untuk hari ini',

  // ── Filter chips nilai ────────────────────────────────────────────────
  filterNilaiLabel: 'Nilai',
  filterNilaiAria: (label: string) => `Filter nilai: ${label}`,

  // ── Filter pita usia ──────────────────────────────────────────────────
  filterUsiaSemua: 'Semua usia',

  // ── Filter durasi ─────────────────────────────────────────────────────
  filterDurasiLabel: 'Durasi',
  filterDurasi5: '≤5 menit',
  filterDurasi10: '≤10 menit',
  filterDurasi15: '≤15 menit',
  filterDurasiSemua: 'Semua durasi',

  // ── Toggle alat ───────────────────────────────────────────────────────
  filterPakaiAlatLabel: 'Pakai alat',
  filterPakaiAlatAria: 'Tampilkan aktivitas dengan alat',
  filterTanpaAlatLabel: 'Tanpa alat',
  filterTanpaAlatAria: 'Tampilkan aktivitas tanpa alat',
  filterSemuaAlatLabel: 'Semua',

  // ── Pencarian teks ────────────────────────────────────────────────────
  searchPlaceholder: 'Cari aktivitas...',
  searchAria: 'Cari aktivitas berdasarkan judul',

  // ── Card grid ─────────────────────────────────────────────────────────
  alatIconAria: 'Membutuhkan alat',

  // ── Empty state ───────────────────────────────────────────────────────
  emptyState: 'Belum ada aktivitas untuk kombinasi ini — coba longgarkan filternya 🌱',

  // ── Detail & aksi ─────────────────────────────────────────────────────
  jadikanHariIniCTA: 'Jadikan langkah hari ini',
  tambahkanKePekanCTA: 'Tambahkan ke pekan ini',
  jadikanHariIniAria: (judul: string) => `Jadikan "${judul}" sebagai langkah hari ini`,
  tambahkanKePekanAria: (judul: string) => `Tambahkan "${judul}" ke pekan ini`,

  // ── Feedback aksi ────────────────────────────────────────────────────
  jadikanHariIniOk: 'Langkah hari ini diganti!',
  tambahkanKePekanOk: 'Ditambahkan ke pekan ini',
  pekanSudahPenuh: 'Pekan ini sudah ada 7 langkah — coba lagi pekan depan ya 🌸',

  // ── Alat edukasi section ─────────────────────────────────────────────
  alatSectionLabel: 'Alat yang berguna',
  alatCaraPakaiLabel: 'Cara pakai',
  alatAlternatifLabel: 'Alternatif di rumah',
};
