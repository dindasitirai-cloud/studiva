// kontenMetadata.ts — Phase 25
// Infrastruktur metadata konten untuk 6 domain (alergi, bahasa/dwibahasa, toilet
// training, waktu layar, saudara, PAUD/STPPA). Bersandar pada guideline resmi &
// literatur (BPOM 31/2018, FAO/WHO Codex 2022, IDAI, WHO 2019, AAP, Permendikbud
// 137/2014 & BSKAP 032/2024). Lihat doc: Rekah_Phase25_KontenMetadata_RisetLiteratur.
//
// CATATAN: ini LAPISAN DATA + FUNGSI. Katalog konten belum ditandai — penandaan
// alergen & semua teks medis berstatus DRAFT menunggu review Fitri. Semua field
// metadata pada konten bersifat opsional sehingga konten lama tidak terpengaruh.

import type { DomainKey } from '../../data/learningStrategies';

// Status tinjauan selaras ContentStatus (learningStrategies): draft → review → approved → published
export type StatusTinjauan = 'draft' | 'review' | 'approved' | 'published';

// ─── 1. ALERGEN ───────────────────────────────────────────────────────────────
export type AllergenKey =
  | 'milk' | 'egg' | 'peanut' | 'tree_nuts' | 'soy'
  | 'wheat_gluten' | 'fish' | 'crustacean' | 'sesame'
  | 'mollusc' | 'sulfite' | 'buckwheat' | 'mustard' | 'celery' | 'lupin';

export interface AlergenMeta { key: AllergenKey; label: string; big: boolean }

export const ALERGEN: readonly AlergenMeta[] = [
  { key: 'milk', label: 'Susu (susu sapi)', big: true },
  { key: 'egg', label: 'Telur', big: true },
  { key: 'peanut', label: 'Kacang tanah', big: true },
  { key: 'tree_nuts', label: 'Kacang pohon', big: true },
  { key: 'soy', label: 'Kedelai', big: true },
  { key: 'wheat_gluten', label: 'Gandum / serealia bergluten', big: true },
  { key: 'fish', label: 'Ikan', big: true },
  { key: 'crustacean', label: 'Krustasea (udang, kepiting, lobster)', big: true },
  { key: 'sesame', label: 'Wijen', big: true },
  { key: 'mollusc', label: 'Moluska (kerang, cumi, siput)', big: false },
  { key: 'sulfite', label: 'Sulfit', big: false },
  { key: 'buckwheat', label: 'Soba / buckwheat', big: false },
  { key: 'mustard', label: 'Mustard / biji sawi', big: false },
  { key: 'celery', label: 'Seledri', big: false },
  { key: 'lupin', label: 'Lupin', big: false },
];

export interface AllergenInfo {
  mengandung: AllergenKey[];   // bahan inti/pasti ada
  jejak?: AllergenKey[];       // may-contain / traces / opsional
}

/** Pemetaan jawaban Peta `a_alergi` (label) → alergen kanonik. "Kacang" diperlakukan
 *  luas (tanah + pohon); "Seafood" mencakup ikan, krustasea, moluska. */
const PETA_ALERGI_KE_KEY: Record<string, AllergenKey[]> = {
  'Susu sapi': ['milk'],
  'Telur': ['egg'],
  'Kacang': ['peanut', 'tree_nuts'],
  'Seafood': ['fish', 'crustacean', 'mollusc'],
};

/** Daftar alergen yang dihindari anak, dari jawaban Peta. "Lainnya"/"Tidak ada" diabaikan. */
export function alergenHindariDariPeta(jawaban: Record<string, string[]>): Set<AllergenKey> {
  const out = new Set<AllergenKey>();
  for (const l of jawaban['a_alergi'] ?? []) for (const k of PETA_ALERGI_KE_KEY[l] ?? []) out.add(k);
  return out;
}

/** True bila konten mengandung alergen yang dihindari (contains atau traces). */
export function kontenKenaAlergi(meta: AllergenInfo | undefined, hindari: ReadonlySet<AllergenKey>): boolean {
  if (!meta || hindari.size === 0) return false;
  if (meta.mengandung.some(a => hindari.has(a))) return true;
  return (meta.jejak ?? []).some(a => hindari.has(a));
}

