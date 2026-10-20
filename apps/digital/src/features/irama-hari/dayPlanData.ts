// =============================================================
// dayPlanData — model & store per-hari bersama untuk Kelola.
// Satu sumber per tanggal (localStorage `rekah_hariini_v3_<idAnak>_<YYYY-MM-DD>`)
// dipakai oleh papan "Hari Ini" (tanggal berjalan) dan "Rencana Minggu"
// (tanggal mana pun). Berisi kegiatan default + tambahan + urutan + to-do.
// Penjadwalan dari Bekal menulis ke store tanggal tujuan lewat jadwalkanKeHari().
// Konten default = SEED (DRAFT, review Psikolog Fitri Effendy).
// =============================================================
import { useEffect, useMemo, useState } from 'react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { REGISTRY_BUNGA } from '../akar-keluarga/registryBunga';
import { derivedRiwayatSiram, tingkatMekar } from '@studiva/shared';
import type { IkonKey } from './susunanDefault';
import { kegTemplate, useIramaKatalog } from './iramaKatalog';
import type { KatalogIrama } from './iramaKatalog';

export type Tipe = 'kebiasaan' | 'main' | 'buku' | 'lainnya';
export type Waktu = 'pagi' | 'siang' | 'malam';

export const LB: Record<Tipe, string> = { kebiasaan: 'Kebiasaan baik yang bisa dilakukan', main: 'Ajak main', buku: 'Baca buku', lainnya: 'Lainnya' };
export const SUBT: Record<'main' | 'buku' | 'lainnya', string> = { main: 'dari Bekal Ajak Main', buku: 'dari Bekal Wawasan Tumbuh', lainnya: 'buatan kamu' };
export const TINT: Record<'main' | 'buku' | 'lainnya', [string, string]> = { main: ['#FCE4EE', '#C0567F'], buku: ['#EFE9FB', '#7A5CA6'], lainnya: ['#F1ECF0', '#8A7385'] };
export const CHIP: Record<'main' | 'buku' | 'lainnya', [string, string]> = { main: ['#F3EEF1', '#8A5A74'], buku: ['#EFE9FD', '#5B3FAF'], lainnya: ['#F1ECF0', '#8A7385'] };
export const labelWarna = (tp: Tipe) => tp === 'kebiasaan' ? '#5F84E6' : tp === 'main' ? '#D2559A' : tp === 'buku' ? '#7A5CA6' : '#8A7385';
export const statusMekar = (l: number) => l >= 3 ? 'Mekar' : l >= 1 ? 'Tumbuh' : 'Kuncup';
export const idNilai = (n: string) => REGISTRY_BUNGA.find(b => b.nama === n)?.id ?? n.toLowerCase().replace(/\s+/g, '-');

export interface Item {
  id: string; tipe: Tipe; t: string; n?: NilaiAkar;
  /** Butir katalog Kebiasaan Baik (Phase 19): semua nilai + rentang usia (bulan, inklusif). */
  nilaiList?: NilaiAkar[]; usiaMin?: number; usiaMax?: number;
  /** Rujukan butir Kebiasaan Baik (teks; tampil sebagai tautan). */
  sumber?: string;
  /** Phase 21C: 'rekah' = saran yang dipilih Rekah (kurasiPapan), bukan ditambah pengguna. */
  asal?: 'rekah';
  /** Alasan singkat kenapa Rekah memilihnya (DRAFT copy). */
  alasan?: string;
  /** Label asal yang menggantikan label tipe (mis. "dari Temani · …"). */
  labelSumber?: string;
}
export interface KegDef { key: string; wk: string; ik: IkonKey; nm: string; items: Item[] }
export interface KolomDef { key: Waktu; label: string; dot: string; soft: string; keg: KegDef[] }

