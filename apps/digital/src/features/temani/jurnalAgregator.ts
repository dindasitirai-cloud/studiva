// Jurnal — agregator log otomatis (Phase 14Q, rev 14U). Menurunkan entri harian
// dari data yang SUDAH ada (read-only): pilihan_harian.selesai/kustom + centang
// kebiasaan + refleksi. Judul diresolve dari katalog konten (Ajak Main, Wawasan
// Tumbuh, Kebiasaan Baik), item kustom (Temani/Bantu), dan katalog seed Kelola
// (kebiasaan/situasional/main/buku dari HariIni). Dikelompokkan per kategori.
import { adaptKegiatan } from '../beranda-usia/adapter/kegiatanAdapter';
import { adaptPanduan } from '../beranda-usia/adapter/panduanAdapter';
import { adaptSikap } from '../beranda-usia/adapter/sikapAdapter';

export type KategoriJurnal =
  | 'kebiasaan' | 'situasional' | 'main' | 'wawasan' | 'dikelola' | 'temani' | 'bantu' | 'refleksi' | 'lainnya';

export interface EntriOtomatis { kategori: KategoriJurnal; teks: string }

interface KustomItem { id?: string; judul?: string; keteranganKapan?: string; sumberId?: string }
interface DiffHari { selesai?: string[]; kustom?: KustomItem[] }

const LABEL_HASIL: Record<string, string> = {
  menyenangkan: 'Menyenangkan', terlalu_sulit: 'Terlalu sulit', kurang_cocok: 'Kurang cocok',
};

// Normalisasi label kategori mentah (mis. 'buku' → 'wawasan') ke kategori jurnal.
export function normalisasiKategori(k: string): KategoriJurnal {
  if (k === 'buku') return 'wawasan';
  if (k === 'kebiasaan' || k === 'situasional' || k === 'main' || k === 'wawasan'
    || k === 'dikelola' || k === 'temani' || k === 'bantu' || k === 'refleksi') return k;
  return 'lainnya';
}

// Katalog id → judul + kategori dari adapter konten (sumber sama dgn Bekal/Kelola).
const KATALOG: Map<string, { judul: string; kategori: KategoriJurnal }> = (() => {
  const m = new Map<string, { judul: string; kategori: KategoriJurnal }>();
  try { for (const { item } of adaptKegiatan().items) m.set(item.id, { judul: item.judul, kategori: 'main' }); } catch { /* abaikan */ }
  try { for (const { item } of adaptPanduan().items) m.set(item.id, { judul: item.judul, kategori: 'wawasan' }); } catch { /* abaikan */ }
  try { for (const s of adaptSikap().katalog) m.set(s.id, { judul: s.judul, kategori: 'kebiasaan' }); } catch { /* abaikan */ }
  return m;
})();

function kategoriKustom(it: KustomItem): KategoriJurnal {
  const k = `${it.keteranganKapan ?? ''} ${it.sumberId ?? ''} ${it.id ?? ''}`;
  if (/temani/i.test(k)) return 'temani';
  if (/bantu/i.test(k)) return 'bantu';
  if (/kebiasaan/i.test(k)) return 'kebiasaan';
  return 'lainnya';
}

export function bangunEntriHari(
  diffRaw: unknown,
  centangHari: Record<string, string[]> | undefined,
  refleksiHari: readonly { hasil: string }[],
  katalogSeed?: Map<string, { judul: string; kategori: string }>,
): EntriOtomatis[] {
  const diff = (diffRaw ?? {}) as DiffHari;
  const selesai = Array.isArray(diff.selesai) ? diff.selesai : [];
  const kustom = Array.isArray(diff.kustom) ? diff.kustom : [];
  const byId = new Map<string, KustomItem>();
  for (const it of kustom) if (it.id) byId.set(it.id, it);

  const entri: EntriOtomatis[] = [];
  const seen = new Set<string>();
  const tambah = (kategori: KategoriJurnal, teks: string) => {
    if (!teks) return;
    const key = `${kategori}|${teks}`;
    if (seen.has(key)) return;
    seen.add(key);
    entri.push({ kategori, teks });
  };

  // 1) Item "selesai" (kustom Temani/Bantu + katalog konten + seed Kelola).
  for (const id of selesai) {
    const it = byId.get(id);
    if (it && it.judul) { tambah(kategoriKustom(it), it.judul); continue; }
    const kat = KATALOG.get(id);
    if (kat) { tambah(kat.kategori, kat.judul); continue; }
    const seed = katalogSeed?.get(id);
    if (seed) { tambah(normalisasiKategori(seed.kategori), seed.judul); continue; }
  }

  // 2) Centang Kebiasaan Baik + Kebiasaan situasional (kolom centang, per nilai).
  if (centangHari) {
    for (const nilai of Object.keys(centangHari)) {
      const arr = centangHari[nilai];
      if (!Array.isArray(arr)) continue;
      for (const sid of arr) {
        const seed = katalogSeed?.get(sid);
        if (seed) { tambah(normalisasiKategori(seed.kategori), seed.judul); continue; }
        const kat = KATALOG.get(sid);
        tambah('kebiasaan', kat ? kat.judul : `Kebiasaan baik · ${nilai}`);
      }
    }
  }

  // 3) Refleksi Temani.
  for (const r of refleksiHari) {
    tambah('refleksi', `Refleksi: ${LABEL_HASIL[r.hasil] ?? r.hasil}`);
  }

  return entri;
}

// Gabung + dedupe beberapa daftar entri (mis. Supabase + store lokal Kelola).
export function gabungEntri(...daftar: EntriOtomatis[][]): EntriOtomatis[] {
  const out: EntriOtomatis[] = [];
  const seen = new Set<string>();
  for (const list of daftar) for (const e of list) {
    const key = `${e.kategori}|${e.teks}`;
    if (!e.teks || seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}
