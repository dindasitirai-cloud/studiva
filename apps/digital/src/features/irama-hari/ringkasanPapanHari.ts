// =============================================================
// ringkasanPapanHari — ringkasan papan Irama Keseharian untuk SATU tanggal
// (Phase 21E). Dipakai Beranda "Rencana hari ini" agar menampilkan isi yang SAMA
// dengan papan Kelola: kebiasaan rutin (usia + nilai fokus), tambahan pengguna,
// saran Rekah (Ajak Main · Wawasan Tumbuh · Temani, lewat saranRekahPerKeg), dan
// "Untuk dikelola" (Inbox + rencana kelola hari ini). Status per slot memakai kata,
// bukan angka (invariant tanpa angka progres).
// Hanya membaca — tidak menulis apa pun. Copy DRAFT → review Psikolog Fitri.
// =============================================================
import { useEffect, useMemo, useState } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import { useKnowledgeLibrary } from '../../context/KnowledgeLibraryContext';
import { useIdPenyetir } from './terlihatData';
import { getCentangKebiasaan } from '../../lib/supabase/rekah';
import { useTemaniKatalog } from '../temani/temaniKatalog';
import { useTemaniSelesaiHari } from '../temani/temaniKelola';
import { DEFAULT_KOLOM, bacaStoreHari, slotKegHari } from './dayPlanData';
import type { Item, Waktu } from './dayPlanData';
import { saringKebiasaanKartu, useIramaKatalog } from './iramaKatalog';
import { useParameterPenyesuaian, usePetaStore } from './kehidupanData';
import { saranRekahPerKeg, bacaProgresTemani, idTemaniDariRekah, domainMinat } from './kurasiPapan';
import { alergenHindariDariPeta, bahasaRumahDariPeta } from './kontenMetadata';
import { useInboxStore } from './inboxData';
import { useRencanaMinggu, seninISO, hariIndex, dariISO } from './rencanaData';

export type SlotRingkas = Waktu | 'dikelola';
export interface RencanaGrup { keg: string; todos: string[] }
export interface RingkasanPapanHari {
  items: Record<SlotRingkas, RencanaGrup[]>;
  status: Record<SlotRingkas, string>;
  kosong: boolean;
}

const MAKS_BARIS = 3;

function statusKata(total: number, selesai: number): string {
  if (total === 0) return 'Belum ada isi';
  if (selesai === 0) return 'Belum dimulai';
  if (selesai >= total) return 'Sudah dicoba semua';
  return 'Sudah ada yang dicoba';
}

