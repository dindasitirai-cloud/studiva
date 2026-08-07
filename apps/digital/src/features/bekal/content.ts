// =============================================================
// KONTEN FITUR BEKAL
// STATUS: DRAFT — seluruh teks UI MENUNGGU REVIEW PSIKOLOG FITRI
// sebelum rilis produksi. Jangan ubah copy tanpa melalui review.
// =============================================================

// MENUNGGU REVIEW PSIKOLOG FITRI
export const DRAF_BANNER = 'DRAF · menunggu review Psikolog Fitri Effendy sebelum rilis';

// ── Header ────────────────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const JUDUL_BEKAL = 'Jelajah Bekal';

// ── Layar edge-case ──────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const LAYAR_BELUM_LAHIR = {
  judul: 'Masih menghitung hari',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  badan: 'Bekal baru bisa dijelajahi setelah {anak} hadir. Sambil menunggu, Ayah Bunda bisa membaca panduan.',
};

// MENUNGGU REVIEW PSIKOLOG FITRI
export const LAYAR_DATA_BELUM_DIISI = {
  judul: 'Tambahkan data anak dulu',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  badan: 'Tanggal lahir {anak} belum tercatat. Lengkapi profil untuk membuka Bekal.',
};

// MENUNGGU REVIEW PSIKOLOG FITRI
export const LAYAR_MELEWATI_RENTANG = {
  judul: 'Rekah sudah menemani perjalanan {Anak}',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  badan: 'Konten Rekah dirancang untuk usia 0–6 tahun. Terima kasih sudah bersama kami — semoga perjalanan {anak} terus mekar.',
};

// MENUNGGU REVIEW PSIKOLOG FITRI
export const LAYAR_KONTEN_BELUM_SIAP = {
  judul: 'Konten untuk usia ini sedang disiapkan',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  badan: 'Tim Rekah sedang menyelesaikan materi untuk usia {anak} saat ini. Tidak lama lagi.',
};

// ── Pemilih sub-tahap ─────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const PEMILIH_SUB_TAHAP = {
  /** Teks posisi anak — token {Anak} digantikan oleh renderRichText. */
  posisiAnak: '{Anak} sedang di sini.',
  tandaAktif: '(sekarang)',
};

// ── Kolam kegiatan ────────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const KOLAM_KEGIATAN = {
  judul: 'Semua kegiatan',
  judulPerTipe: {
    aktivitas:   'Aktivitas',
    alatEdukasi: 'Alat bermain',
    unduhan:     'Unduhan',
  } as Record<string, string>,
  lepasAriaLabel:  (judul: string): string => `Lepaskan ${judul} dari rencana hari ini`,
  tambahAriaLabel: (judul: string): string => `Tambahkan ${judul} ke rencana hari ini`,
  lepasLabel:        'Lepas',
  tambahLabel:       'Pilih',
  sudahDipilihLabel: 'Dipilih hari ini',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  pesanPlafonPenuh: 'Hari ini sudah penuh. Lepaskan satu kegiatan dulu untuk menambah ini.',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  pesanBacaSaja: 'Tersedia saat sampai di tahap ini.',
  kosong: 'Belum ada kegiatan untuk tahap ini.',
};

// ── Panduan bekal ─────────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const PANDUAN_BEKAL = {
  judul:              'Bacaan untuk Ayah Bunda',
  kosong:             'Panduan untuk tahap ini sedang disiapkan.',
  bukaAriaLabel:      (judul: string): string => `Buka: ${judul}`,
  tutupAriaLabel:     (judul: string): string => `Tutup: ${judul}`,
  // MENUNGGU REVIEW PSIKOLOG FITRI
  isiBacaanSegera:    'Isi bacaan segera hadir.',
};

// ── Tab shell ──────────────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const LABEL_TAB = {
  kebiasaanBaik: 'Kebiasaan Baik',
  ajakMain:      'Ajak Main',
  wawasanTumbuh: 'Wawasan Tumbuh',
};

// MENUNGGU REVIEW PSIKOLOG FITRI
export const HEADER_BEKAL = {
  penjelasan:
    'Bekal mengajak Ayah Bunda memilih dari tiga hal: kebiasaan sehari-hari yang merawat nilai keluarga, kegiatan bersama anak, dan bacaan pendamping sebagai wawasan tumbuh. ' +
    'Tidak ada yang harus diselesaikan semuanya — pilih yang terasa pas, dan yang sedikit tapi rutin lebih berarti daripada banyak sekaligus.',
};

