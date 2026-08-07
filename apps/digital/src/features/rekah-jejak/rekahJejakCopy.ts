// KONTEN: wajib review Psikolog Fitri sebelum rilis.
// PRIORITAS TERTINGGI: kartu sinyal caregiver lelah — area caregiver well-being.

export const JEJAK_COPY = {
  // ── Header ───────────────────────────────────────────────────────────
  judulHalaman: 'Jejak Mekar',
  sub: 'Pola milik keluargamu — bukan rapor.',

  // ── Bunga Musim ───────────────────────────────────────────────────────
  bungaCaption: 'Setiap kelopak adalah satu momen yang kalian tanam.',
  bungaLabel: (nilaiLabel: string) => `Nilai ${nilaiLabel}`,

  // ── Momen tersimpan ───────────────────────────────────────────────────
  momenJudul: 'Momen Tersimpan',
  momenEmpty: 'Momen-momen kecil kalian akan terkumpul di sini 🌸',

  // ── Status Musim ──────────────────────────────────────────────────────
  statusMusim: (nilai1: string, nilai2: string, pekan: number) =>
    `Musim ${nilai1} & ${nilai2} — pekan ke-${pekan} dari 4`,

  // ── Pola lembut (tampil saat ≥5 refleksi) ────────────────────────────
  polaBelumCukup: 'Pola akan muncul setelah kamu mencatat beberapa cerita.',
  polaResponDominan: (namaAnak: string, domain: string) =>
    `Bulan ini, ${namaAnak} paling sering terlihat seru saat aktivitas ${domain}.`,

  // ── Sinyal caregiver lelah (PRIORITAS REVIEW Psikolog Fitri) ─────────
  // Tampil jika moodCaregiver === 'lelah' mendominasi (>50% dari ≥5 entri)
  sinyalLelahJudul: 'Kamu banyak menemani dalam keadaan lelah',
  sinyalLelahBody:
    'Terima kasih sudah hadir 💗 Rencana pekan depan bisa kita ringankan.',
  sinyalLelahCTA: 'Ringankan pekan depan',
  sinyalLelahToggleNote: 'Rencana akan menyesuaikan energimu.',
  // DILARANG: insight yang membandingkan keluarga lain, norma usia, atau "minggu terbaik/terburuk"

  // ── Arsip musim sebelumnya ────────────────────────────────────────────
  musimSebelumnyaLabel: 'Musim Sebelumnya',
  musimSebelumnyaEmpty: 'Musimmu yang pertama sedang berjalan 🌱',
};
