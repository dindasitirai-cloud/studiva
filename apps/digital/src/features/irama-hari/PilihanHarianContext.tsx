import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { ItemBekal } from '../beranda-usia/bekal';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { ItemSikap } from '../beranda-usia/adapter/sikapAdapter';
import { resolveSikap } from '../beranda-usia/adapter/sikapAdapter';
import { pilihKegiatanHarian } from '../beranda-usia/rotasiHarian';
import type { HasilRotasi } from '../beranda-usia/rotasiHarian';
import { benihDariTeks, kocok } from '../beranda-usia/adapter/acakDeterministik';
import { useAuth } from '../../context/AuthContext';
import { getPilihanHarian, simpanPilihanHarian } from '../../lib/supabase/rekah';

// ─── Tipe ──────────────────────────────────────────────────────────────────

export type BlokWaktu = 'pagi' | 'siang' | 'sore' | 'jelangTidur';

const BLOK_URUTAN: BlokWaktu[] = ['pagi', 'siang', 'sore', 'jelangTidur'];

/** Delta pilihan pengguna — semua kegiatan kini dipilih manual via popup. */
export interface PilihanHarian {
  tanggal: string;
  idAnak: string;
  /** Dipertahankan untuk kompatibilitas data lama; tidak dipakai lagi di UI baru. */
  dihapus: string[];
  /** Id item yang ditambah pengguna secara manual (urutan = urutan penambahan). */
  ditambah: string[];
  /** Override penempatan blok oleh pengguna; auto-assign dipakai bila id tidak ada di sini. */
  penempatan: Record<string, BlokWaktu | null>;
  /** Id item yang sudah ditandai selesai. */
  selesai: string[];
  catatan: string;
  /** Id kartu Wawasan Tumbuh yang dipilih hari ini (array kosong = belum dipilih). */
  wawasanIds: string[];
  /** Blok waktu per kartu Wawasan Tumbuh (key = id kartu, default jelangTidur). */
  wawasanBloks: Record<string, BlokWaktu>;
  /** Item kustom (momen / kegiatan ditulis sendiri) agar bisa muncul di susunan hari. */
  kustom: ItemBekal[];
}

// ─── State & Reducer ───────────────────────────────────────────────────────

type Aksi =
  | { type: 'GANTI'; idDiganti: string; dalamRotasi: boolean; penggantiId: string; blokWarisan: BlokWaktu | null }
  | { type: 'HAPUS'; id: string; dalamRotasi: boolean }
  | { type: 'TAMBAH'; id: string }
  | { type: 'PINDAH_BLOK'; id: string; blok: BlokWaktu | null }
  | { type: 'TANDAI_SELESAI'; id: string }
  | { type: 'TULIS_CATATAN'; catatan: string }
  | { type: 'HIDRAT'; state: PilihanHarian }
  | { type: 'RESET_HARI'; tanggal: string; idAnak: string }
  | { type: 'PILIH_WAWASAN'; id: string }
  | { type: 'PINDAH_WAWASAN_BLOK'; id: string; blok: BlokWaktu }
  | { type: 'TAMBAH_KUSTOM'; item: ItemBekal };