// ─── 2. BAHASA / DWIBAHASA ────────────────────────────────────────────────────
export type BahasaKey = 'id' | 'min' | 'jv' | 'su' | 'bbc' | 'bug' | 'ban' | 'daerah' | 'nonverbal';
export type ModeDwibahasa = 'none' | 'varian_kembar' | 'terjemahan' | 'campuran';
export type DomainBahasa = 'reseptif' | 'ekspresif' | 'praliterasi' | 'pragmatik';
export type TeknikStimulasi =
  | 'serve_return' | 'dialogic_reading' | 'baca_bersama' | 'penamaan' | 'ekspansi'
  | 'self_talk' | 'parallel_talk' | 'lagu_rima' | 'bermain_pura' | 'narasi_rutinitas' | 'gestur_isyarat';

export const TEKNIK_STIMULASI: Record<TeknikStimulasi, string> = {
  serve_return: 'Beri-dan-terima (serve & return)',
  dialogic_reading: 'Membaca dialogis (PEER/CROWD)',
  baca_bersama: 'Membaca bersama',
  penamaan: 'Memberi nama benda',
  ekspansi: 'Memperluas/membetulkan ucapan',
  self_talk: 'Menarasikan tindakan sendiri',
  parallel_talk: 'Menarasikan tindakan anak',
  lagu_rima: 'Lagu & rima',
  bermain_pura: 'Bermain pura-pura',
  narasi_rutinitas: 'Menarasikan rutinitas harian',
  gestur_isyarat: 'Gestur/isyarat bayi',
};

export interface KonteksBahasaRumah { dwibahasa: boolean; bahasa: string[] }

/** Dari jawaban Peta `c_bahasa`: apakah rumah dwibahasa + daftar bahasa. */
export function bahasaRumahDariPeta(jawaban: Record<string, string[]>): KonteksBahasaRumah {
  const j = jawaban['c_bahasa'] ?? [];
  const dwibahasa = j.includes('Dwibahasa') || (j.includes('Indonesia') && j.includes('Bahasa daerah'));
  return { dwibahasa, bahasa: j };
}

// ─── 3. TOILET TRAINING ───────────────────────────────────────────────────────
export type TahapKesiapan = 'prasyarat' | 'pengenalan' | 'latihan_aktif' | 'kemandirian';
export type JenisKesiapan = 'fisik' | 'kognitif' | 'sosial_emosional';

export const TAHAP_KESIAPAN: Record<TahapKesiapan, string> = {
  prasyarat: 'Prasyarat (belum waktunya)',
  pengenalan: 'Pengenalan',
  latihan_aktif: 'Latihan aktif',
  kemandirian: 'Kemandirian',
};

/** Usia minimum sebelum mendorong latihan toilet (AAP/AAFP/IDAI): ~18 bulan. */
export const USIA_MIN_TOILET_BULAN = 18;

/** Tahap kesiapan toilet dari jawaban Peta `a_toilet` + gate usia. usiaBulan null = abaikan gate. */
export function tahapToiletDariPeta(jawaban: Record<string, string[]>, usiaBulan: number | null): TahapKesiapan | null {
  const j = (jawaban['a_toilet'] ?? [])[0];
  if (!j) return null;
  if (usiaBulan != null && usiaBulan < USIA_MIN_TOILET_BULAN) return 'prasyarat';
  switch (j) {
    case 'Belum mulai': return 'pengenalan';
    case 'Sedang belajar': return 'latihan_aktif';
    case 'Lepas popok siang': return 'latihan_aktif';
    case 'Sudah bisa': return 'kemandirian';
    default: return null;
  }
}

// ─── 4. WAKTU LAYAR ───────────────────────────────────────────────────────────
export type BandLayar = '0_23_bln' | '24_59_bln' | '60_72_bln';
export type KesesuaianLayar = 'hindari' | 'terbatas' | 'boleh';
export type JenisLayar = 'video_call' | 'tontonan' | 'permainan' | 'edukasi_interaktif' | 'none';

export interface KebijakanLayar {
  band: BandLayar;
  kesesuaian: KesesuaianLayar;
  maksMenitPerHari: number;
  coViewing: boolean;
  pengecualianVideoCall: boolean;
  pesan: string;
}

