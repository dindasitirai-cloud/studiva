// Kebiasaan Baik admin — import/ekspor CSV & Excel + pemeriksaan (fungsi murni).
// Format: SATU BARIS = SATU KEBIASAAN. Kolom = template "Rekah_Template_Import_Kebiasaan_v1.xlsx".
//   kategori = rutin        → isi kolom `kegiatan` (kunci kegiatan template Irama Hari)
//   kategori = situasional  → isi kolom `kapan` (mis. "saat anak kesal")
import Papa from 'papaparse';
import { NILAI } from '../../akar-keluarga/content';
import { cekKata } from '../../temani/admin/temaniImport';
import { normalisasiKebiasaan } from '../../../lib/supabase/kebiasaan';
import type { IsiKebiasaan } from '../../../lib/supabase/kebiasaan';
import { USIA_MAKS, labelUsia } from '../kebiasaanSeed';

export const KOLOM_KEB = [
  'id', 'judul', 'deskripsi', 'nilai', 'usia_min_bulan', 'usia_max_bulan', 'kategori', 'kegiatan', 'kapan', 'urutan',
] as const;
type Kolom = typeof KOLOM_KEB[number];
type Baris = Partial<Record<Kolom, string>> & { _baris: number };

export const POLA_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ── Pemeriksaan ──────────────────────────────────────────────────────────────

export function periksaKataKeb(isi: IsiKebiasaan): string[] {
  const out: string[] = [];
  const cek = (bagian: string, teks: string | null) => { const k = cekKata(teks); if (k.length) out.push(`${bagian}: ${k.join(', ')}`); };
  cek('Judul', isi.judul);
  cek('Deskripsi', isi.deskripsi);
  cek('Kapan', isi.kapan);
  return out;
}

/** Hal yang wajib ada sebelum diajukan. `kunciTemplate` = kunci kegiatan template yang ada. */
export function periksaKelengkapanKeb(isi: IsiKebiasaan, kunciTemplate: readonly string[]): string[] {
  const out: string[] = [];
  if (!POLA_ID.test(isi.id)) out.push('ID hanya boleh huruf kecil, angka, dan tanda-hubung (mis. kb-058).');
  if (!isi.judul) out.push('Judul kebiasaan belum diisi.');
  if (isi.judul.length > 90) out.push('Judul maksimal 90 karakter.');
  if (!isi.nilai.length) out.push('Pilih minimal satu nilai.');
  if (isi.usia_min_bulan > isi.usia_max_bulan) out.push('Rentang usia belum benar.');
  if (isi.kategori === 'rutin') {
    if (!isi.template_key) out.push('Kebiasaan rutin perlu ditempelkan ke satu kegiatan Irama Hari.');
    else if (!kunciTemplate.includes(isi.template_key)) out.push(`Kegiatan "${isi.template_key}" tidak ada di daftar kegiatan template.`);
  } else if (!isi.kapan) out.push('Kebiasaan situasional perlu keterangan "kapan" (mis. saat anak kesal).');
  return out;
}

// ── Membaca file ─────────────────────────────────────────────────────────────

function barisKeObjek(rows: unknown[][]): { data?: Baris[]; error?: string } {
  const hi = rows.findIndex(r => r.map(x => String(x ?? '').trim().toLowerCase()).includes('judul'));
  if (hi < 0) return { error: "Kolom 'judul' tidak ditemukan. Pastikan baris pertama berisi nama kolom dari template." };
  const head = rows[hi].map(x => String(x ?? '').trim().toLowerCase());
  const hilang = ['judul', 'nilai', 'kategori'].filter(k => !head.includes(k));
  if (hilang.length) return { error: `Kolom wajib tidak ada: ${hilang.join(', ')}.` };
  const data: Baris[] = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const o: Baris = { _baris: i + 1 };
    let kosong = true;
    head.forEach((h, j) => {
      if (!(KOLOM_KEB as readonly string[]).includes(h)) return;
      const v = String(rows[i]?.[j] ?? '').trim();
      o[h as Kolom] = v;
      if (v) kosong = false;
    });
    if (!kosong) data.push(o);
  }
  return { data };
}

export interface HasilBacaKeb { nama: string; data?: Baris[]; error?: string }

export async function bacaFileKeb(file: File): Promise<HasilBacaKeb> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'csv' || ext === 'txt') {
    const teks = (await file.text()).replace(/^﻿/, '');
    const parsed = Papa.parse<string[]>(teks, { skipEmptyLines: 'greedy' });
    const r = barisKeObjek(parsed.data);
    if (r.data && !r.data.length) return { nama: file.name, error: 'Tidak ada baris data di file ini.' };
    return { nama: file.name, ...r };
  }
  if (ext === 'xlsx' || ext === 'xls') {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array' });
    const urut = ['Isi di sini', ...wb.SheetNames.filter(n => !['Isi di sini', 'Contoh', 'Petunjuk', 'Pilihan'].includes(n))];
    for (const n of urut) {
      const ws = wb.Sheets[n];
      if (!ws) continue;
      const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', raw: false });
      const r = barisKeObjek(rows);
      if (r.data && r.data.length) return { nama: `${file.name} › ${n}`, data: r.data };
    }
    return { nama: file.name, error: "Sheet 'Isi di sini' masih kosong. Sheet 'Contoh' sengaja tidak diimpor." };
  }
  return { nama: file.name, error: 'Format tidak didukung. Gunakan .xlsx atau .csv.' };
}