function reducer(state: PilihanHarian, aksi: Aksi): PilihanHarian {
  switch (aksi.type) {
    case 'HIDRAT': {
      const loaded = aksi.state as PilihanHarian & { wawasanId?: string | null; wawasanBlok?: BlokWaktu };
      if (loaded.wawasanIds === undefined) {
        // Migrasi data lama: wawasanId (string|null) + wawasanBlok → wawasanIds + wawasanBloks
        const oldId = loaded.wawasanId ?? null;
        const oldBlok: BlokWaktu = loaded.wawasanBlok ?? 'jelangTidur';
        return {
          ...loaded,
          wawasanIds: oldId ? [oldId] : [],
          wawasanBloks: oldId ? { [oldId]: oldBlok } : {},
          kustom: (loaded as unknown as { kustom?: ItemBekal[] }).kustom ?? [],
        };
      }
      return { ...loaded, kustom: loaded.kustom ?? [] };
    }
    case 'RESET_HARI':
      return buatStateAwal(aksi.tanggal, aksi.idAnak);
    case 'GANTI': {
      const dihapus = aksi.dalamRotasi
        ? [...state.dihapus, aksi.idDiganti]
        : state.dihapus;
      const ditambah = aksi.dalamRotasi
        ? [...state.ditambah, aksi.penggantiId]
        : [...state.ditambah.filter(id => id !== aksi.idDiganti), aksi.penggantiId];
      const penempatan = { ...state.penempatan };
      delete penempatan[aksi.idDiganti];
      if (aksi.blokWarisan !== null) {
        penempatan[aksi.penggantiId] = aksi.blokWarisan;
      } else {
        penempatan[aksi.penggantiId] = null;
      }
      return { ...state, dihapus, ditambah, penempatan };
    }
    case 'HAPUS': {
      const dihapus = aksi.dalamRotasi
        ? [...state.dihapus, aksi.id]
        : state.dihapus;
      const ditambah = aksi.dalamRotasi
        ? state.ditambah
        : state.ditambah.filter(id => id !== aksi.id);
      const penempatan = { ...state.penempatan };
      delete penempatan[aksi.id];
      return { ...state, dihapus, ditambah, penempatan, kustom: state.kustom.filter(i => i.id !== aksi.id) };
    }
    case 'TAMBAH': {
      if (state.ditambah.includes(aksi.id)) return state;
      return {
        ...state,
        ditambah: [...state.ditambah, aksi.id],
        // penempatan tidak disentuh — blok ditetapkan otomatis berurutan oleh penempatanEfektif
      };
    }
    case 'TAMBAH_KUSTOM': {
      if (state.ditambah.includes(aksi.item.id)) return state;
      return {
        ...state,
        kustom: [...state.kustom, aksi.item],
        ditambah: [...state.ditambah, aksi.item.id],
      };
    }
    case 'PILIH_WAWASAN': {
      const ids = state.wawasanIds ?? [];
      const sudahAda = ids.includes(aksi.id);
      const wawasanIds = sudahAda ? ids.filter(id => id !== aksi.id) : [...ids, aksi.id];
      const wawasanBloks = { ...(state.wawasanBloks ?? {}) };
      if (sudahAda) delete wawasanBloks[aksi.id];
      else if (!wawasanBloks[aksi.id]) wawasanBloks[aksi.id] = 'jelangTidur';
      return { ...state, wawasanIds, wawasanBloks };
    }
    case 'PINDAH_WAWASAN_BLOK':
      return { ...state, wawasanBloks: { ...(state.wawasanBloks ?? {}), [aksi.id]: aksi.blok } };
    case 'PINDAH_BLOK': {
      return {
        ...state,
        penempatan: { ...state.penempatan, [aksi.id]: aksi.blok },
      };
    }
    case 'TANDAI_SELESAI': {
      const sudahAda = state.selesai.includes(aksi.id);
      return {
        ...state,
        selesai: sudahAda
          ? state.selesai.filter(id => id !== aksi.id)
          : [...state.selesai, aksi.id],
      };
    }
    case 'TULIS_CATATAN':
      return { ...state, catatan: aksi.catatan };
    default:
      return state;
  }
}

function buatStateAwal(tanggal: string, idAnak: string): PilihanHarian {
  return { tanggal, idAnak, dihapus: [], ditambah: [], penempatan: {}, selesai: [], catatan: '', wawasanIds: [], wawasanBloks: {}, kustom: [] };
}

