// ============================================================================
// Copy wizard profil anak.
//
// TINJAUAN KLINIS: seluruh teks di berkas ini menunggu tinjauan
// Psikolog Fitri Effendy sebelum rilis produksi.
//
// Aturan bahasa Rekah yang berlaku di sini:
//   - "cukup dan bermakna", bukan "maksimal"
//   - tanpa bahasa diagnostik
//   - tanpa perbandingan antar anak
//   - tanpa tanda pisah panjang di teks yang tampil
// ============================================================================

import type { PeranPendamping } from '../../types/anak';

export const COPY = {
  nav: {
    kembali: 'Kembali',
    lanjut: 'Lanjut',
    lewati: 'Lewati dulu',
  },

  sambutan: {
    judul: 'Rekah',
    tagline: 'Mekar pada waktunya.',
    body: 'Sebelum mulai, kenalkan dulu si kecil. Cukup beberapa isian, dan Rekah akan menemani dari sana.',
    cta: 'Kenalkan si kecil',
  },

  anak: {
    judul: 'Siapa yang akan kita temani?',
    sub: 'Nama dan tanggal lahir menentukan isi dashboard yang Rekah siapkan.',

    labelNama: 'Nama panggilan',
    placeholderNama: 'mis. Rakha',
    galatNama: 'Nama panggilan minimal 2 huruf.',

    labelTanggal: 'Tanggal lahir',
    galatTanggal: 'Masukkan tanggal lahir yang valid.',
    galatMasaDepan: 'Tanggal lahir belum bisa di masa depan.',
    catatanKunci: 'Tanggal lahir dikunci setelah tersimpan. Kalau ada salah ketik, koreksi bisa diajukan dari halaman Profil Anak.',

    labelKelamin: 'Jenis kelamin',
    catatanKelamin: 'Hanya untuk memilih ilustrasi dan kata sapaan. Isi kegiatan dan panduan sama untuk semua anak.',

    labelFoto: 'Foto (opsional)',
    catatanFoto: 'Ukuran maksimal 5 MB. Tersimpan privat di akunmu, hanya kamu yang bisa melihatnya.',
    ctaPilihFoto: 'Pilih foto',
    ctaGantiFoto: 'Ganti foto',
    ctaHapusFoto: 'Hapus foto',
    galatFotoBukanGambar: 'Berkas harus berupa gambar.',
    galatFotoTerlaluBesar: 'Ukuran foto maksimal 5 MB. Coba pilih foto yang lebih kecil.',

    // ── Konfirmasi usia ──────────────────────────────────────────────────────
    // Dashboard Rekah disusun per rentang satu tahun: 0 sampai 1 tahun,
    // 1 sampai 2 tahun, dan seterusnya sampai 6 tahun. Anak 3 bulan masuk
    // rentang 0 sampai 1 tahun; anak 1 tahun 8 bulan masuk rentang 1 sampai
    // 2 tahun. Teks di bawah menyebut rentangnya secara eksplisit supaya
    // orang tua tahu persis apa yang akan mereka lihat.

    /** Rentangnya sudah siap dan berisi konten. */
    rentangSiap: (nama: string, usia: string, rentang: string) =>
      `${nama} kini ${usia}, jadi Rekah menyiapkan dashboard untuk usia ${rentang}. Semua kegiatan dan panduan di dalamnya dipilih untuk rentang usia itu.`,

    /**
     * Rentangnya belum dibangun. Jangan menjanjikan isi yang belum ada —
     * orang tua akan tahu begitu masuk.
     */
    rentangSegera: (nama: string, usia: string, rentang: string) =>
      `${nama} kini ${usia}, jadi dashboard yang cocok adalah untuk usia ${rentang}. Isinya masih kami siapkan bersama psikolog. Sementara itu kamu tetap bisa menanam nilai di Taman Akar dan menyusun Irama Hari.`,

    /** Di atas 6 tahun, di luar jangkauan Rekah saat ini. */
    diLuarRentang: (nama: string) =>
      `Untuk sekarang Rekah menemani anak usia 0 sampai 6 tahun, dan ${nama} sudah melewatinya. Kamu tetap bisa membuat profilnya, dan kami akan mengabari begitu rentang usia ini tersedia.`,
  },

  pendamping: {
    judul: 'Dan siapa yang mendampingi?',
    sub: 'Rekah menyapa dengan nama ini di beranda dan catatan harian. Boleh lebih dari satu orang.',

    labelNama: 'Panggilan',
    placeholderNama: 'mis. Bunda',
    labelPeran: 'Peran',

    ctaTambah: 'Tambah pendamping',
    ctaHapus: (panggilan: string) =>
      `Hapus ${panggilan || 'pendamping ini'}`,
    batasTercapai: 'Maksimal enam pendamping per anak.',

    catatan: 'Bisa ditambah atau diubah kapan saja dari halaman Profil Anak.',
    cta: 'Selesai',
  },

  perayaan: {
    judul: 'Selamat datang',
    sub: (nama: string) =>
      `Profil ${nama} sudah tersimpan. Mulai dari satu langkah kecil hari ini.`,
    cta: 'Masuk ke Beranda',
  },

  simpan: {
    sedang: 'Menyimpan...',
    gagal: 'Profil belum tersimpan. Periksa koneksi lalu coba lagi.',
  },
} as const;

export const PERAN_COPY: Record<PeranPendamping, string> = {
  'ibu': 'Ibu',
  'ayah': 'Ayah',
  'nenek-kakek': 'Nenek atau Kakek',
  'pengasuh': 'Pengasuh',
  'lainnya': 'Lainnya',
};