// ── Kebiasaan Baik ─────────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const KEBIASAAN_BAIK = {
  pembuka:
    'Ini bukan daftar yang harus dituntaskan. Pilih satu-dua nilai yang paling dekat dengan jiwa keluarga, lalu latih kebiasaannya pelan-pelan.',
  jumlahKebiasaan: (n: number): string =>
    n === 1 ? '1 kebiasaan untuk usia ini' : `${n} kebiasaan untuk usia ini`,
  sikapSedangDilengkapi: 'Kebiasaan sedang dilengkapi',
  tetapBisaDitanam:
    'Nilai ini tetap bisa kamu tanam di Taman Akar Keluarga.',
  sudahDiTaman: 'Sudah di taman keluarga',
  tombolCabut: 'Cabut dari taman', // TODO: review Fitri
  ajakanTanam: (nilai: string): string => `Tanam ${nilai} di taman keluarga?`,
  tombolTanam: (nilai: string): string => `Tanam ${nilai}`,
  lihatSemuaNilai: 'Lihat semua nilai',
  sembunyikanNilai: 'Sembunyikan',
  kebiasaanLabel: 'Kebiasaan orang tua',
  tutup: 'Tutup',
};

// ── Papan Bekal — judul & subjudul per tab ────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const BEKAL_HEAD = {
  kebiasaanBaik: {
    judul: 'Kebiasaan Baik',
    sub: 'Ini bukan daftar yang harus dituntaskan. Pilih satu-dua nilai yang paling dekat dengan jiwa keluarga, lalu latih kebiasaannya pelan-pelan.',
  },
  ajakMain: {
    judul: 'Ajak Main',
    sub: 'Kegiatan kecil yang bisa dilakukan bersama—ringan, menyenangkan, dan diam-diam menumbuhkan.',
  },
  wawasanTumbuh: {
    judul: 'Wawasan Tumbuh',
    sub: 'Bacaan pendamping singkat untuk memahami apa yang sedang tumbuh di tahun pertama.',
  },
};

// ── Papan Ajak Main — konten kartu statis ─────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const BEKAL_AJAK_MAIN = [
  { nilai: 'Kasih Sayang' as const,  name: 'Peluk Pagi',         desc: 'Mulai hari dengan pelukan dan tatapan hangat',    pillText: '5 menit' },
  { nilai: 'Empati' as const,        name: 'Tebak Rasa',         desc: 'Tebak perasaan tokoh dalam buku cerita',         pillText: 'sambil membaca' },
  { nilai: 'Kemandirian' as const,   name: 'Pakai Baju Sendiri', desc: 'Beri waktu, tahan diri untuk tak membantu',      pillText: 'harian' },
  { nilai: 'Syukur' as const,        name: 'Satu Syukur Malam',  desc: 'Sebut satu hal baik sebelum tidur',              pillText: 'malam' },
  { nilai: 'Cinta Ilmu' as const,    name: 'Satu Pertanyaan',    desc: 'Sambut rasa ingin tahunya dengan antusias',      pillText: 'harian' },
] as const;

// ── Papan Wawasan Tumbuh — konten kartu statis ────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const BEKAL_WAWASAN = [
  { nilai: 'Cinta Ilmu' as const,   name: 'Otak yang Dibangun', desc: 'Kenapa tahun pertama begitu menentukan',     pillText: '5 mnt baca' },
  { nilai: 'Kasih Sayang' as const, name: 'Ikatan Aman',        desc: 'Dasar rasa percaya anak pada dunia',         pillText: '4 mnt baca' },
  { nilai: 'Sabar' as const,        name: 'Ritme, Bukan Jadwal',desc: 'Membaca isyarat bayi dengan tenang',         pillText: '6 mnt baca' },
  { nilai: 'Empati' as const,       name: 'Bahasa Perasaan',    desc: 'Menamai emosi anak sejak dini',              pillText: '5 mnt baca' },
  { nilai: 'Keberanian' as const,   name: 'Ruang Mencoba',      desc: 'Membiarkan anak jatuh kecil dengan aman',   pillText: '4 mnt baca' },
] as const;

// ── Footer papan ──────────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const BEKAL_FOOTER = 'arahkan kursor ke bunga — pilih yang terasa dekat, lalu tanam di taman keluarga';