// Label & warna kolom dipakai papan. Daftar `keg` di sini kini hanya cadangan historis:
// kegiatan template + kebiasaan rutinnya diambil dari katalog Irama (iramaKatalog.ts),
// yang bisa diatur admin di /rekah-admin/sikap.
export const DEFAULT_KOLOM: KolomDef[] = [
  { key: 'pagi', label: 'Pagi', dot: '#F06BA8', soft: '#FDEAF3', keg: [
    { key: 'bangun', wk: '06:30', ik: 'bangun', nm: 'Bangun tidur', items: [{ id: 'kbd-bangun-1', tipe: 'kebiasaan', t: 'Sapa hangat & kontak mata', n: 'Kasih Sayang' }] },
    { key: 'sarapan', wk: '07:30', ik: 'makan', nm: 'Sarapan', items: [{ id: 'kbd-sarap-1', tipe: 'kebiasaan', t: 'Cuci tangan sebelum makan', n: 'Kemandirian' }, { id: 'kbd-sarap-2', tipe: 'kebiasaan', t: 'Ucap terima kasih', n: 'Syukur' }] },
    { key: 'mandipagi', wk: '08:30', ik: 'mandi', nm: 'Mandi pagi', items: [{ id: 'kbd-mandi-1', tipe: 'kebiasaan', t: 'Coba pakai baju sendiri', n: 'Kemandirian' }] },
  ] },
  { key: 'siang', label: 'Siang', dot: '#E9A93B', soft: '#FDF2DC', keg: [
    { key: 'main', wk: '10:00', ik: 'main', nm: 'Main bersama', items: [{ id: 'kbd-main-1', tipe: 'kebiasaan', t: 'Bermain bergiliran', n: 'Berbagi' }, { id: 'kbd-main-2', tipe: 'kebiasaan', t: 'Tunjukkan perasaan teman', n: 'Empati' }, { id: 'md-main-1', tipe: 'main', t: 'Tumpuk balok warna' }] },
    { key: 'makansiang', wk: '12:00', ik: 'sup', nm: 'Makan siang', items: [{ id: 'kbd-msiang-1', tipe: 'kebiasaan', t: 'Makan sendiri', n: 'Kemandirian' }] },
    { key: 'tidursiang', wk: '13:00', ik: 'tidurSiang', nm: 'Tidur siang', items: [] },
  ] },
  { key: 'malam', label: 'Malam', dot: '#8B6FD6', soft: '#F0EBFB', keg: [
    { key: 'makanmalam', wk: '18:00', ik: 'sup', nm: 'Makan malam', items: [{ id: 'kbd-mmalam-1', tipe: 'kebiasaan', t: 'Bantu siapkan meja', n: 'Tanggung Jawab' }] },
    { key: 'beres', wk: '18:45', ik: 'beres', nm: 'Beres-beres', items: [{ id: 'kbd-beres-1', tipe: 'kebiasaan', t: 'Rapikan mainan sendiri', n: 'Tanggung Jawab' }] },
    { key: 'tidur', wk: '19:30', ik: 'tidur', nm: 'Rutinitas sebelum tidur', items: [{ id: 'kbd-tidur-1', tipe: 'kebiasaan', t: 'Sikat gigi sendiri', n: 'Kemandirian' }, { id: 'kbd-tidur-2', tipe: 'kebiasaan', t: 'Cerita & doa', n: 'Kasih Sayang' }, { id: 'bk-tidur-1', tipe: 'buku', t: 'Baca buku bersama' }] },
  ] },
];

// Cadangan historis — situasional kini dari katalog Kebiasaan Baik (situasionalUntuk).
export const SITUASIONAL: { id: string; t: string; n: NilaiAkar; kapan: string }[] = [
  { id: 'sit-1', t: 'Tetap tenang saat anak rewel', n: 'Sabar', kapan: 'saat rewel' },
  { id: 'sit-2', t: 'Berbagi mainan saat ada teman', n: 'Berbagi', kapan: 'saat main dgn teman' },
  { id: 'sit-3', t: 'Minta maaf saat berbuat salah', n: 'Kejujuran', kapan: 'saat ada masalah' },
  { id: 'sit-4', t: 'Berani coba hal baru', n: 'Keberanian', kapan: 'saat ragu' },
];

export const ORDER: Tipe[] = ['kebiasaan', 'main', 'buku', 'lainnya'];

