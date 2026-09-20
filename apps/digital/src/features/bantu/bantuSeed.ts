// Bantu — seed konten terkurasi situasi (Phase 14C). Engine TERKURASI: mencocokkan
// situasi, jujur saat tak ada match. DRAFT: kenapaSumber null → layer sumber tak tampil.
// Pemindai keselamatan + rujukan WAJIB diverifikasi sebelum tayang (Phase 14A §3 / 14O).
export type KategoriSituasi = 'perilaku_anak' | 'relasional' | 'caregiver' | 'meta';

export interface BantuClarify {
  pertanyaan: string;
  opsi: string[];
}
export interface BantuRespons {
  validasi: string;
  langkah: string[];
  yangDiamati?: string;
  kenapaSederhana?: string;
  kenapaSumber?: string | null;
}
export interface BantuSituasi {
  slug: string;
  label: string;
  /** Satu baris deskriptor untuk kartu entry (Phase 14N). */
  ringkas?: string;
  kategori: KategoriSituasi;
  sensitifKeselamatan?: boolean;
  clarify: BantuClarify[];
  respons: BantuRespons;
  status: 'menunggu_review' | 'disetujui';
}

export const BANTU_SITUASI: BantuSituasi[] = [
  {
    slug: 'tantrum', label: 'Anak tantrum', ringkas: 'Ledakan emosi, sulit menenangkan', kategori: 'perilaku_anak', status: 'menunggu_review',
    clarify: [{ pertanyaan: 'Biasanya sebelum tantrum ada pemicunya?', opsi: ['Lapar/lelah', 'Transisi', 'Tidak dituruti', 'Tidak yakin'] }],
    respons: {
      validasi: 'Tantrum itu cara anak menyalurkan perasaan yang belum bisa ia ungkap dengan kata. Kamu tidak sedang melakukan sesuatu yang keliru.',
      langkah: ['Tetap dekat & tenang, turunkan badan setara mata anak.', 'Namai perasaannya: "Kamu kecewa ya."', 'Tunggu gelombangnya reda sebelum menawarkan solusi.', 'Setelah tenang, sambungkan singkat.'],
      yangDiamati: 'Apakah anak lebih cepat tenang saat ditemani tanpa dibujuk berlebihan?',
      kenapaSederhana: 'Anak menenangkan diri lebih baik saat merasa ditemani, bukan dinilai.',
      kenapaSumber: null,
    },
  },
  {
    slug: 'sulit_tidur', label: 'Sulit tidur', ringkas: 'Sulit mulai tidur atau sering terbangun', kategori: 'perilaku_anak', status: 'menunggu_review',
    clarify: [{ pertanyaan: 'Sulitnya di bagian mana?', opsi: ['Saat mulai tidur', 'Sering terbangun', 'Keduanya'] }],
    respons: {
      validasi: 'Transisi ke tidur memang salah satu momen tersulit bagi banyak keluarga.',
      langkah: ['Beri peringatan sebelum bersiap tidur ("Lima menit lagi ya").', 'Buat urutan tetap yang bisa diprediksi (mandi → buku → lampu redup).', 'Jaga nada tenang & konsisten walau anak menawar.', 'Bila menolak, validasi lalu tetap pada urutan.'],
      yangDiamati: 'Apakah transisi lebih mulus saat urutannya sama tiap malam?',
      kenapaSederhana: 'Perubahan yang bisa diprediksi terasa lebih aman bagi anak.',
      kenapaSumber: null,
    },
  },
  {
    slug: 'tidak_mau_makan', label: 'Tidak mau makan', ringkas: 'Menolak makan atau pilih-pilih', kategori: 'perilaku_anak', status: 'menunggu_review',
    clarify: [{ pertanyaan: 'Menolaknya seperti apa?', opsi: ['Jenis tertentu', 'Makan secara umum', 'Tergantung suasana'] }],
    respons: {
      validasi: 'Selera & jumlah makan anak sering naik-turun; ini umum pada usia ini.',
      langkah: ['Sajikan porsi kecil + satu makanan yang ia suka.', 'Beri peran kecil (memilih di antara dua, memegang sendok).', 'Jaga meja tanpa tekanan/paksaan/negosiasi berlebihan.', 'Akhiri dengan tenang tanpa menjadikan makanan hadiah/hukuman.'],
      yangDiamati: 'Apakah suasana makan lebih tenang saat tekanan dikurangi?',
      kenapaSederhana: 'Anak cenderung lebih mau saat merasa punya sedikit kendali & tanpa paksaan.',
      kenapaSumber: null,
    },
  },
  {
    slug: 'memukul', label: 'Memukul', ringkas: 'Memukul, menggigit, atau melukai', kategori: 'perilaku_anak', sensitifKeselamatan: true, status: 'menunggu_review',
    clarify: [{ pertanyaan: 'Apakah sampai ada yang terluka?', opsi: ['Tidak', 'Ada yang terluka', 'Sering & parah'] }],
    respons: {
      validasi: 'Di usia ini, memukul sering muncul karena kemampuan bahasa belum secepat perasaannya — ini bukan tanda anak "nakal".',
      langkah: ['Hentikan dengan lembut & tegas: tahan tangannya, "Ibu tidak biarkan memukul."', 'Namai perasaan + tawarkan cara lain ("Kamu marah — bilang \'aku marah\'").', 'Pastikan yang dipukul aman & diperhatikan.', 'Setelah tenang, latih ulang cara menyalurkan.'],
      yangDiamati: 'Apakah anak mulai punya cara lain menyalurkan marah?',
      kenapaSederhana: 'Anak butuh alternatif konkret, bukan sekadar larangan.',
      kenapaSumber: null,
    },
  },
  {
    slug: 'konflik_saudara', label: 'Konflik saudara', ringkas: 'Rebutan, cemburu, atau bertengkar', kategori: 'relasional', sensitifKeselamatan: true, status: 'menunggu_review',
    clarify: [{ pertanyaan: 'Situasinya bagaimana?', opsi: ['Rebutan barang', 'Aman, hanya ribut', 'Sampai menyakiti'] }],
    respons: {
      validasi: 'Konflik antar-saudara adalah bagian wajar mereka belajar berbagi & bernegosiasi.',
      langkah: ['Pastikan aman lebih dulu (pisahkan bila perlu).', 'Akui kedua sisi tanpa mencari "siapa salah".', 'Bantu mereka menyuarakan keinginan bergantian.', 'Dorong solusi bersama sesuai usia (giliran/bagi).'],
      yangDiamati: 'Apakah mereka mulai bisa bergiliran dengan sedikit bantuan?',
      kenapaSederhana: 'Fokus ke solusi & rasa adil lebih menolong daripada mencari yang bersalah.',
      kenapaSumber: null,
    },
  },
  {
    slug: 'konflik_caregiver', label: 'Konflik caregiver', ringkas: 'Beda cara mengasuh antar pengasuh', kategori: 'relasional', status: 'menunggu_review',
    clarify: [{ pertanyaan: 'Beda pendapatnya soal apa?', opsi: ['Aturan', 'Rutinitas', 'Cara merespons'] }],
    respons: {
      validasi: 'Wajar tiap pengasuh punya cara berbeda; yang membantu anak adalah kesepakatan yang cukup konsisten.',
      langkah: ['Bahas berdua jauh dari anak.', 'Sepakati satu hal kecil yang sama dulu (bukan semua sekaligus).', 'Tuangkan sebagai "cara kita" — bukan aturan satu pihak.', 'Tinjau ulang setelah beberapa hari.'],
      yangDiamati: 'Apakah anak lebih tenang saat responnya lebih seragam?',
      kenapaSederhana: 'Konsistensi yang cukup (bukan sempurna) membantu anak tahu apa yang diharapkan.',
      kenapaSumber: null,
    },
  },
  {
    slug: 'saya_mudah_marah', label: 'Saya kehilangan sabar', ringkas: 'Saat kamu merasa kehabisan sabar', kategori: 'caregiver', sensitifKeselamatan: true, status: 'menunggu_review',
    clarify: [{ pertanyaan: 'Saat ini kamu merasa...', opsi: ['Masih sangat terpancing', 'Sudah agak reda'] }],
    respons: {
      validasi: 'Merasa kehilangan sabar bukan berarti kamu orang tua yang buruk — itu tanda kamu sedang kelelahan & butuh sejenak. Kamu sudah baik dengan mengakuinya.',
      langkah: ['Pastikan anak aman, lalu beri dirimu jeda singkat (menjauh beberapa langkah, tarik napas beberapa kali).', 'Turunkan tuntutan sesaat — tak semua harus selesai sekarang.', 'Bila sudah lebih tenang, sambung kembali dengan anak dengan lembut.', 'Bila ini sering terjadi & terasa berat, pertimbangkan bicara dengan pasangan/orang tepercaya atau tenaga profesional.'],
      yangDiamati: 'Apakah jeda singkat membantumu kembali lebih tenang?',
      kenapaSederhana: 'Menenangkan diri dulu membuat kita bisa merespons, bukan bereaksi.',
      kenapaSumber: null,
    },
  },
  {
    slug: 'bingung_merespons', label: 'Saya bingung merespons', ringkas: 'Tidak yakin harus bagaimana', kategori: 'meta', status: 'menunggu_review',
    clarify: [],
    respons: {
      validasi: 'Tidak apa-apa bingung — kita cari tahu bersama, pelan-pelan.',
      langkah: ['Tetap tenang, namai perasaan anak.', 'Jaga keamanan lebih dulu.', 'Tunda keputusan besar saat suasana masih panas.', 'Pilih satu langkah kecil untuk sekarang.'],
      yangDiamati: 'Apa satu hal kecil yang bisa membuat momen ini sedikit lebih tenang?',
      kenapaSederhana: 'Satu langkah kecil yang tenang lebih menolong daripada mencari jawaban sempurna.',
      kenapaSumber: null,
    },
  },
];

