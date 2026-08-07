// KONTEN: wajib review Psikolog Fitri sebelum rilis.
// PRIORITAS TINGGI: kartu "sinyal caregiver lelah" (Jejak Mekar) — review terpisah.

export const REFLEKSI_COPY = {
  // ── Header ───────────────────────────────────────────────────────────
  judulCerita: 'Cerita Hari Ini',
  sub: (namaAnak: string) => `Bagaimana ${namaAnak} hari ini?`,

  // ── Respons anak ─────────────────────────────────────────────────────
  responsLabel: (namaAnak: string) => `Bagaimana respons ${namaAnak}?`,
  responsOptions: [
    { value: 'seru' as const, label: 'Seru & terlibat', emoji: '🎉' },
    { value: 'menantang' as const, label: 'Menantang, tapi jadi', emoji: '💪' },
    { value: 'belum-tertarik' as const, label: 'Belum tertarik', emoji: '🌱' },
  ],
  // Catatan pembuka — BUKAN penilaian
  responsPengantar:
    'Ketiganya sama-sama berarti — semua respons adalah informasi, bukan nilai.',

  // Respons 'belum-tertarik' — tanpa nada menghibur berlebihan
  belumTertarikNote:
    'Kadang memang belum waktunya, dan itu juga bagian dari tumbuh 🌱',

  // ── Mood caregiver (opsional) ─────────────────────────────────────────
  moodLabel: 'Dan kamu sendiri?',
  moodSub: 'Opsional — hanya untuk dirimu sendiri.',
  moodOptions: [
    { value: 'lega' as const, label: 'Lega', emoji: '🙂' },
    { value: 'biasa' as const, label: 'Biasa', emoji: '😌' },
    { value: 'lelah' as const, label: 'Lelah', emoji: '🕯️' },
  ],

  // ── Catatan bebas (opsional) ──────────────────────────────────────────
  catatanLabel: 'Ada momen kecil yang mau disimpan?',
  catatanPlaceholder: 'Tulis sesukamu…',
  simpanKeJurnalLabel: 'Simpan juga ke Jurnal 📖',

  // ── CTA ───────────────────────────────────────────────────────────────
  simpanCTA: 'Simpan cerita',
  lewatiLink: 'Lewati',
  // Tanpa pesan bersalah saat lewati — completion tetap tercatat
};
