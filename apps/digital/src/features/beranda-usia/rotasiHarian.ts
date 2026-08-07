/**
 * Rotasi kegiatan harian — pemilihan item Bekal yang deterministik per anak per tanggal.
 *
 * Catatan tipe: nilaiFokus menggunakan NilaiAkar (12 nilai Akar Keluarga, contoh: 'Kasih Sayang').
 * Spec awal menyebut NilaiId (6 nilai Rekah: 'mandiri', 'empatik', …), namun ItemBekal.nilai
 * bertipe NilaiAkar[], sehingga perbandingan hanya bermakna bila keduanya dari sistem yang sama.
 * NilaiId tidak pernah bisa beririsan dengan NilaiAkar — perubahan ini bukan deviasi dari intent
 * spec, melainkan koreksi tipe agar Aturan 1 dapat bekerja saat tag nilai terisi di masa mendatang.
 *
 * Parameter nilaiFokus merujuk ke nilai yang dipilih keluarga (bukan hanya 3 fokus lama).
 * Pemanggil sebaiknya meneruskan seluruh nilai yang dipilih keluarga.
 */

import type { ItemBekal } from './bekal';
import type { NilaiAkar } from '../akar-keluarga/content';
import { benihDariTeks, kocok } from './adapter/acakDeterministik';

// Patokan hari: 1 Januari 2020, komponen lokal.
// Konsisten dengan usia.ts yang juga memakai komponen lokal (bukan UTC).
const PATOKAN = new Date(2020, 0, 1);

// ─── Tipe publik ──────────────────────────────────────────────────────────────

export interface KonteksRotasi {
  tanggal: Date;
  idAnak: string;
  kolam: readonly ItemBekal[];
  /** Nilai fokus dari wizard Akar Keluarga. Boleh kosong jika wizard belum diisi. */
  nilaiFokus: readonly NilaiAkar[];
  maksItem: number;
}

export type KodeCatatan =
  | 'KOLAM_KOSONG'
  | 'KOLAM_LEBIH_KECIL_DARI_PLAFON'
  | 'TANPA_NILAI_DIPILIH'
  | 'TIDAK_ADA_YANG_COCOK_NILAI_FOKUS'
  | 'DOMAIN_SERAGAM_TAK_TERHINDARKAN';

export interface CatatanRotasi {
  kode: KodeCatatan;
  pesan: string;
}

