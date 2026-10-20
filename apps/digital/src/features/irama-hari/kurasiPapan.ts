// =============================================================
// kurasiPapan — saran kegiatan yang DIPILIH REKAH untuk papan Irama Keseharian
// (Phase 21C). Menggantikan saran statis di template katalog (dulu "Tumpuk balok
// warna" di Main bersama & "Baca buku bersama" di Rutinitas sebelum tidur muncul
// sama persis di setiap hari untuk setiap anak).
//
// Satu Ajak Main per hari untuk kegiatan "Main bersama", dipilih dari:
//   1. Usia anak        → hanya Ajak Main di band usia anak sekarang.
//   2. Yang diamati     → domain dari Kompas Perkembangan (Perjalanan → Mengamati)
//                         didahulukan (jembatan domain sama dengan FokusMingguIni).
//   3. Keadaan keluarga → bila Kehidupan Keluarga meminta langkah pendek,
//                         utamakan kegiatan berdurasi singkat.
// Rotasi deterministik per anak per tanggal: sama bila dibuka ulang, berganti
// antar hari, tidak berulang dalam satu minggu bila kolam cukup.
// Nilai keluarga sudah menyetir Kebiasaan Baik di papan; Ajak Main belum bertag
// nilai (tanpaTemaNilai), jadi nilai tidak dipakai di sini (jujur, tanpa klaim).
//
// Phase 21D — sumber tambahan:
//   • Wawasan Tumbuh (bacaan orang tua) → 1 per hari di "Tidur siang" (saat anak tidur),
//     cadangan "Rutinitas sebelum tidur". Disetir keadaan keluarga (tag Kehidupan
//     Keluarga) lalu yang diamati, lalu usia. Kartu Deteksi Dini (DK) & medis TIDAK
//     disarankan rutin (DK = jalur eskalasi, bukan slot harian).
//   • Temani → langkah perjalanan aktif pada tanggalnya (hari ke-N = mulai + N-1,
//     sama dengan cara Temani menghitung), ditaruh di kegiatan yang cocok
//     (tidur → Rutinitas sebelum tidur, makan → Makan siang, lainnya → Bangun tidur).
// Copy DRAFT → review Psikolog Fitri.
// =============================================================
import type { Activity, DomainKey } from '../../data/learningStrategies';
import { kontenKenaAlergi } from './kontenMetadata';
import type { AllergenKey } from './kontenMetadata';
import { DOMAIN_META } from '../../data/learningStrategies';
import { benihDariTeks, kocok } from '../beranda-usia/adapter/acakDeterministik';
import { promptById } from '../rekah-journey/observation/observationPrompts';
import { resolveSubUsia, SUB_USIA_TO_AGE_KEY } from '../../components/FilterSubUsia';
import type { ParameterPenyesuaian, TagPenyesuaian } from './kehidupanData';
import { COPY_TAG } from './kehidupanData';
import type { KnowledgeCard, DomainCode } from '@studiva/shared';
import type { TemaniJourney } from '../temani/temaniSeed';
import type { Item, Waktu, Store } from './dayPlanData';

/** Kegiatan template yang menerima saran Ajak Main pilihan Rekah. */
export const KEG_SARAN_REKAH = 'main';
export const AWALAN_REKAH = 'rk-';

// Domain perkembangan (observasi) → DomainKey kegiatan. Sama dengan FokusMingguIni.
const DOMAIN_OBS_KE_KEGIATAN: Record<string, DomainKey[]> = {
  'Gross Motor': ['mk'],
  'Fine Motor': ['mh'],
  'Cognitive': ['kog'],
  'Language & Communication': ['bhs'],
  'Social-Emotional': ['sos'],
  'Self-Regulation & Executive Function': ['fe'],
  'Adaptive / Self-Help': ['mh', 'sos'],
};

// Minat main anak (Peta · a_main) → domain kegiatan, untuk memprioritaskan Ajak Main.
const MINAT_KE_DOMAIN: Record<string, DomainKey[]> = {
  'Musik & suara': ['sen', 'bhs'],
  'Buku & gambar': ['bhs', 'kog'],
  'Air': ['sen', 'mk'],
  'Gerak fisik': ['mk', 'mh'],
  'Menyusun': ['mh', 'kog'],
  'Pura-pura': ['sos', 'bhs'],
};
export function domainMinat(labels: readonly string[]): Set<DomainKey> {
  const out = new Set<DomainKey>();
  for (const l of labels) for (const d of MINAT_KE_DOMAIN[l] ?? []) out.add(d);
  return out;
}

