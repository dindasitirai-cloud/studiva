// Bantu — katalog situasi yang dilihat orang tua.
// Sumber: tabel bantu_situasi (dikelola di /rekah-admin/bantu, tayang setelah disetujui
// Psikolog Fitri). Bila tabel belum ada / belum ada yang tayang / belum login → seed
// bantuSeed.ts agar halaman Bantu tidak kosong.
import { useSyncExternalStore } from 'react';
import { BANTU_SITUASI as SEED, OPSI_MEMICU_B5 } from './bantuSeed';
import type { BantuSituasi } from './bantuSeed';
import { muatKatalogBantu } from '../../lib/supabase/bantu';
import type { SituasiKatalog } from '../../lib/supabase/bantu';

let katalog: BantuSituasi[] = SEED;
let sedangMemuat: Promise<void> | null = null;
let sudahDimuat = false;
const pendengar = new Set<() => void>();

export function dariKatalogBantu(s: SituasiKatalog): BantuSituasi {
  return {
    slug: s.slug,
    label: s.label,
    ringkas: s.ringkas || undefined,
    kategori: s.kategori,
    sensitifKeselamatan: s.sensitif_keselamatan,
    status: 'disetujui',
    clarify: s.clarify.map(c => ({ pertanyaan: c.pertanyaan, opsi: c.opsi, opsiKeselamatan: c.opsi_keselamatan })),
    respons: {
      validasi: s.validasi,
      langkah: s.langkah,
      yangDiamati: s.yang_diamati || undefined,
      kenapaSederhana: s.kenapa_sederhana || undefined,
      kenapaSumber: s.kenapa_sumber || null,
    },
  };
}

export function muatUlangKatalogBantu(): Promise<void> {
  if (sedangMemuat) return sedangMemuat;
  sedangMemuat = muatKatalogBantu()
    .then(rows => {
      katalog = rows && rows.length > 0 ? rows.map(dariKatalogBantu) : SEED;
      pendengar.forEach(fn => fn());
    })
    .finally(() => { sedangMemuat = null; });
  return sedangMemuat;
}

function berlangganan(fn: () => void) {
  pendengar.add(fn);
  if (!sudahDimuat) { sudahDimuat = true; void muatUlangKatalogBantu(); }
  return () => { pendengar.delete(fn); };
}

export function useBantuKatalog(): BantuSituasi[] {
  return useSyncExternalStore(berlangganan, () => katalog, () => katalog);
}

/** Opsi clarify yang membuka layar keselamatan: daftar global (kode) + tanda per situasi (admin). */
export function opsiMemicuB5(situasi: BantuSituasi | null, opsi: string): boolean {
  if (OPSI_MEMICU_B5.includes(opsi)) return true;
  return !!situasi?.clarify.some(c => c.opsiKeselamatan?.includes(opsi));
}