/** Kebijakan layar per usia (sintesis paling konservatif WHO 2019 + AAP 2016 + IDAI). */
export function kebijakanLayar(usiaBulan: number | null): KebijakanLayar {
  if (usiaBulan == null || usiaBulan < 24) {
    return {
      band: '0_23_bln', kesesuaian: 'hindari', maksMenitPerHari: 0, coViewing: true, pengecualianVideoCall: true,
      pesan: 'WHO & IDAI: hindari layar di usia ini. Panggilan video keluarga tetap boleh.',
    };
  }
  if (usiaBulan < 60) {
    return {
      band: '24_59_bln', kesesuaian: 'terbatas', maksMenitPerHari: 60, coViewing: true, pengecualianVideoCall: true,
      pesan: 'Maksimal 60 menit/hari konten berkualitas, ditemani (co-viewing). Lebih sedikit lebih baik.',
    };
  }
  return {
    band: '60_72_bln', kesesuaian: 'terbatas', maksMenitPerHari: 60, coViewing: true, pengecualianVideoCall: true,
    pesan: 'Batasi waktu layar, pilih konten berkualitas, dan tetap temani.',
  };
}

// ─── 5. SAUDARA ───────────────────────────────────────────────────────────────
// Konteks selaras opsi Peta `a_saudara`.
export type KonteksSaudara = 'anak-tunggal' | 'punya-kakak' | 'punya-adik' | 'kembar' | 'menanti-adik';
export type TagSaudara =
  | 'persiapan-pra-lahir' | 'kejujuran-perubahan' | 'regresi' | 'kecemburuan'
  | 'pelibatan-kakak' | 'waktu-berdua' | 'selesaikan-transisi' | 'berbagi-perhatian' | 'peran-kakak-hebat';

export const KONTEKS_SAUDARA: Record<KonteksSaudara, string> = {
  'anak-tunggal': 'Anak tunggal',
  'punya-kakak': 'Punya kakak',
  'punya-adik': 'Punya adik',
  'kembar': 'Kembar',
  'menanti-adik': 'Akan punya adik',
};

const PETA_SAUDARA_KE_KEY: Record<string, KonteksSaudara> = {
  'Anak tunggal': 'anak-tunggal',
  'Punya kakak': 'punya-kakak',
  'Punya adik': 'punya-adik',
  'Kembar': 'kembar',
  'Akan punya adik': 'menanti-adik',
};

export function konteksSaudaraDariPeta(jawaban: Record<string, string[]>): KonteksSaudara | null {
  const j = (jawaban['a_saudara'] ?? [])[0];
  return j ? (PETA_SAUDARA_KE_KEY[j] ?? null) : null;
}

/** Konten adaptasi adik relevan bila anak akan/baru punya adik. */
export function butuhKontenAdik(konteks: KonteksSaudara | null): boolean {
  return konteks === 'menanti-adik' || konteks === 'punya-adik' || konteks === 'kembar';
}

// ─── 6. PAUD / STPPA ──────────────────────────────────────────────────────────
export type AspekSTPPA =
  | 'nilai_agama_moral' | 'fisik_motorik' | 'kognitif' | 'bahasa' | 'sosial_emosional' | 'seni';
export type SubFisikMotorik = 'motorik_kasar' | 'motorik_halus' | 'kesehatan_keselamatan';
export type FaseFondasi = 'nilai_agama_budi_pekerti' | 'jati_diri' | 'dasar_literasi_steam';
export type SumberRegulasi = 'permendikbud-137-2014' | 'bskap-032-2024' | 'permendikdasmen-10-2025';
export type PaudStatus = 'belum' | 'paud_tk' | 'daycare' | 'di_rumah';

export const ASPEK_STPPA: Record<AspekSTPPA, string> = {
  nilai_agama_moral: 'Nilai Agama dan Moral',
  fisik_motorik: 'Fisik-Motorik',
  kognitif: 'Kognitif',
  bahasa: 'Bahasa',
  sosial_emosional: 'Sosial-Emosional',
  seni: 'Seni',
};