/** Band Ajak Main untuk usia (bulan) — sama dengan pemilih Bekal di PapanKegiatan. */
export function bandAjakMain(usiaBulan: number): Set<string> {
  if (usiaBulan < 12) return new Set(['b03', 'b36', 'b69', 'b912']);
  if (usiaBulan < 24) return new Set(['t1218', 't1824']);
  if (usiaBulan < 36) return new Set(['u23']);
  if (usiaBulan < 48) return new Set(['u34']);
  if (usiaBulan < 60) return new Set(['u45']);
  return new Set(['u56']);
}

/** Domain kegiatan yang sedang diamati, dari id prompt Kompas Perkembangan. */
export function domainDiamati(idObservasi: readonly string[]): Set<DomainKey> {
  const out = new Set<DomainKey>();
  for (const id of idObservasi) {
    const d = promptById(id)?.domainOrArea;
    for (const k of (d ? DOMAIN_OBS_KE_KEGIATAN[d] : undefined) ?? []) out.add(k);
  }
  return out;
}

function indeksHari(tanggal: string): number {
  const [y, m, d] = tanggal.split('-').map(Number);
  return Math.round(Date.UTC(y, (m || 1) - 1, d || 1) / 86400000);
}

export interface KonteksKurasi {
  idAnak: string;
  tanggal: string;                 // YYYY-MM-DD
  usiaBulan: number;
  kegiatan: readonly Activity[];   // publishedActivities
  diamati: ReadonlySet<DomainKey>;
  /** Minat main anak (Peta) → domain; dipakai bila tidak ada yang diamati. */
  minat?: ReadonlySet<DomainKey>;
  param?: ParameterPenyesuaian;
  /** Judul yang sudah ada di papan hari itu (hindari dobel). */
  sudahAda?: ReadonlySet<string>;
  /** Id saran (rk-…) yang sudah diganti pengguna hari itu — jangan dipilih lagi. */
  hindari?: ReadonlySet<string>;
  /** Phase 25: alergen yang dihindari anak (dari Peta) → sembunyikan konten makanan yang mengandung. */
  hindariAlergen?: ReadonlySet<AllergenKey>;
  /** Phase 25: rumah dwibahasa → utamakan konten yang ramah dwibahasa bila tersedia. */
  dwibahasa?: boolean;
  /** Phase 26 B1: label minat asli anak (Peta a_main) untuk alasan personal. */
  minatLabel?: readonly string[];
}

/** Saring kolam dari id yang diganti; bila semua sudah diganti, kembali ke kolam penuh (berputar). */
function tanpaDiganti<T>(kolam: T[], idDari: (x: T) => string, hindari?: ReadonlySet<string>): T[] {
  if (!hindari || hindari.size === 0) return kolam;
  const sisa = kolam.filter(x => !hindari.has(idDari(x)));
  return sisa.length > 0 ? sisa : kolam;
}

