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

const SEED: KonteksKehidupan[] = []; // pengguna baru mulai kosong

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
  ganti: (arr: KonteksKehidupan[]) => void;
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

  const ganti = (arr: KonteksKehidupan[]) => simpan(arr);

  const aktif = items.filter(it => it.status !== 'tenang');
  const tenang = items.filter(it => it.status === 'tenang');
  return { semua: items, aktif, tenang, tambah, perbarui, setStatus, hapus, ganti };
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

/** Penyesuaian gabungan: konteks "yang sedang berubah" + jawaban Peta (Phase 29 fix). */
export function penyesuaianGabung(aktif: KonteksKehidupan[], jawaban: Record<string, string[]>): BarisPenyesuaian[] {
  const seen = new Set<TagPenyesuaian>();
  const out: BarisPenyesuaian[] = [];
  const tags: TagPenyesuaian[] = [...aktif.map(k => k.tag), ...tagsDariPeta(jawaban)];
  for (const t of tags) {
    const baris = COPY_TAG[t]?.baris;
    if (!baris || seen.has(t)) continue;
    seen.add(t);
    out.push({ tag: t, baris });
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
  const peta = usePetaStore(idAnak);
  const tags = new Set<TagPenyesuaian>([...aktif.map(k => k.tag), ...tagsDariPeta(peta.jawaban)]);
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

// ─── A1 (Phase 26): satu langkah konkret hari ini dari konteks aktif (DRAFT → Fitri) ──
export interface LangkahHariIni { tag: TagPenyesuaian; judul: string; detail: string; slot: 'pagi' | 'siang' | 'malam'; kegKey: string }
const LANGKAH_COPY: Partial<Record<TagPenyesuaian, { judul: string; detail: string }>> = {
  tidur:            { judul: 'Coba rutinitas tidur 3 langkah malam ini.', detail: 'Redupkan lampu, satu lagu, satu cerita. Cukup itu — tidak perlu sempurna.' },
  energi_caregiver: { judul: 'Ambil satu kegiatan 5 menit saja hari ini.', detail: 'Memilih yang kecil bukan menyerah — itu sudah cukup hari ini.' },
  kembali_kerja:    { judul: 'Titipkan satu momen kecil sebelum berangkat.', detail: 'Sarapan bersama atau pelukan singkat sudah berarti bagi anak.' },
  kurang_nyaman:    { judul: 'Pilih kegiatan tenang hari ini; tunda yang menantang.', detail: 'Saat anak kurang nyaman, dekat dan tenang lebih menolong.' },
  transisi:         { judul: 'Beri aba-aba sebelum pindah kegiatan.', detail: 'Mis. "dua menit lagi ya" membantu perpindahan terasa lebih mulus.' },
  perubahan_ritme:  { judul: 'Jaga satu hal tetap sama hari ini.', detail: 'Mis. jam tidur yang sama membantu anak merasa aman saat ritme berubah.' },
};
const LANGKAH_PRIORITAS: TagPenyesuaian[] = ['tidur', 'energi_caregiver', 'kembali_kerja', 'kurang_nyaman', 'transisi', 'perubahan_ritme'];
// Klasifikasi langkah → slot waktu + kegiatan tujuan (key template Irama) tempat to-do ditempel.
const LANGKAH_TUJUAN: Record<TagPenyesuaian, { slot: 'pagi' | 'siang' | 'malam'; kegKey: string }> = {
  tidur:            { slot: 'malam', kegKey: 'tidur' },      // Rutinitas sebelum tidur
  perubahan_ritme:  { slot: 'malam', kegKey: 'tidur' },      // jaga jam tidur tetap sama
  kembali_kerja:    { slot: 'pagi',  kegKey: 'sarapan' },    // momen kecil sebelum berangkat
  kurang_nyaman:    { slot: 'siang', kegKey: 'main' },       // pilih kegiatan tenang saat main
  transisi:         { slot: 'siang', kegKey: 'main' },       // aba-aba saat perpindahan main
  energi_caregiver: { slot: 'siang', kegKey: 'main' },       // satu kegiatan 5 menit
  lainnya:          { slot: 'siang', kegKey: 'main' },
};
/** Satu langkah konkret opsional dari tag aktif paling menonjol; null bila tak ada. */
export function langkahHariIni(tags: readonly TagPenyesuaian[], rowsDb?: readonly { kunci: string; judul: string; detail?: string | null }[]): LangkahHariIni | null {
  const set = new Set(tags);
  for (const t of LANGKAH_PRIORITAS) {
    const c = LANGKAH_COPY[t];
    if (c && set.has(t)) {
      const db = rowsDb?.find(r => r.kunci === t);
      const tuj = LANGKAH_TUJUAN[t];
      return { tag: t, judul: db?.judul ?? c.judul, detail: db?.detail ?? c.detail, slot: tuj.slot, kegKey: tuj.kegKey };
    }
  }
  return null;
}

// ─── Peta bidang: fakta editable per bidang (Anak/Caregiver/Rumah) — 3C-b ─────

export type BidangPeta = 'anak' | 'caregiver' | 'rumah';
export interface FaktaBidang { id: string; bidang: BidangPeta; k: string; v: string }

const BIDANG_SEED: FaktaBidang[] = []; // pengguna baru mulai kosong (tahap usia dari profil, nilai fokus dari Akar)

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

const CARA_SEED: CaraMengasuh[] = []; // pengguna baru mulai kosong

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

export type SlotHari = 'pagi' | 'siang' | 'malam';
export const SLOT_LABEL: Record<SlotHari, string> = { pagi: 'Pagi', siang: 'Siang', malam: 'Malam' };

export interface Peristiwa { id: string; judul: string; tanggal: string; jenis: JenisPeristiwa; waktu?: string; slot?: SlotHari; sumber?: 'user' | 'kia' }

const PERISTIWA_SEED: Peristiwa[] = []; // pengguna baru mulai kosong (jadwal imunisasi dari Buku KIA menyusul)

export interface PeristiwaStore {
  items: Peristiwa[]; // terurut naik berdasarkan tanggal
  tambah: (judul: string, tanggal: string, jenis: JenisPeristiwa, opts?: { waktu?: string; slot?: SlotHari }) => void;
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
    tambah: (judul, tanggal, jenis, opts) => { const j = judul.trim(); if (!j || !tanggal) return; simpan([...items, { id: `p-${Date.now().toString(36)}`, judul: j, tanggal, jenis, waktu: opts?.waktu, slot: opts?.slot, sumber: 'user' }]); },
    hapus: (id) => simpan(items.filter(p => p.id !== id)),
  };
}


// ─── Imunisasi — jadwal Buku KIA (DRAFT; tinjauan Fitri / tenaga kesehatan) ───
// Dihitung dari tanggal lahir anak. Konten jadwal mengikuti pedoman Buku KIA /
// Kemenkes (imunisasi dasar + lanjutan) dan TETAP DRAFT sampai disetujui.

export interface ButirKIA { key: string; bln: number; label: string }
export const JADWAL_KIA: ButirKIA[] = [
  { key: 'hb0',   bln: 0,  label: 'Hepatitis B (HB-0)' },
  { key: 'bcg',   bln: 1,  label: 'BCG + Polio tetes 1' },
  { key: 'bln2',  bln: 2,  label: 'DPT-HB-Hib 1 + Polio 2 + PCV 1 + Rotavirus 1' },
  { key: 'bln3',  bln: 3,  label: 'DPT-HB-Hib 2 + Polio 3 + PCV 2 + Rotavirus 2' },
  { key: 'bln4',  bln: 4,  label: 'DPT-HB-Hib 3 + Polio 4 + IPV 1 + Rotavirus 3' },
  { key: 'bln9',  bln: 9,  label: 'Campak-Rubela 1 + IPV 2' },
  { key: 'bln12', bln: 12, label: 'PCV 3' },
  { key: 'bln18', bln: 18, label: 'DPT-HB-Hib lanjutan + Campak-Rubela 2' },
];

export interface ImunisasiItem { key: string; bln: number; label: string; due: string }

function tambahBulan(d: Date, m: number): Date { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; }
const isoTgl = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Jadwal imunisasi dari tanggal lahir; tampilkan butir sekitar usia kini & ke depan. */
export function jadwalImunisasi(tanggalLahir: string | null, usiaBulan: number | null): ImunisasiItem[] {
  if (!tanggalLahir) return [];
  const dob = new Date(tanggalLahir + 'T00:00:00');
  if (isNaN(dob.getTime())) return [];
  const minBln = (usiaBulan ?? 0) - 1;
  return JADWAL_KIA.filter(k => k.bln >= minBln).map(k => ({ key: k.key, bln: k.bln, label: k.label, due: isoTgl(tambahBulan(dob, k.bln)) }));
}

export interface ImunisasiJadwal { tgl: string; waktu?: string; slot?: SlotHari }
export interface ImunisasiStore {
  jadwal: Record<string, ImunisasiJadwal>;
  konfirmasi: (key: string, v: ImunisasiJadwal) => void;
  batal: (key: string) => void;
}

export function useImunisasiStore(idAnak: string): ImunisasiStore {
  const kunci = `rekah_imunisasi_${idAnak}`;
  const awal = useMemo<Record<string, ImunisasiJadwal>>(() => {
    try { const raw = localStorage.getItem(kunci); if (raw) { const p = JSON.parse(raw) as { jadwal?: Record<string, ImunisasiJadwal> }; if (p.jadwal) return p.jadwal; } } catch { /* abaikan */ }
    return {};
  }, [kunci]);
  const [jadwal, setJadwal] = useState<Record<string, ImunisasiJadwal>>(awal);
  const simpan = (j: Record<string, ImunisasiJadwal>) => { setJadwal(j); try { localStorage.setItem(kunci, JSON.stringify({ jadwal: j })); } catch { /* abaikan */ } };
  return {
    jadwal,
    konfirmasi: (key, v) => simpan({ ...jadwal, [key]: v }),
    batal: (key) => { const n = { ...jadwal }; delete n[key]; simpan(n); },
  };
}

/** Selisih hari (bulat) dari hari ini ke tanggal ISO. */
export function selisihHari(tglISO: string, hariIni: Date): number {
  const d = new Date(tglISO + 'T00:00:00');
  return Math.round((d.getTime() - new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate()).getTime()) / 86400000);
}

