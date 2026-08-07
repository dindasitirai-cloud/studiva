export type Keparahan = 'blokir' | 'peringatan';

export interface Temuan {
  kode: string;
  keparahan: Keparahan;
  pesan: string;
  lokasi?: string;
  saran?: string;
}

export interface LaporanValidasi {
  waktu: string;
  ringkas: {
    totalSikap: number;
    totalKegiatan: number;
    totalPanduan: number;
    panduanTersaringDeteksiDini: number;
    selFaseNilaiTerisi: number;
    selFaseNilaiKosong: number;
    selSubTahapNilaiTerisi: number;
    selSubTahapNilaiKosong: number;
    itemTanpaTemaNilai: number;
    jumlahBlokir: number;
    jumlahPeringatan: number;
  };
  temuan: Temuan[];
}

// ─── Kode temuan kanonik ─────────────────────────────────────────────────────

export const KODE = {
  ID_DUPLIKAT:                  'ID_DUPLIKAT',
  SUMBER_ID_MENGGANTUNG:        'SUMBER_ID_MENGGANTUNG',
  DOMAIN_TIDAK_DIKENAL:         'DOMAIN_TIDAK_DIKENAL',
  FASE_TIDAK_VALID:             'FASE_TIDAK_VALID',
  JUDUL_KOSONG:                 'JUDUL_KOSONG',
  NILAI_TIDAK_DIKENAL:          'NILAI_TIDAK_DIKENAL',
  SEL_FASE_NILAI_KOSONG:        'SEL_FASE_NILAI_KOSONG',
  LS_TANPA_NILAI:               'LS_TANPA_NILAI',
  LS_TANPA_JENIS:               'LS_TANPA_JENIS',
  DURASI_KOSONG:                'DURASI_KOSONG',
  SUBTAHAP_KOSONG:              'SUBTAHAP_KOSONG',
  KEGIATAN_KURANG_DARI_PLAFON:  'KEGIATAN_KURANG_DARI_PLAFON',
  PANDUAN_DETEKSI_DINI_DISARING:'PANDUAN_DETEKSI_DINI_DISARING',
  KATA_TERLARANG:               'KATA_TERLARANG',
  PEMILIK_DIKERASKAN:           'PEMILIK_DIKERASKAN',
  PERLU_TINJAUAN_MANUSIA:       'PERLU_TINJAUAN_MANUSIA',
  NILAI_DAN_TANPA_TEMA_BERSAMAAN:'NILAI_DAN_TANPA_TEMA_BERSAMAAN',
  NILAI_TANPA_KEGIATAN:         'NILAI_TANPA_KEGIATAN',
  SEL_SUBTAHAP_NILAI_KOSONG:    'SEL_SUBTAHAP_NILAI_KOSONG',
  DOMAIN_TANPA_KEGIATAN:        'DOMAIN_TANPA_KEGIATAN',
} as const;

// ─── Kata yang tidak boleh muncul di teks yang dilihat pengguna ──────────────

export const POLA_KATA_TERLARANG =
  /terlambat|belum mencapai|di bawah|tertinggal|kurang|gagal|seharusnya sudah/i;

// ─── Helper builder ───────────────────────────────────────────────────────────

export function blokir(
  kode: string,
  pesan: string,
  opts: { lokasi?: string; saran?: string } = {},
): Temuan {
  return { kode, keparahan: 'blokir', pesan, ...opts };
}

export function peringatan(
  kode: string,
  pesan: string,
  opts: { lokasi?: string; saran?: string } = {},
): Temuan {
  return { kode, keparahan: 'peringatan', pesan, ...opts };
}