export interface KegBuatan { id: string; nm: string; wk?: string }
export interface Store {
  extra: Record<string, Item[]>;
  hidden: string[];
  hiddenKeg: string[];
  doneExtra: string[];
  addedKeg: Record<string, KegBuatan[]>;
  order: Record<string, string[]>;
  /** Saran Rekah (rk-) yang diganti pengguna hari itu — kurasi memilih yang lain. */
  diganti?: string[];
  /** Kegiatan bawaan yang diubah HANYA untuk hari ini (nama / jam). */
  ubahKeg?: Record<string, UbahKeg>;
}

// ─── Ubah kegiatan bawaan (nama & jam) ───────────────────────────────────────
// Dua cakupan: "hanya hari ini" (store hari itu → ubahKeg) atau "jadikan default"
// (per anak, berlaku di semua hari yang tidak punya ubahan khusus hari itu).
export interface UbahKeg {
  nm?: string; wk?: string;
  /** To-do yang ditambahkan ke DEFAULT kegiatan ini (muncul di semua hari). */
  tambah?: Item[];
  /** To-do bawaan yang dihapus dari DEFAULT kegiatan ini. */
  sembunyi?: string[];
}
const kunciDefaultKeg = (idAnak: string) => `rekah_irama_default_${idAnak}`;
const EVENT_DEFAULT_KEG = 'rekah-irama-default';
const EVENT_HARI = 'rekah-hari-ubah'; // broadcast saat store satu tanggal berubah via fungsi non-hook (jadwalkanKeHari/tulisStoreHari)
export function bacaDefaultKeg(idAnak: string): Record<string, UbahKeg> {
  try { const r = localStorage.getItem(kunciDefaultKeg(idAnak)); if (r) { const p = JSON.parse(r); if (p && typeof p === 'object') return p as Record<string, UbahKeg>; } } catch { /* abaikan */ }
  return {};
}
function tulisDefaultKeg(idAnak: string, v: Record<string, UbahKeg>): void {
  try { localStorage.setItem(kunciDefaultKeg(idAnak), JSON.stringify(v)); } catch { /* abaikan */ }
  try { window.dispatchEvent(new CustomEvent(EVENT_DEFAULT_KEG, { detail: idAnak })); } catch { /* abaikan */ }
}
export const KOSONG: Store = { extra: {}, hidden: [], hiddenKeg: [], doneExtra: [], addedKeg: {}, order: {} };

const dayKey = (idAnak: string, tanggal: string) => `rekah_hariini_v3_${idAnak}_${tanggal}`;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;

function loadStore(kunci: string): Store {
  try { const r = localStorage.getItem(kunci); if (r) return { ...KOSONG, ...JSON.parse(r) }; } catch { /* abaikan */ }
  return { ...KOSONG };
}

/** Kegiatan pada satu slot (default belum disembunyikan + buatan), terurut. */
export interface KegRingkas {
  key: string; nm: string; wk?: string; items: Item[]; isDefault: boolean;
  /** Bawaan yang diubah: 'hari' = hanya hari ini, 'default' = default keluarga. */
  diubah?: 'hari' | 'default';
  /** Nama & jam bawaan Rekah (sebelum diubah). */
  asli?: { nm: string; wk?: string };
}

function susunKeg(store: Store, slot: Waktu, katalog?: KatalogIrama, ubahDefault: Record<string, UbahKeg> = {}): KegRingkas[] {
  const defaults: KegRingkas[] = kegTemplate(slot, katalog).filter(k => !store.hiddenKeg.includes(k.key))
    .map(k => {
      const uh = store.ubahKeg?.[k.key]; const ud = ubahDefault[k.key];
      const u = { ...ud, ...uh };
      const sembunyiDef = new Set(ud?.sembunyi ?? []);
      const adaDefault = !!ud && (ud.nm !== undefined || ud.wk !== undefined || (ud.tambah?.length ?? 0) > 0 || sembunyiDef.size > 0);
      return {
        key: k.key, nm: u.nm || k.nm, wk: u.wk !== undefined ? (u.wk || undefined) : k.wk,
        items: [...k.items.filter(i => !sembunyiDef.has(i.id)), ...(ud?.tambah ?? [])], isDefault: true,
        diubah: uh ? 'hari' as const : adaDefault ? 'default' as const : undefined,
        asli: { nm: k.nm, wk: k.wk },
      };
    });
  const added: KegRingkas[] = (store.addedKeg[slot] ?? []).map(k => ({ key: k.id, nm: k.nm, wk: k.wk || 'buatan kamu', items: [], isDefault: false }));
  const all = [...defaults, ...added];
  const saved = store.order[slot];
  if (!saved || saved.length === 0) return all;
  const byKey = new Map(all.map(a => [a.key, a]));
  const out: KegRingkas[] = [];
  for (const k of saved) { const a = byKey.get(k); if (a) { out.push(a); byKey.delete(k); } }
  for (const a of all) if (byKey.has(a.key)) out.push(a);
  return out;
}

