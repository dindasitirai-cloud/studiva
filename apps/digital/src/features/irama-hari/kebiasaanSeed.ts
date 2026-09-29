// =============================================================
// Seed katalog Kebiasaan Baik + kegiatan template Irama Hari (Phase 19).
// Dipakai saat tabel Supabase (migrasi 026) belum ada / belum login / masih kosong.
// • Butir kb-### diturunkan dari MATERI (frozen) + klasifikasi di bawah.
// • kbd-* = kebiasaan bawaan Irama Hari (dulu di DEFAULT_KOLOM), msh-* = dari Momen
//   Sehari-hari, sit-* = situasional lama. ID dipertahankan agar centang lama tetap cocok.
// Kategori:
//   rutin        → menempel di satu kegiatan template (template_key)
//   situasional  → muncul "kapan saja" dengan keterangan kapan
// STATUS: DRAFT — klasifikasi menunggu review Psikolog Fitri Effendy.
// =============================================================
import { MATERI } from '../akar-keluarga/content';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { IkonKey } from './susunanDefault';

export type Waktu = 'pagi' | 'siang' | 'malam';
export type KategoriKebiasaan = 'rutin' | 'situasional';

export interface SaranTemplate { id: string; tipe: 'main' | 'buku'; t: string }

export interface TemplateIrama {
  key: string;
  waktu: Waktu;
  nama: string;
  jam: string;
  ikon: IkonKey;
  urutan: number;
  aktif: boolean;
  saran: SaranTemplate[];
}

export interface KebiasaanKatalog {
  id: string;
  judul: string;
  deskripsi: string;
  nilai: NilaiAkar[];
  usia_min_bulan: number;
  usia_max_bulan: number;
  kategori: KategoriKebiasaan;
  template_key: string | null;
  kapan: string | null;
  urutan: number;
  status: 'tayang' | 'diarsipkan';
}

export const LABEL_WAKTU: Record<Waktu, string> = { pagi: 'Pagi', siang: 'Siang', malam: 'Malam' };
export const LABEL_KATEGORI_KEB: Record<KategoriKebiasaan, string> = { rutin: 'Rutin (menempel di kegiatan)', situasional: 'Situasional (kapan saja)' };

/** Rentang usia 10 band MATERI, dalam bulan (inklusif). */
export const BAND_USIA: { label: string; min: number; max: number }[] = [
  { label: '0–3 bl', min: 0, max: 2 }, { label: '3–6 bl', min: 3, max: 5 }, { label: '6–9 bl', min: 6, max: 8 },
  { label: '9–12 bl', min: 9, max: 11 }, { label: '12–18 bl', min: 12, max: 17 }, { label: '18–24 bl', min: 18, max: 23 },
  { label: '2–3 th', min: 24, max: 35 }, { label: '3–4 th', min: 36, max: 47 }, { label: '4–5 th', min: 48, max: 59 },
  { label: '5–6 th', min: 60, max: 71 },
];
export const USIA_MAKS = 71;

/** Ikon yang bisa dipilih admin untuk kegiatan template (IlustrasiKegiatan). */
export const IKON_TEMPLATE: { key: IkonKey; label: string }[] = [
  { key: 'bangun', label: 'Bangun' }, { key: 'makan', label: 'Makan' }, { key: 'sup', label: 'Makan (mangkuk)' },
  { key: 'mandi', label: 'Mandi' }, { key: 'main', label: 'Main' }, { key: 'buku', label: 'Buku' },
  { key: 'luar', label: 'Di luar' }, { key: 'beres', label: 'Beres-beres' }, { key: 'gigi', label: 'Sikat gigi' },
  { key: 'cerita', label: 'Cerita' }, { key: 'tidurSiang', label: 'Tidur siang' }, { key: 'tidur', label: 'Tidur' },
  { key: 'kopi', label: 'Waktu orang tua' },
];

export function labelUsia(min: number, max: number): string {
  if (min <= 0 && max >= USIA_MAKS) return 'Semua usia';
  const band = BAND_USIA.find(b => b.min === min && b.max === max);
  if (band) return band.label;
  const f = (b: number) => (b < 24 ? `${b} bl` : `${Math.floor(b / 12)} th${b % 12 ? ` ${b % 12} bl` : ''}`);
  return `${f(min)} – ${f(max + 1)}`;
}

