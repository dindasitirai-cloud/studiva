// KONTEN: wajib review Psikolog Fitri sebelum rilis.
// TODO: dokumen kebijakan privasi lengkap — konten dari Raisha (item 6.2 checklist go-live)

export const PRIVACY_COPY = {
  judulSeksi: 'Data & Privasi',

  apaYangDisimpan: `Kami menyimpan profil anak dan caregiver yang kamu isi, langkah-langkah
yang selesai dikerjakan, catatan refleksi singkat setelah setiap langkah,
dan entri jurnal yang kamu tulis sendiri.`,

  untukApa: `Data ini hanya digunakan untuk menampilkan rencana dan jejak perkembanganmu.
Catatan dan jurnal tidak dianalisis, tidak dibagi ke pihak lain,
dan tidak digunakan untuk iklan.`,

  hak: 'Kamu bisa menghapus semua data Rekah-mu kapan saja.',

  tombolHapus: 'Hapus semua data Rekah-ku',
  konfirmasiJudul: 'Yakin menghapus semua data?',
  konfirmasiBody: (namaAnak: string) =>
    `Langkah, refleksi, dan jurnal ${namaAnak} akan dihapus permanen. Ketik nama ${namaAnak} untuk konfirmasi.`,
  konfirmasiPlaceholder: (namaAnak: string) => `Ketik "${namaAnak}"`,
  konfirmasiTombol: 'Ya, hapus semua',
  batalTombol: 'Batal',

  pesanBerhasil: 'Semua data Rekah sudah dihapus. Sampai jumpa lagi 🌱',
  pesanGagal: 'Gagal menghapus data. Coba lagi ya.',
};
