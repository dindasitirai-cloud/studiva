/**
 * KONTEN RUANG TEDUH, FASE ANAK 0 SAMPAI 1 TAHUN
 *
 * WAJIB DIREVIEW SEBELUM PRODUKSI:
 * - Psikolog Fitri Effendy: seluruh copy, bingkai bahasa, kriteria panduan memilih
 * - Apoteker Raisha: konten suplemen, gizi, dan yang bersinggungan dengan menyusui
 *
 * Sumber utama: Buku KIA Kemenkes RI edisi 2024.
 * Setiap klaim kesehatan wajib punya sumberHalamanKIA agar bisa diaudit balik.
 *
 * Status: DRAFT, belum disetujui.
 */

import type {
  KelompokGizi,
  SuplemenHarian,
  ItemChecklist,
  SubTahapRuangTeduh,
  CuacaHati,
  KondisiNifas,
} from './types';
import { validasiChecklist } from './konfigurasi';

// ─── 5.1 Kelompok gizi (KIA hal. 37) ─────────────────────────────────────────

export const KELOMPOK_GIZI: KelompokGizi[] = [
  {
    id: 'makanan-pokok',
    nama: 'Makanan pokok',
    porsiHarian: 6,
    padananRumahTangga: '1 porsi kira kira tiga per empat gelas nasi',
    sumberHalamanKIA: 37,
  },
  {
    id: 'protein-hewani',
    nama: 'Protein hewani',
    porsiHarian: 4,
    padananRumahTangga: '1 porsi kira kira 1 butir telur ayam',
    sumberHalamanKIA: 37,
  },
  {
    id: 'protein-nabati',
    nama: 'Protein nabati',
    porsiHarian: 4,
    padananRumahTangga: '1 porsi kira kira 1 potong tempe',
    sumberHalamanKIA: 37,
  },
  {
    id: 'sayur',
    nama: 'Sayur sayuran',
    porsiHarian: 4,
    padananRumahTangga: '1 porsi kira kira 1 mangkuk sayur matang',
    sumberHalamanKIA: 37,
  },
  {
    id: 'buah',
    nama: 'Buah buahan',
    porsiHarian: 4,
    padananRumahTangga: '1 porsi kira kira 1 pisang sedang',
    sumberHalamanKIA: 37,
  },
  {
    id: 'minyak-lemak',
    nama: 'Minyak atau lemak',
    porsiHarian: 6,
    padananRumahTangga: '1 porsi kira kira 1 sendok teh',
    sumberHalamanKIA: 37,
  },
  {
    id: 'gula',
    nama: 'Gula',
    porsiHarian: 2,
    padananRumahTangga: 'paling banyak 2 porsi sehari',
    sumberHalamanKIA: 37,
  },
];

// Target air putih per sub tahap
export const TARGET_AIR_PER_SUBTAHAP: Record<SubTahapRuangTeduh, number> = {
  'menyusui-eksklusif': 14,
  'mpasi-berlanjut': 12,
};

// ─── 5.2 Suplemen ─────────────────────────────────────────────────────────────

export const SUPLEMEN_HARIAN: SuplemenHarian[] = [
  {
    id: 'ttd',
    nama: 'Tablet Tambah Darah',
    keterangan: 'Mencegah anemia masa nifas. Sebaiknya tidak diminum bersama teh atau kopi.',
    sumberHalamanKIA: 26,
    perluReviewApoteker: true,
  },
  {
    id: 'vitamin-a',
    nama: 'Vitamin A nifas',
    keterangan: 'Sesuai jadwal dari bidan atau Puskesmas.',
    sumberHalamanKIA: 28,
    perluReviewApoteker: true,
  },
];

// ─── 5.3 Judul dinamis Piring Ibu ─────────────────────────────────────────────

// TODO: review Fitri
export function judulPiring(persen: number): string {
  if (persen === 0)     return 'Piring Ibu menunggu, tidak perlu buru buru';
  if (persen < 60)      return 'Piring Ibu hari ini sedang terisi';
  if (persen < 100)     return 'Piring Ibu hari ini sudah cukup beragam';
  return 'Piring Ibu lengkap hari ini';
}

// ─── 5.4 Checklist kesiapan keluarga ─────────────────────────────────────────