/** Imunisasi yang jatuh tempo (<= ambangHari) & belum dijadwalkan — untuk reminder. */
export function imunisasiJatuhTempo(
  tanggalLahir: string | null, usiaBulan: number | null,
  jadwal: Record<string, ImunisasiJadwal>, hariIni: Date, ambangHari = 14,
): ImunisasiItem[] {
  return jadwalImunisasi(tanggalLahir, usiaBulan)
    .filter(x => !jadwal[x.key])
    .filter(x => selisihHari(x.due, hariIni) <= ambangHari)
    .sort((a, b) => a.due.localeCompare(b.due));
}


// ─── Peta Kehidupan Keluarga berbasis pilihan (adaptif usia) — Phase 24 ───────
// Rekah bertanya; jawaban = pilihan. Sebagian memicu tag penyesuaian
// (tagsDariPeta → papan Hari Ini) & membuka lembar khusus (nifas/piring).
// Copy & isi medis DRAFT → Fitri / tenaga kesehatan.

export type BandPeta = 'bayi' | 'batita' | 'pra';
export function bandPeta(usiaBulan: number | null): BandPeta {
  if (usiaBulan == null) return 'batita';
  if (usiaBulan < 12) return 'bayi';
  if (usiaBulan < 36) return 'batita';
  return 'pra';
}

