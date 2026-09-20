// Data dummy untuk fase UI. Seluruh blok ini dihapus saat backend live.
// Setiap konstanta ditandai dengan TODO yang menunjukkan sumber data aslinya.

import type { SaranItem, Kebiasaan, WajarItem, Bacaan } from '../components/beranda/types';
import type { PeranSingkat } from './beranda-copy';

// TODO: ambil peran dari profil pendamping aktif
export const MOCK_PERAN: PeranSingkat = 'ibu';

// TODO: ambil nama anak dari AnakContext (anak.namaAnak)
export const MOCK_NAMA_ANAK = 'Layla';

// TODO: ambil usia teks dari hitungBand / ringkasRentang
export const MOCK_USIA_TEKS = '2 tahun 3 bulan';

// TODO: ambil inisial dari inisialAnak(anak.namaAnak)
export const MOCK_INISIAL = 'LL';

// TODO: ambil usia bulan dari useAnakAktif().usiaBulan
export const MOCK_USIA_BULAN = 27;

// TODO: cek apakah akun punya pasangan tertaut (tabel partner_orang_tua)
export const MOCK_ADA_PASANGAN = true;

// TODO: baca mood pasangan dari tabel mood harian
export const MOCK_LANGIT_PASANGAN = null;

// TODO: ambil data Sedia dari tabel konten_sedia sesuai usia anak
// Set ke null untuk menyembunyikan SediaCard
export const MOCK_SEDIA: { hariLagi: number; judul: string; deskripsi: string } | null = {
  hariLagi: 9,
  judul: 'Menghadapi masa transisi anak',
  deskripsi:
    'Dalam beberapa hari ke depan, ada yang bisa disiapkan bersama — bukan untuk mengantisipasi masalah, tapi untuk menyambut tahap baru dengan tenang.',
};

// TODO: hitung jumlah catatan dari tabel jurnal_perkembangan
// Set ke 0 untuk menyembunyikan PanenCard
export const MOCK_JUMLAH_CATATAN_PANEN = 12;

// TODO: ambil daftar nilai yang dipilih orang tua dari profil keluarga
// (useAkarStateSync(idAnak) dari features/akar-keluarga/state.ts)
export const MOCK_NILAI_DIPILIH: string[] = ['Kemandirian', 'Empati', 'Syukur'];

// TODO: ambil kebiasaan di bawah nilai terpilih dari konten Bekal
export const MOCK_KEBIASAAN: Kebiasaan[] = [
  { id: 'k1', judul: 'Aku bisa sendiri', waktu: 'Pagi', domain: 'Sosial-Emosi', tercatat: false },
  { id: 'k2', judul: 'Menamai emosi', waktu: 'Sepanjang hari', domain: 'Bahasa', tercatat: true },
  { id: 'k3', judul: 'Jujur tanpa takut', waktu: 'Kapan saja', domain: 'Sosial-Emosi', tercatat: false },
  { id: 'k4', judul: 'Tugas rumah mini', waktu: 'Sore', domain: 'Motorik Halus', tercatat: true },
];

// TODO: kolam saran diambil dari konten minggu berjalan sesuai age band anak;
// TODO: kecualikan item yang sudah dijadwalkan atau ditolak dalam 14 hari terakhir;
// TODO: pilihan dikunci per hari di server — tidak berubah saat refresh
export const MOCK_SARAN: SaranItem[] = [
  {
    id: 's1',
    jenis: 'ajak_main',
    judul: 'Memasak bersama: Aduk dan Tuang',
    ringkasan:
      'Libatkan si kecil dalam kegiatan memasak sederhana — mengaduk, menuang, atau menyentuh berbagai tekstur. Tidak perlu hasil masakan yang sempurna.',
    domain: 'Motorik Halus',
    nilai: 'Kemandirian',
    durasi: '15–20 menit',
    manfaat:
      'Yang sedang dilatih: koordinasi tangan-mata dan rasa percaya diri untuk mencoba hal baru.',
  },
  {
    id: 's2',
    jenis: 'ajak_main',
    judul: 'Bermain Peran: Toko-tokoan',
    ringkasan:
      'Atur mainan atau barang rumah sebagai "toko." Si kecil bisa jadi penjual atau pembeli — keduanya belajar hal yang berbeda.',
    domain: 'Bahasa',
    nilai: 'Empati',
    durasi: '20–30 menit',
    manfaat:
      'Yang sedang dilatih: kemampuan bergiliran, kosa kata, dan memahami peran orang lain.',
  },
  {
    id: 'w1',
    jenis: 'wawasan_tumbuh',
    judul: 'Kenapa si kecil sering bilang "tidak"?',
    ringkasan:
      'Di usia dua tahun, "tidak" bukan pembangkangan — ini adalah latihan otonomi pertama. Cara Ayah dan Bunda merespons membentuk cara si kecil belajar batasan.',
    domain: 'Sosial-Emosi',
    nilai: 'Kemandirian',
    durasi: '5 menit baca',
    manfaat:
      'Yang sedang dilatih: memahami diri sendiri sebagai individu yang terpisah dari orang tua.',
  },
  {
    id: 'w2',
    jenis: 'wawasan_tumbuh',
    judul: 'Bermain sendiri: bukan tanda masalah',
    ringkasan:
      'Anak yang bisa bermain sendiri sejenak sedang berlatih konsentrasi dan imajinasi. Ini bukan tanda anak introvert atau tertutup.',
    domain: 'Sosial-Emosi',
    nilai: 'Kemandirian',
    durasi: '4 menit baca',
    manfaat: 'Yang sedang dilatih: regulasi diri dan kemampuan menghibur diri sendiri.',
  },
];

