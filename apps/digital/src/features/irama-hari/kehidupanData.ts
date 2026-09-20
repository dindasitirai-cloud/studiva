// =============================================================
// kehidupanData — sumber tunggal data "Kehidupan Keluarga" (Phase 15C · Tahap inti).
// Kelola = context engine: orang tua mencatat "yang sedang berubah" di keluarga,
// lalu Rekah menyesuaikan saran berdasarkan konteks itu (mesin adaptasi sederhana,
// aturan app-layer). localStorage per anak; Supabase menyusul.
//
// INVARIANT: tanpa skor/level/persen; tanpa diagnosis/defisit; konteks anak =
// observasi lembut; "sudah tenang" (bukan "selesai"); AI diberi label.
// SEMUA copy user-facing = DRAFT → tinjauan Psikolog Fitri Effendy.
// =============================================================
import { useMemo, useState } from 'react';

export type BidangKehidupan = 'anak' | 'caregiver' | 'rumah' | 'peristiwa';
export type StatusKonteks = 'aktif' | 'membaik' | 'tenang';
export type SejakKapan = 'baru' | 'beberapa_minggu' | 'lama';
export type TagPenyesuaian =
  | 'tidur'            // tidur belum stabil
  | 'energi_caregiver'// energi/kapasitas pengasuh terbatas
  | 'kembali_kerja'   // caregiver kembali bekerja / waktu bersama berubah
  | 'transisi'        // perpindahan aktivitas sulit (mandi, berhenti main, dll.)
  | 'kurang_nyaman'   // anak sedang kurang nyaman (tumbuh gigi / baru pulih) — OBSERVASI, bukan diagnosis
  | 'perubahan_ritme' // ritme keluarga berubah sementara (nenek pergi, pindah, tamu)
  | 'lainnya';        // dicatat saja, tanpa penyesuaian otomatis

export interface KonteksKehidupan {
  id: string;
  bidang: BidangKehidupan;
  judul: string;
  catatan?: string;
  sejak: SejakKapan;
  tag: TagPenyesuaian;
  status: StatusKonteks;
  dibuat: string; // ISO
}

// ─── Peta tampilan bidang (Langit Peony) ──────────────────────────────────────

export const BIDANG: Record<BidangKehidupan, { label: string; bar: string; tile: string; ink: string }> = {
  anak:      { label: 'Anak',      bar: '#F06BA8', tile: '#FCE4EE', ink: '#C6407F' },
  caregiver: { label: 'Caregiver', bar: '#7A5CA6', tile: '#EFE9FB', ink: '#7A5CA6' },
  rumah:     { label: 'Rumah',     bar: '#E0A93C', tile: '#FBF0D8', ink: '#B4831F' },
  peristiwa: { label: 'Peristiwa', bar: '#5F84E6', tile: '#EAF2FF', ink: '#3F6FD8' },
};

export const SEJAK_LABEL: Record<SejakKapan, string> = {
  baru: 'baru minggu ini',
  beberapa_minggu: 'sekitar beberapa minggu',
  lama: 'sudah cukup lama',
};

export const STATUS_LABEL: Record<StatusKonteks, string> = {
  aktif: 'Sedang berlangsung',
  membaik: 'Mulai membaik',
  tenang: 'Sudah tenang',
};

// ─── Peta copy DRAFT per tag (why 3-layer + baris panel penyesuaian) ──────────
// Rujukan hanya dari daftar approved (WHO Nurturing Care, CDC, AAP, IDAI,
// Kemenkes) dan TETAP ditandai DRAFT sampai disetujui Fitri.

export interface CopyTag {
  label: string;
  lakukan: string;   // "Yang Rekah lakukan"
  kenapa: string;    // "Kenapa"
  rujukan: string;   // "Rujukan" (DRAFT)
  baris: string;     // kalimat untuk panel "Bagaimana Rekah menyesuaikan"
}

