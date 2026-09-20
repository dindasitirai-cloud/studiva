/**
 * SELURUH TEKS UI RUANG TEDUH ADA DI SINI.
 *
 * Tidak ada string keras di komponen — semua merujuk ke konstanta di file ini.
 * STATUS: DRAFT — wajib review Psikolog Fitri Effendy sebelum produksi.
 */

// ─── Halaman utama ────────────────────────────────────────────────────────────

// TODO: review Fitri
export const CP_SAPAAN_JUDUL = 'Bagaimana kabar Ibu hari ini?';
export const CP_SAPAAN_JUDUL_AYAH = 'Bagaimana kabar Ayah hari ini?';

// TODO: review Fitri
export const CP_DILUAR_RENTANG = 'Ruang Teduh untuk usia ini sedang disiapkan.';

// ─── Langit Hari Ini ──────────────────────────────────────────────────────────

// TODO: review Fitri
export const CP_LANGIT_JUDUL = 'Langit Hari Ini';
export const CP_LANGIT_PERTANYAAN_IBU = 'Hati Ibu hari ini seperti apa?';
export const CP_LANGIT_PERTANYAAN_AYAH = 'Hati Ayah hari ini seperti apa?';
export const CP_LANGIT_SUBTEKS = 'Boleh dilewati. Tidak ada yang perlu dikejar, tidak ada rentetan yang putus.';
export const CP_LANGIT_TOMBOL_RIWAYAT = 'Lihat riwayat langit';

export const CP_LANGIT_LABEL: Record<string, string> = {
  cerah:   'Cerah',
  berawan: 'Berawan',
  mendung: 'Mendung',
  hujan:   'Hujan',
  badai:   'Badai',
};

// TODO: review Fitri — seluruh respons cuaca
export interface ResponsCuacaCopy {
  penanda: string;
  isi: string;
  /** tautan darurat — hanya untuk badai */
  tautan?: string;
}

export const CP_RESPONS_CUACA: Record<string, ResponsCuacaCopy> = {
  cerah: {
    penanda: 'Senang mendengarnya.',
    isi: 'Hari cerah juga pantas dicatat. Hari ini kamu jalani bersama si kecil.',
  },
  berawan: {
    penanda: 'Terima kasih sudah jujur.',
    isi: 'Berawan itu wajar. Tidak setiap hari harus terang benderang.',
  },
  mendung: {
    penanda: 'Terima kasih sudah mencatat.',
    isi: 'Hari mendung tetap hari yang kamu lalui. Itu sudah cukup.',
  },
  hujan: {
    penanda: 'Hari ini hatinya sedang hujan ya.',
    isi: 'Tidak apa-apa. Kebun juga butuh hujan.',
  },
  badai: {
    penanda: 'Hari ini sedang berat sekali.',
    isi: 'Kamu tidak harus kuat sendirian. Minta pasangan atau keluarga menemani hari ini, atau buka kartu Setelah Badai.',
  },
};

// ─── Riwayat Langit ───────────────────────────────────────────────────────────

// TODO: review Fitri
export const CP_RIWAYAT_JUDUL = 'Langit 28 hari terakhir';
export const CP_RIWAYAT_KETERANGAN =
  'Hari yang kosong tetap hari yang dijalani. Riwayat ini bisa dilihat Ibu dan Ayah.';
export const CP_RIWAYAT_TOMBOL_TUTUP = 'Tutup riwayat';

// ─── Setelah Badai ───────────────────────────────────────────────────────────

// TODO: review Fitri
export const CP_BADAI_JUDUL = 'Setelah Badai';
export const CP_BADAI_SUBJUDUL_BAYI = 'Langkah untuk melewati momen paling berat';
export const CP_BADAI_SUBJUDUL_ANAK = 'Langkah saat kehilangan kendali';
export const CP_BADAI_SEKSI_PENCEGAHAN = 'Sebelum meledak';
export const CP_BADAI_SEKSI_PEMULIHAN = 'Setelah badai lewat';
export const CP_BADAI_SEKSI_PERLU_DIKETAHUI = 'Yang perlu diketahui';
export const CP_BADAI_TOMBOL_SELENGKAPNYA = 'Selengkapnya';
export const CP_BADAI_TOMBOL_TUTUP = 'Tutup';

export const CP_BADAI_JALUR_BANTUAN_JUDUL = 'Perlu bantuan lebih?';
export const CP_BADAI_JALUR_BANTUAN_ISI =
  'Hubungi bidan atau dokter di Puskesmas terdekat, atau ceritakan ke pendamping Rekah.';