export interface DayPlan {
  store: Store;
  orderedKeg: (slot: Waktu) => KegRingkas[];
  addExtra: (kegKey: string, tipe: Tipe, teks: string, nilai?: NilaiAkar) => void;
  toggleExtra: (id: string) => void;
  hideItem: (id: string) => void;
  delExtra: (kegKey: string, id: string) => void;
  addKeg: (slot: Waktu, nm: string, wk?: string) => void;
  delKeg: (slot: Waktu, id: string) => void;
  hideKeg: (key: string) => void;
  reorder: (slot: Waktu, key: string, arah: -1 | 1) => void;
  /** Simpan saran Rekah ke papan (mis. saat ditandai selesai) agar tercatat & ikut Tinjau Minggu. */
  adopsi: (kegKey: string, item: Item, selesai: boolean) => void;
  /** Ubah nama/jam kegiatan. Bawaan: cakupan 'hari' atau 'default'; buatan: selalu hari ini. */
  ubahKeg: (slot: Waktu, key: string, nm: string, wk: string, cakupan: 'hari' | 'default') => void;
  /** Kembalikan kegiatan bawaan ke nama/jam Rekah (hari ini + default keluarga). */
  pulihkanKeg: (key: string) => void;
  /** Tambah to-do ke DEFAULT kegiatan bawaan (muncul di semua hari). */
  tambahTodoDefault: (kegKey: string, tipe: Tipe, teks: string, nilai?: NilaiAkar) => void;
  /** Hapus to-do dari DEFAULT kegiatan bawaan (semua hari). */
  hapusTodoDefault: (kegKey: string, id: string) => void;
  /** Ganti saran Rekah (Ajak Main / Wawasan Tumbuh) dengan pilihan Rekah lain. */
  gantiRekah: (kegKey: string, id: string) => void;
  /** Ganti Ajak Main / Wawasan Tumbuh pilihan pengguna dengan judul lain (posisi tetap). */
  gantiExtra: (kegKey: string, id: string, judul: string) => void;
}