const CHECKLIST_KESIAPAN: ItemChecklist[] = [
  {
    id: 'ktp-kk',
    label: 'KTP dan Kartu Keluarga siap',
    kategori: 'kesiapan-keluarga',
    sumberHalamanKIA: 18,
  },
  {
    id: 'pendamping-salin',
    label: 'Pendamping saat periksa dan melahirkan',
    kategori: 'kesiapan-keluarga',
    sumberHalamanKIA: 18,
  },
  {
    id: 'donor-darah',
    label: 'Lebih dari 1 calon pendonor darah segolongan',
    kategori: 'kesiapan-keluarga',
    catatan: 'Disiapkan sejak awal, bukan saat darurat',
    sumberHalamanKIA: 18,
  },
  {
    id: 'tabungan-salin',
    label: 'Tabungan atau dana cadangan untuk biaya melahirkan',
    kategori: 'kesiapan-keluarga',
    sumberHalamanKIA: 18,
  },
  {
    id: 'kendaraan-siaga',
    label: 'Kendaraan siaga jika sewaktu waktu diperlukan',
    kategori: 'kesiapan-keluarga',
    sumberHalamanKIA: 18,
  },
  {
    id: 'jkn-bpjs',
    label: 'Kartu JKN dan pendaftaran BPJS Kesehatan',
    kategori: 'kesiapan-keluarga',
    sumberHalamanKIA: 18,
  },
  {
    id: 'akta-lahir',
    label: 'Akta kelahiran {anak} diurus',
    kategori: 'kesiapan-keluarga',
    sumberHalamanKIA: 18,
  },
  {
    id: 'jkn-anak',
    label: '{Anak} didaftarkan ke JKN',
    kategori: 'kesiapan-keluarga',
    sumberHalamanKIA: 18,
  },
  {
    id: 'kb-pasca-salin',
    label: 'Metode KB pasca salin sudah dipilih',
    kategori: 'kesiapan-keluarga',
    catatan: 'Pilih yang tidak mengganggu produksi ASI',
    sumberHalamanKIA: 33,
  },
];

// ─── 5.5 Checklist barang ─────────────────────────────────────────────────────

