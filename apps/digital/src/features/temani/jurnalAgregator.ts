// Jurnal — agregator log otomatis (Phase 14Q). Menurunkan entri harian dari
// data yang SUDAH ada (read-only): pilihan_harian.selesai/kustom, centang
// kebiasaan, dan refleksi_kegiatan. Judul diresolve dari katalog konten
// (Ajak Main, Wawasan Tumbuh, Kebiasaan Baik) + item kustom (Temani/Bantu).
import { adaptKegiatan } from '../beranda-usia/adapter/kegiatanAdapter';
import { adaptPanduan } from '../beranda-usia/adapter/panduanAdapter';
import { adaptSikap } from '../beranda-usia/adapter/sikapAdapter';

export type SumberJurnal = 'kelola' | 'kegiatan' | 'wawasan' | 'kebiasaan' | 'temani' | 'bantu' | 'refleksi';

export interface EntriOtomatis { sumber: SumberJurnal; teks: string; tag: string }

interface KustomItem { id?: string; judul?: string; keteranganKapan?: string; sumberId?: string }
interface DiffHari { selesai?: string[]; kustom?: KustomItem[] }
interface KatalogItem { judul: string; sumber: SumberJurnal; tag: string }

const LABEL_HASIL: Record<string, string> = {
  menyenangkan: '🙂 Menyenangkan',
  terlalu_sulit: '😮‍💨 Terlalu sulit',
  kurang_cocok: '🤔 Kurang cocok',
};

// Katalog id -> judul dibangun sekali dari adapter konten (sama sumbernya dengan
// yang dipakai Bekal/Kelola untuk me-resolve judul item). Aman: adapter murni.
const KATALOG: Map<string, KatalogItem> = (() => {
  const m = new Map<string, KatalogItem>();
  try { for (const { item } of adaptKegiatan().items) m.set(item.id, { judul: item.judul, sumber: 'kegiatan', tag: 'Ajak Main' }); } catch { /* abaikan */ }
  try { for (const { item } of adaptPanduan().items) m.set(item.id, { judul: item.judul, sumber: 'wawasan', tag: 'Wawasan Tumbuh' }); } catch { /* abaikan */ }
  try { for (const s of adaptSikap().katalog) m.set(s.id, { judul: s.judul, sumber: 'kebiasaan', tag: 'Kebiasaan Baik' }); } catch { /* abaikan */ }
  return m;
})();

function sumberKustom(it: KustomItem): { sumber: SumberJurnal; tag: string } {
  const k = `${it.keteranganKapan ?? ''} ${it.sumberId ?? ''}`;
  if (/temani/i.test(k)) return { sumber: 'temani', tag: 'Temani' };
  if (/bantu/i.test(k)) return { sumber: 'bantu', tag: 'Bantu · situasional' };
  if (/kebiasaan/i.test(k)) return { sumber: 'kebiasaan', tag: 'Kebiasaan Baik' };
  return { sumber: 'kelola', tag: 'Kelola · selesai' };
}

const RANK: Record<SumberJurnal, number> = {
  kegiatan: 0, kebiasaan: 1, wawasan: 2, kelola: 3, bantu: 4, temani: 5, refleksi: 6,
};

export function bangunEntriHari(
  diffRaw: unknown,
  centangHari: Record<string, string[]> | undefined,
  refleksiHari: readonly { hasil: string }[],
): EntriOtomatis[] {
  const diff = (diffRaw ?? {}) as DiffHari;
  const selesai = Array.isArray(diff.selesai) ? diff.selesai : [];
  const kustom = Array.isArray(diff.kustom) ? diff.kustom : [];
  const byId = new Map<string, KustomItem>();
  for (const it of kustom) if (it.id) byId.set(it.id, it);

  const entri: EntriOtomatis[] = [];
  const seen = new Set<string>();
  const tambah = (e: EntriOtomatis) => {
    const key = `${e.sumber}|${e.teks}`;
    if (seen.has(key)) return;
    seen.add(key);
    entri.push(e);
  };

  let lain = 0;
  for (const id of selesai) {
    const it = byId.get(id);
    if (it && it.judul) {
      const { sumber, tag } = sumberKustom(it);
      tambah({ sumber, teks: it.judul, tag });
      continue;
    }
    const kat = KATALOG.get(id);
    if (kat) { tambah({ sumber: kat.sumber, teks: kat.judul, tag: kat.tag }); continue; }
    lain += 1;
  }
  if (lain > 0) tambah({ sumber: 'kelola', teks: `${lain} kegiatan lain diselesaikan`, tag: 'Kelola · selesai' });

  if (centangHari) {
    for (const nilai of Object.keys(centangHari)) {
      const arr = centangHari[nilai];
      if (!Array.isArray(arr)) continue;
      for (const sid of arr) {
        const kat = KATALOG.get(sid);
        tambah({ sumber: 'kebiasaan', teks: kat ? kat.judul : `Kebiasaan baik · ${nilai}`, tag: 'Kebiasaan Baik' });
      }
    }
  }

  for (const r of refleksiHari) {
    tambah({ sumber: 'refleksi', teks: `Refleksi: ${LABEL_HASIL[r.hasil] ?? r.hasil}`, tag: 'Temani' });
  }

  return entri.sort((a, b) => RANK[a.sumber] - RANK[b.sumber]);
}