/** Saran Ajak Main pilihan Rekah untuk satu tanggal (0 atau 1 item). */
export function kurasiMainBersama(k: KonteksKurasi): Item[] {
  // Sama dengan Bekal Ajak Main: tahun pertama memakai sub tahap usia (b03/b36/b69/b912).
  const band = k.usiaBulan < 12 ? new Set<string>([resolveSubUsia(k.usiaBulan)]) : bandAjakMain(k.usiaBulan);
  const sudah = k.sudahAda ?? new Set<string>();
  let kolam = tanpaDiganti(k.kegiatan.filter(a => band.has(a.ageId) && !sudah.has(a.judul.trim().toLowerCase())), a => `${AWALAN_REKAH}${a.id}`, k.hindari);
  // Phase 25: saring konten yang mengandung alergen yang dihindari (konten tak-bertag tak terpengaruh).
  if (k.hindariAlergen && k.hindariAlergen.size > 0) kolam = kolam.filter(a => !kontenKenaAlergi(a.meta?.allergens, k.hindariAlergen!));
  if (kolam.length === 0) return [];

  // Keadaan keluarga: langkah pendek → ambil yang paling singkat di kolam (durasi ≤ batas
  // 40% tersingkat), karena tiap band punya rentang durasi berbeda.
  const pref: ReadonlySet<DomainKey> = k.diamati.size > 0 ? k.diamati : (k.minat ?? new Set<DomainKey>());
  const pakaiMinat = k.diamati.size === 0 && (k.minat?.size ?? 0) > 0;
  const pendek = !!k.param?.langkahPendek;
  if (pendek) {
    const durasi = kolam.map(a => a.durasiMenit || 0).filter(d => d > 0).sort((x, y) => x - y);
    if (durasi.length > 0) {
      const batas = durasi[Math.max(0, Math.ceil(durasi.length * 0.4) - 1)];
      const singkat = kolam.filter(a => (a.durasiMenit || 0) > 0 && a.durasiMenit <= batas);
      if (singkat.length > 0) kolam = singkat;
    }
  }

  // Phase 25: rumah dwibahasa → utamakan konten dwibahasa bila ada yang bertag.
  if (k.dwibahasa) {
    const dw = kolam.filter(a => a.meta?.dwibahasa);
    if (dw.length > 0) kolam = dw;
  }

  // Rotasi per minggu (Senin–Minggu), dikocok per anak per minggu.
  // Bila ada yang sedang diamati: Sen/Rab/Jum/Min memakai kegiatan domain itu (bergiliran),
  // Sel/Kam/Sab kegiatan lain — diamati didahulukan tanpa jadi monoton.
  const hari = indeksHari(k.tanggal);
  const minggu = Math.floor((hari + 3) / 7);     // 1970-01-01 = Kamis → minggu berganti tiap Senin
  const posisi = (((hari + 3) % 7) + 7) % 7;      // Senin = 0 … Minggu = 6
  const benih = benihDariTeks(`${k.idAnak}:${minggu}`);
  const stabil = (xs: readonly Activity[]) => [...xs].sort((x, y) => x.id - y.id);
  const cocok = pref.size > 0 ? kocok(stabil(kolam.filter(a => a.domain.some(d => pref.has(d)))), benih) : [];
  const lain = kocok(stabil(kolam.filter(a => !cocok.includes(a))), benih + 1);
  let a: Activity;
  if (cocok.length > 0 && (posisi % 2 === 0 || lain.length === 0)) {
    a = cocok[(Math.floor(posisi / 2) + minggu) % cocok.length];
  } else {
    const daftar = lain.length > 0 ? lain : cocok;
    const langkah = cocok.length > 0 ? Math.floor(posisi / 2) : posisi;
    a = daftar[(langkah + minggu * 7) % daftar.length];
  }

  const domainCocok = a.domain.filter(d => pref.has(d)).map(d => DOMAIN_META[d]?.label).filter(Boolean);
  // B1: bila dipilih karena minat, pakai kata-kata caregiver sendiri (mis. "air, musik & suara").
  const kataMinat = pakaiMinat && k.minatLabel
    ? k.minatLabel.filter(l => (MINAT_KE_DOMAIN[l] ?? []).some(d => a.domain.includes(d))).map(l => l.toLowerCase())
    : [];
  const bagian = [
    domainCocok.length > 0
      ? (pakaiMinat
          ? `sesuai yang disukai anak (${kataMinat.length ? kataMinat.join(', ') : domainCocok.join(', ')})`
          : `sesuai yang sedang kamu amati (${domainCocok.join(', ')})`)
      : 'sesuai usia anak',
    pendek ? 'dipilih yang singkat mengikuti keadaan keluarga' : '',
  ].filter(Boolean);

  return [{
    id: `${AWALAN_REKAH}${a.id}`,
    tipe: 'main',
    t: a.judul,
    asal: 'rekah',
    alasan: `Dipilih Rekah ${bagian.join(', ')}.`,
  }];
}

// ─── Phase 21D: Wawasan Tumbuh & Temani ──────────────────────────────────────

/** Saran Rekah beserta tempatnya di papan. slot = cadangan bila kegiatan tujuan tidak ada. */
export interface SaranPapan { kegKey: string; kegCadangan?: string; slot: Waktu; item: Item }