export interface PetaOpsi { v: string; tag?: TagPenyesuaian; unlock?: 'nifas' | 'piring' }
export interface PetaPertanyaan {
  id: string; bidang: BidangPeta; band: 'all' | BandPeta;
  teks: string; multi?: boolean; inbox?: boolean; sensitif?: boolean; baru?: boolean;
  opsi: PetaOpsi[];
}
const o = (v: string, extra?: Partial<PetaOpsi>): PetaOpsi => ({ v, ...extra });

export const PETA_PERTANYAAN: PetaPertanyaan[] = [
  // Anak — umum
  { id: 'a_suasana', bidang: 'anak', band: 'all', multi: true, teks: 'Watak/temperamennya?', opsi: [o('Ceria'), o('Penasaran'), o('Pemalu'), o('Tenang'), o('Aktif sekali')] },
  { id: 'a_tenang', bidang: 'anak', band: 'all', multi: true, teks: 'Paling menenangkan saat rewel?', opsi: [o('Digendong'), o('Disusui'), o('Dinyanyikan'), o('Diajak bicara'), o('Waktu tenang')] },
  { id: 'a_alergi', bidang: 'anak', band: 'all', multi: true, baru: true, teks: 'Ada alergi / pantangan makanan?', opsi: [o('Tidak ada'), o('Susu sapi'), o('Telur'), o('Kacang'), o('Seafood'), o('Lainnya')] },
  { id: 'a_saudara', bidang: 'anak', band: 'all', baru: true, teks: 'Posisi di keluarga?', opsi: [o('Anak tunggal'), o('Punya kakak'), o('Punya adik'), o('Kembar'), o('Akan punya adik')] },
  { id: 'a_main', bidang: 'anak', band: 'all', multi: true, teks: 'Paling suka main apa?', opsi: [o('Musik & suara'), o('Buku & gambar'), o('Air'), o('Gerak fisik'), o('Menyusun'), o('Pura-pura')] },
  { id: 'a_khusus', bidang: 'anak', band: 'all', sensitif: true, teks: 'Ada kebutuhan khusus / kondisi kesehatan yang perlu Rekah pertimbangkan?', opsi: [o('Tidak ada'), o('Ya, ceritakan nanti')] },
  // Anak — bayi 0–12 bln
  { id: 'a_menyusu', bidang: 'anak', band: 'bayi', baru: true, teks: 'Cara menyusu?', opsi: [o('ASI eksklusif'), o('ASI + sufor'), o('Sufor'), o('Sudah mulai MPASI')] },
  { id: 'a_tummy', bidang: 'anak', band: 'bayi', teks: 'Tummy time / latihan posisi?', opsi: [o('Rutin'), o('Kadang'), o('Belum')] },
  // Anak — batita 1–3 th
  { id: 'a_makan_bt', bidang: 'anak', band: 'batita', teks: 'Soal makan?', opsi: [o('Lahap'), o('Pilih-pilih'), o('Masih disuapi'), o('Suka makan sendiri')] },
  { id: 'a_toilet', bidang: 'anak', band: 'batita', baru: true, teks: 'Latihan ke toilet?', opsi: [o('Belum mulai'), o('Sedang belajar'), o('Lepas popok siang'), o('Sudah bisa')] },
  { id: 'a_bicara', bidang: 'anak', band: 'batita', teks: 'Perkembangan bicara?', opsi: [o('Beberapa kata'), o('Gabung 2 kata'), o('Banyak bicara'), o('Sedang berkembang')] },
  // Anak — prasekolah 3–6 th
  { id: 'a_makan_pra', bidang: 'anak', band: 'pra', teks: 'Soal makan?', opsi: [o('Lahap'), o('Pilih-pilih'), o('Mandiri')] },
  { id: 'a_sekolah', bidang: 'anak', band: 'pra', baru: true, teks: 'Sudah sekolah / dititipkan?', opsi: [o('Belum'), o('PAUD atau TK'), o('Daycare'), o('Di rumah saja')] },
  { id: 'a_teman', bidang: 'anak', band: 'pra', teks: 'Main dengan teman?', opsi: [o('Suka & mudah'), o('Masih malu'), o('Belum banyak kesempatan')] },
  { id: 'a_emosi', bidang: 'anak', band: 'pra', multi: true, teks: 'Emosi & komunikasi?', opsi: [o('Bisa cerita perasaan'), o('Mudah meledak'), o('Cemas berpisah'), o('Banyak bertanya')] },
  { id: 'a_layar', bidang: 'anak', band: 'pra', baru: true, teks: 'Waktu layar (gadget)?', opsi: [o('Tidak ada'), o('Terbatas'), o('Cukup banyak')] },
  // Caregiver
  { id: 'c_menemani', bidang: 'caregiver', band: 'all', multi: true, teks: 'Siapa saja yang menemani sehari-hari?', opsi: [o('Bunda'), o('Ayah'), o('Nenek'), o('Kakek'), o('Pengasuh'), o('Saudara')] },
  { id: 'c_utama', bidang: 'caregiver', band: 'all', teks: 'Pengasuh utama di siang hari?', opsi: [o('Bunda'), o('Ayah'), o('Nenek'), o('Pengasuh')] },
  { id: 'c_bunda', bidang: 'caregiver', band: 'all', teks: 'Keseharian Bunda sekarang?', opsi: [o('Di rumah penuh'), o('Kerja dari rumah'), o('Kerja di luar'), o('Baru kembali kerja', { tag: 'kembali_kerja' })] },
  { id: 'c_dukungan', bidang: 'caregiver', band: 'all', teks: 'Dukungan yang tersedia?', opsi: [o('Pasangan hadir'), o('Keluarga dekat'), o('Pengasuh'), o('Mengasuh sendiri / LDM')] },
  { id: 'c_bahasa', bidang: 'caregiver', band: 'all', multi: true, baru: true, teks: 'Bahasa yang dipakai di rumah?', opsi: [o('Indonesia'), o('Bahasa daerah'), o('Dwibahasa')] },
  { id: 'c_ibu', bidang: 'caregiver', band: 'all', multi: true, teks: 'Kondisi ibu saat ini?', opsi: [o('Sedang nifas', { unlock: 'nifas' }), o('Menyusui', { unlock: 'piring' }), o('Memerah ASI (pumping)', { unlock: 'piring' }), o('Sedang hamil lagi', { unlock: 'piring' }), o('Tidak ada')] },
  // Rumah
  { id: 'r_sibuk', bidang: 'rumah', band: 'all', multi: true, teks: 'Jam paling sibuk?', opsi: [o('Pagi 06–08'), o('Siang'), o('Sore 16–19'), o('Malam')] },
  { id: 'r_ruang', bidang: 'rumah', band: 'all', teks: 'Ruang main anak?', opsi: [o('Sudah aman dijelajah'), o('Masih disiapkan'), o('Terbatas')] },
  { id: 'r_aman', bidang: 'rumah', band: 'all', multi: true, baru: true, teks: 'Keamanan rumah yang perlu perhatian?', opsi: [o('Tangga / area berisiko'), o('Colokan listrik'), o('Dapur'), o('Sudah cukup aman')] },
  { id: 'r_tidur', bidang: 'rumah', band: 'bayi', baru: true, teks: 'Tempat tidur bayi?', opsi: [o('Boks/keranjang terpisah'), o('Satu ranjang dengan ortu'), o('Kasur di lantai'), o('Belum tetap')] },
  { id: 'r_rokok', bidang: 'rumah', band: 'all', baru: true, teks: 'Ada yang merokok di rumah?', opsi: [o('Tidak ada'), o('Ya, di luar saja'), o('Ya, di dalam')] },
  { id: 'r_tinggal', bidang: 'rumah', band: 'all', teks: 'Tinggal bersama?', opsi: [o('Keluarga inti'), o('Keluarga besar'), o('Lainnya')] },
  { id: 'r_akses', bidang: 'rumah', band: 'all', teks: 'Akses ke luar / ruang gerak?', opsi: [o('Ada halaman / taman dekat'), o('Terbatas')] },
  { id: 'r_faskes', bidang: 'rumah', band: 'all', baru: true, teks: 'Akses ke posyandu / faskes?', opsi: [o('Dekat & mudah'), o('Agak jauh')] },
  { id: 'r_kebutuhan', bidang: 'rumah', band: 'all', multi: true, inbox: true, teks: 'Kebutuhan rumah sekarang?', opsi: [o('Perlengkapan main'), o('Buku anak'), o('Alat makan anak'), o('Tempat tidur'), o('Lainnya')] },
];