export const COPY_TAG: Record<TagPenyesuaian, CopyTag> = {
  tidur: {
    label: 'Tidur belum stabil',
    lakukan: 'Langkah harian dibuat singkat (3–5 menit) dan lebih banyak diselipkan ke rutinitas, bukan aktivitas terjadwal.',
    kenapa: 'Saat tidur belum cukup, anak dan pengasuh punya energi terbatas. Langkah kecil yang berulang lebih mungkin dijalani daripada rencana besar.',
    rujukan: 'WHO Nurturing Care · IDAI — rutinitas tidur yang menenangkan (DRAFT · menunggu tinjauan Psikolog Fitri).',
    baris: 'Langkah dibuat singkat (3–5 menit) dan lebih banyak diselipkan ke rutinitas.',
  },
  energi_caregiver: {
    label: 'Energi pengasuh terbatas',
    lakukan: 'Saran dikurangi dan difokuskan; ditaruh di momen yang sudah pasti kalian lewati.',
    kenapa: 'Ketika kapasitas terbatas, sedikit langkah yang benar-benar terjadi lebih berarti daripada banyak rencana yang membebani.',
    rujukan: 'WHO Nurturing Care — responsive caregiving (DRAFT · menunggu tinjauan Psikolog Fitri).',
    baris: 'Saran dibuat lebih sedikit dan fokus, menyesuaikan energi yang ada.',
  },
  kembali_kerja: {
    label: 'Waktu bersama berubah',
    lakukan: 'Saran diprioritaskan pada momen yang pasti ada: menyambut pagi, mandi, dan menjelang tidur.',
    kenapa: 'Kualitas kehadiran di momen kecil lebih penting daripada banyaknya waktu. Rekah menaruh langkah di titik yang sudah pasti kalian lalui bersama.',
    rujukan: 'WHO Nurturing Care — responsive caregiving (DRAFT · menunggu tinjauan Psikolog Fitri).',
    baris: 'Momen sandaran diarahkan ke pagi & menjelang tidur, saat kalian pasti bersama.',
  },
  transisi: {
    label: 'Perpindahan aktivitas sulit',
    lakukan: 'Fokus nilai keluarga dititipkan ke momen transisi — memberi anak pilihan kecil sebagai kesempatan lembut, bukan tugas.',
    kenapa: 'Perpindahan lebih mulus saat anak merasa punya kendali. Pilihan terbatas menumbuhkan otonomi tanpa membuat kewalahan.',
    rujukan: 'CDC · AAP — smooth transitions & autonomy support (DRAFT · menunggu tinjauan Psikolog Fitri).',
    baris: 'Fokus keluarga dititipkan ke momen transisi sebagai kesempatan lembut.',
  },
  kurang_nyaman: {
    label: 'Anak sedang kurang nyaman',
    lakukan: 'Langkah dibuat lebih ringan dan menenangkan; aktivitas yang menuntut dikurangi sementara.',
    kenapa: 'Saat tubuhnya sedang tidak nyaman, anak butuh rasa aman lebih dulu. Hal bernuansa kesehatan sebaiknya dibicarakan dengan tenaga profesional.',
    rujukan: 'IDAI · Kemenkes — kenyamanan anak (DRAFT · menunggu tinjauan Psikolog Fitri).',
    baris: 'Langkah dibuat lebih ringan & menenangkan sementara ini.',
  },
  perubahan_ritme: {
    label: 'Ritme keluarga berubah',
    lakukan: 'Saran menyesuaikan ritme sementara; hal-hal yang menenangkan dijaga tetap ada meski jadwal berubah.',
    kenapa: 'Perubahan sementara lebih mudah dilalui bila hal yang menenangkan tetap hadir sebagai jangkar.',
    rujukan: 'WHO Nurturing Care — konsistensi & rasa aman (DRAFT · menunggu tinjauan Psikolog Fitri).',
    baris: 'Ritme saran menyesuaikan perubahan, menjaga hal yang menenangkan tetap ada.',
  },
  lainnya: {
    label: 'Hal lain',
    lakukan: 'Dicatat sebagai konteks keluarga. Belum ada penyesuaian otomatis untuk hal ini.',
    kenapa: 'Rekah menyimpannya agar kamu punya gambaran utuh keadaan keluarga, meski belum mengubah saran.',
    rujukan: '—',
    baris: '',
  },
};