/** Age key Wawasan Tumbuh untuk usia (bulan) — sama dengan pemilih Bekal di PapanKegiatan. */
export function kunciUsiaWawasan(usiaBulan: number): Set<string> {
  // Sama dengan Bekal Wawasan Tumbuh: tahun pertama memakai sub tahap usia (0-3/3-6/6-9/9-12 bln).
  if (usiaBulan < 12) return new Set([SUB_USIA_TO_AGE_KEY[resolveSubUsia(usiaBulan)]]);
  const bands: { max: number; keys: string[] }[] = [
    { max: 12, keys: ['0-3m', '3-6m', '6-9m', '9-12m'] },
    { max: 24, keys: ['12-18m', '18-24m'] },
    { max: 36, keys: ['2-3y'] },
    { max: 48, keys: ['3-4y'] },
    { max: 60, keys: ['4-5y'] },
    { max: Infinity, keys: ['5-6y'] },
  ];
  return new Set((bands.find(b => usiaBulan <= b.max) ?? bands[bands.length - 1]).keys);
}

const DOMAIN_KEG_KE_KARTU: Record<DomainKey, DomainCode> = {
  mk: 'FM', mh: 'FM', sen: 'FM', kog: 'KG', bhs: 'BH', sos: 'SE', fe: 'SE',
};
const LABEL_KARTU: Record<DomainCode, string> = {
  FM: 'Fisik & Motorik', KG: 'Kognitif', BH: 'Bahasa & Komunikasi', SE: 'Sosial-Emosional',
  KS: 'Kesehatan & Gizi', PS: 'Pengasuhan & Stimulasi', DK: 'Deteksi Dini & Kebutuhan Khusus',
};
// Keadaan keluarga → kata kunci judul / domain kartu yang relevan (DRAFT, best-effort).
const KEADAAN_KE_KARTU: Partial<Record<TagPenyesuaian, { kata?: string[]; domain?: DomainCode[] }>> = {
  tidur: { kata: ['tidur'] },
  transisi: { kata: ['transisi', 'rutinitas', 'tantrum', 'emosi'] },
  kurang_nyaman: { kata: ['nyaman', 'tenang'] },
  energi_caregiver: { domain: ['PS'] },
  kembali_kerja: { domain: ['PS'], kata: ['berpisah', 'pisah'] },
  perubahan_ritme: { kata: ['rutinitas', 'adaptasi'] },
};

/** Pilih satu per hari: prioritas di Sen/Rab/Jum/Min (bergiliran), sisanya di Sel/Kam/Sab. */
function pilihPerHari<T>(prioritas: readonly T[], lain: readonly T[], idAnak: string, tanggal: string, garam: string): T | undefined {
  const hari = indeksHari(tanggal);
  const minggu = Math.floor((hari + 3) / 7);
  const posisi = (((hari + 3) % 7) + 7) % 7;
  const benih = benihDariTeks(`${idAnak}:${garam}:${minggu}`);
  const p = kocok(prioritas, benih);
  const l = kocok(lain, benih + 1);
  if (p.length === 0 && l.length === 0) return undefined;
  if (p.length > 0 && (posisi % 2 === 0 || l.length === 0)) return p[(Math.floor(posisi / 2) + minggu) % p.length];
  const daftar = l.length > 0 ? l : p;
  const langkah = p.length > 0 ? Math.floor(posisi / 2) : posisi;
  return daftar[(langkah + minggu * 7) % daftar.length];
}

export interface KonteksWawasan {
  idAnak: string; tanggal: string; usiaBulan: number;
  kartu: readonly KnowledgeCard[];
  diamati: ReadonlySet<DomainKey>;
  param?: ParameterPenyesuaian;
  sudahAda?: ReadonlySet<string>;
  hindari?: ReadonlySet<string>;
}

