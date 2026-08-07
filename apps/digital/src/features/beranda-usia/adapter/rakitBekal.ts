import { DAFTAR_BEKAL } from '../bekalRegistry';
import type { Bekal, ItemBekal, SubTahap } from '../bekal';
import { adaptSikap } from './sikapAdapter';
import type { ItemSikap } from './sikapAdapter';
import { adaptKegiatan } from './kegiatanAdapter';
import { adaptPanduan } from './panduanAdapter';
import {
  KODE, blokir, peringatan,
} from './laporan';
import type { Temuan, LaporanValidasi } from './laporan';

export interface HasilRakitan {
  bekal: Bekal[];
  katalogSikap: ItemSikap[];
  laporan: LaporanValidasi;
}

const NILAI_LIST = [
  'Kasih Sayang','Sabar','Empati','Syukur','Kejujuran','Kemandirian',
  'Tanggung Jawab','Berbagi','Hormat pada Sesama','Kesederhanaan','Keberanian','Cinta Ilmu',
] as const;

/**
 * Merakit seluruh konten Bekal dari tiga sumber dan menghasilkan laporan validasi.
 * Tidak pernah melempar exception — semua error menjadi Temuan.
 */
export function rakitBekal(): HasilRakitan {
  const semuaTemuan: Temuan[] = [];

  // ── 1. Adaptasi tiga sumber ───────────────────────────────────────────────

  let hasilSikap: ReturnType<typeof adaptSikap>;
  try {
    hasilSikap = adaptSikap();
  } catch (e) {
    hasilSikap = { katalog: [], temuan: [blokir('ADAPTER_ERROR', `adaptSikap melempar exception: ${e}`)] };
  }

  let hasilKegiatan: ReturnType<typeof adaptKegiatan>;
  try {
    hasilKegiatan = adaptKegiatan();
  } catch (e) {
    hasilKegiatan = { items: [], temuan: [blokir('ADAPTER_ERROR', `adaptKegiatan melempar exception: ${e}`)] };
  }

  let hasilPanduan: ReturnType<typeof adaptPanduan>;
  try {
    hasilPanduan = adaptPanduan();
  } catch (e) {
    hasilPanduan = { items: [], panduanTersaringDeteksiDini: 0, temuan: [blokir('ADAPTER_ERROR', `adaptPanduan melempar exception: ${e}`)] };
  }

  semuaTemuan.push(...hasilSikap.temuan, ...hasilKegiatan.temuan, ...hasilPanduan.temuan);

  // ── 2. Indeks kegiatan dan panduan per sub-tahap ──────────────────────────

  const kegiatanPerTahap = new Map<string, ItemBekal[]>();
  for (const { subTahapId, item } of hasilKegiatan.items) {
    const arr = kegiatanPerTahap.get(subTahapId) ?? [];
    arr.push(item);
    kegiatanPerTahap.set(subTahapId, arr);
  }

  const panduanPerTahap = new Map<string, ItemBekal[]>();
  for (const { subTahapId, item } of hasilPanduan.items) {
    const arr = panduanPerTahap.get(subTahapId) ?? [];
    arr.push(item);
    panduanPerTahap.set(subTahapId, arr);
  }

  // ── 3. Periksa ID duplikat lintas jenis ──────────────────────────────────

  const globalIdSet = new Set<string>();
  const semuaItem: ItemBekal[] = [
    ...hasilKegiatan.items.map(x => x.item),
    ...hasilPanduan.items.map(x => x.item),
  ];
  for (const item of semuaItem) {
    if (globalIdSet.has(item.id)) {
      semuaTemuan.push(blokir(KODE.ID_DUPLIKAT,
        `Id item duplikat lintas jenis: ${item.id}`, { lokasi: item.id }));
    }
    globalIdSet.add(item.id);
  }

  // ── 4. Periksa sumberId menggantung ──────────────────────────────────────
  // (Implementasi penuh memerlukan tabel lookup ke sumber asli.
  //  Di sini kita verifikasi format id sumber saja — tidak kosong.)
  for (const item of semuaItem) {
    if (!item.sumberId || !item.sumberId.trim()) {
      semuaTemuan.push(blokir(KODE.SUMBER_ID_MENGGANTUNG,
        `Item "${item.id}" tidak punya sumberId.`, { lokasi: item.id }));
    }
  }
  for (const s of hasilSikap.katalog) {
    if (!s.sumberId || !s.sumberId.trim()) {
      semuaTemuan.push(blokir(KODE.SUMBER_ID_MENGGANTUNG,
        `Sikap "${s.id}" tidak punya sumberId.`, { lokasi: s.id }));
    }
  }

  // ── 5. Bangun Bekal dengan kegiatan dan panduan terisi ────────────────────

  const bekal: Bekal[] = DAFTAR_BEKAL.map(b => {
    const subTahap: SubTahap[] = b.subTahap.map(st => {
      const kegiatan = kegiatanPerTahap.get(st.id) ?? [];
      const panduan = panduanPerTahap.get(st.id) ?? [];

      // Sub-tahap tanpa kegiatan
      if (kegiatan.length === 0) {
        semuaTemuan.push(peringatan(KODE.SUBTAHAP_KOSONG,
          `Sub-tahap "${st.label}" belum punya kegiatan.`,
          { lokasi: st.id },
        ));
      }

      // Kegiatan kurang dari plafon
      if (kegiatan.length > 0 && kegiatan.length < st.maksItemPerHari) {
        semuaTemuan.push(peringatan(KODE.KEGIATAN_KURANG_DARI_PLAFON,
          `Sub-tahap "${st.label}" punya ${kegiatan.length} kegiatan, plafon harian ${st.maksItemPerHari}.`,
          { lokasi: st.id },
        ));
      }

      return { ...st, kegiatan, panduan };
    });

    return { ...b, subTahap };
  });

  // ── 6. Matriks sub-tahap × nilai kegiatan ────────────────────────────────

  const { terisi: selSubTahapNilaiTerisi, temuan: temuanMatriks } =
    hitungMatriksSubTahapNilai(bekal);
  const selSubTahapNilaiKosong = bekal.flatMap(b => b.subTahap).length * NILAI_LIST.length - selSubTahapNilaiTerisi;
  semuaTemuan.push(...temuanMatriks);

  // ── 7. Hitung item tanpaTemaNilai (unik per (tipe, sumberId)) ────────────

  const itemTanpaTemaNilai = hitungItemTanpaTemaNilai(bekal);

  // ── 8. Susun laporan ──────────────────────────────────────────────────────

  const semuaBlokir = semuaTemuan.filter(t => t.keparahan === 'blokir');
  const semuaPeringatan = semuaTemuan.filter(t => t.keparahan === 'peringatan');

  const selTerisi = hitungSelTerisi(hasilSikap.katalog);

  const laporan: LaporanValidasi = {
    waktu: new Date().toISOString(),
    ringkas: {
      totalSikap: hasilSikap.katalog.length,
      totalKegiatan: hasilKegiatan.items.length,
      totalPanduan: hasilPanduan.items.length,
      panduanTersaringDeteksiDini: hasilPanduan.panduanTersaringDeteksiDini,
      selFaseNilaiTerisi: selTerisi,
      selFaseNilaiKosong: 60 - selTerisi,
      selSubTahapNilaiTerisi,
      selSubTahapNilaiKosong,
      itemTanpaTemaNilai,
      jumlahBlokir: semuaBlokir.length,
      jumlahPeringatan: semuaPeringatan.length,
    },
    temuan: semuaTemuan,
  };

  return { bekal, katalogSikap: hasilSikap.katalog, laporan };
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function hitungSelTerisi(katalog: ItemSikap[]): number {
  let terisi = 0;
  for (const fase of [1, 2, 3, 4, 5]) {
    for (const nilai of NILAI_LIST) {
      const ada = katalog.some(
        s => fase >= s.faseMulai && fase <= s.faseSelesai && (s.nilai as string[]).includes(nilai),
      );
      if (ada) terisi++;
    }
  }
  return terisi;
}

function hitungMatriksSubTahapNilai(
  bekal: Bekal[],
): { terisi: number; temuan: Temuan[] } {
  const semuaSubTahap = bekal.flatMap(b => b.subTahap);
  const temuan: Temuan[] = [];

  // Matriks: subTahapId → Set<nilai> yang ada kegiatan-nya
  const matriksNilai = new Map<string, Set<string>>();
  for (const st of semuaSubTahap) {
    const nilaiDiSubTahap = new Set<string>();
    for (const item of st.kegiatan) {
      for (const n of item.nilai) {
        nilaiDiSubTahap.add(n);
      }
    }
    matriksNilai.set(st.id, nilaiDiSubTahap);
  }

  // NILAI_TANPA_KEGIATAN — satu temuan per nilai (bukan per sub-tahap)
  // Dihasilkan bila nilai tidak muncul di kegiatan mana pun dalam sistem.
  const nilaiYangAdaKegiatan = new Set<string>();
  for (const nilaiSet of matriksNilai.values()) {
    for (const n of nilaiSet) nilaiYangAdaKegiatan.add(n);
  }

  for (const nilai of NILAI_LIST) {
    if (!nilaiYangAdaKegiatan.has(nilai)) {
      temuan.push(peringatan(KODE.NILAI_TANPA_KEGIATAN,
        `Nilai "${nilai}" tidak diwakili oleh kegiatan mana pun di seluruh sistem.`,
        { saran: 'Tambahkan tag nilai ini ke setidaknya satu kegiatan di xlsx review.' },
      ));
    }
  }

  // SEL_SUBTAHAP_NILAI_KOSONG — hanya untuk nilai yang punya kegiatan di suatu sub-tahap
  // (nilai tanpa kegiatan sama sekali sudah dilaporkan lewat NILAI_TANPA_KEGIATAN)
  for (const st of semuaSubTahap) {
    const nilaiDiSini = matriksNilai.get(st.id) ?? new Set();
    for (const nilai of NILAI_LIST) {
      if (!nilaiYangAdaKegiatan.has(nilai)) continue; // sudah dicatat NILAI_TANPA_KEGIATAN
      if (!nilaiDiSini.has(nilai)) {
        temuan.push(peringatan(KODE.SEL_SUBTAHAP_NILAI_KOSONG,
          `Sub-tahap "${st.label}" tidak punya kegiatan bertag "${nilai}".`,
          { lokasi: st.id },
        ));
      }
    }
  }

  const terisi = [...matriksNilai.values()].reduce((acc, s) => acc + s.size, 0);
  return { terisi, temuan };
}

function hitungItemTanpaTemaNilai(bekal: Bekal[]): number {
  const seen = new Set<string>();
  for (const b of bekal) {
    for (const st of b.subTahap) {
      for (const item of st.kegiatan) {
        if (item.tanpaTemaNilai) {
          seen.add(`${item.tipe}:${item.sumberId}`);
        }
      }
    }
  }
  return seen.size;
}
