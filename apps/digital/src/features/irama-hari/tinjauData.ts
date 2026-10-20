// =============================================================
// tinjauData — Tinjau Minggu di tab Perjalanan (Phase 21 · P2).
// Orang tua meninjau kegiatan 7 hari terakhir (Ajak Main, Wawasan/buku, buatan
// sendiri yang ada di papan Irama Keseharian), lalu memilih per kegiatan:
//   Pertahankan  → dijadwalkan lagi di hari yang sama minggu depan (CONTINUE)
//   Lebih ringan → dijadwalkan lagi dalam versi ringan (SIMPLIFY, variasiMudah bila ada)
//   Ganti cara   → tidak dijadwalkan; diarahkan mencari alternatif di Bekal (CHANGE_APPROACH)
//   Istirahat    → tidak dijadwalkan
// Hasil tercatat per minggu (localStorage `rekah_tinjau_<idAnak>_<seninISO>`),
// dan setiap penjadwalan bisa DIBATALKAN (item yang dibuat dihapus dari hari tujuan).
//
// Kebiasaan Baik tidak ikut ditinjau: kebiasaan bersifat berulang (Pita Kebiasaan),
// bukan untuk diputuskan ulang tiap minggu.
// Batas: "Cukup berat" TIDAK membuat mesin peringan kedua — diarahkan ke Kehidupan
// Keluarga (energi_caregiver) yang sudah menyetir penyesuaian.
// INVARIANT: tanpa skor/angka progres; semua reversible. Copy DRAFT → Psikolog Fitri.
// Supabase menyusul (butuh sign-off skema).
// =============================================================
import { useMemo, useState } from 'react';
import { localISO, seninISO, dariISO } from './rencanaData';
import { bacaStoreHari, tulisStoreHari, slotUntukKeg, uidItem } from './dayPlanData';
import type { Tipe, Waktu, Item } from './dayPlanData';

export type Keputusan = 'pertahankan' | 'ringan' | 'ganti' | 'istirahat';
export type Rasa = 'ringan' | 'pas' | 'berat';

export const LABEL_KEPUTUSAN: Record<Keputusan, string> = {
  pertahankan: 'Pertahankan',
  ringan: 'Lebih ringan',
  ganti: 'Ganti cara',
  istirahat: 'Istirahat dulu',
};

export const LABEL_TIPE: Record<'main' | 'buku' | 'lainnya', string> = {
  main: 'Ajak Main', buku: 'Wawasan Tumbuh', lainnya: 'Buatan kamu',
};

/** Satu kegiatan yang muncul di papan dalam 7 hari terakhir. */
export interface KegiatanMinggu {
  kunci: string;          // judul ternormalisasi (gabungan kemunculan berulang)
  judul: string;
  tipe: 'main' | 'buku' | 'lainnya';
  selesai: boolean;       // pernah ditandai selesai minggu ini
  /** Kemunculan terakhir — dipakai sebagai acuan hari & slot penjadwalan ulang. */
  tanggal: string;
  kegKey: string;
  slot: Waktu | null;
}

/** Jejak item yang dibuat oleh tinjauan (agar bisa dibatalkan). */
export interface ItemTerjadwal { tanggal: string; kegKey: string | null; slot: Waktu; id: string }

export interface KeputusanItem {
  kunci: string;
  judul: string;
  tipe: KegiatanMinggu['tipe'];
  keputusan: Keputusan;
  teksVersiRingan?: string;
  terjadwal?: ItemTerjadwal;   // ada bila pertahankan/ringan berhasil dijadwalkan
  dibatalkan?: boolean;
  asal: KegiatanMinggu;        // kemunculan acuan (untuk menjadwalkan ulang saat diurungkan)
}

export interface CatatanTinjau {
  minggu: string;            // seninISO minggu yang ditinjau
  pada: string;              // ISO waktu simpan
  rasa: Rasa | null;
  keputusan: KeputusanItem[];
  catatan: string;
  jurnal: 'tersimpan' | 'gagal' | 'tidak';
}