// Pilihan tag yang wajar per bidang (untuk form Tambah/Perbarui).
export const TAG_PER_BIDANG: Record<BidangKehidupan, TagPenyesuaian[]> = {
  anak: ['tidur', 'transisi', 'kurang_nyaman', 'lainnya'],
  caregiver: ['energi_caregiver', 'kembali_kerja', 'lainnya'],
  rumah: ['perubahan_ritme', 'lainnya'],
  peristiwa: ['perubahan_ritme', 'kurang_nyaman', 'lainnya'],
};

// ─── SEED contoh (DRAFT) — muncul di run pertama; bisa diubah/dihapus penuh ────

const SEED: KonteksKehidupan[] = [
  { id: 'k-seed-1', bidang: 'anak', judul: 'Tidur malam belum stabil', catatan: 'Sering terbangun, butuh waktu lebih untuk tenang kembali.', sejak: 'beberapa_minggu', tag: 'tidur', status: 'aktif', dibuat: '2026-01-01T00:00:00.000Z' },
  { id: 'k-seed-2', bidang: 'caregiver', judul: 'Bunda kembali bekerja', catatan: 'Waktu bersama lebih terbatas di pagi & sore.', sejak: 'beberapa_minggu', tag: 'kembali_kerja', status: 'aktif', dibuat: '2026-01-01T00:00:00.000Z' },
];

// ─── Store localStorage per anak ──────────────────────────────────────────────

function baca(kunci: string): KonteksKehidupan[] {
  try {
    const raw = localStorage.getItem(kunci);
    if (raw) {
      const p = JSON.parse(raw) as { items?: KonteksKehidupan[] };
      if (Array.isArray(p.items)) return p.items;
    }
  } catch { /* abaikan */ }
  return SEED; // run pertama
}

export interface KehidupanStore {
  semua: KonteksKehidupan[];
  aktif: KonteksKehidupan[];   // status !== 'tenang' → tampil di daftar utama
  tenang: KonteksKehidupan[];  // dirapikan (riwayat)
  tambah: (data: Omit<KonteksKehidupan, 'id' | 'dibuat' | 'status'> & { status?: StatusKonteks }) => void;
  perbarui: (id: string, patch: Partial<Omit<KonteksKehidupan, 'id' | 'dibuat'>>) => void;
  setStatus: (id: string, status: StatusKonteks) => void;
  hapus: (id: string) => void;
}

export function useKehidupanStore(idAnak: string): KehidupanStore {
  const kunci = `rekah_kehidupan_${idAnak}`;
  const awal = useMemo(() => baca(kunci), [kunci]);
  const [items, setItems] = useState<KonteksKehidupan[]>(awal);

  const simpan = (arr: KonteksKehidupan[]) => {
    setItems(arr);
    try { localStorage.setItem(kunci, JSON.stringify({ items: arr })); } catch { /* abaikan */ }
  };

  const tambah: KehidupanStore['tambah'] = (data) => {
    const judul = data.judul.trim();
    if (!judul) return;
    const it: KonteksKehidupan = {
      id: `k-${Date.now().toString(36)}`,
      bidang: data.bidang,
      judul,
      catatan: data.catatan?.trim() || undefined,
      sejak: data.sejak,
      tag: data.tag,
      status: data.status ?? 'aktif',
      dibuat: new Date().toISOString(),
    };
    simpan([it, ...items]);
  };

  const perbarui: KehidupanStore['perbarui'] = (id, patch) => {
    simpan(items.map(it => (it.id === id ? { ...it, ...patch, judul: (patch.judul ?? it.judul).trim() } : it)));
  };

  const setStatus: KehidupanStore['setStatus'] = (id, status) => {
    simpan(items.map(it => (it.id === id ? { ...it, status } : it)));
  };

  const hapus: KehidupanStore['hapus'] = (id) => {
    simpan(items.filter(it => it.id !== id));
  };

  const aktif = items.filter(it => it.status !== 'tenang');
  const tenang = items.filter(it => it.status === 'tenang');
  return { semua: items, aktif, tenang, tambah, perbarui, setStatus, hapus };
}