/** Crosswalk domain perkembangan Rekah → aspek STPPA (divalidasi vs Phase 11D). */
export const DOMAIN_KE_STPPA: Record<DomainKey, AspekSTPPA> = {
  mk: 'fisik_motorik',
  mh: 'fisik_motorik',
  sen: 'seni',
  kog: 'kognitif',
  bhs: 'bahasa',
  sos: 'sosial_emosional',
  fe: 'sosial_emosional', // regulasi diri = bagian sosial-emosional STPPA
};

export const DOMAIN_KE_SUB_FM: Partial<Record<DomainKey, SubFisikMotorik>> = {
  mk: 'motorik_kasar',
  mh: 'motorik_halus',
};

export const ASPEK_KE_FASE: Record<AspekSTPPA, FaseFondasi> = {
  nilai_agama_moral: 'nilai_agama_budi_pekerti',
  fisik_motorik: 'jati_diri',
  sosial_emosional: 'jati_diri',
  kognitif: 'dasar_literasi_steam',
  bahasa: 'dasar_literasi_steam',
  seni: 'dasar_literasi_steam',
};

export function aspekDariDomain(d: DomainKey): AspekSTPPA { return DOMAIN_KE_STPPA[d]; }
export function faseFondasiDariDomain(d: DomainKey): FaseFondasi { return ASPEK_KE_FASE[DOMAIN_KE_STPPA[d]]; }

const PETA_SEKOLAH_KE_STATUS: Record<string, PaudStatus> = {
  'Belum': 'belum',
  'PAUD atau TK': 'paud_tk',
  'Daycare': 'daycare',
  'Di rumah saja': 'di_rumah',
};

export function paudStatusDariPeta(jawaban: Record<string, string[]>): PaudStatus | null {
  const j = (jawaban['a_sekolah'] ?? [])[0];
  return j ? (PETA_SEKOLAH_KE_STATUS[j] ?? null) : null;
}

// ─── METADATA KONTEN GABUNGAN ─────────────────────────────────────────────────
// Dilekatkan opsional ke Activity (learningStrategies) sbg field `meta`. Semua opsional.
export interface KontenMetadata {
  // alergi
  allergens?: AllergenInfo;
  dapatDifilterAlergen?: boolean;   // true = tag alergen sudah lengkap & ditinjau
  // bahasa
  bahasa?: BahasaKey[];
  bahasaUtama?: BahasaKey;
  dwibahasa?: boolean;
  modeDwibahasa?: ModeDwibahasa;
  domainBahasa?: DomainBahasa[];
  teknikStimulasi?: TeknikStimulasi[];
  milestoneTarget?: string[];
  // toilet
  tahapToilet?: TahapKesiapan;
  jenisKesiapan?: JenisKesiapan[];
  usiaMinToiletBulan?: number;
  // layar
  berbasisLayar?: boolean;
  jenisLayar?: JenisLayar;
  // saudara
  adaptasiAdik?: boolean;
  tagSaudara?: TagSaudara[];
  // PAUD
  aspekSTPPA?: AspekSTPPA;
  subFisikMotorik?: SubFisikMotorik;
  faseFondasi?: FaseFondasi;
  sumberRegulasi?: SumberRegulasi;
  // tata kelola
  statusTinjauan?: StatusTinjauan;  // undefined = published (backward compat)
  ditinjauOleh?: string;            // mis. "Fitri"
}