const kunciTinjau = (idAnak: string, senin: string) => `rekah_tinjau_${idAnak}_${senin}`;
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

function tambahHari(iso: string, n: number): string {
  const d = dariISO(iso); d.setDate(d.getDate() + n); return localISO(d);
}

/** Kegiatan (bukan kebiasaan) yang ada di papan 7 hari terakhir s.d. hariIni, terbaru menang. */
export function kumpulkanKegiatanMinggu(idAnak: string, hariIni: string): KegiatanMinggu[] {
  const peta = new Map<string, KegiatanMinggu>();
  for (let i = 6; i >= 0; i--) {
    const tgl = tambahHari(hariIni, -i);
    const s = bacaStoreHari(idAnak, tgl);
    const done = new Set(s.doneExtra);
    for (const [kegKey, items] of Object.entries(s.extra)) {
      for (const it of items as Item[]) {
        const tipe = it.tipe as Tipe;
        if (tipe === 'kebiasaan') continue;
        if (s.hidden.includes(it.id)) continue;
        if (it.id.startsWith('rk-tm-')) continue; // langkah Temani punya refleksi sendiri di Temani
        const k = norm(it.t);
        const lama = peta.get(k);
        peta.set(k, {
          kunci: k, judul: it.t, tipe,
          selesai: (lama?.selesai ?? false) || done.has(it.id),
          tanggal: tgl, kegKey, slot: slotUntukKeg(s, kegKey),
        });
      }
    }
  }
  // yang ditandai selesai lebih dulu
  return [...peta.values()].sort((a, b) => Number(b.selesai) - Number(a.selesai));
}

/** Jadwalkan ulang ke hari yang sama minggu depan (tanggal + 7). Mengembalikan jejaknya. */
function jadwalkanUlang(idAnak: string, k: KegiatanMinggu, teks: string): ItemTerjadwal {
  const tujuan = tambahHari(k.tanggal, 7);
  const s = bacaStoreHari(idAnak, tujuan);
  const slot: Waktu = k.slot ?? 'siang';
  const kegAda = slotUntukKeg(s, k.kegKey) !== null;
  const id = uidItem(kegAda ? 'e' : 'k');
  if (kegAda) {
    const item: Item = { id, tipe: k.tipe, t: teks };
    tulisStoreHari(idAnak, tujuan, { ...s, extra: { ...s.extra, [k.kegKey]: [...(s.extra[k.kegKey] ?? []), item] } });
    return { tanggal: tujuan, kegKey: k.kegKey, slot, id };
  }
  tulisStoreHari(idAnak, tujuan, { ...s, addedKeg: { ...s.addedKeg, [slot]: [...(s.addedKeg[slot] ?? []), { id, nm: teks }] } });
  return { tanggal: tujuan, kegKey: null, slot, id };
}

function hapusTerjadwal(idAnak: string, j: ItemTerjadwal): void {
  const s = bacaStoreHari(idAnak, j.tanggal);
  if (j.kegKey) {
    tulisStoreHari(idAnak, j.tanggal, {
      ...s,
      extra: { ...s.extra, [j.kegKey]: (s.extra[j.kegKey] ?? []).filter(e => e.id !== j.id) },
      doneExtra: s.doneExtra.filter(x => x !== j.id),
    });
  } else {
    const ex = { ...s.extra }; delete ex[j.id];
    tulisStoreHari(idAnak, j.tanggal, { ...s, addedKeg: { ...s.addedKeg, [j.slot]: (s.addedKeg[j.slot] ?? []).filter(k => k.id !== j.id) }, extra: ex });
  }
}

function baca(kunci: string): CatatanTinjau | null {
  try { const r = localStorage.getItem(kunci); if (r) return JSON.parse(r) as CatatanTinjau; } catch { /* abaikan */ }
  return null;
}