/** Satu bacaan Wawasan Tumbuh untuk orang tua per hari. */
export function kurasiWawasan(k: KonteksWawasan): SaranPapan[] {
  const usia = kunciUsiaWawasan(k.usiaBulan);
  const sudah = k.sudahAda ?? new Set<string>();
  const kolam = tanpaDiganti([...k.kartu]
    .filter(c => usia.has(c.ageKey) && !!c.summary && c.domain !== 'DK' && !c.isMedical && !sudah.has(c.title.trim().toLowerCase()))
    .sort((a, b) => a.id.localeCompare(b.id)), c => `${AWALAN_REKAH}wt-${c.id}`, k.hindari);
  if (kolam.length === 0) return [];

  // 1) keadaan keluarga, 2) yang diamati
  const tags = k.param?.aktifTag ?? [];
  const cocokKeadaan = (c: KnowledgeCard): TagPenyesuaian | undefined => tags.find(t => {
    const r = KEADAAN_KE_KARTU[t]; if (!r) return false;
    const judul = c.title.toLowerCase();
    return (r.domain?.includes(c.domain) ?? false) || (r.kata?.some(w => judul.includes(w)) ?? false);
  });
  const domainKartu = new Set([...k.diamati].map(d => DOMAIN_KEG_KE_KARTU[d]));
  const keadaan = kolam.filter(c => cocokKeadaan(c));
  const diamati = kolam.filter(c => !keadaan.includes(c) && domainKartu.has(c.domain));
  const prioritas = keadaan.length > 0 ? keadaan : diamati;
  const lain = kolam.filter(c => !prioritas.includes(c));
  const c = pilihPerHari(prioritas, lain, k.idAnak, k.tanggal, 'wt');
  if (!c) return [];

  const tag = cocokKeadaan(c);
  const alasan = tag
    ? `Bacaan untuk orang tua, dipilih Rekah karena keadaan keluarga (${COPY_TAG[tag].label.toLowerCase()}).`
    : domainKartu.has(c.domain)
      ? `Bacaan untuk orang tua, sejalan dengan yang sedang kamu amati (${LABEL_KARTU[c.domain]}).`
      : 'Bacaan untuk orang tua, dipilih Rekah sesuai usia anak.';
  return [{
    kegKey: 'tidursiang', kegCadangan: 'tidur', slot: 'siang',
    item: { id: `${AWALAN_REKAH}wt-${c.id}`, tipe: 'buku', t: c.title, asal: 'rekah', alasan },
  }];
}

/** Progres Temani yang disimpan TemaniPage (localStorage `rekah_temani_<idAnak>`). */
export interface ProgresTemani { slug: string; hari: number; status: 'aktif' | 'selesai'; mulaiTanggal?: string }

export function bacaProgresTemani(idAnak: string): ProgresTemani | null {
  try { const r = localStorage.getItem(`rekah_temani_${idAnak}`); return r ? (JSON.parse(r) as ProgresTemani) : null; } catch { return null; }
}

/** Langkah Temani pada tanggal tsb (bila ada perjalanan aktif). */
export function kurasiTemani(tanggal: string, progres: ProgresTemani | null, journeys: readonly TemaniJourney[], sudahAda?: ReadonlySet<string>): SaranPapan[] {
  if (!progres || progres.status !== 'aktif') return [];
  const j = journeys.find(x => x.slug === progres.slug);
  if (!j) return [];
  const hariKe = progres.mulaiTanggal ? indeksHari(tanggal) - indeksHari(progres.mulaiTanggal) + 1 : NaN;
  if (!Number.isFinite(hariKe) || hariKe < 1 || hariKe > j.durasiHari) return [];
  const h = j.hari.find(x => x.hari === hariKe);
  if (!h || (sudahAda?.has(h.fokus.trim().toLowerCase()))) return [];
  const slug = j.slug.toLowerCase();
  const [kegKey, slot]: [string, Waktu] = slug.includes('tidur') ? ['tidur', 'malam'] : slug.includes('makan') ? ['makansiang', 'siang'] : ['bangun', 'pagi'];
  return [{
    kegKey, slot,
    item: {
      id: `${AWALAN_REKAH}tm-${j.slug}-${hariKe}`, tipe: 'lainnya', t: h.fokus, asal: 'rekah',
      labelSumber: `dari Temani · ${j.judul}`,
      alasan: h.script ? `Langkah Temani hari ini. Contoh: “${h.script}”` : `Langkah Temani hari ini dari perjalanan “${j.judul}”.`,
    },
  }];
}

// ─── Penempatan bersama (papan Kelola & Beranda "Rencana hari ini") ──────────

export interface KonteksSaranHari {
  idAnak: string;
  tanggal: string;
  usiaBulan: number;
  kegiatan: readonly Activity[];
  kartu: readonly KnowledgeCard[];
  idObservasi: readonly string[];
  minat?: ReadonlySet<DomainKey>;
  /** Phase 25 */
  hindariAlergen?: ReadonlySet<AllergenKey>;
  dwibahasa?: boolean;
  /** Phase 26 B1 */
  minatLabel?: readonly string[];
  param?: ParameterPenyesuaian;
  store: Store;
  journeys: readonly TemaniJourney[];
  progresTemani: ProgresTemani | null;
  /** Kunci kegiatan yang tampil di papan per slot, berurutan. */
  kegDiSlot: (slot: Waktu) => string[];
}

