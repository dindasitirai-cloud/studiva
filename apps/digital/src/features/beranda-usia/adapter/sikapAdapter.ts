import { NILAI, MATERI } from '../../akar-keluarga/content';
import type { NilaiAkar } from '../../akar-keluarga/content';
import {
  KODE, blokir, peringatan, POLA_KATA_TERLARANG,
} from './laporan';
import type { Temuan } from './laporan';

export interface ItemSikap {
  id: string;
  judul: string;
  /** Array — satu sikap bisa membawa beberapa nilai Akar Keluarga. */
  nilai: NilaiAkar[];
  /** Fase di mana sikap ini mulai berlaku (1–5, inklusif). */
  faseMulai: number;
  /** Fase di mana sikap ini masih berlaku (1–5, inklusif). */
  faseSelesai: number;
  sumberId: string;
}

export interface HasilSikap {
  katalog: ItemSikap[];
  temuan: Temuan[];
}

// ─── Konstanta ───────────────────────────────────────────────────────────────

const NILAI_KANONIK = new Set<string>(NILAI);

/** Batas bawah (inklusif) tiap fase dalam bulan. Eksklusif atas = mulai fase berikut. */
const FASE_MULAI_BULAN: Record<number, number> = {
  1: 0,
  2: 12,
  3: 24,
  4: 36,
  5: 48,
};

/** Indeks array MATERI (0-9) → nomor fase (1-5). */
const BAND_IDX_TO_FASE: Record<number, number> = {
  0: 1, 1: 1, 2: 1, 3: 1,  // 0–3bl, 3–6bl, 6–9bl, 9–12bl
  4: 2, 5: 2,               // 12–18bl, 18–24bl
  6: 3,                     // 2–3th
  7: 4,                     // 3–4th
  8: 5, 9: 5,               // 4–5th, 5–6th
};

// ─── Fungsi publik ───────────────────────────────────────────────────────────

/**
 * Mengembalikan nomor fase (1–5) dari usia dalam bulan.
 * Mengembalikan null jika usia di luar 0–71 bulan.
 *
 * Batas: inklusif bawah, eksklusif atas — konsisten dengan konvensi Bekal.
 */
export function faseDariUsiaBulan(usiaBulan: number): number | null {
  if (usiaBulan < 0 || usiaBulan >= 72) return null;
  if (usiaBulan < 12) return 1;
  if (usiaBulan < 24) return 2;
  if (usiaBulan < 36) return 3;
  if (usiaBulan < 48) return 4;
  return 5;
}

/**
 * Sikap yang berlaku untuk anak seusia ini DAN cocok dengan nilai fokus keluarga.
 * Mengembalikan array kosong bila tidak ada yang cocok — itu keadaan sah
 * yang harus ditangani UI, bukan error.
 */
export function resolveSikap(
  usiaBulan: number,
  nilaiFokus: readonly NilaiAkar[],
  katalog: readonly ItemSikap[],
): ItemSikap[] {
  const fase = faseDariUsiaBulan(usiaBulan);
  if (fase === null) return [];
  const fokusSet = new Set<string>(nilaiFokus);
  return katalog.filter(
    s =>
      fase >= s.faseMulai &&
      fase <= s.faseSelesai &&
      s.nilai.some(n => fokusSet.has(n)),
  );
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

/** Membangun katalog sikap dari MATERI di akar-keluarga/content.ts. */
export function adaptSikap(): HasilSikap {
  const katalog: ItemSikap[] = [];
  const temuan: Temuan[] = [];
  const idSet = new Set<string>();

  for (let bandIdx = 0; bandIdx < MATERI.length; bandIdx++) {
    const fase = BAND_IDX_TO_FASE[bandIdx];
    const items = MATERI[bandIdx];

    for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
      const src = items[itemIdx];
      const id = `sk-${String(bandIdx).padStart(2, '0')}-${String(itemIdx).padStart(2, '0')}`;
      const lokasi = id;

      // ID duplikat
      if (idSet.has(id)) {
        temuan.push(blokir(KODE.ID_DUPLIKAT, `Id sikap duplikat: ${id}`, { lokasi }));
        continue;
      }
      idSet.add(id);

      // Judul kosong
      if (!src.judul || !src.judul.trim()) {
        temuan.push(blokir(KODE.JUDUL_KOSONG, 'Judul sikap kosong.', { lokasi }));
        continue;
      }

      // Kata terlarang di judul/deskripsi
      if (POLA_KATA_TERLARANG.test(src.judul) || POLA_KATA_TERLARANG.test(src.deskripsi)) {
        temuan.push(blokir(KODE.KATA_TERLARANG,
          `Kata terlarang ditemukan di judul atau deskripsi: "${src.judul}"`, { lokasi }));
      }

      // Validasi nilai
      const nilaiValid: NilaiAkar[] = [];
      for (const n of src.nilai) {
        if (NILAI_KANONIK.has(n)) {
          nilaiValid.push(n as NilaiAkar);
        } else {
          const tebakan = cariTebakanTerdekat(n);
          temuan.push(peringatan(KODE.NILAI_TIDAK_DIKENAL,
            `Ejaan nilai tidak dikenal: "${n}".`,
            { lokasi, saran: tebakan ? `Mungkin maksudnya: "${tebakan}"` : undefined },
          ));
        }
      }

      katalog.push({
        id,
        judul: src.judul,
        nilai: nilaiValid,
        faseMulai: fase,
        faseSelesai: fase,
        sumberId: `content:materi:${bandIdx}:${itemIdx}`,
      });
    }
  }

  // Fase tidak valid — semua dari MATERI, fase selalu 1-5 dari konstanta, tidak perlu diperiksa ulang.
  // Jika di masa depan sumber diganti generated TS, validasi FASE_TIDAK_VALID ada di konversiKonten.ts.

  // Sel fase × nilai kosong (60 kombinasi)
  const FASE_LIST = [1, 2, 3, 4, 5];
  for (const fase of FASE_LIST) {
    for (const nilai of NILAI) {
      const adaSikap = katalog.some(
        s => fase >= s.faseMulai && fase <= s.faseSelesai && s.nilai.includes(nilai as NilaiAkar),
      );
      if (!adaSikap) {
        temuan.push(peringatan(
          KODE.SEL_FASE_NILAI_KOSONG,
          `Tidak ada sikap untuk fase ${fase} × nilai "${nilai}".`,
          { lokasi: `fase-${fase}:${nilai}` },
        ));
      }
    }
  }

  return { katalog, temuan };
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function cariTebakanTerdekat(input: string): string | undefined {
  let jarakMin = Infinity;
  let tebakan: string | undefined;
  for (const kandidat of NILAI) {
    const j = levenshtein(input.toLowerCase(), kandidat.toLowerCase());
    if (j < jarakMin) {
      jarakMin = j;
      tebakan = kandidat;
    }
  }
  return jarakMin <= 3 ? tebakan : undefined;
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// Ekspor tambahan untuk validasi lintas file
export { FASE_MULAI_BULAN };