export interface PetaStore {
  jawaban: Record<string, string[]>;
  pilih: (q: PetaPertanyaan, v: string) => void;
}
export function usePetaStore(idAnak: string): PetaStore {
  const kunci = `rekah_peta_${idAnak}`;
  const awal = useMemo<Record<string, string[]>>(() => {
    try { const raw = localStorage.getItem(kunci); if (raw) { const p = JSON.parse(raw) as { jawaban?: Record<string, string[]> }; if (p.jawaban) return p.jawaban; } } catch { /* abaikan */ }
    return {};
  }, [kunci]);
  const [jawaban, setJawaban] = useState<Record<string, string[]>>(awal);
  const simpan = (j: Record<string, string[]>) => { setJawaban(j); try { localStorage.setItem(kunci, JSON.stringify({ jawaban: j })); } catch { /* abaikan */ } };
  const pilih = (q: PetaPertanyaan, v: string) => {
    const cur = jawaban[q.id] ?? [];
    const next = q.multi ? (cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]) : (cur.includes(v) ? [] : [v]);
    simpan({ ...jawaban, [q.id]: next });
  };
  return { jawaban, pilih };
}

/** Tag penyesuaian turunan dari jawaban Peta (menyetir papan Hari Ini). */
export function tagsDariPeta(jawaban: Record<string, string[]>): TagPenyesuaian[] {
  const out = new Set<TagPenyesuaian>();
  for (const q of PETA_PERTANYAAN) {
    const sel = jawaban[q.id]; if (!sel || sel.length === 0) continue;
    for (const opt of q.opsi) if (opt.tag && sel.includes(opt.v)) out.add(opt.tag);
  }
  return [...out];
}