const CHECKLIST_BARANG: ItemChecklist[] = [
  // Tier perlu
  {
    id: 'baju-bayi',
    label: 'Baju bayi 4 sampai 6 setel',
    kategori: 'pakaian',
    tier: 'perlu',
    panduanMemilih: [
      { teks: 'Bahan katun yang menyerap keringat, karena bayi cepat gerah', jenis: 'cari' },
      { teks: 'Bukaan kancing depan, supaya tidak perlu ditarik lewat kepala', jenis: 'cari' },
      { teks: 'Tali panjang di area leher dan hiasan kecil yang bisa lepas', jenis: 'hindari' },
    ],
    tautanBelanja: '', // TODO: isi tautan afiliasi Shopee setelah akun afiliasi siap
  },
  {
    id: 'kain-bedong',
    label: 'Kain bedong dan selimut tipis',
    kategori: 'pakaian',
    tier: 'perlu',
  },
  {
    id: 'tempat-tidur',
    label: 'Tempat tidur dengan kasur rata',
    kategori: 'tidur-aman',
    tier: 'perlu',
    catatan: 'Tanpa bantal dan boneka, untuk tidur yang aman',
    panduanMemilih: [
      { teks: 'Kasur rata dan cukup padat, seukuran ranjang tanpa celah di pinggir', jenis: 'cari' },
      { teks: '{Anak} ditidurkan telentang, di alas tidurnya sendiri', jenis: 'cari' },
      { teks: 'Bantal, guling, boneka, bumper, dan selimut tebal', jenis: 'hindari' },
    ],
    alasanTanpaTautan:
      'Rekah tidak menautkan produk tempat tidur. Keamanan tidur bergantung pada cara pemakaian dan kondisi kamar, bukan pada merek, dan itu tidak bisa Rekah jamin dari jauh.',
  },
  {
    id: 'popok',
    label: 'Popok',
    kategori: 'kebersihan',
    tier: 'perlu',
  },

  // Tier membantu
  {
    id: 'gendongan',
    label: 'Gendongan',
    kategori: 'transportasi',
    tier: 'membantu',
    catatan: 'Menopang Ibu sekaligus menjaga posisi panggul {anak}',
    rujukanPanduan: 'International Hip Dysplasia Institute',
    panduanMemilih: [
      {
        teks: 'Dudukan lebar yang menopang paha sampai lutut, sehingga lutut {anak} sedikit lebih tinggi dari bokong dan kakinya membentuk huruf M',
        jenis: 'cari',
      },
      {
        teks: 'Kedua paha bisa terbuka membentuk sudut sekitar 60 sampai 120 derajat',
        jenis: 'cari',
      },
      {
        teks: '{Anak} menghadap ke arah tubuh Ibu, terutama selama 6 bulan pertama',
        jenis: 'cari',
      },
      {
        teks: 'Ada penopang kepala dan leher selama {anak} belum kuat menegakkan kepalanya',
        jenis: 'cari',
      },
      {
        teks: 'Gendongan yang membuat kaki {anak} menggantung lurus dan rapat, karena posisi itu yang diketahui kurang baik untuk perkembangan panggul',
        jenis: 'hindari',
      },
    ],
    tautanBelanja: '', // TODO: isi tautan afiliasi Shopee setelah akun afiliasi siap
  },
  {
    id: 'pompa-asi',
    label: 'Pompa dan wadah ASI perah',
    kategori: 'menyusui',
    tier: 'membantu',
    catatan: 'Terutama kalau Ibu akan kembali bekerja',
    sumberHalamanKIA: 36,
    panduanMemilih: [
      {
        teks: 'Corong yang pas dengan ukuran puting Ibu, ini yang paling menentukan nyaman atau tidaknya',
        jenis: 'cari',
      },
      {
        teks: 'Mudah dibongkar dan dicuci sampai ke sela sela',
        jenis: 'cari',
      },
      {
        teks: 'Wadah kecil ukuran 15 sampai 60 ml per porsi, supaya ASI tidak terbuang',
        jenis: 'cari',
      },
    ],
    tautanBelanja: '', // TODO: isi tautan afiliasi Shopee setelah akun afiliasi siap
  },
  {
    id: 'termometer',
    label: 'Termometer bayi',
    kategori: 'kesehatan',
    tier: 'membantu',
    panduanMemilih: [
      {
        teks: 'Termometer digital yang angkanya mudah dibaca saat tengah malam',
        jenis: 'cari',
      },
      { teks: 'Termometer air raksa', jenis: 'hindari' },
    ],
    tautanBelanja: '', // TODO: isi tautan afiliasi Shopee setelah akun afiliasi siap
  },

  // Tier tidak-wajib
  {
    id: 'sepatu-bayi',
    label: 'Sepatu bayi baru lahir',
    kategori: 'pakaian',
    tier: 'tidak-wajib',
  },
  {
    id: 'penghangat-tisu',
    label: 'Penghangat tisu basah',
    kategori: 'kebersihan',
    tier: 'tidak-wajib',
  },
  {
    id: 'baby-box',
    label: 'Baby box khusus',
    kategori: 'tidur-aman',
    tier: 'tidak-wajib',
  },
];

export const SEMUA_CHECKLIST: ItemChecklist[] = [
  ...CHECKLIST_KESIAPAN,
  ...CHECKLIST_BARANG,
];

export { CHECKLIST_KESIAPAN, CHECKLIST_BARANG };

// Validasi saat modul dimuat
const _errorValidasi = validasiChecklist(SEMUA_CHECKLIST);
if (_errorValidasi.length > 0) {
  console.warn('[RuangTeduh] validasiChecklist menemukan masalah:', _errorValidasi);
}

// ─── 5.6 Teks tetap ──────────────────────────────────────────────────────────

// TODO: review Fitri
export const TEKS_SAPAAN_BERANDA = {
  judul: 'Bagaimana kabar Ibu hari ini?',
  subjudul:
    'Kebun tempat {anak} tumbuh hanya subur kalau yang merawatnya juga terawat.',
} as const;

// TODO: review Fitri
export const TEKS_KUTIPAN_MENYAMBUT =
  'Bayi tidak menilai harga stroller. Yang {anak} butuhkan sudah ada: Ibu, ASI, dan tempat tidur yang aman.';

// TODO: review Fitri
export const TEKS_CATATAN_BARANG_BEKAS =
  'Barang pinjaman dari keluarga atau warisan kakak dihitung sama seperti barang baru. Yang penting aman dipakai {anak}.';

