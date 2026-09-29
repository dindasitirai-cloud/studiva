// Temani — katalog perjalanan yang dilihat orang tua.
// Sumber: tabel temani_journey (dikelola admin di /rekah-admin/temani, tayang setelah
// disetujui Psikolog Fitri). Bila tabel belum ada / belum ada yang tayang / belum login,
// jatuh ke seed lama (temaniSeed.ts) agar tampilan tidak kosong.
import { useSyncExternalStore } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { TEMANI_JOURNEYS as SEED } from './temaniSeed';
import type { TemaniJourney } from './temaniSeed';
import { muatKatalogTemani } from '../../lib/supabase/temani';
import type { JourneyKatalog } from '../../lib/supabase/temani';

let katalog: TemaniJourney[] = SEED;
let sumber: 'seed' | 'supabase' = 'seed';
let sedangMemuat: Promise<void> | null = null;
const pendengar = new Set<() => void>();

export function dariKatalog(j: JourneyKatalog): TemaniJourney {
  return {
    slug: j.slug,
    judul: j.judul,
    deskripsi: j.deskripsi,
    nilaiTerkait: j.nilai_terkait as NilaiAkar[],
    usiaMinBulan: j.usia_min_bulan,
    usiaMaxBulan: j.usia_max_bulan,
    durasiHari: j.hari.length,
    status: 'disetujui',
    kebiasaanUtama: j.kebiasaan_utama || undefined,
    hari: j.hari.map(h => ({
      hari: h.hari,
      fokus: h.fokus_hari,
      script: h.script || undefined,
      kenapaSederhana: h.kenapa_sederhana || undefined,
      kenapaEvidence: h.kenapa_evidence || undefined,
      kenapaSumber: h.kenapa_sumber || null,
      yangDiamati: h.yang_diamati || undefined,
      jenis: h.jenis,
      kebiasaanId: h.kebiasaan_id || undefined,
    })),
  };
}

function umumkan() { pendengar.forEach(fn => fn()); }

/** Muat ulang katalog dari Supabase (dipanggil otomatis oleh hook; aman dipanggil berulang). */
export function muatUlangKatalog(): Promise<void> {
  if (sedangMemuat) return sedangMemuat;
  sedangMemuat = muatKatalogTemani()
    .then(rows => {
      if (rows && rows.length > 0) {
        katalog = rows.map(dariKatalog);
        sumber = 'supabase';
      } else {
        katalog = SEED;
        sumber = 'seed';
      }
      umumkan();
    })
    .finally(() => { sedangMemuat = null; });
  return sedangMemuat;
}

let sudahDimuat = false;
function berlangganan(fn: () => void) {
  pendengar.add(fn);
  if (!sudahDimuat) { sudahDimuat = true; void muatUlangKatalog(); }
  return () => { pendengar.delete(fn); };
}

/** Daftar perjalanan terkini (re-render otomatis saat katalog selesai dimuat). */
export function useTemaniKatalog(): TemaniJourney[] {
  return useSyncExternalStore(berlangganan, () => katalog, () => katalog);
}

export function sumberKatalog(): 'seed' | 'supabase' { return sumber; }

/** Perjalanan yang cocok untuk usia anak & (bila ada) nilai keluarga. */
export function journeysUntuk(daftar: TemaniJourney[], usiaBulan: number | null, nilaiKeluarga: readonly NilaiAkar[]): TemaniJourney[] {
  return daftar.filter(j => {
    const cocokUsia = usiaBulan === null ? true : usiaBulan >= j.usiaMinBulan && usiaBulan <= j.usiaMaxBulan;
    const cocokNilai = nilaiKeluarga.length === 0 ? true : j.nilaiTerkait.some(n => nilaiKeluarga.includes(n));
    return cocokUsia && cocokNilai;
  });
}

/** Journey yang menuju satu Kebiasaan Baik (kb id) — untuk cross-link dari Bekal. */
export function journeyUntukKebiasaan(daftar: TemaniJourney[], kbId: string | undefined | null): TemaniJourney | undefined {
  if (!kbId) return undefined;
  return daftar.find(j => j.kebiasaanUtama === kbId || j.hari.some(h => h.kebiasaanId === kbId));
}