// ─── Ringkasan Peta jadi poin-poin (Phase 29: Keadaan sekarang) ───────────────
export interface PoinRingkas { bidang: BidangPeta; label: string; nilai: string }
export const RINGKAS_LABEL: Record<string, string> = {
  a_suasana: 'Watak', a_tenang: 'Menenangkan saat rewel',
  a_alergi: 'Alergi / pantangan', a_saudara: 'Posisi di keluarga', a_main: 'Suka main',
  a_khusus: 'Kebutuhan khusus', a_menyusu: 'Cara menyusu', a_tummy: 'Tummy time',
  a_makan_bt: 'Makan', a_toilet: 'Toilet training', a_bicara: 'Bicara',
  a_makan_pra: 'Makan', a_sekolah: 'Sekolah / dititipkan', a_teman: 'Main dengan teman',
  a_emosi: 'Emosi & komunikasi', a_layar: 'Waktu layar',
  c_menemani: 'Yang menemani', c_utama: 'Pengasuh utama', c_bunda: 'Keseharian Bunda',
  c_dukungan: 'Dukungan', c_bahasa: 'Bahasa rumah', c_ibu: 'Kondisi ibu',
  r_sibuk: 'Jam tersibuk', r_ruang: 'Ruang main', r_aman: 'Keamanan rumah', r_tinggal: 'Tinggal bersama',
  r_akses: 'Akses ke luar', r_faskes: 'Akses posyandu / faskes', r_kebutuhan: 'Kebutuhan rumah',
  r_tidur: 'Tempat tidur bayi', r_rokok: 'Rokok di rumah',
};
/** Ringkas jawaban Peta jadi poin per bidang (abaikan "Tidak ada"). */
export function ringkasanPeta(jawaban: Record<string, string[]>): PoinRingkas[] {
  const out: PoinRingkas[] = [];
  for (const q of PETA_PERTANYAAN) {
    const sel = (jawaban[q.id] ?? []).filter(v => v !== 'Tidak ada');
    if (sel.length === 0) continue;
    out.push({ bidang: q.bidang, label: RINGKAS_LABEL[q.id] ?? q.teks.replace(/\?$/, ''), nilai: sel.join(', ') });
  }
  return out;
}