// TODO: review Fitri
export const TEKS_CATATAN_TIDAK_WAJIB =
  'Tier ini sengaja tidak punya panduan memilih dan tidak punya tautan belanja. Kalau Ibu melewatinya, {anak} tetap baik baik saja.';

// TODO: review Fitri
export const TEKS_PAGAR_PRODUK = {
  judul: 'Yang tidak akan pernah Rekah tautkan',
  isi: 'Botol dot, empeng, dan susu formula untuk bayi di bawah 1 tahun. Promosi pengganti ASI untuk kelompok usia ini diatur ketat di Indonesia, dan Rekah memilih berada jauh di sisi aman.',
} as const;

// TODO: review Fitri
export const TEKS_CATATAN_POSISI =
  'Rekah mendampingi Buku KIA, bukan menggantikannya. Tetap bawa buku fisik Ibu ke Posyandu dan Puskesmas.';

// TODO: review Fitri
export const TEKS_PERAN_AYAH = {
  judul: 'Yang bisa Ayah lakukan',
  isi: 'Berbagi peran merawat {anak}, memijat lembut punggung Ibu, dan mengajak Ibu bicara tentang perasaannya. Buku KIA menempatkan dukungan suami sebagai penanganan utama, bukan pelengkap.',
  sumberHalamanKIA: [26, 32],
} as const;

// Pesan gating usia di luar 0 sampai 12 bulan
// TODO: review Fitri
export const TEKS_DILUAR_RENTANG =
  'Ruang Teduh untuk usia ini sedang disiapkan.';

// ─── 5.7 Rak kartu edukasi ───────────────────────────────────────────────────

export interface KartuEdukasiData {
  id: string;
  judul: string;
  sumberHalamanKIA: number[];
}

// TODO: review Fitri — judul kartu
export const KARTU_EDUKASI: KartuEdukasiData[] = [
  {
    id: 'kartu-perasaan-ibu',
    judul: 'Yang Ibu rasakan ini normal atau perlu dicek?',
    sumberHalamanKIA: [32],
  },
  {
    id: 'kartu-posisi-menyusui',
    judul: 'Posisi dan pelekatan menyusui yang benar',
    sumberHalamanKIA: [35],
  },
  {
    id: 'kartu-simpan-asi',
    judul: 'Tabel simpan ASI perah',
    sumberHalamanKIA: [36],
  },
  {
    id: 'kartu-peran-ayah',
    judul: 'Yang bisa Ayah lakukan minggu ini',
    sumberHalamanKIA: [26, 32],
  },
  {
    id: 'kartu-kb-pasca-salin',
    judul: 'KB pasca salin yang ramah ASI',
    sumberHalamanKIA: [33],
  },
];

// =============================================================================

/**
 * KONTEN CUACA HATI DAN LEMBAR NIFAS
 * STATUS: MENUNGGU PERSETUJUAN PSIKOLOG FITRI EFFENDY.
 * Enam keputusan masih terbuka, lihat naskah copy Rilis 2.
 * Jangan mengubah teks di blok ini tanpa persetujuan tertulis.
 */

// ─── 5.1 Check-in Cuaca Hati ─────────────────────────────────────────────────

export const CUACA_PERTANYAAN = 'Hati Ibu hari ini seperti apa?';

export const CUACA_SUBTEKS =
  'Boleh dilewati. Tidak ada yang perlu dikejar, tidak ada rentetan yang putus.';

export const CUACA_LABEL: Record<CuacaHati, string> = {
  cerah:   'Cerah',
  berawan: 'Berawan',
  mendung: 'Mendung',
  hujan:   'Hujan',
  badai:   'Badai',
};

// ─── 5.2 Respons setelah memilih ─────────────────────────────────────────────

export interface ResponsCuaca {
  penanda: string;
  isi: string;
}