export interface TinjauStore {
  minggu: string;
  catatan: CatatanTinjau | null;          // tinjauan minggu ini (null = belum)
  sebelumnya: CatatanTinjau | null;       // tinjauan minggu lalu (untuk konteks awal minggu)
  simpan: (input: {
    rasa: Rasa | null;
    pilihan: { k: KegiatanMinggu; keputusan: Keputusan; teksVersiRingan?: string }[];
    catatan: string;
    jurnal: CatatanTinjau['jurnal'];
  }) => CatatanTinjau;
  setJurnal: (status: CatatanTinjau['jurnal']) => void;
  batalkan: (kunci: string) => void;
  urungkan: (kunci: string) => void;
  ulang: () => void;                      // buka tinjauan lagi (membatalkan semua penjadwalan)
}

export function useTinjauMinggu(idAnak: string, hariIni: string): TinjauStore {
  const minggu = seninISO(dariISO(hariIni));
  const kunci = kunciTinjau(idAnak, minggu);
  const awal = useMemo(() => baca(kunci), [kunci]);
  const sebelumnya = useMemo(() => baca(kunciTinjau(idAnak, tambahHari(minggu, -7))), [idAnak, minggu]);
  const [catatan, setCatatan] = useState<CatatanTinjau | null>(awal);

  const tulis = (c: CatatanTinjau | null) => {
    setCatatan(c);
    try { if (c) localStorage.setItem(kunci, JSON.stringify(c)); else localStorage.removeItem(kunci); } catch { /* abaikan */ }
  };

  const simpan: TinjauStore['simpan'] = ({ rasa, pilihan, catatan: teks, jurnal }) => {
    const keputusan: KeputusanItem[] = pilihan.map(({ k, keputusan: kp, teksVersiRingan }) => {
      const base: KeputusanItem = { kunci: k.kunci, judul: k.judul, tipe: k.tipe, keputusan: kp, teksVersiRingan, asal: k };
      if (kp === 'pertahankan') return { ...base, terjadwal: jadwalkanUlang(idAnak, k, k.judul) };
      if (kp === 'ringan') return { ...base, terjadwal: jadwalkanUlang(idAnak, k, teksVersiRingan || `${k.judul} (versi lebih ringan)`) };
      return base;
    });
    const c: CatatanTinjau = { minggu, pada: new Date().toISOString(), rasa, keputusan, catatan: teks.trim(), jurnal };
    tulis(c);
    return c;
  };

  const ubahItem = (kunciItem: string, f: (x: KeputusanItem) => KeputusanItem) => {
    if (!catatan) return;
    tulis({ ...catatan, keputusan: catatan.keputusan.map(x => (x.kunci === kunciItem ? f(x) : x)) });
  };

  const batalkan = (kunciItem: string) => ubahItem(kunciItem, x => {
    if (x.terjadwal) hapusTerjadwal(idAnak, x.terjadwal);
    return { ...x, dibatalkan: true, terjadwal: undefined };
  });

  const urungkan = (kunciItem: string) => ubahItem(kunciItem, x => {
    if (x.keputusan === 'pertahankan' || x.keputusan === 'ringan') {
      const teks = x.keputusan === 'ringan' ? (x.teksVersiRingan || `${x.judul} (versi lebih ringan)`) : x.judul;
      return { ...x, dibatalkan: false, terjadwal: jadwalkanUlang(idAnak, x.asal, teks) };
    }
    return { ...x, dibatalkan: false };
  });

  const ulang = () => {
    if (catatan) for (const x of catatan.keputusan) if (x.terjadwal) hapusTerjadwal(idAnak, x.terjadwal);
    tulis(null);
  };

  // Dipanggil setelah simpan async (Jurnal) — baca dari storage agar tidak memakai state basi.
  const setJurnal = (status: CatatanTinjau['jurnal']) => { const c = baca(kunci); if (c) tulis({ ...c, jurnal: status }); };

  return { minggu, catatan, sebelumnya, simpan, setJurnal, batalkan, urungkan, ulang };
}