export interface HasilRotasi {
  pilihan: ItemBekal[];
  /** Urutan penuh seluruh item kolam anak setelah dikocok untuk siklus ini.
   *  Dipakai oleh kegiatanPengganti untuk mencari pengganti deterministik. */
  urutanSiklus: ItemBekal[];
  indeksHari: number;
  siklusKe: number;
  posisiDalamSiklus: number;
  panjangSiklus: number;
  catatan: CatatanRotasi[];
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function hitungIndeksHari(tanggal: Date): number {
  // Math.round menangani peralihan DST (hari 23/25 jam) agar tetap bilangan bulat.
  const t = new Date(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate());
  return Math.round((t.getTime() - PATOKAN.getTime()) / 86400000);
}

function cocokNilai(item: ItemBekal, nilaiFokus: readonly NilaiAkar[]): boolean {
  return item.nilai.some(n => nilaiFokus.includes(n));
}

/** Bagi array yang sudah dikocok menjadi halaman hari-hari siklus. */
function paginasiSiklus(dikocok: ItemBekal[], maksItem: number): ItemBekal[][] {
  const siklus: ItemBekal[][] = [];
  for (let i = 0; i < dikocok.length; i += maksItem) {
    siklus.push(dikocok.slice(i, i + maksItem));
  }
  return siklus;
}

function tukar(siklus: ItemBekal[][], hA: number, posA: number, hB: number, posB: number): void {
  const tmp = siklus[hA][posA];
  siklus[hA][posA] = siklus[hB][posB];
  siklus[hB][posB] = tmp;
}

/**
 * Aturan 1 — minimal satu item beririsan nilai yang dipilih keluarga per hari.
 * Telusuri hari kandidat secara berurutan dari indeks terkecil (deterministik).
 *
 * Bila belum ada konten yang bertag nilai yang dipilih, masuk ke cabang
 * TIDAK_ADA_YANG_COCOK_NILAI_FOKUS — rotasi tetap berjalan normal tanpa swap.
 * Ini bukan kondisi gagal, melainkan kondisi sementara sampai konten bertag ditambahkan.
 */
function terapkanAturan1(
  siklus: ItemBekal[][],
  nilaiFokus: readonly NilaiAkar[],
  kolamAnak: ItemBekal[],
  catatan: CatatanRotasi[],
): void {
  if (nilaiFokus.length === 0) {
    catatan.push({ kode: 'TANPA_NILAI_DIPILIH', pesan: 'Nilai yang dipilih keluarga belum diisi. Rotasi nilai dilewati.' });
    return;
  }
  if (!kolamAnak.some(i => cocokNilai(i, nilaiFokus))) {
    catatan.push({
      kode: 'TIDAK_ADA_YANG_COCOK_NILAI_FOKUS',
      pesan: 'Belum ada item dalam kolam yang ditandai dengan nilai fokus keluarga. Penandaan nilai konten masih berlangsung.',
    });
    return;
  }

  for (let h = 0; h < siklus.length; h++) {
    if (siklus[h].some(i => cocokNilai(i, nilaiFokus))) continue;

    // Cari hari donor k yang punya >= 2 item cocok (agar k tetap >= 1 setelah menyumbang)
    for (let k = 0; k < siklus.length; k++) {
      if (k === h) continue;
      const posisiCocok: number[] = [];
      for (let p = 0; p < siklus[k].length; p++) {
        if (cocokNilai(siklus[k][p], nilaiFokus)) posisiCocok.push(p);
      }
      if (posisiCocok.length < 2) continue;
      tukar(siklus, k, posisiCocok[0], h, 0);
      break;
    }
  }
}

/**
 * Aturan 2 — hindari domain seragam dalam satu hari (untuk hari dengan >= 2 item).
 * Pertukaran hanya dilakukan jika tidak merusak Aturan 1 pada kedua hari.
 */
function terapkanAturan2(
  siklus: ItemBekal[][],
  nilaiFokus: readonly NilaiAkar[],
  kolamAnak: ItemBekal[],
  maksItem: number,
  catatan: CatatanRotasi[],
): void {
  const domainKolam = new Set(kolamAnak.map(i => String(i.domain)));
  if (domainKolam.size <= 1) {
    catatan.push({
      kode: 'DOMAIN_SERAGAM_TAK_TERHINDARKAN',
      pesan: 'Seluruh kolam berada dalam satu domain. Variasi domain per hari tidak dapat dipastikan.',
    });
    return;
  }

  const aturan1Aktif = nilaiFokus.length > 0 && kolamAnak.some(i => cocokNilai(i, nilaiFokus));

  for (let h = 0; h < siklus.length; h++) {
    if (maksItem < 2 || siklus[h].length < 2) continue;
    const domainHari = new Set(siklus[h].map(i => String(i.domain)));
    if (domainHari.size > 1) continue;

    const domainSeragam = String(siklus[h][0].domain);

    outerSwap:
    for (let k = 0; k < siklus.length; k++) {
      if (k === h) continue;
      for (let posA = 0; posA < siklus[k].length; posA++) {
        if (String(siklus[k][posA].domain) === domainSeragam) continue;
        for (let posB = 0; posB < siklus[h].length; posB++) {
          if (!aturan1Aktif) {
            tukar(siklus, k, posA, h, posB);
            break outerSwap;
          }
          // Simulasi: pastikan pertukaran tidak merusak Aturan 1 pada kedua hari
          const itemDariK = siklus[k][posA];
          const itemDariH = siklus[h][posB];
          const hSetelah = siklus[h].map((x, p) => (p === posB ? itemDariK : x));
          const kSetelah = siklus[k].map((x, p) => (p === posA ? itemDariH : x));
          if (
            hSetelah.some(i => cocokNilai(i, nilaiFokus)) &&
            kSetelah.some(i => cocokNilai(i, nilaiFokus))
          ) {
            tukar(siklus, k, posA, h, posB);
            break outerSwap;
          }
        }
      }
    }
  }
}

/**
 * Aturan 3 — tanpa pengulangan di batas siklus.
 * Hitung hari terakhir siklus sebelumnya (tanpa terapkan ulang aturan — menghindari rekursi),
 * lalu pastikan hari pertama siklus ini tidak memuat item yang sama.
 */
function terapkanAturan3(
  siklus: ItemBekal[][],
  kolamAnak: ItemBekal[],
  idAnak: string,
  siklusKe: number,
  maksItem: number,
): void {
  if (siklusKe <= 0 || siklus.length === 0) return;

  const benihPrev = benihDariTeks(idAnak + ':' + (siklusKe - 1));
  const dikocokPrev = kocok(kolamAnak, benihPrev);
  const siklusPrev = paginasiSiklus(dikocokPrev, maksItem);
  const idPrev = new Set((siklusPrev[siklusPrev.length - 1] ?? []).map(i => i.id));
  if (idPrev.size === 0) return;

  for (let posH = 0; posH < siklus[0].length; posH++) {
    if (!idPrev.has(siklus[0][posH].id)) continue;

    // Cari pengganti dari hari lain dalam siklus ini yang tidak ada di hari terakhir siklus sebelumnya
    for (let k = 1; k < siklus.length; k++) {
      for (let posK = 0; posK < siklus[k].length; posK++) {
        if (!idPrev.has(siklus[k][posK].id)) {
          tukar(siklus, 0, posH, k, posK);
          break;
        }
      }
      if (!idPrev.has(siklus[0][posH].id)) break;
    }
    // Bila tidak ada pengganti (semua item juga ada di hari terakhir siklus sebelumnya),
    // irisan dibiarkan — situasi tak terhindarkan bila kolam sangat kecil.
  }
}

// ─── Fungsi utama publik ──────────────────────────────────────────────────────

export function pilihKegiatanHarian(konteks: KonteksRotasi): HasilRotasi {
  const { tanggal, idAnak, kolam, nilaiFokus, maksItem } = konteks;
  const catatan: CatatanRotasi[] = [];

  // Langkah 1: Saring item milik anak
  const kolamAnak = kolam.filter(i => i.pemilik === 'anak');

  if (kolamAnak.length === 0) {
    return {
      pilihan: [],
      urutanSiklus: [],
      indeksHari: 0,
      siklusKe: 0,
      posisiDalamSiklus: 0,
      panjangSiklus: 0,
      catatan: [{ kode: 'KOLAM_KOSONG', pesan: 'Kolam kegiatan anak masih kosong.' }],
    };
  }

  if (maksItem <= 0) {
    return {
      pilihan: [],
      urutanSiklus: [],
      indeksHari: hitungIndeksHari(tanggal),
      siklusKe: 0,
      posisiDalamSiklus: 0,
      panjangSiklus: 0,
      catatan: [{ kode: 'KOLAM_LEBIH_KECIL_DARI_PLAFON', pesan: 'Plafon harian harus lebih dari nol.' }],
    };
  }

  const n = kolamAnak.length;
  const indeksHari = hitungIndeksHari(tanggal);

  // Langkah 2: Tangani kolam lebih kecil dari atau sama dengan plafon
  if (n <= maksItem) {
    catatan.push({
      kode: 'KOLAM_LEBIH_KECIL_DARI_PLAFON',
      pesan: `Kolam (${n} item) tidak lebih besar dari plafon harian (${maksItem}). Seluruh kolam ditampilkan setiap hari.`,
    });
    return {
      pilihan: [...kolamAnak],
      urutanSiklus: [...kolamAnak],
      indeksHari,
      siklusKe: 0,
      posisiDalamSiklus: 0,
      panjangSiklus: 1,
      catatan,
    };
  }

  // Langkah 3: Hitung posisi dalam siklus
  const panjangSiklus = Math.ceil(n / maksItem);
  const siklusKe = Math.floor(indeksHari / panjangSiklus);
  const posisiDalamSiklus = ((indeksHari % panjangSiklus) + panjangSiklus) % panjangSiklus;

  // Langkah 4: Kocok → simpan urutan penuh → bagi menjadi hari-hari siklus
  const benih = benihDariTeks(idAnak + ':' + siklusKe);
  const dikocok = kocok(kolamAnak, benih);
  const siklus = paginasiSiklus(dikocok, maksItem);

  // Langkah 5: Terapkan aturan secara berurutan
  terapkanAturan1(siklus, nilaiFokus, kolamAnak, catatan);
  terapkanAturan2(siklus, nilaiFokus, kolamAnak, maksItem, catatan);
  terapkanAturan3(siklus, kolamAnak, idAnak, siklusKe, maksItem);

  const pilihan = siklus[posisiDalamSiklus] ?? [];

  return {
    pilihan: [...pilihan],
    urutanSiklus: dikocok,
    indeksHari,
    siklusKe,
    posisiDalamSiklus,
    panjangSiklus,
    catatan,
  };
}

/**
 * Cari pengganti deterministik untuk item yang ingin disingkirkan pengguna.
 *
 * Mulai dari posisi setelah blok hari ini dalam urutanSiklus, telusuri ke depan (melingkar).
 * Lewati item yang sudah ada dalam pilihanSaatIni (kecuali idDiganti yang sedang diganti).
 * Mengembalikan null bila tidak ada kandidat tersedia — tombol ganti sebaiknya disembunyikan saat ini.
 */
export function kegiatanPengganti(
  idDiganti: string,
  urutanSiklus: readonly ItemBekal[],
  posisiDalamSiklus: number,
  maksItem: number,
  pilihanSaatIni: readonly ItemBekal[],
): ItemBekal | null {
  const n = urutanSiklus.length;
  if (n === 0) return null;

  const dipakai = new Set(pilihanSaatIni.map(i => i.id));
  dipakai.delete(idDiganti);

  // Mulai pencarian dari awal blok hari berikutnya dalam siklus
  const mulai = ((posisiDalamSiklus + 1) * maksItem) % n;

  for (let offset = 0; offset < n; offset++) {
    const kandidat = urutanSiklus[(mulai + offset) % n];
    if (!dipakai.has(kandidat.id)) return kandidat;
  }

  return null;
}
