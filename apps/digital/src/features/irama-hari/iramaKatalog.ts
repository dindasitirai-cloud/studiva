// Irama Hari — katalog kegiatan template + Kebiasaan Baik yang dilihat orang tua.
// Sumber: tabel irama_template & kebiasaan_baik (dikelola di /rekah-admin/sikap).
// Bila tabel belum ada / kosong / belum login → seed kebiasaanSeed.ts agar papan tidak kosong.
//   rutin        → item "Kebiasaan baik" di kartu kegiatan template (disaring usia + nilai fokus)
//   situasional  → daftar "kapan saja" di Kelola (disaring usia + nilai fokus)
import { useSyncExternalStore } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { Item, KegDef, Waktu } from './dayPlanData';
import { TEMPLATE_SEED, KEBIASAAN_SEED, USIA_MAKS } from './kebiasaanSeed';
import type { TemplateIrama, KebiasaanKatalog } from './kebiasaanSeed';
import { muatKatalogKebiasaan, muatTemplateIrama } from '../../lib/supabase/kebiasaan';

export interface KatalogIrama {
  templates: TemplateIrama[];
  kebiasaan: KebiasaanKatalog[];
  /** true bila data berasal dari Supabase (bukan seed). */
  dariServer: boolean;
}

let katalog: KatalogIrama = { templates: TEMPLATE_SEED, kebiasaan: KEBIASAAN_SEED, dariServer: false };
let sedangMemuat: Promise<void> | null = null;
let sudahDimuat = false;
const pendengar = new Set<() => void>();

export function muatUlangKatalogIrama(): Promise<void> {
  if (sedangMemuat) return sedangMemuat;
  sedangMemuat = Promise.all([muatTemplateIrama(), muatKatalogKebiasaan()])
    .then(([tpl, keb]) => {
      const adaTpl = !!tpl && tpl.length > 0;
      const adaKeb = !!keb && keb.length > 0;
      katalog = {
        templates: adaTpl ? tpl! : TEMPLATE_SEED,
        kebiasaan: adaKeb ? keb! : KEBIASAAN_SEED,
        dariServer: adaTpl || adaKeb,
      };
      pendengar.forEach(fn => fn());
    })
    .finally(() => { sedangMemuat = null; });
  return sedangMemuat;
}

function berlangganan(fn: () => void) {
  pendengar.add(fn);
  if (!sudahDimuat) { sudahDimuat = true; void muatUlangKatalogIrama(); }
  return () => { pendengar.delete(fn); };
}

export function useIramaKatalog(): KatalogIrama {
  return useSyncExternalStore(berlangganan, () => katalog, () => katalog);
}

/** Snapshot saat ini (untuk fungsi non-React, mis. susunKeg / katalog Jurnal). */
export function ambilKatalogIrama(): KatalogIrama {
  return katalog;
}

const tayang = (k: KebiasaanKatalog) => k.status !== 'diarsipkan';

/** Butir kebiasaan rutin → item papan (n diisi saat disaring sesuai fokus). */
export function keItem(k: KebiasaanKatalog): Item {
  return { id: k.id, tipe: 'kebiasaan', t: k.judul, n: k.nilai[0], nilaiList: k.nilai, usiaMin: k.usia_min_bulan, usiaMax: k.usia_max_bulan };
}

/** Kegiatan template aktif untuk satu bagian waktu, lengkap dengan kebiasaan rutinnya. */
export function kegTemplate(waktu: Waktu, k: KatalogIrama = katalog): KegDef[] {
  return k.templates
    .filter(t => t.aktif && t.waktu === waktu)
    .sort((a, b) => a.urutan - b.urutan)
    .map(t => ({
      key: t.key, wk: t.jam, ik: t.ikon, nm: t.nama,
      items: [
        ...k.kebiasaan
          .filter(b => tayang(b) && b.kategori === 'rutin' && b.template_key === t.key)
          .sort((a, b) => a.urutan - b.urutan)
          .map(keItem),
        ...t.saran.map(s => ({ id: s.id, tipe: s.tipe, t: s.t }) as Item),
      ],
    }));
}

const cocokUsia = (usiaBulan: number, min = 0, max = USIA_MAKS) => {
  const u = Math.min(Math.max(0, usiaBulan), USIA_MAKS);
  return u >= min && u <= max;
};

/** Nilai pertama butir yang sedang jadi fokus keluarga (dipakai untuk centang & bunga). */
export function nilaiCocok(nilai: readonly NilaiAkar[] | undefined, fokus: ReadonlySet<NilaiAkar>): NilaiAkar | undefined {
  return (nilai ?? []).find(n => fokus.has(n));
}

/**
 * Saring item kartu: kebiasaan hanya yang cocok usia anak & salah satu nilainya jadi fokus
 * (n diganti ke nilai fokus tersebut). Item lain (main/buku/lainnya) tidak berubah.
 */
export function saringKebiasaanKartu(items: Item[], usiaBulan: number, fokus: ReadonlySet<NilaiAkar>): Item[] {
  const out: Item[] = [];
  for (const it of items) {
    if (it.tipe !== 'kebiasaan' || !it.nilaiList) { out.push(it); continue; }
    if (!cocokUsia(usiaBulan, it.usiaMin, it.usiaMax)) continue;
    const n = nilaiCocok(it.nilaiList, fokus);
    if (n) out.push({ ...it, n });
  }
  return out;
}

export interface ItemSituasional { id: string; t: string; n: NilaiAkar; kapan: string; deskripsi: string }

/** Kebiasaan situasional untuk usia anak & nilai fokus keluarga. */
export function situasionalUntuk(usiaBulan: number, fokus: ReadonlySet<NilaiAkar>, k: KatalogIrama = katalog): ItemSituasional[] {
  const out: ItemSituasional[] = [];
  for (const b of [...k.kebiasaan].sort((a, c) => a.urutan - c.urutan)) {
    if (!tayang(b) || b.kategori !== 'situasional' || !cocokUsia(usiaBulan, b.usia_min_bulan, b.usia_max_bulan)) continue;
    const n = nilaiCocok(b.nilai, fokus);
    if (n) out.push({ id: b.id, t: b.judul, n, kapan: b.kapan || 'kapan saja', deskripsi: b.deskripsi });
  }
  return out;
}
