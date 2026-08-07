import type { ComponentType } from "react";
import TahunPertama from "./bands/tahun-pertama/TahunPertama";

export type BandStatus = "aktif" | "segera";

// Komponen band tidak lagi menerima data anak lewat props. Mereka mengambil
// sendiri dari AnakContext lewat useChildProfile.
export type BandProps = Record<string, never>;

export type AgeBand = {
  id: string;
  label: string;
  minBulan: number;
  maxBulan: number;
  status: BandStatus;
  Component: ComponentType<BandProps> | null;
};

// TODO: konfirmasi batas band. Saat ini setiap band = [minBulan, maxBulan) sehingga
// anak yang tepat berulang tahun ke-1 masuk band 1-2, bukan 0-1.
// Menambah band baru = tambah satu entri di sini. Rentang tidak boleh tumpang tindih.
export const AGE_BANDS: AgeBand[] = [
  { id: "0-1", label: "Tahun Pertama",          minBulan: 0,  maxBulan: 12, status: "aktif",  Component: TahunPertama },
  { id: "1-2", label: "Usia 1 sampai 2 Tahun",  minBulan: 12, maxBulan: 24, status: "segera", Component: null },
  { id: "2-3", label: "Usia 2 sampai 3 Tahun",  minBulan: 24, maxBulan: 36, status: "segera", Component: null },
  { id: "3-4", label: "Usia 3 sampai 4 Tahun",  minBulan: 36, maxBulan: 48, status: "segera", Component: null },
  { id: "4-5", label: "Usia 4 sampai 5 Tahun",  minBulan: 48, maxBulan: 60, status: "segera", Component: null },
  { id: "5-6", label: "Usia 5 sampai 6 Tahun",  minBulan: 60, maxBulan: 72, status: "segera", Component: null },
];

export function resolveBand(usiaBulan: number | null): AgeBand | null {
  if (usiaBulan === null || usiaBulan < 0) return null;
  return AGE_BANDS.find((b) => usiaBulan >= b.minBulan && usiaBulan < b.maxBulan) ?? null;
}

/**
 * Rentang usia band dalam kata, mis. "0 sampai 1 tahun".
 *
 * Dipakai wizard untuk memberi tahu orang tua dashboard mana yang akan
 * mereka lihat. Diturunkan dari minBulan/maxBulan, bukan dari `label`,
 * supaya menambah band baru tidak menuntut penulisan label kedua.
 */
export function labelRentangTahun(band: AgeBand): string {
  return `${band.minBulan / 12} sampai ${band.maxBulan / 12} tahun`;
}

export interface RingkasRentang {
  rentang: string;
  /** false berarti band-nya masih berstatus "segera", isinya belum ada. */
  siap: boolean;
}

/**
 * Ringkasan rentang untuk usia tertentu. null berarti di luar 0 sampai 6 tahun.
 */
export function ringkasRentang(usiaBulan: number | null): RingkasRentang | null {
  const band = resolveBand(usiaBulan);
  if (!band) return null;
  return {
    rentang: labelRentangTahun(band),
    siap: band.status === "aktif" && band.Component !== null,
  };
}