// ─── LABEL MAP untuk editor admin (Phase 25) ───────────────────────────────────
export const BAHASA_LABEL: Record<BahasaKey, string> = {
  id: 'Bahasa Indonesia', min: 'Minangkabau', jv: 'Jawa', su: 'Sunda',
  bbc: 'Batak Toba', bug: 'Bugis', ban: 'Bali', daerah: 'Bahasa daerah', nonverbal: 'Tanpa kata',
};
export const MODE_DWIBAHASA_LABEL: Record<ModeDwibahasa, string> = {
  none: 'Satu bahasa', varian_kembar: 'Varian kembar (paralel)', terjemahan: 'Terjemahan', campuran: 'Campur kode',
};
export const DOMAIN_BAHASA_LABEL: Record<DomainBahasa, string> = {
  reseptif: 'Reseptif (memahami)', ekspresif: 'Ekspresif (memproduksi)', praliterasi: 'Pra-literasi', pragmatik: 'Pragmatik/sosial',
};
export const JENIS_KESIAPAN_LABEL: Record<JenisKesiapan, string> = {
  fisik: 'Kesiapan fisik', kognitif: 'Kesiapan kognitif', sosial_emosional: 'Kesiapan sosial-emosional',
};
export const JENIS_LAYAR_LABEL: Record<JenisLayar, string> = {
  video_call: 'Panggilan video', tontonan: 'Tontonan', permainan: 'Permainan', edukasi_interaktif: 'Edukasi interaktif', none: 'Tanpa layar',
};
export const TAG_SAUDARA_LABEL: Record<TagSaudara, string> = {
  'persiapan-pra-lahir': 'Persiapan sebelum adik lahir',
  'kejujuran-perubahan': 'Jujur tentang perubahan',
  'regresi': 'Regresi (mundur sementara)',
  'kecemburuan': 'Kecemburuan / bersaing perhatian',
  'pelibatan-kakak': 'Melibatkan kakak merawat adik',
  'waktu-berdua': 'Waktu khusus 1-on-1',
  'selesaikan-transisi': 'Tuntaskan transisi besar sebelum lahir',
  'berbagi-perhatian': 'Belajar berbagi & giliran',
  'peran-kakak-hebat': 'Memberi peran "kakak hebat"',
};
export const SUB_FM_LABEL: Record<SubFisikMotorik, string> = {
  motorik_kasar: 'Motorik kasar', motorik_halus: 'Motorik halus', kesehatan_keselamatan: 'Kesehatan & keselamatan',
};
export const FASE_FONDASI_LABEL: Record<FaseFondasi, string> = {
  nilai_agama_budi_pekerti: 'Nilai Agama & Budi Pekerti', jati_diri: 'Jati Diri', dasar_literasi_steam: 'Dasar Literasi/STEAM',
};
export const SUMBER_REGULASI_LABEL: Record<SumberRegulasi, string> = {
  'permendikbud-137-2014': 'Permendikbud 137/2014 (STPPA)',
  'bskap-032-2024': 'BSKAP 032/2024 (Fase Fondasi)',
  'permendikdasmen-10-2025': 'Permendikdasmen 10/2025 (SKL PAUD)',
};

// ─── Phase 26 Tahap 2: kartu panduan konkret (DRAFT → Fitri) ───────────────────
// Catatan: ini PANDUAN ringkas berbasis usia/jawaban (pola Nifas/Piring), bukan
// konten katalog bertag. Semua teks DRAFT, menunggu tinjauan Fitri.
export interface SaranKartu { judul: string; detail: string }

export const TOILET_SARAN: Record<TahapKesiapan, SaranKartu> = {
  prasyarat: { judul: 'Belum perlu buru-buru', detail: 'Di bawah sekitar 18 bulan, cukup kenalkan kata & biarkan anak melihat rutinitas toilet. Kesiapan tiap anak berbeda.' },
  pengenalan: { judul: 'Kenalkan pelan-pelan', detail: 'Letakkan pispot di tempat terlihat, ajak duduk berpakaian tanpa paksaan, dan puji usaha kecil.' },
  latihan_aktif: { judul: 'Dampingi latihan', detail: 'Tawarkan ke toilet di waktu rutin (bangun tidur, sesudah makan). Rayakan keberhasilan, tetap tenang saat meleset.' },
  kemandirian: { judul: 'Kuatkan kebiasaan', detail: 'Pastikan anak mudah menjangkau toilet & pakaiannya. Tetap dampingi di malam hari bila perlu.' },
};

export function saranLayar(usiaBulan: number | null, rowsDb?: readonly { kunci: string; judul: string; detail?: string | null }[]): { judul: string; detail: string; alternatif: string } {
  const k = kebijakanLayar(usiaBulan);
  const db = rowsDb?.find(r => r.kunci === k.band);
  return {
    judul: db?.judul ?? (k.kesesuaian === 'hindari' ? 'Usia ini: sebaiknya tanpa layar' : 'Batasi & temani saat layar'),
    detail: db?.detail ?? k.pesan,
    alternatif: 'Alternatif: main sensorik, baca buku bergambar, atau gerak bebas 10 menit.',
  };
}