export const TEMPLATE_SEED: TemplateIrama[] = [
  { key: 'bangun',     waktu: 'pagi',  nama: 'Bangun tidur',            jam: '06:30', ikon: 'bangun',     urutan: 10, aktif: true, saran: [] },
  { key: 'sarapan',    waktu: 'pagi',  nama: 'Sarapan',                 jam: '07:30', ikon: 'makan',      urutan: 20, aktif: true, saran: [] },
  { key: 'mandipagi',  waktu: 'pagi',  nama: 'Mandi pagi',              jam: '08:30', ikon: 'mandi',      urutan: 30, aktif: true, saran: [] },
  { key: 'main',       waktu: 'siang', nama: 'Main bersama',            jam: '10:00', ikon: 'main',       urutan: 10, aktif: true, saran: [{ id: 'md-main-1', tipe: 'main', t: 'Tumpuk balok warna' }] },
  { key: 'makansiang', waktu: 'siang', nama: 'Makan siang',             jam: '12:00', ikon: 'sup',        urutan: 20, aktif: true, saran: [] },
  { key: 'tidursiang', waktu: 'siang', nama: 'Tidur siang',             jam: '13:00', ikon: 'tidurSiang', urutan: 30, aktif: true, saran: [] },
  { key: 'makanmalam', waktu: 'malam', nama: 'Makan malam',             jam: '18:00', ikon: 'sup',        urutan: 10, aktif: true, saran: [] },
  { key: 'beres',      waktu: 'malam', nama: 'Beres-beres',             jam: '18:45', ikon: 'beres',      urutan: 20, aktif: true, saran: [] },
  { key: 'tidur',      waktu: 'malam', nama: 'Rutinitas sebelum tidur', jam: '19:30', ikon: 'tidur',      urutan: 30, aktif: true, saran: [{ id: 'bk-tidur-1', tipe: 'buku', t: 'Baca buku bersama' }] },
];

/** Klasifikasi butir MATERI: string = template_key (rutin), { kapan } = situasional. */
export const KLASIFIKASI_MATERI: Record<string, string | { kapan: string }> = {
  'kb-001': 'bangun', 'kb-002': { kapan: 'saat bayi menangis' }, 'kb-003': 'mandipagi', 'kb-004': 'main', 'kb-005': { kapan: 'saat menggendong' },
  'kb-006': 'tidur', 'kb-007': 'main', 'kb-008': 'main', 'kb-009': { kapan: 'saat bayi mengoceh' }, 'kb-010': 'main',
  'kb-011': { kapan: 'saat keluarga saling menolong' }, 'kb-012': 'makanmalam', 'kb-013': 'main', 'kb-014': 'main', 'kb-015': 'main',
  'kb-016': { kapan: 'saat anak menunjuk sesuatu' }, 'kb-017': { kapan: 'saat anak memberi benda' }, 'kb-018': 'sarapan', 'kb-019': { kapan: 'saat di luar rumah' }, 'kb-020': 'main',
  'kb-021': { kapan: 'saat ada yang datang atau pergi' }, 'kb-022': 'beres', 'kb-023': { kapan: 'saat anak berbuat baik' }, 'kb-024': 'tidur', 'kb-025': { kapan: 'saat ada camilan' },
  'kb-026': { kapan: 'saat bertemu orang' }, 'kb-027': { kapan: 'saat perlu menunggu' }, 'kb-028': { kapan: 'di setiap interaksi' }, 'kb-029': 'beres', 'kb-030': 'mandipagi',
  'kb-031': 'tidur', 'kb-032': 'main', 'kb-033': 'main', 'kb-034': 'mandipagi', 'kb-035': { kapan: 'saat anak mengaku salah' },
  'kb-036': { kapan: 'saat anak kesal' }, 'kb-037': 'sarapan', 'kb-038': { kapan: 'saat di taman bermain' }, 'kb-039': 'makanmalam', 'kb-040': 'tidur',
  'kb-041': 'tidur', 'kb-042': { kapan: 'sepekan sekali' }, 'kb-043': 'main', 'kb-044': 'main', 'kb-045': { kapan: 'saat santai bersama' },
  'kb-046': 'main', 'kb-047': 'main', 'kb-048': 'main', 'kb-049': { kapan: 'sekali sepekan' }, 'kb-050': 'main',
  'kb-051': { kapan: 'saat ada kesempatan baru' }, 'kb-052': 'beres', 'kb-053': { kapan: 'saat ingin membeli sesuatu' }, 'kb-054': { kapan: 'saat ada kesempatan berbagi' }, 'kb-055': 'tidur',
  'kb-056': 'tidur', 'kb-057': { kapan: 'saat kumpul keluarga' },
};

type Baris = Omit<KebiasaanKatalog, 'status' | 'deskripsi' | 'usia_min_bulan' | 'usia_max_bulan'> & { deskripsi?: string; usia_min_bulan?: number; usia_max_bulan?: number };