export const RESPONS_CUACA: Record<CuacaHati, ResponsCuaca> = {
  cerah: {
    penanda: 'Senang mendengarnya, Bu.',
    isi: 'Hari cerah juga pantas dicatat. {Anak} tumbuh di sisi Ibu yang sedang hangat.',
  },
  berawan: {
    penanda: 'Terima kasih sudah jujur.',
    isi: 'Berawan itu wajar. Tidak setiap hari harus terang benderang.',
  },
  mendung: {
    penanda: 'Terima kasih sudah mencatat.',
    isi: 'Hari mendung tetap hari yang Ibu lalui bersama {anak}. Itu sudah cukup.',
  },
  hujan: {
    penanda: 'Hari ini hatinya sedang hujan ya, Bu.',
    isi: 'Tidak apa apa. Kebun juga butuh hujan. {Anak} tetap tumbuh di sisi Ibu yang sedang berteduh.',
  },
  badai: {
    penanda: 'Ibu sedang berat sekali hari ini.',
    isi: 'Ibu tidak perlu kuat sendirian. Kalau mau, Ibu bisa cerita dulu, atau minta ayah dan keluarga menemani hari ini.',
  },
};

// ─── 5.3 Riwayat ─────────────────────────────────────────────────────────────

export const RIWAYAT_JUDUL = 'Langit 14 hari terakhir';

export const RIWAYAT_KETERANGAN =
  'Tanpa angka, tanpa skor, tanpa rentetan hari. Hari kosong berarti Ibu sedang beristirahat, bukan gagal mencatat.';

export const RIWAYAT_KUTIPAN =
  'Kebun butuh semua cuaca. Hujan bukan tanda Ibu gagal merawat.';

// ─── 5.4 Cermin pola ─────────────────────────────────────────────────────────

export const CERMIN_POLA_JUDUL =
  'Ibu sudah 2 minggu mencatat langit yang mendung';

export const CERMIN_POLA_ISI =
  'Buku KIA menyarankan, jika dalam 2 minggu atau lebih setelah melahirkan Ibu merasa mudah murung atau sedih, kondisi ini sebaiknya diperiksakan ke tenaga kesehatan. Ini bukan diagnosis, hanya pantulan dari catatan Ibu sendiri.';

export const CERMIN_TOMBOL_PENDAMPING = 'Cerita ke Pendamping';

export const CERMIN_TOMBOL_JADWAL = 'Jadwal periksa nifas';

export const CERMIN_CATATAN_KAKI =
  'Sumber: Buku KIA 2024, halaman 26 dan 32. Tidak ada notifikasi terkirim ke siapa pun tanpa Ibu menekan tombol.';

export const CERMIN_PENDAMPING_SEMENTARA =
  'Ruang cerita dengan Pendamping sedang disiapkan.';

// ─── 5.5 Kartu pemicu krisis dan layar krisis ─────────────────────────────────

export const KARTU_PEMICU_KRISIS = {
  judul: 'Sedang berat sekali?',
  isi: 'Kalau ada pikiran menyakiti diri sendiri atau bayi, itu gejala yang perlu ditangani segera dan bukan salah Ibu.',
  tombol: 'Saya sedang merasakan itu',
} as const;

export const LAYAR_KRISIS = {
  judul: 'Ibu perlu ditemani sekarang',
  isi: 'Tolong hubungi atau datangi Puskesmas atau Rumah Sakit terdekat hari ini juga, dan minta suami atau keluarga menemani Ibu saat ini. Ibu tidak perlu menghadapi ini sendirian.',
} as const;

// ─── 5.6 Daftar kondisi Lembar Nifas ─────────────────────────────────────────

export const LEMBAR_NIFAS_JUDUL = 'Cek kondisi Ibu hari ini';

export const LEMBAR_NIFAS_SUBTEKS =
  'Centang yang Ibu rasakan. Tidak ada yang perlu dicentang kalau Ibu merasa baik.';

