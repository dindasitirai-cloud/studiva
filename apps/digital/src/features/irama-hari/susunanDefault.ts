// =============================================================
// susunanDefault.ts — DEFAULT kegiatan umum sehari-hari caregiver + anak.
// Rekah mengisikan ini agar Susunan Hari tidak kosong. BUKAN urutan/isi wajib:
// pengguna bebas mengubah waktu, mengganti, menambah, menghapus.
// Warna kategori = garis kiri kartu (Kebiasaan Baik biru, Ajak Main pink,
// Wawasan Tumbuh ungu, Parent Time kuning). Ikon = ilustrasi flat (bukan emoji).
// STATUS: DRAFT copy — menunggu review Psikolog Fitri Effendy.
// =============================================================

export type KategoriKegiatan = 'rutin' | 'kebiasaan' | 'main' | 'wawasan' | 'parentTime';

export type IkonKey =
  | 'bangun' | 'makan' | 'mandi' | 'main' | 'buku' | 'sup' | 'tidurSiang'
  | 'kopi' | 'luar' | 'beres' | 'gigi' | 'cerita' | 'tidur';

export interface KegiatanDefault {
  id: string;
  waktu: string;             // jam perkiraan (bisa diubah pengguna)
  judul: string;
  ikon: IkonKey;             // ilustrasi flat (dipetakan di IramaPeluncur)
  kategori: KategoriKegiatan;
  meta?: string;             // baris kecil di bawah judul
}

export interface BlokSusunan {
  key: string;
  judul: string;
  kegiatan: KegiatanDefault[];
}

// Garis kiri + label kategori. Warna sesuai permintaan Raisha.
export const WARNA_KATEGORI: Record<KategoriKegiatan, { bar: string; label: string; tint: string; ink: string }> = {
  rutin:      { bar: '#D7C7D2', label: 'Rutin',          tint: '#F1ECF0', ink: '#8A7385' },
  kebiasaan:  { bar: '#8FB8F7', label: 'Kebiasaan Baik', tint: '#EAF2FF', ink: '#3E6E9C' }, // biru
  main:       { bar: '#F8B9D4', label: 'Ajak Main',      tint: '#FCE4EE', ink: '#C0567F' }, // pink
  wawasan:    { bar: '#C9B8F0', label: 'Wawasan Tumbuh', tint: '#EFE9FB', ink: '#7A5CA6' }, // ungu
  parentTime: { bar: '#FFE29A', label: 'Parent Time',    tint: '#FBF1D8', ink: '#A6842B' }, // kuning
};

export const SUSUNAN_DEFAULT: BlokSusunan[] = [
  {
    key: 'pagiSiang',
    judul: 'Pagi – Siang',
    kegiatan: [
      { id: 'def-bangun',    waktu: '06:30', judul: 'Bangun & sapa hangat',        ikon: 'bangun', kategori: 'rutin',      meta: 'Sambut dengan wajah dekat & suara lembut' },
      { id: 'def-sarapan',   waktu: '07:30', judul: 'Sarapan bersama',             ikon: 'makan',  kategori: 'rutin' },
      { id: 'def-mandipagi', waktu: '08:30', judul: 'Mandi pagi',                  ikon: 'mandi',  kategori: 'rutin' },
      { id: 'def-mainpagi',  waktu: '09:30', judul: 'Main bersama sebentar',       ikon: 'main',   kategori: 'main',       meta: 'Ikuti apa yang menarik buat anak' },
      { id: 'def-buku',      waktu: '11:00', judul: 'Lihat buku / cerita singkat', ikon: 'buku',   kategori: 'wawasan' },
    ],
  },
  {
    key: 'siangSore',
    judul: 'Siang – Sore',
    kegiatan: [
      { id: 'def-makansiang', waktu: '12:00', judul: 'Makan siang',               ikon: 'sup',       kategori: 'rutin' },
      { id: 'def-tidursiang', waktu: '13:00', judul: 'Tidur siang',               ikon: 'tidurSiang',kategori: 'rutin' },
      { id: 'def-parentjeda', waktu: '13:30', judul: 'Jeda sejenak untuk diri',   ikon: 'kopi',      kategori: 'parentTime', meta: 'Istirahat sebentar — bukan kewajiban' },
      { id: 'def-mainluar',   waktu: '15:30', judul: 'Main di luar / jalan-jalan',ikon: 'luar',      kategori: 'main' },
      { id: 'def-mandisore',  waktu: '16:30', judul: 'Mandi sore',                ikon: 'mandi',     kategori: 'rutin' },
    ],
  },
  {
    key: 'malam',
    judul: 'Malam',
    kegiatan: [
      { id: 'def-makanmalam', waktu: '18:00', judul: 'Makan malam bersama',        ikon: 'sup',    kategori: 'rutin' },
      { id: 'def-beres',      waktu: '18:45', judul: 'Beres-beres mainan bareng',  ikon: 'beres',  kategori: 'kebiasaan', meta: 'Rapikan bersama sambil bermain' },
      { id: 'def-sikatgigi',  waktu: '19:15', judul: 'Sikat gigi',                 ikon: 'gigi',   kategori: 'kebiasaan' },
      { id: 'def-cerita',     waktu: '19:30', judul: 'Cerita / doa sebelum tidur', ikon: 'cerita', kategori: 'kebiasaan', meta: 'Momen tenang berdua' },
      { id: 'def-tidur',      waktu: '20:00', judul: 'Tidur',                      ikon: 'tidur',  kategori: 'rutin' },
    ],
  },
];