/** Panduan toilet untuk tahap kesiapan, dengan override DB (Phase 28d) + fallback TOILET_SARAN. */
export function panduanToilet(tahap: TahapKesiapan, rowsDb?: readonly { kunci: string; judul: string; detail?: string | null }[]): SaranKartu {
  const db = rowsDb?.find(r => r.kunci === tahap);
  const def = TOILET_SARAN[tahap];
  return { judul: db?.judul ?? def.judul, detail: db?.detail ?? def.detail };
}

/** Panduan saudara untuk konteks, dengan override DB (Phase 28d) + fallback SARAN_SAUDARA. */
export function panduanSaudara(konteks: KonteksSaudara, rowsDb?: readonly { kunci: string; judul: string; detail?: string | null }[]): SaranKartu | null {
  const def = SARAN_SAUDARA[konteks];
  const db = rowsDb?.find(r => r.kunci === konteks);
  if (!def && !db) return null;
  return { judul: db?.judul ?? def?.judul ?? '', detail: db?.detail ?? def?.detail ?? '' };
}

export const SARAN_SAUDARA: Partial<Record<KonteksSaudara, SaranKartu>> = {
  'menanti-adik': { judul: 'Menyiapkan jadi kakak', detail: 'Ceritakan kehadiran adik sejak awal, libatkan memilih perlengkapan, dan tuntaskan transisi besar (mis. toilet) sebelum adik lahir.' },
  'punya-adik': { judul: 'Menemani jadi kakak', detail: 'Wajar bila anak sesekali "mundur" (regresi) — jangan ditegur. Sisihkan waktu khusus berdua & beri peran kecil merawat adik.' },
  'kembar': { judul: 'Dua sekaligus', detail: 'Usahakan sedikit waktu satu-satu untuk tiap anak, dan hindari membanding-bandingkan keduanya.' },
};

// ─── Phase 27: Rumah — persiapan per tahap + r_aman sadar-tahap (DRAFT → Fitri) ──
export type KategoriPersiapan = 'keamanan' | 'penataan' | 'logistik';
export interface ItemPersiapan { kategori: KategoriPersiapan; judul: string; esensial: boolean; khasIndonesia?: boolean }

type TahapRumah = 'bayi_diam' | 'merangkak' | 'jalan' | 'prasekolah';
function tahapRumah(usiaBulan: number | null): TahapRumah {
  if (usiaBulan == null || usiaBulan < 6) return 'bayi_diam';
  if (usiaBulan < 12) return 'merangkak';
  if (usiaBulan < 36) return 'jalan';
  return 'prasekolah';
}
const TAHAP_RUMAH_LABEL: Record<TahapRumah, string> = {
  bayi_diam: 'bayi, belum berpindah',
  merangkak: 'mulai merangkak & berdiri',
  jalan: 'berjalan & menjelajah',
  prasekolah: 'memanjat & lebih mandiri',
};
export function tahapRumahLabel(usiaBulan: number | null): string { return TAHAP_RUMAH_LABEL[tahapRumah(usiaBulan)]; }

const PERSIAPAN: Record<TahapRumah, ItemPersiapan[]> = {
  bayi_diam: [
    { kategori: 'keamanan', judul: 'Pastikan tempat tidur bayi aman: telentang, kasur keras, area kosong', esensial: true },
    { kategori: 'logistik', judul: 'Gunakan air matang untuk menyiapkan susu', esensial: true },
    { kategori: 'logistik', judul: 'Jadikan rumah bebas asap rokok', esensial: true, khasIndonesia: true },
  ],
  merangkak: [
    { kategori: 'keamanan', judul: 'Jangkar lemari, rak & TV ke dinding', esensial: true },
    { kategori: 'keamanan', judul: 'Pasang gerbang di atas & bawah tangga', esensial: true },
    { kategori: 'keamanan', judul: 'Kosongkan ember/bak setelah dipakai', esensial: true, khasIndonesia: true },
    { kategori: 'penataan', judul: 'Siapkan kursi & area makan MPASI', esensial: true },
    { kategori: 'logistik', judul: 'Sediakan oralit + zinc di kotak P3K', esensial: false },
  ],
  jalan: [
    { kategori: 'keamanan', judul: 'Pasang pengaman jendela; jauhkan kursi dari jendela', esensial: true },
    { kategori: 'keamanan', judul: 'Kunci obat & bahan kimia di tempat tinggi', esensial: true },
    { kategori: 'penataan', judul: 'Rak mainan rendah agar anak bisa ambil & beres sendiri', esensial: false },
    { kategori: 'logistik', judul: 'Perketat PSN 3M Plus (anti-jentik)', esensial: false, khasIndonesia: true },
  ],
  prasekolah: [
    { kategori: 'keamanan', judul: 'Simpan korek & pemantik terkunci', esensial: true },
    { kategori: 'keamanan', judul: 'Pertahankan jangkar furnitur & pengaman jendela', esensial: true },
    { kategori: 'penataan', judul: 'Sudut belajar/main mandiri + penyimpanan rendah', esensial: false },
    { kategori: 'logistik', judul: 'P3K & nomor darurat mudah diakses', esensial: false },
  ],
};
export interface BarisAksiPersiapan { kunci: string; judul: string; detail?: string | null; meta?: Record<string, unknown>; urutan?: number }
/** Item persiapan rumah untuk tahap usia. Bila rowsDb (Supabase, Phase 28) berisi baris untuk
 *  tahap tsb, pakai itu; jika tidak, pakai default kode. */