// ── Pemindai keselamatan (Phase 14C §4 · daftar Phase 14O v1 — KONSERVATIF).
// Bias: lebih baik menampilkan B5 saat ragu. Berbasis NIAT & indikasi cedera, bukan
// katalog metode. DRAFT — wajib review Psikolog Fitri Effendy sebelum tayang.
export const KATA_KUNCI_KESELAMATAN: string[] = [
  // §3.1 — niat/risiko menyakiti diri (caregiver)
  'ingin mati', 'pengen mati', 'pingin mati', 'mau mati', 'kepingin mati',
  'mengakhiri hidup', 'akhiri hidup', 'menyudahi hidup',
  'bunuh diri', 'bundir', 'gantung diri',
  'menyakiti diri', 'melukai diri', 'lukai diri', 'nyakitin diri', 'self harm',
  'tidak ingin hidup', 'gak mau hidup', 'ga mau hidup',
  'lebih baik aku tidak ada', 'lebih baik aku mati', 'lebih baik aku pergi',
  'capek hidup', 'lelah hidup', 'tidak sanggup hidup', 'ga sanggup hidup',
  // §3.2 — niat/risiko menyakiti anak, atau anak sudah terluka
  'menyakiti anak', 'melukai anak', 'mukul anak', 'memukul anak', 'pengen mukul', 'mau mukul',
  'takut menyakiti', 'takut kelepasan', 'nyakitin anak', 'hampir mukul',
  'gak bisa nahan tangan', 'kelepasan mukul', 'membanting anak',
  'anak terluka', 'anak memar', 'anak berdarah', 'dipukuli', 'dianiaya',
  // §3.3 — KDRT / merasa tidak aman
  'kekerasan', 'kdrt', 'kekerasan rumah tangga', 'dipukul suami', 'dipukul istri', 'dipukul pasangan',
  'disakiti pasangan', 'diancam', 'mengancam', 'tidak aman', 'gak aman', 'takut pulang', 'takut sama pasangan',
  // §3.4 — krisis berat (putus asa / tak sanggup)
  'sudah tidak sanggup', 'tidak sanggup lagi', 'gak sanggup lagi', 'ga sanggup lagi',
  'putus asa', 'tidak ada harapan', 'gak ada harapan', 'semua sia-sia', 'tidak ada gunanya',
  'tidak kuat lagi', 'gak kuat lagi', 'ga kuat lagi', 'tidak tahan lagi',
];
export function adaSinyalBahaya(teks: string): boolean {
  const t = (teks || '').toLowerCase();
  return KATA_KUNCI_KESELAMATAN.some(k => t.includes(k));
}

// Jawaban clarify yang memicu B5 (mis. "Ada yang terluka", "Sering & parah", "Masih sangat terpancing").
export const OPSI_MEMICU_B5: string[] = ['Ada yang terluka', 'Sering & parah', 'Sampai menyakiti', 'Masih sangat terpancing'];

export interface Rujukan { nama: string; untuk: string; kontak: string; }
// KANDIDAT — WAJIB diverifikasi + owner pemelihara sebelum tayang (Phase 14A §3).
export const RUJUKAN_KESELAMATAN: Rujukan[] = [
  { nama: 'SAPA 129 (KemenPPPA)', untuk: 'Kekerasan pada perempuan & anak', kontak: 'Telp 129 / WhatsApp 0811-129-129' },
  { nama: 'TePSA (Kemensos)', untuk: 'Perlindungan sosial anak', kontak: '1500-771' },
  { nama: 'SEJIWA (Kemenkes)', untuk: 'Kesehatan jiwa / dukungan psikologis', kontak: '119 ext 8 · Healing119.id' },
  { nama: 'Darurat', untuk: 'Situasi darurat mendesak', kontak: '112' },
];