// ─── Mesin adaptasi sederhana (aturan app-layer, DRAFT) ───────────────────────

export interface BarisPenyesuaian { tag: TagPenyesuaian; baris: string }

/** Dari konteks aktif → daftar baris penyesuaian unik (dedup per tag). */
export function ringkasPenyesuaian(aktif: KonteksKehidupan[]): BarisPenyesuaian[] {
  const seen = new Set<TagPenyesuaian>();
  const out: BarisPenyesuaian[] = [];
  for (const k of aktif) {
    const baris = COPY_TAG[k.tag]?.baris;
    if (!baris || seen.has(k.tag)) continue;
    seen.add(k.tag);
    out.push({ tag: k.tag, baris });
  }
  return out;
}

/** Kalimat "Keadaan keluarga sekarang" (DRAFT, berlabel AI di UI). */
export function kalimatKeadaan(aktif: KonteksKehidupan[], nama: string): string {
  if (aktif.length === 0) {
    return `Rekah belum tahu banyak tentang keadaan keluarga ${nama} saat ini. Ceritakan satu hal yang sedang berubah, agar saran terasa lebih pas.`;
  }
  const judul = aktif.slice(0, 2).map(k => k.judul.toLowerCase());
  const daftar = judul.length === 1 ? judul[0] : `${judul[0]} dan ${judul[1]}`;
  const sisa = aktif.length - judul.length;
  const ekor = sisa > 0 ? `, di antara hal lain,` : '';
  return `Beberapa waktu ini${ekor} keluarga ${nama} sedang melewati ${daftar}. Rekah membuat langkah tetap ringan dan menyesuaikan sarannya.`;
}

// ─── Parameter penyesuaian (untuk wiring ke Hari Ini / Rencana — TODO) ─────────

export interface ParameterPenyesuaian {
  langkahPendek: boolean;      // dorong langkah 3–5 menit
  utamakanEmbedding: boolean;  // selipkan ke rutinitas > aktivitas terjadwal
  kurangiJumlah: boolean;      // tampilkan lebih sedikit saran
  momenPagiMalam: boolean;     // prioritaskan momen pagi & menjelang tidur
  aktifTag: TagPenyesuaian[];
}

/** Selector parameter penyesuaian dari konteks aktif.
 *  TODO(wiring): dibaca oleh Hari Ini & Rencana Minggu untuk menyetir kurasi.
 *  Tahap inti hanya MENAMPILKAN penyesuaian (panel); belum menyetir kurasi. */
export function useParameterPenyesuaian(idAnak: string): ParameterPenyesuaian {
  const { aktif } = useKehidupanStore(idAnak);
  const tags = new Set(aktif.map(k => k.tag));
  return {
    langkahPendek: tags.has('tidur') || tags.has('energi_caregiver') || tags.has('kurang_nyaman'),
    utamakanEmbedding: tags.has('tidur') || tags.has('kembali_kerja'),
    kurangiJumlah: tags.has('energi_caregiver'),
    momenPagiMalam: tags.has('kembali_kerja'),
    aktifTag: [...tags],
  };
}

/** Ringkasan pendek penyesuaian untuk banner/chip di Hari Ini (DRAFT).
 *  Mengembalikan null bila tak ada konteks aktif → Hari Ini tampil normal. */
export function catatanPenyesuaianRingkas(p: ParameterPenyesuaian): string | null {
  const bits: string[] = [];
  if (p.langkahPendek) bits.push('dibuat lebih singkat & ringan');
  if (p.utamakanEmbedding) bits.push('diselipkan ke rutinitas');
  if (p.momenPagiMalam) bits.push('difokuskan ke pagi & menjelang tidur');
  if (p.kurangiJumlah) bits.push('dibuat lebih sedikit & fokus');
  if (bits.length === 0) return null;
  return bits.slice(0, 2).join(' · ');
}

// ─── Peta bidang: fakta editable per bidang (Anak/Caregiver/Rumah) — 3C-b ─────

export type BidangPeta = 'anak' | 'caregiver' | 'rumah';
export interface FaktaBidang { id: string; bidang: BidangPeta; k: string; v: string }