export function persiapanRumah(usiaBulan: number | null, rowsDb?: readonly BarisAksiPersiapan[]): ItemPersiapan[] {
  const tahap = tahapRumah(usiaBulan);
  if (rowsDb && rowsDb.length) {
    const forTahap = rowsDb.filter(r => r.kunci === tahap);
    if (forTahap.length) {
      return [...forTahap].sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0)).map(r => ({
        kategori: (r.meta?.kategori as KategoriPersiapan) ?? 'logistik',
        judul: r.judul,
        esensial: !!r.meta?.esensial,
        khasIndonesia: !!r.meta?.khasIndonesia,
      }));
    }
  }
  return PERSIAPAN[tahap];
}

const AMAN_OPSI: Record<TahapRumah, string[]> = {
  bayi_diam: ['Permukaan tinggi tanpa pengaman', 'Cairan panas terjangkau', 'Tali/kabel dekat bayi', 'Sudah cukup aman'],
  merangkak: ['Lemari/rak/TV belum dijangkar', 'Tangga tanpa gerbang', 'Colokan terbuka', 'Ember/bak berisi air', 'Kabel/tali tirai', 'Sudah cukup aman'],
  jalan: ['Jendela tanpa pengaman', 'Obat/bahan kimia terjangkau', 'Akses dapur saat memasak', 'Ember/bak berisi air', 'Sudah cukup aman'],
  prasekolah: ['Korek/pemantik terjangkau', 'Jendela tanpa pengaman', 'Furnitur belum dijangkar', 'Sudah cukup aman'],
};
export function opsiAman(usiaBulan: number | null): string[] { return AMAN_OPSI[tahapRumah(usiaBulan)]; }

export const AMAN_REMINDER: Record<string, string> = {
  'Permukaan tinggi tanpa pengaman': 'Jangan tinggalkan bayi di permukaan tinggi; selalu satu tangan memegang',
  'Cairan panas terjangkau': 'Jauhkan cairan panas & taplak yang bisa ditarik dari jangkauan',
  'Tali/kabel dekat bayi': 'Jauhkan tali, kantong plastik & kabel dari area bayi',
  'Lemari/rak/TV belum dijangkar': 'Jangkar lemari, rak & TV ke dinding',
  'Tangga tanpa gerbang': 'Pasang gerbang di atas & bawah tangga',
  'Colokan terbuka': 'Tutup colokan listrik dengan penutup aman',
  'Ember/bak berisi air': 'Kosongkan ember/bak setelah dipakai; tutup kamar mandi',
  'Kabel/tali tirai': 'Rapikan kabel & amankan tali tirai (anti-tercekik)',
  'Jendela tanpa pengaman': 'Pasang pengaman jendela & jauhkan kursi dari jendela',
  'Obat/bahan kimia terjangkau': 'Kunci obat & bahan kimia di tempat tinggi',
  'Akses dapur saat memasak': 'Batasi akses dapur saat memasak',
  'Korek/pemantik terjangkau': 'Simpan korek & pemantik terkunci',
  'Furnitur belum dijangkar': 'Jangkar furnitur ke dinding',
};