// ─── Quick-pick konteks (Phase 29c): hal fluktuatif yang dulu ada di Peta ──────
// Dipindah ke "Yang sedang berubah" karena jawabannya berubah harian/mingguan.
export interface KonteksCepat { key: string; chip: string; bidang: BidangKehidupan; judul: string; tag: TagPenyesuaian }
export const QUICK_KONTEKS: KonteksCepat[] = [
  { key: 'tidur', chip: 'Tidur terganggu', bidang: 'anak', judul: 'Tidur malam lagi terganggu', tag: 'tidur' },
  { key: 'nyaman', chip: 'Anak kurang nyaman', bidang: 'anak', judul: 'Anak sedang kurang nyaman (mis. tumbuh gigi / baru sakit)', tag: 'kurang_nyaman' },
  { key: 'transisi', chip: 'Susah pindah kegiatan', bidang: 'anak', judul: 'Anak sedang susah berpindah kegiatan', tag: 'transisi' },
  { key: 'mood', chip: 'Suasana naik-turun', bidang: 'anak', judul: 'Suasana anak sedang naik-turun', tag: 'lainnya' },
  { key: 'energi', chip: 'Energi terbatas', bidang: 'caregiver', judul: 'Energi & kapasitas saya sedang terbatas', tag: 'energi_caregiver' },
  { key: 'kerja', chip: 'Waktu bersama berubah', bidang: 'caregiver', judul: 'Waktu bersama berubah (mis. baru kembali kerja)', tag: 'kembali_kerja' },
  { key: 'ritme', chip: 'Perubahan ritme', bidang: 'rumah', judul: 'Ada perubahan ritme (pindah / tamu / renovasi)', tag: 'perubahan_ritme' },
];

/** Lembar khusus yang terbuka dari jawaban "Kondisi ibu". */
export function lembarTerbuka(jawaban: Record<string, string[]>): { nifas: boolean; piring: boolean } {
  const sel = jawaban['c_ibu'] ?? [];
  const u = new Set<string>();
  const q = PETA_PERTANYAAN.find(x => x.id === 'c_ibu');
  for (const opt of q?.opsi ?? []) if (opt.unlock && sel.includes(opt.v)) u.add(opt.unlock);
  return { nifas: u.has('nifas'), piring: u.has('piring') };
}

// ─── Lembar Nifas (pedoman Buku KIA, DRAFT) ──────────────────────────────────

