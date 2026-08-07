// KONTEN: wajib review Psikolog Fitri sebelum rilis.

export const MUSIM_COPY = {
  // ── Kartu trigger di beranda ──────────────────────────────────────────
  triggerJudul: 'Musim pertamamu selesai 🌸',
  triggerSub: 'Empat minggu sudah kamu tanam. Sekarang saatnya merayakan.',
  triggerCTA: 'Lihat Rangkuman Musim',

  // ── Layar 1: Rangkuman ───────────────────────────────────────────────
  rangkumanJudul: (nilai1: string, nilai2: string) =>
    `Empat minggu menanam ${nilai1} & ${nilai2}.`,
  rangkumanLangkahLabel: (n: number) => `${n} langkah selesai`,
  rangkumanMomenLabel: 'Momen yang tersimpan',
  rangkumanMomenEmpty: 'Belum ada momen yang dicatat.',
  rangkumanCTA: 'Lanjut',

  // ── Layar 2: Refleksi Musim ──────────────────────────────────────────
  refleksiJudul: 'Satu momen yang paling kamu syukuri',
  refleksiSub: 'Opsional — hanya untuk dirimu sendiri.',
  refleksiPlaceholder: 'Ceritakan sesukamu…',
  abadikanJurnalLabel: 'Abadikan Musim ini di Jurnal 📖',
  refleksiCTA: 'Simpan & Lanjut',
  refleksiLewati: 'Lewati',

  // ── Layar 3: Pilih Musim Berikutnya ─────────────────────────────────
  pilihanJudul: 'Musim selanjutnya',
  lanjutkanSama: 'Lanjutkan nilai yang sama 🌱',
  lanjutkanSamaSub: 'Nilai yang sama, cerita baru.',
  tanamanBaru: 'Tanam nilai baru ✨',
  tanamanBaruSub: 'Pilih dua nilai baru untuk musim berikutnya.',
  konfirmasiGantiNilai:
    'Ganti sekarang juga boleh — Musim-mu ikut dimulai ulang ya 🌱',

  // ── Konfirmasi akhir ─────────────────────────────────────────────────
  musimBaruMulai: 'Musim baru dimulai! 🌸',
};