export function useDayPlan(idAnak: string, tanggal: string): DayPlan {
  const kunci = dayKey(idAnak, tanggal);
  const awal = useMemo(() => loadStore(kunci), [kunci]);
  const [store, setStore] = useState<Store>(awal);
  const katalog = useIramaKatalog(); // render ulang saat katalog admin selesai dimuat
  const [ubahDefault, setUbahDefault] = useState<Record<string, UbahKeg>>(() => bacaDefaultKeg(idAnak));
  useEffect(() => {
    setUbahDefault(bacaDefaultKeg(idAnak));
    const h = (e: Event) => { if ((e as CustomEvent).detail === idAnak) setUbahDefault(bacaDefaultKeg(idAnak)); };
    window.addEventListener(EVENT_DEFAULT_KEG, h);
    return () => window.removeEventListener(EVENT_DEFAULT_KEG, h);
  }, [idAnak]);
  // Sinkron saat store tanggal ini ditulis dari luar hook (mis. "Tambah ke Hari Ini" dari Kehidupan Keluarga).
  useEffect(() => {
    const h = (e: Event) => { if ((e as CustomEvent).detail === kunci) setStore(loadStore(kunci)); };
    window.addEventListener(EVENT_HARI, h);
    return () => window.removeEventListener(EVENT_HARI, h);
  }, [kunci]);
  const [kAktif, setKAktif] = useState(kunci);
  if (kAktif !== kunci) { setKAktif(kunci); setStore(loadStore(kunci)); }

  const simpan = (n: Store) => { setStore(n); try { localStorage.setItem(kunci, JSON.stringify(n)); } catch { /* abaikan */ } };

  const addExtra = (kegKey: string, tipe: Tipe, teks: string, nilai?: NilaiAkar) => {
    const t = teks.trim(); if (!t) return;
    const item: Item = { id: uid('e'), tipe, t, n: tipe === 'kebiasaan' ? nilai : undefined };
    simpan({ ...store, extra: { ...store.extra, [kegKey]: [...(store.extra[kegKey] ?? []), item] } });
  };
  const toggleExtra = (id: string) => { const s = new Set(store.doneExtra); s.has(id) ? s.delete(id) : s.add(id); simpan({ ...store, doneExtra: [...s] }); };
  const hideItem = (id: string) => simpan({ ...store, hidden: [...new Set([...store.hidden, id])] });
  // Saran Rekah (rk-) yang dihapus juga disembunyikan, agar tidak muncul lagi dari kurasi hari itu.
  const delExtra = (kegKey: string, id: string) => simpan({ ...store, extra: { ...store.extra, [kegKey]: (store.extra[kegKey] ?? []).filter(e => e.id !== id) }, doneExtra: store.doneExtra.filter(x => x !== id), hidden: id.startsWith('rk-') ? [...new Set([...store.hidden, id])] : store.hidden });
  const addKeg = (slot: Waktu, nm: string, wk?: string) => { const t = nm.trim(); if (!t) return; simpan({ ...store, addedKeg: { ...store.addedKeg, [slot]: [...(store.addedKeg[slot] ?? []), { id: uid('k'), nm: t, wk }] } }); };
  const delKeg = (slot: Waktu, id: string) => { const ex = { ...store.extra }; delete ex[id]; simpan({ ...store, addedKeg: { ...store.addedKeg, [slot]: (store.addedKeg[slot] ?? []).filter(k => k.id !== id) }, extra: ex }); };
  const hideKeg = (key: string) => simpan({ ...store, hiddenKeg: [...new Set([...store.hiddenKeg, key])] });
  const reorder = (slot: Waktu, key: string, arah: -1 | 1) => {
    const cur = susunKeg(store, slot, katalog, ubahDefault).map(a => a.key);
    const i = cur.indexOf(key); const j = i + arah;
    if (i < 0 || j < 0 || j >= cur.length) return;
    [cur[i], cur[j]] = [cur[j], cur[i]];
    simpan({ ...store, order: { ...store.order, [slot]: cur } });
  };

  const adopsi = (kegKey: string, item: Item, selesai: boolean) => {
    if ((store.extra[kegKey] ?? []).some(e => e.id === item.id)) return;
    simpan({ ...store, extra: { ...store.extra, [kegKey]: [...(store.extra[kegKey] ?? []), item] }, doneExtra: selesai ? [...new Set([...store.doneExtra, item.id])] : store.doneExtra });
  };

  const gantiRekah = (kegKey: string, id: string) => simpan({
    ...store,
    extra: { ...store.extra, [kegKey]: (store.extra[kegKey] ?? []).filter(e => e.id !== id) },
    doneExtra: store.doneExtra.filter(x => x !== id),
    diganti: [...new Set([...(store.diganti ?? []), id])],
  });

  const gantiExtra = (kegKey: string, id: string, judul: string) => {
    const t = judul.trim(); if (!t) return;
    simpan({
      ...store,
      extra: { ...store.extra, [kegKey]: (store.extra[kegKey] ?? []).map(e => e.id === id ? { ...e, id: uid('e'), t } : e) },
      doneExtra: store.doneExtra.filter(x => x !== id),
    });
  };

  const ubahKeg = (slot: Waktu, key: string, nm: string, wk: string, cakupan: 'hari' | 'default') => {
    const n = nm.trim(); if (!n) return;
    const w = wk.trim();
    const buatan = (store.addedKeg[slot] ?? []).some(k => k.id === key);
    if (buatan) {
      simpan({ ...store, addedKeg: { ...store.addedKeg, [slot]: (store.addedKeg[slot] ?? []).map(k => k.id === key ? { ...k, nm: n, wk: w || undefined } : k) } });
      return;
    }
    if (cakupan === 'hari') {
      simpan({ ...store, ubahKeg: { ...(store.ubahKeg ?? {}), [key]: { nm: n, wk: w } } });
      return;
    }
    const lama = bacaDefaultKeg(idAnak);
    const baru = { ...lama, [key]: { ...lama[key], nm: n, wk: w } };
    tulisDefaultKeg(idAnak, baru);
    setUbahDefault(baru);
    // Hari ini ikut default (hapus ubahan khusus hari ini bila ada).
    if (store.ubahKeg?.[key]) { const u = { ...store.ubahKeg }; delete u[key]; simpan({ ...store, ubahKeg: u }); }
  };
  const pulihkanKeg = (key: string) => {
    const d = { ...bacaDefaultKeg(idAnak) };
    if (key in d) { delete d[key]; tulisDefaultKeg(idAnak, d); setUbahDefault(d); }
    if (store.ubahKeg?.[key]) { const u = { ...store.ubahKeg }; delete u[key]; simpan({ ...store, ubahKeg: u }); }
  };

  const tambahTodoDefault = (kegKey: string, tipe: Tipe, teks: string, nilai?: NilaiAkar) => {
    const t = teks.trim(); if (!t) return;
    const lama = bacaDefaultKeg(idAnak);
    const cur = lama[kegKey] ?? {};
    const item: Item = { id: uid('d'), tipe, t, n: tipe === 'kebiasaan' ? nilai : undefined };
    const baru = { ...lama, [kegKey]: { ...cur, tambah: [...(cur.tambah ?? []), item] } };
    tulisDefaultKeg(idAnak, baru); setUbahDefault(baru);
  };
  const hapusTodoDefault = (kegKey: string, id: string) => {
    const lama = bacaDefaultKeg(idAnak);
    const cur = lama[kegKey] ?? {};
    const dariTambah = (cur.tambah ?? []).some(i => i.id === id);
    const baru = { ...lama, [kegKey]: dariTambah
      ? { ...cur, tambah: (cur.tambah ?? []).filter(i => i.id !== id) }
      : { ...cur, sembunyi: [...new Set([...(cur.sembunyi ?? []), id])] } };
    tulisDefaultKeg(idAnak, baru); setUbahDefault(baru);
  };

  return { store, orderedKeg: (slot) => susunKeg(store, slot, katalog, ubahDefault), ubahKeg, pulihkanKeg, tambahTodoDefault, hapusTodoDefault, addExtra, toggleExtra, hideItem, delExtra, addKeg, delKeg, hideKeg, reorder, adopsi, gantiRekah, gantiExtra };
}