const addHari = (d: Date, n: number): Date => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export interface ButirKF { key: string; label: string; dMin: number; dMax: number }
export const JADWAL_NIFAS: ButirKF[] = [
  { key: 'kf1', label: 'KF1 — 6 jam s/d 2 hari', dMin: 0, dMax: 2 },
  { key: 'kf2', label: 'KF2 — 3 s/d 7 hari', dMin: 3, dMax: 7 },
  { key: 'kf3', label: 'KF3 — 8 s/d 28 hari', dMin: 8, dMax: 28 },
  { key: 'kf4', label: 'KF4 — 29 s/d 42 hari', dMin: 29, dMax: 42 },
];
// Tanda bahaya nifas (Buku KIA, DRAFT — tinjauan tenaga kesehatan).
export const TANDA_BAHAYA_NIFAS: string[] = [
  'Demam lebih dari 38°C atau lebih dari 2 hari',
  'Sedih, murung, menangis tanpa sebab',
  'Sakit kepala hebat atau pandangan kabur',
  'Nyeri ulu hati, mual, muntah',
  'Kejang, atau bengkak di kaki, tangan, wajah',
  'Perdarahan lewat jalan lahir',
  'Keluar cairan berbau dari jalan lahir',
  'Payudara bengkak, merah & sakit',
];
export const MOOD_NIFAS: string[] = ['Baik', 'Lelah tapi oke', 'Sering sedih / cemas', 'Butuh dukungan'];
export const CEK_HARIAN_NIFAS: string[] = ['Tablet tambah darah', 'Makan sesuai kebutuhan'];
export interface HindariNifas { teks: string; alasan: string }
export const HINDARI_NIFAS: HindariNifas[] = [
  { teks: 'Membuang ASI pertama (kolostrum)', alasan: 'Sangat berguna untuk kekebalan tubuh anak.' },
  { teks: 'Membersihkan payudara dengan alkohol, povidon iodine, obat merah, atau sabun', alasan: 'Bisa terminum oleh bayi.' },
  { teks: 'Mengikat perut terlalu kencang', alasan: '' },
  { teks: 'Latihan fisik posisi telungkup', alasan: '' },
  { teks: 'Menempelkan daun-daunan pada kemaluan', alasan: 'Bisa menimbulkan infeksi.' },
];
export interface KFItem { key: string; label: string; dMin: number; dMax: number; dueMin: string; dueMax: string }
export function jadwalKF(tanggalLahir: string | null): KFItem[] {
  if (!tanggalLahir) return [];
  const dob = new Date(tanggalLahir + 'T00:00:00'); if (isNaN(dob.getTime())) return [];
  return JADWAL_NIFAS.map(k => ({ key: k.key, label: k.label, dMin: k.dMin, dMax: k.dMax, dueMin: isoTgl(addHari(dob, k.dMin)), dueMax: isoTgl(addHari(dob, k.dMax)) }));
}
export function hariNifas(tanggalLahir: string | null, hariIni: Date): number | null {
  if (!tanggalLahir) return null;
  const usia = -selisihHari(tanggalLahir, hariIni); // hari sejak lahir
  return usia >= 0 && usia <= 60 ? usia : null;
}
export interface NifasJadwal { tgl: string; waktu?: string; slot?: SlotHari }
export interface NifasHari { mood: string; checks: string[]; danger: string[] }
// kf = penjadwalan ke Irama (lama, dipertahankan); kfDone = tanda kunjungan selesai;
// vitaminA = 2 kapsul SELAMA masa nifas (bukan harian); log = catatan per tanggal (mood/cek/bahaya) → Lembar Pemantauan Ibu Nifas.
interface NifasState { kf: Record<string, NifasJadwal>; kfDone: Record<string, boolean>; vitaminA: boolean[]; log: Record<string, NifasHari> }
export interface NifasStore {
  kf: Record<string, NifasJadwal>;
  kfDone: Record<string, boolean>;
  vitaminA: boolean[];
  hari: NifasHari;
  konfirmasiKF: (key: string, v: NifasJadwal) => void;
  toggleKFDone: (key: string) => void;
  toggleVitaminA: (i: number) => void;
  setMood: (m: string) => void;
  toggleCheck: (t: string) => void;
  toggleDanger: (t: string) => void;
}
const NIFAS_HARI_KOSONG: NifasHari = { mood: '', checks: [], danger: [] };
export function useNifasStore(idAnak: string): NifasStore {
  const kunci = `rekah_nifas_${idAnak}`;
  const hariIniISO = isoTgl(new Date());
  const awal = useMemo<NifasState>(() => {
    try {
      const raw = localStorage.getItem(kunci);
      if (raw) {
        const p = JSON.parse(raw) as Partial<NifasState> & { bahaya?: string[]; mood?: string };
        const log: Record<string, NifasHari> = p.log ?? {};
        // migrasi struktur lama (bahaya/mood tingkat atas) → log hari ini
        if (((p.bahaya?.length ?? 0) > 0 || (p.mood ?? '') !== '') && !log[hariIniISO]) {
          log[hariIniISO] = { mood: p.mood ?? '', checks: [], danger: p.bahaya ?? [] };
        }
        return { kf: p.kf ?? {}, kfDone: p.kfDone ?? {}, vitaminA: p.vitaminA ?? [false, false], log };
      }
    } catch { /* abaikan */ }
    return { kf: {}, kfDone: {}, vitaminA: [false, false], log: {} };
  }, [kunci, hariIniISO]);
  const [st, setSt] = useState<NifasState>(awal);
  const simpan = (n: NifasState) => { setSt(n); try { localStorage.setItem(kunci, JSON.stringify(n)); } catch { /* abaikan */ } };
  const hari = st.log[hariIniISO] ?? NIFAS_HARI_KOSONG;
  const tulisHari = (patch: Partial<NifasHari>) => simpan({ ...st, log: { ...st.log, [hariIniISO]: { ...hari, ...patch } } });
  return {
    kf: st.kf, kfDone: st.kfDone, vitaminA: st.vitaminA, hari,
    konfirmasiKF: (key, v) => simpan({ ...st, kf: { ...st.kf, [key]: v } }),
    toggleKFDone: (key) => simpan({ ...st, kfDone: { ...st.kfDone, [key]: !st.kfDone[key] } }),
    toggleVitaminA: (i) => { const va = [st.vitaminA[0] ?? false, st.vitaminA[1] ?? false]; va[i] = !va[i]; simpan({ ...st, vitaminA: va }); },
    setMood: (m) => tulisHari({ mood: hari.mood === m ? '' : m }),
    toggleCheck: (t) => tulisHari({ checks: hari.checks.includes(t) ? hari.checks.filter(x => x !== t) : [...hari.checks, t] }),
    toggleDanger: (t) => tulisHari({ danger: hari.danger.includes(t) ? hari.danger.filter(x => x !== t) : [...hari.danger, t] }),
  };
}