// TODO: item dipilih sesuai age band anak dari konten Ruang Teduh
export const MOCK_WAJAR: WajarItem = {
  id: 'wajar1',
  pertanyaan: 'Anak saya belum banyak bicara di usia dua tahun.',
  wajar:
    'Rentang bicara di usia ini sangat lebar. Sebagian anak sudah merangkai dua kata, sebagian baru beberapa kata tunggal, sebagian lagi lebih banyak menunjuk dan menarik tangan. Menunjuk dan isyarat adalah bentuk berkomunikasi yang setara dengan berbicara.',
  kapanBicara:
    'Kalau Bunda ingin memahami lebih jauh cara si kecil berkomunikasi, ini waktu yang baik untuk mengobrol dengan psikolog atau tenaga kesehatan. Bukan karena ada yang keliru, tapi karena bicara lebih awal membuat Bunda punya lebih banyak pilihan.',
};

// TODO: pemilihan bacaan berdasarkan peran, usia anak, dan mood terakhir
export const MOCK_BACAAN_UTAMA: Bacaan = {
  id: 'b1',
  judul: 'Mengapa Bermain Bebas Lebih Berharga dari Flash Card',
  kutipan: '"Bermain adalah pekerjaan anak. Di sanalah otak mereka paling aktif belajar."',
  estimasiBaca: '4 menit baca',
};

export const MOCK_BACAAN_LAINNYA: Bacaan[] = [
  {
    id: 'b2',
    judul: 'Ketika Anak Menolak Makan: Bukan Tentang Makanan',
    estimasiBaca: '3 menit baca',
  },
  {
    id: 'b3',
    judul: 'Cara Berbicara Tentang Emosi dengan Anak 2–3 Tahun',
    estimasiBaca: '5 menit baca',
  },
];

// TODO: nomor WhatsApp dari konfigurasi, bukan hardcode
export const MOCK_KONSULTASI = {
  nomorWhatsapp: '6281234567890',
  pesanAwal: 'Halo Fitri, saya ingin berkonsultasi tentang tumbuh kembang si kecil.',
};

/**
 * Memilih satu nilai dari daftar berdasarkan nomor minggu (batas: Senin, Asia/Jakarta UTC+7).
 * Deterministik: Ibu dan Ayah selalu melihat nilai yang sama di minggu yang sama.
 *
 * TODO: pindahkan ke server agar konsisten lintas perangkat dan menangani
 * perubahan daftar nilai di tengah minggu tanpa mengubah tampilan sampai Senin berikutnya.
 */
export function pilihNilaiMingguIni(daftarNilai: string[], tanggal: Date): string {
  if (daftarNilai.length === 0) return '';
  // Geser ke zona waktu Asia/Jakarta (UTC+7) sebelum menentukan hari/minggu
  const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
  const jakartaDate = new Date(tanggal.getTime() + JAKARTA_OFFSET_MS);
  const d = new Date(
    Date.UTC(jakartaDate.getUTCFullYear(), jakartaDate.getUTCMonth(), jakartaDate.getUTCDate()),
  );
  const hariDalamMinggu = d.getUTCDay(); // 0=Min, 1=Sen, ..., 6=Sab
  const selisihSenin = (hariDalamMinggu + 6) % 7; // Sen=0 ... Min=6
  const seninMs = d.getTime() - selisihSenin * 86_400_000;
  const mingguSejak1970 = Math.floor(seninMs / (7 * 24 * 3600 * 1000));
  const idx = ((mingguSejak1970 % daftarNilai.length) + daftarNilai.length) % daftarNilai.length;
  return daftarNilai[idx];
}

/** Memilih satu item acak dari setiap jenis saran. Dipanggil satu kali saat mount. */
export function ambilSaranAcak(pool: SaranItem[]): SaranItem[] {
  const ajakMain = pool.filter(s => s.jenis === 'ajak_main');
  const wawasan = pool.filter(s => s.jenis === 'wawasan_tumbuh');
  const acak = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const result: SaranItem[] = [];
  if (ajakMain.length > 0) result.push(acak(ajakMain));
  if (wawasan.length > 0) result.push(acak(wawasan));
  return result;
}
