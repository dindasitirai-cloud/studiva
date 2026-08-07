// =============================================================
// KONTEN FITUR IRAMA HARI
// STATUS: DRAFT — seluruh teks UI MENUNGGU REVIEW PSIKOLOG FITRI
// sebelum rilis produksi. Jangan ubah copy tanpa melalui review.
// =============================================================

// MENUNGGU REVIEW PSIKOLOG FITRI
export const JUDUL_HALAMAN = 'Irama Hari';

// MENUNGGU REVIEW PSIKOLOG FITRI
export const DRAF_BANNER = 'DRAF · menunggu review Psikolog Fitri Effendy sebelum rilis';

// ─── Layar edge-case ─────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const LAYAR_BELUM_LAHIR = {
  judul: 'Masih menghitung hari',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  badan: 'Irama Hari baru bisa dimulai setelah {anak} hadir. Sambil menunggu, Ayah Bunda bisa menjelajahi panduan di Bekal.',
};

// MENUNGGU REVIEW PSIKOLOG FITRI
export const LAYAR_DATA_BELUM_DIISI = {
  judul: 'Tambahkan data anak dulu',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  badan: 'Tanggal lahir {anak} belum tercatat. Lengkapi profil untuk membuka Irama Hari.',
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

// ─── PilihanHariIni ───────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const PILIHAN_HARI_INI = {
  judul: 'Kegiatan Ajak Main Hari Ini', // TODO: review Fitri
  // MENUNGGU REVIEW PSIKOLOG FITRI
  gantiAriaLabel: 'Ganti kegiatan ini',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  tambahLabel: '+ Tambah kegiatan lain',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  lihatSemuaTemplate: (n: number) => `Lihat semua ${n} kegiatan`,
  // MENUNGGU REVIEW PSIKOLOG FITRI
  kolamKosong: 'Belum ada kegiatan untuk hari ini.',
};

// ─── SusunanHari ─────────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const SUSUNAN_HARI = {
  judul: 'Susunan hari',
  blokLabel: {
    pagi:       'Pagi',
    siang:      'Siang',
    sore:       'Sore',
    jelangTidur:'Jelang tidur',
  } as const,
  // MENUNGGU REVIEW PSIKOLOG FITRI
  blokKosongPertama: 'Belum ada, dan itu tidak apa-apa',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  blokKosongLainnya: 'Belum ada',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  selesaiAriaLabel: 'Tandai selesai',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  sudahSelesaiAriaLabel: 'Sudah selesai',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  pindahBlokLabel: 'Pindah ke',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  tutupPickerLabel: 'Tutup',
};

// ─── KartuBelumDitaruh ───────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const KARTU_BELUM_DITARUH = {
  judul: 'Belum dijadwalkan',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  pilihBlokLabel: 'Pilih waktu',
};

// ─── CatatanHari ─────────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const CATATAN_HARI = {
  judul: 'Catatan hari ini',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  placeholder: 'Tulis apa pun yang ingin Ayah Bunda ingat tentang hari ini…',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  simpanLabel: 'Simpan ke Jurnal',
};

// ─── JalurOrangTua ───────────────────────────────────────────────────────────

// MENUNGGU REVIEW PSIKOLOG FITRI
export const JALUR_ORANGTUA = {
  judul: 'Untuk Bunda',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  subjudul: 'Bacaan hari ini',
  // MENUNGGU REVIEW PSIKOLOG FITRI
  kosong: 'Panduan untuk hari ini akan segera tersedia.',
};