// Label sumber — hanya tampil di mode admin
export const CP_SUMBER_PEDOMAN_LABEL = 'Pedoman';
export const CP_SUMBER_PRAKTIK_LABEL = 'Praktik';

// ─── Sedia ───────────────────────────────────────────────────────────────────

// TODO: review Fitri
export const CP_SEDIA_JUDUL = 'Sedia';
export const CP_SEDIA_SUBJUDUL = 'Pengingat kesehatan dan rumah untuk usia ini';
export const CP_SEDIA_KELOMPOK_KESEHATAN = 'Dari pedoman kesehatan';
export const CP_SEDIA_KELOMPOK_RUMAH = 'Pengingat rumah tangga — bukan dari pedoman kesehatan';
export const CP_SEDIA_CATATAN_STATUS =
  'Kotak ini mencatat keadaan urusan, bukan siapa yang mengerjakannya.';
// TODO: WhatsApp pengiriman manual — jangan bangun sekarang
// export const CP_SEDIA_TOMBOL_WA = 'Kirim ke Ayah via WhatsApp';

// ─── KartuModul (kartu baris generik) ────────────────────────────────────────

export const CP_MODUL_LEMBAR_NIFAS_JUDUL = 'Lembar Nifas';
export const CP_MODUL_LEMBAR_NIFAS_SUBJUDUL = (hariKe: number) =>
  `Hari ke ${hariKe} masa nifas`;

export const CP_MODUL_PIRING_IBU_JUDUL = 'Piring Ibu';
export const CP_MODUL_PIRING_IBU_SUBJUDUL = 'Catat gizi, air, dan suplemen hari ini';

export const CP_MODUL_MENYAMBUT_JUDUL = 'Menyambut Si Kecil';
export const CP_MODUL_MENYAMBUT_SUBJUDUL = 'Checklist kesiapan dan barang';

// TODO: review Fitri — isi kartu Ruang Ayah
export const CP_MODUL_AYAH_JUDUL = 'Ruang Ayah';
export const CP_MODUL_AYAH_KONTEN: Record<number, { isi: string; sumber?: string }> = {
  0: {
    isi: 'Berbagi peran merawat si kecil, memijat lembut punggung Ibu, dan mengajak Ibu bicara tentang perasaannya. Buku KIA menempatkan dukungan suami sebagai penanganan utama, bukan pelengkap.',
    sumber: 'KIA hal. 26 dan 32',
  },
  1: {
    isi: 'Anak usia 1–2 tahun masih butuh Ayah yang hadir, bukan yang sempurna. Bermain lantai 15 menit sehari lebih berdampak daripada aktivitas terencana.',
    sumber: undefined,
  },
  2: {
    isi: 'Di fase gejolak, ketenangan Ayah adalah model. Anak belajar mengatur emosinya dari cara orang dewasa di sekitarnya merespons.',
    sumber: undefined,
  },
  3: {
    isi: 'Anak 3–4 tahun senang ditanya tentang kesehariannya. Satu pertanyaan terbuka per hari lebih berarti dari sesi ngobrol panjang yang dipaksakan.',
    sumber: undefined,
  },
  4: {
    isi: 'Kalau anak bilang "di rumah si X boleh" — tidak perlu debat. Cukup: "Ini aturan di rumah kita." Konsistensi mengalahkan argumen.',
    sumber: undefined,
  },
  5: {
    isi: 'Anak sebentar lagi punya dunia sekolah sendiri. Penasaran Ayah pada cerita harinya — siapa temannya, apa yang lucu — adalah cara terbaik tetap terhubung.',
    sumber: undefined,
  },
};

// TODO: review Fitri — isi kartu Ini Wajar / Dicek?
export const CP_MODUL_INIWAJAR_JUDUL = 'Ini wajar atau perlu dicek?';
export const CP_MODUL_INIWAJAR_SUBJUDUL = 'Panduan membedakan kelelahan biasa dan tanda perlu bantuan';

// ─── Bacaan ───────────────────────────────────────────────────────────────────

export const CP_BACAAN_JUDUL_IBU = 'Bacaan untuk Ibu';
export const CP_BACAAN_JUDUL_AYAH = 'Bacaan untuk Ayah';
export const CP_BACAAN_JUDUL_UMUM = 'Bacaan';

// ─── Catatan kaki ─────────────────────────────────────────────────────────────

// TODO: review Fitri
export const CP_CATATAN_KAKI =
  'Rekah mendampingi Buku KIA, bukan menggantikannya. Tetap bawa buku fisik ke Posyandu dan Puskesmas.';