// ─── Penjadwalan dari Bekal ──────────────────────────────────────────────────

/** Daftar kegiatan pada tanggal+slot (untuk pilihan "dalam kegiatan apa"). */
export function targetKegList(idAnak: string, tanggal: string, slot: Waktu): { key: string; nm: string }[] {
  const s = loadStore(dayKey(idAnak, tanggal));
  return susunKeg(s, slot, undefined, bacaDefaultKeg(idAnak)).map(k => ({ key: k.key, nm: k.nm }));
}

/** Jadwalkan item Bekal ke tanggal tertentu. kegKey null = jadi kegiatan tersendiri. */
export function jadwalkanKeHari(idAnak: string, tanggal: string, opts: { slot: Waktu; kegKey: string | null; tipe: Tipe; teks: string; nilai?: NilaiAkar }): void {
  const kunci = dayKey(idAnak, tanggal);
  const s = loadStore(kunci);
  let next: Store;
  if (opts.kegKey) {
    const item: Item = { id: uid('e'), tipe: opts.tipe, t: opts.teks, n: opts.tipe === 'kebiasaan' ? opts.nilai : undefined };
    next = { ...s, extra: { ...s.extra, [opts.kegKey]: [...(s.extra[opts.kegKey] ?? []), item] } };
  } else {
    next = { ...s, addedKeg: { ...s.addedKeg, [opts.slot]: [...(s.addedKeg[opts.slot] ?? []), { id: uid('k'), nm: opts.teks }] } };
  }
  try { localStorage.setItem(kunci, JSON.stringify(next)); } catch { /* abaikan */ }
  try { window.dispatchEvent(new CustomEvent(EVENT_HARI, { detail: kunci })); } catch { /* abaikan */ }
}