const BIDANG_SEED: FaktaBidang[] = [
  { id: 'f-anak-1', bidang: 'anak', k: 'Pola tidur', v: 'Sedang berubah — sering terbangun' },
  { id: 'f-anak-2', bidang: 'anak', k: 'Makan / MPASI', v: 'Lahap, suka makan sendiri' },
  { id: 'f-anak-3', bidang: 'anak', k: 'Suasana akhir-akhir ini', v: 'Ceria, mudah penasaran' },
  { id: 'f-care-1', bidang: 'caregiver', k: 'Bunda', v: 'Kembali bekerja · hadir pagi & malam' },
  { id: 'f-care-2', bidang: 'caregiver', k: 'Ayah', v: 'Jam kerja 9–5 · aktif akhir pekan' },
  { id: 'f-care-3', bidang: 'caregiver', k: 'Nenek', v: 'Menemani siang hari' },
  { id: 'f-rumah-1', bidang: 'rumah', k: 'Jam paling sibuk', v: 'Pagi 06–08 & sore 17–19' },
  { id: 'f-rumah-2', bidang: 'rumah', k: 'Ruang main', v: 'Sudah aman untuk dijelajah' },
];

export interface BidangStore {
  fakta: (b: BidangPeta) => FaktaBidang[];
  tambah: (b: BidangPeta, k: string, v: string) => void;
  ubah: (id: string, patch: Partial<Pick<FaktaBidang, 'k' | 'v'>>) => void;
  hapus: (id: string) => void;
}

export function useBidangStore(idAnak: string): BidangStore {
  const kunci = `rekah_kehidupan_bidang_${idAnak}`;
  const awal = useMemo<FaktaBidang[]>(() => {
    try {
      const raw = localStorage.getItem(kunci);
      if (raw) { const p = JSON.parse(raw) as { items?: FaktaBidang[] }; if (Array.isArray(p.items)) return p.items; }
    } catch { /* abaikan */ }
    return BIDANG_SEED;
  }, [kunci]);
  const [items, setItems] = useState<FaktaBidang[]>(awal);
  const simpan = (arr: FaktaBidang[]) => {
    setItems(arr);
    try { localStorage.setItem(kunci, JSON.stringify({ items: arr })); } catch { /* abaikan */ }
  };
  return {
    fakta: (b) => items.filter(f => f.bidang === b),
    tambah: (b, k, v) => {
      const kk = k.trim(); const vv = v.trim(); if (!kk || !vv) return;
      simpan([...items, { id: `f-${Date.now().toString(36)}`, bidang: b, k: kk, v: vv }]);
    },
    ubah: (id, patch) => simpan(items.map(f => (f.id === id ? { ...f, ...patch } : f))),
    hapus: (id) => simpan(items.filter(f => f.id !== id)),
  };
}

// ─── Cara kita mengasuh (multi-caregiver) — 3C-c ──────────────────────────────

export type SiapaPengasuh = 'bunda' | 'ayah' | 'nenek' | 'pengasuh';
export const SIAPA_LABEL: Record<SiapaPengasuh, string> = { bunda: 'Bunda', ayah: 'Ayah', nenek: 'Nenek', pengasuh: 'Pengasuh' };
export const SIAPA_WARNA: Record<SiapaPengasuh, { tile: string; ink: string }> = {
  bunda: { tile: '#FBE7EC', ink: '#C6407F' },
  ayah: { tile: '#EAF2FF', ink: '#3F6FD8' },
  nenek: { tile: '#FBF0D8', ink: '#B4831F' },
  pengasuh: { tile: '#E7F2E4', ink: '#4F7A48' },
};

export interface CaraMengasuh { id: string; siapa: SiapaPengasuh; teks: string; dibagikan: boolean }

const CARA_SEED: CaraMengasuh[] = [
  { id: 'c-seed-1', siapa: 'nenek', teks: 'Beri kesempatan mencoba sendiri dulu sebelum dibantu.', dibagikan: true },
  { id: 'c-seed-2', siapa: 'ayah', teks: 'Saat transisi mandi, tawarkan 2 pilihan kecil dulu (mainan air / lagu).', dibagikan: true },
];