export const KONDISI_NIFAS: KondisiNifas[] = [
  // Tingkat bahaya
  {
    id: 'perdarahan-banyak',
    label: 'Perdarahan lebih dari 2 pembalut dalam 5 menit',
    tingkat: 'bahaya',
    sumberHalamanKIA: '28 sampai 31',
  },
  {
    id: 'demam',
    label: 'Demam lebih dari 38 derajat',
    tingkat: 'bahaya',
    sumberHalamanKIA: '28 sampai 31',
  },
  {
    id: 'sakit-kepala-pandangan',
    label: 'Sakit kepala hebat atau pandangan kabur',
    tingkat: 'bahaya',
    sumberHalamanKIA: '28 sampai 31',
  },
  {
    id: 'nyeri-ulu-hati',
    label: 'Nyeri ulu hati, mual, atau muntah',
    tingkat: 'bahaya',
    sumberHalamanKIA: '26 sampai 27',
  },
  {
    id: 'kejang',
    label: 'Kejang, dengan atau tanpa bengkak di kaki, tangan, dan wajah',
    tingkat: 'bahaya',
    sumberHalamanKIA: '26 sampai 27',
  },
  {
    id: 'payudara-merah',
    label: 'Payudara bengkak, merah, disertai rasa sakit',
    tingkat: 'bahaya',
    sumberHalamanKIA: '26 sampai 27',
  },
  {
    id: 'darah-nifas-berbau',
    label: 'Darah nifas berbau, atau perut terasa nyeri',
    tingkat: 'bahaya',
    sumberHalamanKIA: '28 sampai 31',
  },
  {
    id: 'cairan-berbau',
    label: 'Keluar cairan berbau dari jalan lahir',
    tingkat: 'bahaya',
    sumberHalamanKIA: '26 sampai 27',
  },
  {
    id: 'kelamin-bengkak',
    label: 'Area kelamin bengkak, nyeri, atau ada luka',
    tingkat: 'bahaya',
    sumberHalamanKIA: '28 sampai 31',
  },
  {
    id: 'napas-jantung',
    label: 'Napas pendek atau jantung berdebar',
    tingkat: 'bahaya',
    sumberHalamanKIA: '28 sampai 31',
  },
  {
    id: 'sulit-bak',
    label: 'Sulit buang air kecil',
    tingkat: 'bahaya',
    sumberHalamanKIA: '28 sampai 31',
  },
  // Tingkat dicatat
  {
    id: 'payudara-penuh',
    label: 'Payudara terasa penuh atau kencang',
    tingkat: 'dicatat',
    sumberHalamanKIA: '34 sampai 36',
  },
  {
    id: 'sulit-tidur',
    label: 'Sulit tidur walau ada kesempatan',
    tingkat: 'dicatat',
    sumberHalamanKIA: '32',
  },
  {
    id: 'lelah-sepanjang-hari',
    label: 'Badan lelah sekali sepanjang hari',
    tingkat: 'dicatat',
    sumberHalamanKIA: '32',
  },
  {
    id: 'keputihan',
    label: 'Keputihan',
    tingkat: 'dicatat',
    sumberHalamanKIA: '28 sampai 31',
  },
];

// ─── 5.7 Respons tanda bahaya ─────────────────────────────────────────────────

export const ALERT_BAHAYA_JUDUL = 'Ini tanda bahaya masa nifas';

export const ALERT_BAHAYA_MENDESAK =
  'Segera periksa ke Puskesmas atau Rumah Sakit hari ini.';

export const ALERT_BAHAYA_CATATAN =
  'Sumber: Buku KIA 2024, halaman 26 sampai 31';

// ─── 5.8 Jadwal periksa nifas ─────────────────────────────────────────────────

export const JADWAL_NIFAS_JUDUL = 'Empat kali periksa nifas';

export interface EntriJadwalNifas {
  label: string;
  /** hari ke berapa jendela mulai */
  hariMulai: number;
  /** hari ke berapa jendela selesai (inklusif) */
  hariAkhir: number;
  catatan?: string;
}

export const JADWAL_NIFAS: EntriJadwalNifas[] = [
  { label: '6 sampai 48 jam',  hariMulai: 1,  hariAkhir: 2  },
  { label: '3 sampai 7 hari',  hariMulai: 3,  hariAkhir: 7  },
  { label: '8 sampai 28 hari', hariMulai: 8,  hariAkhir: 28 },
  { label: '29 sampai 42 hari', hariMulai: 29, hariAkhir: 42, catatan: 'untuk Ibu saja' },
];

export const JADWAL_NIFAS_CATATAN =
  'Lembar ini bisa Ibu tunjukkan ke bidan saat periksa, sebagai pelengkap buku fisik.';

// ─── 5.9 Yang tidak perlu dilakukan masa nifas ───────────────────────────────

export const TIDAK_PERLU_JUDUL = 'Yang tidak perlu dilakukan masa nifas';

export const TIDAK_PERLU_BUTIR = [
  'Membersihkan payudara dengan alkohol atau sabun, karena bisa terminum bayi.',
  'Membuang kolostrum, ASI pertama yang justru paling berguna.',
  'Mengikat perut terlalu kencang.',
  'Menempelkan daun daunan pada area kemaluan.',
] as const;