// ─── Piring Ibu (Isi Piringku ibu menyusui — pedoman Buku KIA, DRAFT) ─────────

export interface PiringBahan { key: string; label: string; target: number; contoh: string[] }
export const PIRING_PENUHI: PiringBahan[] = [
  { key: 'pokok', label: 'Makanan pokok', target: 6, contoh: ['¾ gelas nasi', '3 jagung sedang', '2 kentang sedang', '1½ potong singkong', '3 iris roti putih', '2 gelas mie basah'] },
  { key: 'hewani', label: 'Protein hewani', target: 4, contoh: ['1 potong sedang ikan', '1 butir telur ayam'] },
  { key: 'nabati', label: 'Protein nabati', target: 4, contoh: ['1 potong sedang tempe', '2 potong sedang tahu'] },
  { key: 'sayur', label: 'Sayur', target: 4, contoh: ['1 mangkuk sayur matang tanpa kuah'] },
  { key: 'buah', label: 'Buah', target: 4, contoh: ['1 potong sedang pisang', '1 potong besar pepaya'] },
];
export interface PiringBatasi { label: string; porsi: string; ket: string }
export const PIRING_BATASI: PiringBatasi[] = [
  { label: 'Minyak / lemak', porsi: '6 sdt', ket: 'termasuk gorengan, tumisan, santan, kemiri, mentega' },
  { label: 'Gula', porsi: '2 sdm', ket: 'dari kue manis, teh manis, dan lainnya' },
];
/** Target air: 14 gelas di 6 bulan pertama, 12 gelas setelahnya (Buku KIA, DRAFT). */
export function airTargetGelas(usiaBulan: number | null): number { return (usiaBulan ?? 0) > 6 ? 12 : 14; }

interface PiringState { porsi: Record<string, number>; water: number }
export interface PiringStore {
  porsi: Record<string, number>;
  water: number;
  setPorsi: (key: string, n: number) => void;
  setWater: (n: number) => void;
}
export function usePiringStore(idAnak: string): PiringStore {
  const kunci = `rekah_piring_${idAnak}_${isoTgl(new Date())}`;
  const awal = useMemo<PiringState>(() => {
    try { const raw = localStorage.getItem(kunci); if (raw) { const p = JSON.parse(raw) as Partial<PiringState>; return { porsi: p.porsi ?? {}, water: p.water ?? 0 }; } } catch { /* abaikan */ }
    return { porsi: {}, water: 0 };
  }, [kunci]);
  const [st, setSt] = useState<PiringState>(awal);
  const simpan = (n: PiringState) => { setSt(n); try { localStorage.setItem(kunci, JSON.stringify(n)); } catch { /* abaikan */ } };
  return {
    porsi: st.porsi, water: st.water,
    setPorsi: (key, n) => simpan({ ...st, porsi: { ...st.porsi, [key]: Math.max(0, n) } }),
    setWater: (n) => simpan({ ...st, water: Math.max(0, n) }),
  };
}