const BAWAAN: Baris[] = [
  { id: 'kbd-bangun-1',  judul: 'Sapa hangat & kontak mata', nilai: ['Kasih Sayang'],   kategori: 'rutin', template_key: 'bangun',     kapan: null, urutan: 10 },
  { id: 'kbd-sarap-1',   judul: 'Cuci tangan sebelum makan', nilai: ['Kemandirian'],    kategori: 'rutin', template_key: 'sarapan',    kapan: null, urutan: 10 },
  { id: 'kbd-sarap-2',   judul: 'Ucap terima kasih',         nilai: ['Syukur'],         kategori: 'rutin', template_key: 'sarapan',    kapan: null, urutan: 20 },
  { id: 'kbd-mandi-1',   judul: 'Coba pakai baju sendiri',   nilai: ['Kemandirian'],    kategori: 'rutin', template_key: 'mandipagi',  kapan: null, urutan: 10 },
  { id: 'kbd-main-1',    judul: 'Bermain bergiliran',        nilai: ['Berbagi'],        kategori: 'rutin', template_key: 'main',       kapan: null, urutan: 10 },
  { id: 'kbd-main-2',    judul: 'Tunjukkan perasaan teman',  nilai: ['Empati'],         kategori: 'rutin', template_key: 'main',       kapan: null, urutan: 20 },
  { id: 'kbd-msiang-1',  judul: 'Makan sendiri',             nilai: ['Kemandirian'],    kategori: 'rutin', template_key: 'makansiang', kapan: null, urutan: 10 },
  { id: 'kbd-mmalam-1',  judul: 'Bantu siapkan meja',        nilai: ['Tanggung Jawab'], kategori: 'rutin', template_key: 'makanmalam', kapan: null, urutan: 10 },
  { id: 'kbd-beres-1',   judul: 'Rapikan mainan sendiri',    nilai: ['Tanggung Jawab'], kategori: 'rutin', template_key: 'beres',      kapan: null, urutan: 10 },
  { id: 'kbd-tidur-1',   judul: 'Sikat gigi sendiri',        nilai: ['Kemandirian'],    kategori: 'rutin', template_key: 'tidur',      kapan: null, urutan: 10 },
  { id: 'kbd-tidur-2',   judul: 'Cerita & doa',              nilai: ['Kasih Sayang'],   kategori: 'rutin', template_key: 'tidur',      kapan: null, urutan: 20 },
  { id: 'msh-001', judul: 'Peluk & sapa hangat saat bangun', deskripsi: 'Sambut anak dengan hangat begitu ia bangun.', nilai: ['Kasih Sayang'], kategori: 'rutin', template_key: 'bangun', kapan: null, urutan: 20 },
  { id: 'msh-002', judul: 'Tunjukkan perasaan orang lain', deskripsi: '"Lihat, temanmu sedih." — melatih membaca perasaan.', nilai: ['Empati'], kategori: 'situasional', template_key: null, kapan: 'saat bermain dengan teman', urutan: 20 },
  { id: 'msh-003', judul: 'Hargai saat ia bercerita apa adanya', deskripsi: 'Sambut cerita jujurnya dengan tenang.', nilai: ['Kejujuran'], kategori: 'situasional', template_key: null, kapan: 'saat anak bercerita', urutan: 20 },
  { id: 'msh-004', judul: 'Nikmati permainan sederhana bersama', deskripsi: 'Main dengan barang sederhana, tanpa perlu mainan mahal.', nilai: ['Kesederhanaan'], kategori: 'rutin', template_key: 'main', kapan: null, urutan: 30 },
  { id: 'msh-005', judul: 'Ceritakan apa yang sedang kalian lakukan', deskripsi: 'Narasikan aktivitas sehari-hari sebagai percakapan.', nilai: ['Cinta Ilmu'], kategori: 'situasional', template_key: null, kapan: 'saat beraktivitas bersama', urutan: 20 },
  { id: 'sit-1', judul: 'Tetap tenang saat anak rewel',  nilai: ['Sabar'],      kategori: 'situasional', template_key: null, kapan: 'saat rewel',          urutan: 10 },
  { id: 'sit-2', judul: 'Berbagi mainan saat ada teman', nilai: ['Berbagi'],    kategori: 'situasional', template_key: null, kapan: 'saat main dgn teman', urutan: 10 },
  { id: 'sit-3', judul: 'Minta maaf saat berbuat salah', nilai: ['Kejujuran'],  kategori: 'situasional', template_key: null, kapan: 'saat ada masalah',    urutan: 10 },
  { id: 'sit-4', judul: 'Berani coba hal baru',          nilai: ['Keberanian'], kategori: 'situasional', template_key: null, kapan: 'saat ragu',           urutan: 10 },
];

function bangunSeed(): KebiasaanKatalog[] {
  const out: KebiasaanKatalog[] = BAWAAN.map(b => ({
    deskripsi: '', usia_min_bulan: 0, usia_max_bulan: USIA_MAKS, status: 'tayang', ...b,
  } as KebiasaanKatalog));
  MATERI.forEach((band, i) => {
    const u = BAND_USIA[i];
    band.forEach(m => {
      if (!m.id || !u) return;
      const k = KLASIFIKASI_MATERI[m.id];
      const rutin = typeof k === 'string';
      out.push({
        id: m.id, judul: m.judul, deskripsi: m.deskripsi, nilai: m.nilai as NilaiAkar[],
        usia_min_bulan: u.min, usia_max_bulan: u.max,
        kategori: rutin ? 'rutin' : 'situasional',
        template_key: rutin ? (k as string) : null,
        kapan: rutin ? null : (k as { kapan: string } | undefined)?.kapan ?? 'kapan saja',
        urutan: 100 + Number(m.id.slice(3)),
        status: 'tayang',
      });
    });
  });
  return out;
}

export const KEBIASAAN_SEED: KebiasaanKatalog[] = bangunSeed();