export interface CaraStore {
  items: CaraMengasuh[];
  tambah: (siapa: SiapaPengasuh, teks: string, dibagikan: boolean) => void;
  ubah: (id: string, patch: Partial<Pick<CaraMengasuh, 'siapa' | 'teks' | 'dibagikan'>>) => void;
  hapus: (id: string) => void;
}

export function useCaraStore(idAnak: string): CaraStore {
  const kunci = `rekah_cara_mengasuh_${idAnak}`;
  const awal = useMemo<CaraMengasuh[]>(() => {
    try { const raw = localStorage.getItem(kunci); if (raw) { const p = JSON.parse(raw) as { items?: CaraMengasuh[] }; if (Array.isArray(p.items)) return p.items; } } catch { /* abaikan */ }
    return CARA_SEED;
  }, [kunci]);
  const [items, setItems] = useState<CaraMengasuh[]>(awal);
  const simpan = (arr: CaraMengasuh[]) => { setItems(arr); try { localStorage.setItem(kunci, JSON.stringify({ items: arr })); } catch { /* abaikan */ } };
  return {
    items,
    tambah: (siapa, teks, dibagikan) => { const t = teks.trim(); if (!t) return; simpan([{ id: `c-${Date.now().toString(36)}`, siapa, teks: t, dibagikan }, ...items]); },
    ubah: (id, patch) => simpan(items.map(c => (c.id === id ? { ...c, ...patch, teks: (patch.teks ?? c.teks).trim() } : c))),
    hapus: (id) => simpan(items.filter(c => c.id !== id)),
  };
}

// ─── Peristiwa mendatang — 3C-c ───────────────────────────────────────────────

export type JenisPeristiwa = 'kesehatan' | 'keluarga' | 'ritme';
export const JENIS_LABEL: Record<JenisPeristiwa, string> = { kesehatan: 'Kesehatan', keluarga: 'Keluarga', ritme: 'Perubahan ritme' };
export const JENIS_WARNA: Record<JenisPeristiwa, { tile: string; ink: string }> = {
  kesehatan: { tile: '#E7F2E4', ink: '#4F7A48' },
  keluarga: { tile: '#FBE7EC', ink: '#C6407F' },
  ritme: { tile: '#EAF2FF', ink: '#3F6FD8' },
};

export interface Peristiwa { id: string; judul: string; tanggal: string; jenis: JenisPeristiwa }

const PERISTIWA_SEED: Peristiwa[] = [
  { id: 'p-seed-1', judul: 'Imunisasi lanjutan', tanggal: '2026-09-24', jenis: 'kesehatan' },
  { id: 'p-seed-2', judul: 'Nenek pulang kampung 5 hari', tanggal: '2026-09-28', jenis: 'ritme' },
];

export interface PeristiwaStore {
  items: Peristiwa[]; // terurut naik berdasarkan tanggal
  tambah: (judul: string, tanggal: string, jenis: JenisPeristiwa) => void;
  hapus: (id: string) => void;
}

export function usePeristiwaStore(idAnak: string): PeristiwaStore {
  const kunci = `rekah_peristiwa_${idAnak}`;
  const awal = useMemo<Peristiwa[]>(() => {
    try { const raw = localStorage.getItem(kunci); if (raw) { const p = JSON.parse(raw) as { items?: Peristiwa[] }; if (Array.isArray(p.items)) return p.items; } } catch { /* abaikan */ }
    return PERISTIWA_SEED;
  }, [kunci]);
  const [items, setItems] = useState<Peristiwa[]>(awal);
  const simpan = (arr: Peristiwa[]) => { setItems(arr); try { localStorage.setItem(kunci, JSON.stringify({ items: arr })); } catch { /* abaikan */ } };
  const urut = (arr: Peristiwa[]) => [...arr].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  return {
    items: urut(items),
    tambah: (judul, tanggal, jenis) => { const j = judul.trim(); if (!j || !tanggal) return; simpan([...items, { id: `p-${Date.now().toString(36)}`, judul: j, tanggal, jenis }]); },
    hapus: (id) => simpan(items.filter(p => p.id !== id)),
  };
}