/** Semua saran Rekah untuk satu tanggal, sudah ditempatkan per kegiatan (tanpa yang disembunyikan/diadopsi). */
export function saranRekahPerKeg(k: KonteksSaranHari): Record<string, Item[]> {
  // Judul tambahan PENGGUNA (bukan saran Rekah yang sudah ditandai) → hindari dobel.
  const semuaExtra = Object.values(k.store.extra).flat();
  const sudahAda = new Set<string>();
  for (const e of semuaExtra) if (!e.id.startsWith(AWALAN_REKAH)) sudahAda.add(e.t.trim().toLowerCase());
  const sembunyi = new Set(k.store.hidden);
  const diAdopsi = new Set(semuaExtra.map(e => e.id));
  const hindari = new Set(k.store.diganti ?? []);
  // Saran Rekah yang sudah ditandai (diadopsi ke papan) TETAP jadi saran hari itu:
  // jangan munculkan Ajak Main / Wawasan Tumbuh pengganti di sampingnya.
  const adaMainRekah = semuaExtra.some(e => jenisSaranRekah(e.id) === 'main');
  const adaWawasanRekah = semuaExtra.some(e => jenisSaranRekah(e.id) === 'wawasan');
  const diamati = domainDiamati(k.idObservasi);
  const semua: SaranPapan[] = [
    ...(adaMainRekah ? [] : kurasiMainBersama({ idAnak: k.idAnak, tanggal: k.tanggal, usiaBulan: k.usiaBulan, kegiatan: k.kegiatan, diamati, minat: k.minat, minatLabel: k.minatLabel, hindariAlergen: k.hindariAlergen, dwibahasa: k.dwibahasa, param: k.param, sudahAda, hindari })
      .map(item => ({ kegKey: KEG_SARAN_REKAH, slot: 'siang' as const, item }))),
    ...(adaWawasanRekah ? [] : kurasiWawasan({ idAnak: k.idAnak, tanggal: k.tanggal, usiaBulan: k.usiaBulan, kartu: k.kartu, diamati, param: k.param, sudahAda, hindari })),
    ...kurasiTemani(k.tanggal, k.progresTemani, k.journeys, sudahAda),
  ];
  // Kegiatan tujuan → cadangan → kegiatan pertama di slotnya.
  const ada = new Set((['pagi', 'siang', 'malam'] as Waktu[]).flatMap(sl => k.kegDiSlot(sl)));
  const out: Record<string, Item[]> = {};
  for (const sp of semua) {
    if (sembunyi.has(sp.item.id) || diAdopsi.has(sp.item.id)) continue;
    const tujuan = ada.has(sp.kegKey) ? sp.kegKey
      : sp.kegCadangan && ada.has(sp.kegCadangan) ? sp.kegCadangan
      : k.kegDiSlot(sp.slot)[0];
    if (!tujuan) continue;
    if (!out[tujuan]) out[tujuan] = [];
    out[tujuan].push(sp.item);
  }
  return out;
}

/** Jenis saran Rekah dari id-nya: Ajak Main "rk-<n>", Wawasan "rk-wt-…", Temani "rk-tm-…". */
export function jenisSaranRekah(id: string): 'main' | 'wawasan' | 'temani' | null {
  if (!id.startsWith(AWALAN_REKAH)) return null;
  if (id.startsWith(`${AWALAN_REKAH}wt-`)) return 'wawasan';
  if (id.startsWith(`${AWALAN_REKAH}tm-`)) return 'temani';
  return /^rk-\d+$/.test(id) ? 'main' : null;
}

/** "rk-tm-<slug>-<n>" → id Temani "temani-<slug>-h<n>" (sumber status selesai di Temani). */
export function idTemaniDariRekah(id: string): { slug: string; hari: number; idTemani: string } | null {
  const m = /^rk-tm-(.+)-(\d+)$/.exec(id);
  if (!m) return null;
  const hari = Number(m[2]);
  return { slug: m[1], hari, idTemani: `temani-${m[1]}-h${hari}` };
}