export function useRingkasanPapanHari(idAnak: string, tanggal: string, nilaiFokus: readonly NilaiAkar[]): RingkasanPapanHari {
  const { usiaBulan } = useChildProfile();
  const usia = usiaBulan ?? 0;
  useIramaKatalog(); // render ulang saat katalog admin selesai dimuat
  const { publishedActivities } = useLearningStrategies();
  const { publishedCards } = useKnowledgeLibrary();
  const idPenyetir = useIdPenyetir(idAnak); // yang terlihat ≤21 hari (Jurnal)
  const param = useParameterPenyesuaian(idAnak);
  const journeys = useTemaniKatalog();
  const inbox = useInboxStore(idAnak);
  const rencana = useRencanaMinggu(idAnak, seninISO(dariISO(tanggal)));

  // Centang kebiasaan nyata hari ini (sumber sama dengan Pita Kebiasaan).
  const [centang, setCentang] = useState<Record<string, string[]>>({});
  useEffect(() => {
    let batal = false;
    getCentangKebiasaan(idAnak, tanggal)
      .then(h => { if (!batal) setCentang((h as Record<string, Record<string, string[]>>)[tanggal] ?? {}); })
      .catch(() => { /* belum masuk / offline */ });
    return () => { batal = true; };
  }, [idAnak, tanggal]);

  const store = bacaStoreHari(idAnak, tanggal);
  const progresTemani = bacaProgresTemani(idAnak);
  const petaJawaban = usePetaStore(idAnak).jawaban;
  const minatMain = domainMinat(petaJawaban['a_main'] ?? []);
  const hindariAlergen = alergenHindariDariPeta(petaJawaban);
  const rumahBahasa = bahasaRumahDariPeta(petaJawaban);
  const fokusSet = useMemo(() => new Set(nilaiFokus), [nilaiFokus]);

  const kegDiSlot = (slot: Waktu) => slotKegHari(store, slot).map(k => k.key);
  const saran = saranRekahPerKeg({
    idAnak, tanggal, usiaBulan: usia, kegiatan: publishedActivities, kartu: publishedCards,
    idObservasi: idPenyetir, minat: minatMain, minatLabel: petaJawaban['a_main'] ?? [], hindariAlergen, dwibahasa: rumahBahasa.dwibahasa, param, store, journeys, progresTemani, kegDiSlot,
  });
  const adaTemani = Object.values(saran).flat().some(it => it.id.startsWith('rk-tm-'));
  const temani = useTemaniSelesaiHari(idAnak, tanggal, adaTemani);

  const doneExtra = new Set(store.doneExtra);
  const hidden = new Set(store.hidden);
  const items = { pagi: [], siang: [], malam: [], dikelola: [] } as Record<SlotRingkas, RencanaGrup[]>;
  const status = {} as Record<SlotRingkas, string>;

  // Per slot: tampilkan kegiatan default (Bangun tidur, Sarapan, ...) lengkap dengan to-do-nya,
  // sama dengan papan Kelola (kebiasaan disaring usia + nilai fokus; saran Rekah & tambahan ikut).
  for (const kol of DEFAULT_KOLOM) {
    const grup: RencanaGrup[] = [];
    let total = 0; let selesai = 0;
    for (const k of slotKegHari(store, kol.key)) {
      const dasar = saringKebiasaanKartu(k.items, usia, fokusSet)
        .filter(i => !hidden.has(i.id) && (i.tipe !== 'kebiasaan' || (i.n != null && fokusSet.has(i.n))));
      const semua: Item[] = [...dasar, ...(saran[k.key] ?? []), ...(store.extra[k.key] ?? [])];
      let non = semua.filter(i => i.tipe !== 'kebiasaan');
      if (param.kurangiJumlah) non = non.slice(0, 1); // sama dengan papan: hari dibuat ringan
      const keb = semua.filter(i => i.tipe === 'kebiasaan');
      const todos: string[] = [];
      for (const i of non) {
        const m = idTemaniDariRekah(i.id);
        const done = doneExtra.has(i.id) || (!!m && temani.ids.has(m.idTemani));
        todos.push(i.t); total++; if (done) selesai++;
      }
      for (const i of keb) {
        const n = i.n;
        const done = !!n && (centang[n] ?? []).includes(i.id);
        todos.push(i.t); total++; if (done) selesai++;
      }
      grup.push({ keg: k.nm, todos });
    }
    items[kol.key] = grup;
    status[kol.key] = statusKata(total, selesai);
  }

  // Untuk dikelola = Inbox (belum selesai) + rencana "kelola" hari ini — sama dengan kolom kanan Kelola.
  const hari = hariIndex(dariISO(tanggal));
  const kelolaHari = rencana.items.filter(p => p.hari === hari && p.slot === 'kelola' && !p.done).map(p => p.teks);
  const dikelola = [...inbox.todo.map(i => i.judul), ...kelolaHari];
  const dikelolaBaris = dikelola.slice(0, MAKS_BARIS).concat(dikelola.length > MAKS_BARIS ? ['dan lainnya di Kelola'] : []);
  items.dikelola = dikelolaBaris.length ? [{ keg: '', todos: dikelolaBaris }] : [];
  status.dikelola = dikelola.length > 0 ? 'Atur waktu' : 'Belum ada isi';

  const adaIsi = (k: SlotRingkas) => items[k].some(g => g.keg !== '' || g.todos.length > 0);
  const kosong = (['pagi', 'siang', 'malam', 'dikelola'] as SlotRingkas[]).every(k => !adaIsi(k));
  return { items, status, kosong };
}
