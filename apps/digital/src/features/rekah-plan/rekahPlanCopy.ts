// KONTEN: wajib review Psikolog Fitri sebelum rilis.

export const PLAN_COPY = {
  // ── Header halaman & pekan ────────────────────────────────────────────
  judulHalaman: 'Rencana Pekan Ini',
  subJudulMusim: (nilai1: string, nilai2: string) => `Musim ${nilai1} & ${nilai2}`,
  pekanLabel: (n: number) => `Pekan ${n}`,
  langkahCount: (n: number) =>
    n === 1 ? '1 langkah kecil untuk pekan ini' : `${n} langkah kecil untuk pekan ini`,

  // ── Card: judul & meta ────────────────────────────────────────────────
  menitLabel: (n: number) => `${n} menit`,
  nilaiChipAria: (label: string) => `Nilai: ${label}`,

  // ── Card: expand/collapse ─────────────────────────────────────────────
  selengkapnyaLabel: 'Selengkapnya',
  sembunyikanLabel: 'Sembunyikan',

  // ── Card: kenapa ini ──────────────────────────────────────────────────
  kenapaIniLabel: 'Kenapa ini penting?',

  // ── Card: sumber ──────────────────────────────────────────────────────
  sumberLabel: 'Sumber',

  // ── Card: langkah ─────────────────────────────────────────────────────
  langkahSectionLabel: 'Langkah-langkahnya',

  // ── Card: script ─────────────────────────────────────────────────────
  scriptLabel: 'Kalimat yang bisa kamu pakai',
  salinLabel: 'Salin',
  salinOkLabel: 'Tersalin!',

  // ── Card: avoid ───────────────────────────────────────────────────────
  avoidLabel: 'Yang sebaiknya dihindari',

  // ── Card: amati ───────────────────────────────────────────────────────
  amatiLabel: 'Amati',

  // ── Card: aksi ───────────────────────────────────────────────────────
  selesaiCTA: 'Tandai selesai',
  selesaiCelebration: 'Merekah! 🌸',
  belumPasLabel: 'Belum pas hari ini',
  bagikanLabel: 'Bagikan',

  // ── Card: pool tipis ─────────────────────────────────────────────────
  poolTipisNote:
    'Kami sedang menambahkan lebih banyak aktivitas untuk usia ini. Rencana pekan ini dari yang tersedia.',

  // ── Ganti langkah ────────────────────────────────────────────────────
  gantiLabel: 'Ganti',
  gantiJudul: 'Pilih pengganti',
  gantiSub: 'Aktivitas di bawah ini sesuai dengan usia dan nilai fokusmu.',
  gantiTidakAda: 'Tidak ada alternatif yang tersedia — coba Jelajah untuk lebih banyak pilihan.',
  gantiPilihAria: (judul: string) => `Pilih ${judul} sebagai pengganti`,
  gantiTutupLabel: 'Batal',

  // ── Tambah langkah ────────────────────────────────────────────────────
  tambahLangkahCTA: '+ Tambah langkah',
  tambahLangkahAria: 'Tambahkan langkah ke rencana pekan ini',
  tambahLangkahPenuh: 'Tujuh sudah penuh mekar — sisanya simpan untuk pekan depan ya 🌸',

  // ── Belum pas — bottom-sheet ─────────────────────────────────────────
  belumPasJudul: 'Mau coba yang mana dulu?',
  belumPasSub: 'Langkah lain dari pekan ini yang bisa kamu coba sekarang.',
  belumPasCobaLangkahIni: 'Coba langkah ini',
  belumPasJelajahLink: 'Jelajahi pilihan lain →',
  belumPasTutupLabel: 'Lewati dulu',

  // ── Semua selesai ─────────────────────────────────────────────────────
  semuaSelesaiJudul: 'Pekan ini penuh mekar!',
  semuaSelesaiEmoji: '🌸',
  semuaSelesaiSub: 'Rencana barumu terbit hari Senin.',
  // TODO: build 4 — link ke Jejak Mekar

  // ── Share ─────────────────────────────────────────────────────────────
  shareText: (judul: string, langkahSingkat: string, script: string) =>
    `🌸 *${judul}*\n\n${langkahSingkat}\n\n_"${script}"_\n\n— dari Rekah, panduan tumbuh kembang anak`,
  shareTitle: (judul: string) => judul,
};