function tanggalLokalString(tanggal: Date): string {
  const y = tanggal.getFullYear();
  const m = String(tanggal.getMonth() + 1).padStart(2, '0');
  const d = String(tanggal.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ─── Context shape ─────────────────────────────────────────────────────────

interface NilaiKonteks {
  hasilRotasi: HasilRotasi;
  pilihanEfektif: ItemBekal[];
  /** Penempatan otomatis berurutan digabung dengan override pengguna. */
  penempatanEfektif: Record<string, BlokWaktu | null>;
  selesaiSet: ReadonlySet<string>;
  sikapHariIni: ItemSikap | null;
  panduanOrangTua: ItemBekal | null;
  catatan: string;
  kolamAnak: readonly ItemBekal[];
  kolamAnakJumlah: number;
  maksItem: number;
  wawasanIds: string[];
  wawasanBloks: Record<string, BlokWaktu>;
  /** Raw state pilihan — dipakai komponen luar (misal IramaMingguan) untuk membaca data hari ini. */
  pilihanHarianRaw: PilihanHarian;
  hapus: (id: string) => void;
  tambah: (item: ItemBekal) => void;
  tambahKustom: (item: ItemBekal) => void;
  pindahBlok: (id: string, blok: BlokWaktu | null) => void;
  tandaiSelesai: (id: string) => void;
  tulisCatatan: (teks: string) => void;
  pilihWawasan: (id: string) => void;
  pindahWawasanBlok: (id: string, blok: BlokWaktu) => void;
}

const KonteksPilihanHarian = createContext<NilaiKonteks | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────

export interface PropsPilihanHarianProvider {
  idAnak: string;
  /** Kegiatan milik anak (sudah difilter pemilik === 'anak'). */
  kolam: readonly ItemBekal[];
  /** Panduan milik orangtua (sudah difilter pemilik === 'orangtua'). */
  kolamOrangTua: readonly ItemBekal[];
  usiaBulan: number;
  nilaiFokus: readonly NilaiAkar[];
  katalogSikap: readonly ItemSikap[];
  maksItem: number;
  children: React.ReactNode;
}

export function PilihanHarianProvider({
  idAnak,
  kolam,
  kolamOrangTua,
  usiaBulan,
  nilaiFokus,
  katalogSikap,
  maksItem,
  children,
}: PropsPilihanHarianProvider) {
  const tanggalHariIni = tanggalLokalString(new Date());
  const { supabaseUser } = useAuth();

  const [tanggalContext, setTanggalContext] = useState(tanggalHariIni);
  const [pilihanHarian, dispatch] = useReducer(
    reducer,
    undefined,
    () => buatStateAwal(tanggalHariIni, idAnak),
  );

  // Cek pergantian hari setiap menit — memastikan reset terjadi meski app dibiarkan terbuka semalam
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // Penanda: hidrat sudah dimuat dari Supabase agar efek save tidak menulis sebelum load.
  const sudahHidrat = useRef(false);
  const simpanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ambil antrian jadwalkan dari sessionStorage dan dispatch TAMBAH.
  function pickupJadwalkanQueue() {
    try {
      const raw = sessionStorage.getItem('studiva_jadwalkan_queue');
      if (!raw) return;
      sessionStorage.removeItem('studiva_jadwalkan_queue');
      const ids: string[] = JSON.parse(raw);
      ids.forEach(id => dispatch({ type: 'TAMBAH', id }));
    } catch {}
  }

  // Muat pilihan hari ini dari Supabase saat mount (bila ada sesi aktif).
  useEffect(() => {
    if (!supabaseUser) {
      sudahHidrat.current = true;
      pickupJadwalkanQueue();
      return;
    }
    getPilihanHarian(idAnak, tanggalHariIni)
      .then(baris => {
        if (baris?.diff) {
          const diff = baris.diff as Record<string, unknown>;
          // Konversi format lama (wawasanId/wawasanBlok) ke format baru (wawasanIds/wawasanBloks)
          const oldId = diff.wawasanId as string | null | undefined;
          const oldBlok = (diff.wawasanBlok as BlokWaktu | undefined) ?? 'jelangTidur';
          const wawasanIds: string[] = diff.wawasanIds !== undefined
            ? (diff.wawasanIds as string[])
            : (oldId ? [oldId] : []);
          const wawasanBloks: Record<string, BlokWaktu> = diff.wawasanBloks !== undefined
            ? (diff.wawasanBloks as Record<string, BlokWaktu>)
            : (oldId ? { [oldId]: oldBlok } : {});
          dispatch({
            type: 'HIDRAT',
            state: {
              tanggal: tanggalHariIni,
              idAnak,
              dihapus: (diff.dihapus as string[]) ?? [],
              ditambah: (diff.ditambah as string[]) ?? [],
              penempatan: (diff.penempatan as Record<string, BlokWaktu | null>) ?? {},
              selesai: (diff.selesai as string[]) ?? [],
              catatan: (diff.catatan as string) ?? '',
              wawasanIds,
              wawasanBloks,
              kustom: (diff.kustom as ItemBekal[]) ?? [],
            },
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        sudahHidrat.current = true;
        pickupJadwalkanQueue();
      });
    // Hanya dijalankan saat mount dan saat idAnak berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAnak, supabaseUser]);

  // Simpan dengan debounce 1 detik setiap kali pilihanHarian berubah.
  useEffect(() => {
    if (!supabaseUser || !sudahHidrat.current) return;

    if (simpanTimer.current) clearTimeout(simpanTimer.current);
    simpanTimer.current = setTimeout(() => {
      simpanPilihanHarian(idAnak, pilihanHarian.tanggal, {
        dihapus: pilihanHarian.dihapus,
        ditambah: pilihanHarian.ditambah,
        penempatan: pilihanHarian.penempatan,
        selesai: pilihanHarian.selesai,
        catatan: pilihanHarian.catatan,
        wawasanIds: pilihanHarian.wawasanIds,
        wawasanBloks: pilihanHarian.wawasanBloks,
        kustom: pilihanHarian.kustom,
      }).catch(() => {});
    }, 1000);

    return () => {
      if (simpanTimer.current) clearTimeout(simpanTimer.current);
    };
  }, [idAnak, pilihanHarian, supabaseUser]);

  // Reset saat ganti hari — simpan hari lama dahulu, lalu mulai fresh.
  useEffect(() => {
    if (tanggalHariIni !== tanggalContext) {
      if (supabaseUser) {
        simpanPilihanHarian(idAnak, tanggalContext, {
          dihapus: pilihanHarian.dihapus,
          ditambah: pilihanHarian.ditambah,
          penempatan: pilihanHarian.penempatan,
          selesai: pilihanHarian.selesai,
          catatan: pilihanHarian.catatan,
          wawasanIds: pilihanHarian.wawasanIds,
          wawasanBloks: pilihanHarian.wawasanBloks,
          kustom: pilihanHarian.kustom,
        }).catch(() => {});
      }
      sudahHidrat.current = false;
      setTanggalContext(tanggalHariIni);
      dispatch({ type: 'RESET_HARI', tanggal: tanggalHariIni, idAnak });
    }
  }, [tanggalHariIni, tanggalContext, idAnak, pilihanHarian, supabaseUser]);

  const hasilRotasi = useMemo(
    () =>
      pilihKegiatanHarian({
        tanggal: new Date(),
        idAnak,
        kolam,
        nilaiFokus,
        maksItem,
      }),
    [idAnak, kolam, nilaiFokus, maksItem],
  );

  const kolamMap = useMemo(
    () => new Map([...kolam, ...pilihanHarian.kustom].map(i => [i.id, i])),
    [kolam, pilihanHarian.kustom],
  );

  // Hanya item yang dipilih manual pengguna — tidak ada rotasi otomatis
  const pilihanEfektif = useMemo<ItemBekal[]>(() => {
    return pilihanHarian.ditambah
      .map(id => kolamMap.get(id))
      .filter((i): i is ItemBekal => i !== undefined);
  }, [pilihanHarian.ditambah, kolamMap]);

  // Penempatan otomatis berurutan (pagi→siang→sore→jelangTidur cycling), override oleh pengguna
  const penempatanEfektif = useMemo<Record<string, BlokWaktu | null>>(() => {
    const combined: Record<string, BlokWaktu | null> = {};
    pilihanEfektif.forEach((item, i) => {
      combined[item.id] = BLOK_URUTAN[i % BLOK_URUTAN.length];
    });
    for (const [id, blok] of Object.entries(pilihanHarian.penempatan)) {
      if (blok !== null) combined[id] = blok;
    }
    return combined;
  }, [pilihanEfektif, pilihanHarian.penempatan]);

  const selesaiSet = useMemo(
    () => new Set(pilihanHarian.selesai),
    [pilihanHarian.selesai],
  );

  const sikapHariIni = useMemo<ItemSikap | null>(() => {
    const list = resolveSikap(usiaBulan, nilaiFokus, katalogSikap);
    if (list.length === 0) return null;
    return list[hasilRotasi.indeksHari % list.length];
  }, [usiaBulan, nilaiFokus, katalogSikap, hasilRotasi.indeksHari]);

  const panduanOrangTua = useMemo<ItemBekal | null>(() => {
    if (kolamOrangTua.length === 0) return null;
    const benihPanduan = benihDariTeks(idAnak + ':panduan:' + hasilRotasi.indeksHari);
    const dikocok = kocok(kolamOrangTua, benihPanduan);
    return dikocok[0] ?? null;
  }, [kolamOrangTua, idAnak, hasilRotasi.indeksHari]);

  const kolamAnak = useMemo(
    () => kolam.filter(i => i.pemilik === 'anak'),
    [kolam],
  );
  const kolamAnakJumlah = kolamAnak.length;

  // ─── Actions ───────────────────────────────────────────────────────────

  const hapus = useCallback(
    (id: string) => {
      const dalamRotasi = hasilRotasi.pilihan.some(i => i.id === id);
      dispatch({ type: 'HAPUS', id, dalamRotasi });
    },
    [hasilRotasi.pilihan],
  );

  const tambah = useCallback((item: ItemBekal) => {
    dispatch({ type: 'TAMBAH', id: item.id });
  }, []);

  const tambahKustom = useCallback((item: ItemBekal) => {
    dispatch({ type: 'TAMBAH_KUSTOM', item });
  }, []);

  const pindahBlok = useCallback((id: string, blok: BlokWaktu | null) => {
    dispatch({ type: 'PINDAH_BLOK', id, blok });
  }, []);

  const tandaiSelesai = useCallback((id: string) => {
    dispatch({ type: 'TANDAI_SELESAI', id });
  }, []);

  const tulisCatatan = useCallback((teks: string) => {
    dispatch({ type: 'TULIS_CATATAN', catatan: teks });
  }, []);

  const pilihWawasan = useCallback((id: string) => {
    dispatch({ type: 'PILIH_WAWASAN', id });
  }, []);

  const pindahWawasanBlok = useCallback((id: string, blok: BlokWaktu) => {
    dispatch({ type: 'PINDAH_WAWASAN_BLOK', id, blok });
  }, []);

  const nilai = useMemo<NilaiKonteks>(
    () => ({
      hasilRotasi,
      pilihanEfektif,
      penempatanEfektif,
      selesaiSet,
      sikapHariIni,
      panduanOrangTua,
      catatan: pilihanHarian.catatan,
      kolamAnak,
      kolamAnakJumlah,
      maksItem,
      wawasanIds: pilihanHarian.wawasanIds ?? [],
      wawasanBloks: pilihanHarian.wawasanBloks ?? {},
      pilihanHarianRaw: pilihanHarian,
      hapus,
      tambah,
      tambahKustom,
      pindahBlok,
      tandaiSelesai,
      tulisCatatan,
      pilihWawasan,
      pindahWawasanBlok,
    }),
    [
      hasilRotasi, pilihanEfektif, penempatanEfektif, selesaiSet,
      sikapHariIni, panduanOrangTua, pilihanHarian,
      kolamAnak, kolamAnakJumlah, maksItem,
      hapus, tambah, tambahKustom, pindahBlok, tandaiSelesai, tulisCatatan, pilihWawasan, pindahWawasanBlok,
    ],
  );

  return (
    <KonteksPilihanHarian.Provider value={nilai}>
      {children}
    </KonteksPilihanHarian.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function usePilihanHarian(): NilaiKonteks {
  const ctx = useContext(KonteksPilihanHarian);
  if (ctx === null) {
    throw new Error('usePilihanHarian harus dipakai di dalam PilihanHarianProvider');
  }
  return ctx;
}