// ─── Centang kebiasaan per tanggal ───────────────────────────────────────────
// Hari berjalan memakai centang nyata (Supabase, lewat onReal) agar Pita/mekar
// tumbuh; tanggal lain memakai simpanan lokal per tanggal (perencanaan).

const centangKey = (idAnak: string, tanggal: string) => `rekah_centanglokal_${idAnak}_${tanggal}`;

export interface CentangHari { centangHari: Record<string, string[]>; toggle: (nilai: NilaiAkar, id: string) => void }

export function useCentangHari(
  idAnak: string,
  tanggal: string,
  opts: { hariIni: string; realCentang: Record<string, Record<string, string[]>>; onReal: (nilai: NilaiAkar, id: string) => void },
): CentangHari {
  const isToday = tanggal === opts.hariIni;
  const kunci = centangKey(idAnak, tanggal);
  const awal = useMemo(() => {
    try { const r = localStorage.getItem(kunci); if (r) return JSON.parse(r) as Record<string, string[]>; } catch { /* abaikan */ }
    return {} as Record<string, string[]>;
  }, [kunci]);
  const [lokal, setLokal] = useState<Record<string, string[]>>(awal);
  const [kAktif, setKAktif] = useState(kunci);
  if (kAktif !== kunci) {
    setKAktif(kunci);
    try { const r = localStorage.getItem(kunci); setLokal(r ? JSON.parse(r) : {}); } catch { setLokal({}); }
  }

  if (isToday) {
    return { centangHari: opts.realCentang[tanggal] ?? {}, toggle: (nilai, id) => opts.onReal(nilai, id) };
  }
  const toggle = (nilai: NilaiAkar, id: string) => {
    setLokal(prev => {
      const arr = new Set(prev[nilai] ?? []); arr.has(id) ? arr.delete(id) : arr.add(id);
      const nx = { ...prev, [nilai]: [...arr] };
      try { localStorage.setItem(kunci, JSON.stringify(nx)); } catch { /* abaikan */ }
      return nx;
    });
  };
  return { centangHari: lokal, toggle };
}

/** Fungsi tingkat mekar per nilai dari riwayat centang nyata (Supabase). */
export function buatMekar(centangKebiasaan: Record<string, Record<string, string[]>>): (n: NilaiAkar) => number {
  const derived = derivedRiwayatSiram(centangKebiasaan);
  const dates = Object.keys(centangKebiasaan).sort();
  return (n: NilaiAkar) => { const riw = dates.map(t => (derived[t] ?? []).includes(n)); const lv = tingkatMekar(riw); return lv[lv.length - 1] ?? 0; };
}

// ─── Akses store per hari untuk Tinjau Minggu (Phase 21 · P2) — additive ─────

/** Baca store satu tanggal (tanpa hook). */
export function bacaStoreHari(idAnak: string, tanggal: string): Store {
  return loadStore(dayKey(idAnak, tanggal));
}
/** Tulis store satu tanggal (tanpa hook). Papan yang sedang terbuka memuat ulang saat di-mount. */
export function tulisStoreHari(idAnak: string, tanggal: string, s: Store): void {
  const k = dayKey(idAnak, tanggal);
  try { localStorage.setItem(k, JSON.stringify(s)); } catch { /* abaikan */ }
  try { window.dispatchEvent(new CustomEvent(EVENT_HARI, { detail: k })); } catch { /* abaikan */ }
}
/** Slot (pagi/siang/malam) tempat sebuah kegiatan berada pada store tsb; null bila tak ditemukan. */
export function slotUntukKeg(s: Store, kegKey: string): Waktu | null {
  for (const slot of ['pagi', 'siang', 'malam'] as Waktu[]) {
    if (susunKeg(s, slot).some(k => k.key === kegKey)) return slot;
  }
  return null;
}
/** Id unik dengan awalan (dipakai item hasil tinjauan). */
export const uidItem = (p: string) => uid(p);

/** Kegiatan yang tampil pada satu slot untuk store tsb (tanpa hook) — dipakai ringkasan Beranda. */
export function slotKegHari(s: Store, slot: Waktu): KegRingkas[] {
  return susunKeg(s, slot);
}
