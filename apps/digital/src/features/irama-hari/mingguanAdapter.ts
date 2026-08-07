// Adapter: mengkonversi PilihanHarian + data katalog → HariIrama.
// Logika transformasi berada di sini agar komponen React hanya berurusan dengan
// tipe HariIrama yang bersih (tanpa referensi ke ItemBekal atau KnowledgeCard).

import type { PilihanHarian, BlokWaktu } from './PilihanHarianContext';
import type { ItemBekal } from '../beranda-usia/bekal';
import type { HariIrama, ItemIrama } from '@studiva/shared';
import { AGE_RANGES, CARDS } from '../../pages/DashboardPages/Tier2/knowledgeCardData';

// Re-ekspor DomainKeyIrama agar domainWarnaIrama.ts bisa mengimpornya dari sini.
export type { DomainKeyIrama } from '@studiva/shared';

const BLOK_URUTAN: BlokWaktu[] = ['pagi', 'siang', 'sore', 'jelangTidur'];

/** Ambil warna cover kartu Wawasan Tumbuh dari AGE_RANGES. */
function ambilWarnaCover(ageKey: string): string {
  return AGE_RANGES.find(r => r.key === ageKey)?.fill ?? '#FFF3F6';
}

/**
 * Konversi satu PilihanHarian + kolam kegiatan ke HariIrama.
 *
 * Catatan: penempatan otomatis per blok (cycling pagi→siang→sore→jelangTidur)
 * sudah dihitung oleh penempatanEfektif di PilihanHarianContext.
 * Adapter ini menerima penempatanEfektif sebagai argumen terpisah.
 */
export function pilihanKeHari(
  pilihan: PilihanHarian,
  penempatanEfektif: Record<string, BlokWaktu | null>,
  kolamMap: ReadonlyMap<string, ItemBekal>,
): HariIrama {
  const slot: Record<BlokWaktu, ItemIrama[]> = {
    pagi: [], siang: [], sore: [], jelangTidur: [],
  };

  // Ajak Main: item dari ditambah + penempatanEfektif
  pilihan.ditambah.forEach((id, indeks) => {
    const item = kolamMap.get(id);
    if (!item) return;
    const blok = penempatanEfektif[id];
    if (!blok) return;

    // Pastikan domainKey adalah DomainKeyIrama yang valid.
    // ItemBekal.domain bisa berupa DomainKey ('mk'|...) atau DomainCode ('FM'|...).
    // Untuk Ajak Main (aktivitas), tipenya adalah DomainKey.
    const dk = item.domain as string;
    const isDomainKey = ['mk','mh','bhs','kog','sos','sen','fe'].includes(dk);

    const iramaItem: ItemIrama = {
      id,
      jenis: 'ajakMain',
      judul: item.judul,
      urutan: indeks,
      selesai: pilihan.selesai.includes(id),
      domainKey: isDomainKey ? (dk as ItemIrama['domainKey']) : undefined,
    };
    slot[blok].push(iramaItem);
  });

  // Wawasan Tumbuh: satu item per wawasanIds + wawasanBloks
  const wawasanIds: string[] = (pilihan as any).wawasanIds
    ?? ((pilihan as any).wawasanId ? [(pilihan as any).wawasanId] : []);
  const wawasanBloks: Record<string, string> = (pilihan as any).wawasanBloks ?? {};
  for (const wId of wawasanIds) {
    const kartu = CARDS.find(c => c.id === wId);
    if (kartu) {
      const warnaCover = ambilWarnaCover(kartu.ageKey);
      const blok = (wawasanBloks[wId] ?? 'jelangTidur') as BlokWaktu;
      const iramaItem: ItemIrama = {
        id: wId,
        jenis: 'wawasanTumbuh',
        judul: kartu.title,
        urutan: 9999,
        selesai: pilihan.selesai.includes(wId),
        warnaCover,
        kartuId: wId,
      };
      slot[blok].push(iramaItem);
    }
  }

  // Urutkan tiap slot berdasarkan urutan
  for (const blok of BLOK_URUTAN) {
    slot[blok].sort((a, b) => a.urutan - b.urutan);
  }

  return { tanggal: pilihan.tanggal, slot };
}

/**
 * Bangun kolam lookup dari array ItemBekal.
 * Pisahkan ke sini agar komponen tidak perlu menghitung Map setiap render.
 */
export function buatKolamMap(kolam: readonly ItemBekal[]): ReadonlyMap<string, ItemBekal> {
  return new Map(kolam.map(i => [i.id, i]));
}