// ── Validasi ─────────────────────────────────────────────────────────────────

export interface BarisImportKeb { baris: number; isi: IsiKebiasaan; idKosong: boolean; galat: string[]; catatan: string[] }

export function validasiImportKeb(data: Baris[], kunciTemplate: readonly string[]): BarisImportKeb[] {
  const dilihat = new Set<string>();
  return data.map(r => {
    const E: string[] = [], W: string[] = [];
    const kat = (r.kategori ?? '').toLowerCase();
    if (!['rutin', 'situasional'].includes(kat)) E.push(`Kategori perlu diisi "rutin" atau "situasional".`);
    const nilaiMentah = (r.nilai ?? '').split(/[;,]/).map(s => s.trim()).filter(Boolean);
    nilaiMentah.forEach(n => { if (!(NILAI as readonly string[]).includes(n)) E.push(`Nilai "${n}" tidak ada di daftar 12 nilai.`); });
    const angka = (v: string | undefined, d: number) => (v === undefined || v === '' ? d : Number(v));
    const min = angka(r.usia_min_bulan, 0), max = angka(r.usia_max_bulan, USIA_MAKS);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max > USIA_MAKS || min > max) E.push(`Usia belum benar (0–${USIA_MAKS} bulan, minimal ≤ maksimal).`);
    const isi = normalisasiKebiasaan({
      id: r.id ?? '', judul: r.judul, deskripsi: r.deskripsi, nilai: nilaiMentah as IsiKebiasaan['nilai'],
      usia_min_bulan: min, usia_max_bulan: max, kategori: kat === 'situasional' ? 'situasional' : 'rutin',
      template_key: r.kegiatan ?? null, kapan: r.kapan ?? null, urutan: angka(r.urutan, 100),
    });
    const idKosong = !isi.id;
    if (!idKosong) {
      if (dilihat.has(isi.id)) E.push(`ID ${isi.id} muncul lebih dari sekali di file.`);
      dilihat.add(isi.id);
    }
    periksaKelengkapanKeb({ ...isi, id: idKosong ? 'kb-000' : isi.id }, kunciTemplate).forEach(k => E.push(k));
    if (kat === 'rutin' && r.kapan) W.push('Kolom "kapan" diabaikan untuk kebiasaan rutin.');
    if (kat === 'situasional' && r.kegiatan) W.push('Kolom "kegiatan" diabaikan untuk kebiasaan situasional.');
    if (idKosong) W.push('ID kosong — akan dibuatkan ID baru (kb-###).');
    periksaKataKeb(isi).forEach(k => W.push(`Kata yang perlu ditinjau — ${k}.`));
    return { baris: r._baris, isi, idKosong, galat: [...new Set(E)], catatan: W };
  });
}

// ── Ekspor ───────────────────────────────────────────────────────────────────

export function keCSVKeb(daftar: IsiKebiasaan[]): string {
  const rows: string[][] = [[...KOLOM_KEB]];
  daftar.forEach(k => rows.push([
    k.id, k.judul, k.deskripsi, k.nilai.join(';'), String(k.usia_min_bulan), String(k.usia_max_bulan),
    k.kategori, k.template_key ?? '', k.kapan ?? '', String(k.urutan),
  ]));
  return '﻿' + Papa.unparse(rows);
}

// ── Perbedaan dua versi ──────────────────────────────────────────────────────

export interface BedaKeb { bagian: string; lama: string; baru: string }

export function bandingkanKeb(lama: IsiKebiasaan, baru: IsiKebiasaan, namaKegiatan: (k: string | null) => string): BedaKeb[] {
  const out: BedaKeb[] = [];
  const s = (v: unknown) => (Array.isArray(v) ? v.join(', ') : v === null || v === undefined || v === '' ? '(kosong)' : String(v));
  const cek = (bagian: string, a: unknown, b: unknown) => { if (s(a) !== s(b)) out.push({ bagian, lama: s(a), baru: s(b) }); };
  cek('Judul', lama.judul, baru.judul);
  cek('Deskripsi', lama.deskripsi, baru.deskripsi);
  cek('Nilai', lama.nilai, baru.nilai);
  cek('Usia', labelUsia(lama.usia_min_bulan, lama.usia_max_bulan), labelUsia(baru.usia_min_bulan, baru.usia_max_bulan));
  cek('Kategori', lama.kategori, baru.kategori);
  cek('Kegiatan', namaKegiatan(lama.template_key), namaKegiatan(baru.template_key));
  cek('Kapan', lama.kapan, baru.kapan);
  cek('Urutan', lama.urutan, baru.urutan);
  return out;
}
