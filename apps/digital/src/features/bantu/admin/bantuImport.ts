// Bantu admin — import/ekspor CSV & Excel + pemeriksaan (fungsi murni).
// Format: SATU BARIS = SATU SITUASI. Langkah di kolom langkah_1..langkah_6; maksimal dua
// pertanyaan clarify (pertanyaan_n, opsi_n dipisah ";", opsi_keselamatan_n dipisah ";").
import Papa from 'papaparse';
import { cekKata } from '../../temani/admin/temaniImport';
import { normalisasiBantu, LABEL_KATEGORI, rentangUsia } from '../../../lib/supabase/bantu';
import type { IsiBantu, KategoriBantu, ClarifyBantu } from '../../../lib/supabase/bantu';
import { OPSI_MEMICU_B5 } from '../bantuSeed';
import { labelUsia } from '../../irama-hari/kebiasaanSeed';

export const MAKS_LANGKAH = 6;
export const MAKS_CLARIFY = 2;

export const KOLOM_BANTU = [
  'slug', 'label', 'ringkas', 'kategori', 'sensitif_keselamatan', 'urutan', 'usia_min_bulan', 'usia_max_bulan', 'validasi',
  ...Array.from({ length: MAKS_LANGKAH }, (_, i) => `langkah_${i + 1}`),
  ...Array.from({ length: MAKS_CLARIFY }, (_, i) => [`pertanyaan_${i + 1}`, `opsi_${i + 1}`, `opsi_keselamatan_${i + 1}`]).flat(),
  'yang_diamati', 'kenapa_sederhana', 'kenapa_sumber',
];

const POLA_SLUG = /^[a-z0-9]+([_-][a-z0-9]+)*$/;
const KATEGORI = Object.keys(LABEL_KATEGORI) as KategoriBantu[];
type Baris = Record<string, string> & { _baris: string };

// ── Pemeriksaan ──────────────────────────────────────────────────────────────

export function periksaKataBantu(isi: IsiBantu): string[] {
  const out: string[] = [];
  const cek = (bagian: string, teks: string) => { const k = cekKata(teks); if (k.length) out.push(`${bagian}: ${k.join(', ')}`); };
  cek('Label', isi.label);
  cek('Ringkas', isi.ringkas);
  cek('Validasi', isi.validasi);
  isi.langkah.forEach((l, i) => cek(`Langkah ${i + 1}`, l));
  cek('Yang diamati', isi.yang_diamati);
  cek('Kenapa', isi.kenapa_sederhana);
  return out;
}

export function periksaKelengkapanBantu(isi: IsiBantu): string[] {
  const out: string[] = [];
  if (!POLA_SLUG.test(isi.slug)) out.push('Slug hanya boleh huruf kecil, angka, garis bawah, dan tanda-hubung.');
  if (!isi.label) out.push('Label situasi belum diisi.');
  if (isi.kategori !== 'meta' && !isi.ringkas) out.push('Ringkasan satu baris untuk kartu belum diisi.');
  if (!isi.validasi) out.push('Kalimat validasi belum diisi.');
  if (isi.langkah.length < 2) out.push('Isi minimal 2 langkah.');
  if (isi.langkah.length > MAKS_LANGKAH) out.push(`Maksimal ${MAKS_LANGKAH} langkah.`);
  if (!isi.kenapa_sederhana) out.push('Penjelasan "kenapa" sederhana belum diisi.');
  isi.clarify.forEach((c, i) => {
    if (!c.pertanyaan) out.push(`Pertanyaan ${i + 1} kosong.`);
    if (c.opsi.length < 2) out.push(`Pertanyaan ${i + 1}: isi minimal 2 pilihan jawaban.`);
  });
  if (isi.clarify.length > MAKS_CLARIFY) out.push(`Maksimal ${MAKS_CLARIFY} pertanyaan.`);
  return out;
}

/** Catatan yang tidak menghalangi, tapi perlu diperhatikan peninjau. */
export function catatanKeselamatan(isi: IsiBantu): string[] {
  const out: string[] = [];
  const adaPemicu = isi.clarify.some(c => c.opsi_keselamatan.length || c.opsi.some(o => OPSI_MEMICU_B5.includes(o)));
  if (isi.sensitif_keselamatan && !adaPemicu) out.push('Situasi ditandai sensitif, tetapi belum ada pilihan jawaban yang membuka layar keselamatan.');
  if (isi.langkah.length > 4) out.push('Lebih dari 4 langkah — Bantu sebaiknya 2–4 langkah agar mudah dijalankan saat genting.');
  if (isi.kenapa_sumber) out.push('Sumber terisi — peninjau perlu memverifikasinya.');
  return out;
}

// ── Membaca file ─────────────────────────────────────────────────────────────

function barisKeObjek(rows: unknown[][]): { data?: Baris[]; error?: string } {
  const hi = rows.findIndex(r => r.map(x => String(x ?? '').trim().toLowerCase()).includes('slug'));
  if (hi < 0) return { error: "Kolom 'slug' tidak ditemukan. Pastikan baris pertama berisi nama kolom dari template." };
  const head = rows[hi].map(x => String(x ?? '').trim().toLowerCase());
  const hilang = ['slug', 'label', 'validasi', 'langkah_1'].filter(k => !head.includes(k));
  if (hilang.length) return { error: `Kolom wajib tidak ada: ${hilang.join(', ')}.` };
  const data: Baris[] = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const o: Baris = { _baris: String(i + 1) };
    let kosong = true;
    head.forEach((h, j) => {
      if (!KOLOM_BANTU.includes(h)) return;
      const v = String(rows[i]?.[j] ?? '').trim();
      o[h] = v;
      if (v) kosong = false;
    });
    if (!kosong) data.push(o);
  }
  return { data };
}

export async function bacaFileBantu(file: File): Promise<{ nama: string; data?: Baris[]; error?: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'csv' || ext === 'txt') {
    const teks = (await file.text()).replace(/^﻿/, '');
    const r = barisKeObjek(Papa.parse<string[]>(teks, { skipEmptyLines: 'greedy' }).data);
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
      const r = barisKeObjek(XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', raw: false }));
      if (r.data && r.data.length) return { nama: `${file.name} › ${n}`, data: r.data };
    }
    return { nama: file.name, error: "Sheet 'Isi di sini' masih kosong. Sheet 'Contoh' sengaja tidak diimpor." };
  }
  return { nama: file.name, error: 'Format tidak didukung. Gunakan .xlsx atau .csv.' };
}

// ── Validasi ─────────────────────────────────────────────────────────────────

export interface BarisImportBantu { slug: string; label: string; isi: IsiBantu; galat: string[]; catatan: string[] }

const pecah = (s: string | undefined) => (s ?? '').split(';').map(x => x.trim()).filter(Boolean);
const bool = (s: string | undefined) => ['ya', 'y', 'true', '1', 'sensitif'].includes((s ?? '').trim().toLowerCase());

export function validasiImportBantu(data: Baris[]): BarisImportBantu[] {
  const dilihat = new Map<string, string>();
  return data.map(r => {
    const E: string[] = [];
    const W: string[] = [];
    const b = `Baris ${r._baris}`;
    const slug = (r.slug ?? '').toLowerCase();
    if (!slug) E.push(`${b}: slug kosong.`);
    else if (!POLA_SLUG.test(slug)) E.push(`${b}: slug "${slug}" hanya boleh huruf kecil, angka, garis bawah, dan tanda-hubung.`);
    if (slug && dilihat.has(slug)) E.push(`${b}: slug "${slug}" sudah dipakai di baris ${dilihat.get(slug)}.`);
    dilihat.set(slug, r._baris);

    const katInput = (r.kategori ?? '').trim().toLowerCase();
    const kategori = KATEGORI.find(k => k === katInput.replace(/\s+/g, '_') || (!!katInput && LABEL_KATEGORI[k].toLowerCase().startsWith(katInput))) ?? null;
    if (!kategori) E.push(`${b}: kategori "${r.kategori ?? ''}" tidak dikenal (perilaku_anak, relasional, caregiver, meta).`);
    if (r.urutan && Number.isNaN(Number(r.urutan))) E.push(`${b}: urutan perlu berupa angka.`);
    for (const k of ['usia_min_bulan', 'usia_max_bulan']) {
      const v = r[k];
      if (v && (Number.isNaN(Number(v)) || Number(v) < 0 || Number(v) > 71)) E.push(`${b}: ${k} perlu angka 0–71.`);
    }

    const langkah = Array.from({ length: MAKS_LANGKAH }, (_, i) => r[`langkah_${i + 1}`] ?? '').filter(Boolean);
    const clarify: ClarifyBantu[] = [];
    for (let i = 1; i <= MAKS_CLARIFY; i++) {
      const p = r[`pertanyaan_${i}`] ?? '';
      const opsi = pecah(r[`opsi_${i}`]);
      const kes = pecah(r[`opsi_keselamatan_${i}`]);
      if (!p && !opsi.length) continue;
      kes.filter(o => !opsi.includes(o)).forEach(o => E.push(`${b}: opsi_keselamatan_${i} "${o}" tidak ada di opsi_${i}.`));
      clarify.push({ pertanyaan: p, opsi, opsi_keselamatan: kes });
    }

    const isi = normalisasiBantu({
      slug, label: r.label, ringkas: r.ringkas, kategori: kategori ?? 'perilaku_anak',
      sensitif_keselamatan: bool(r.sensitif_keselamatan), urutan: r.urutan ? Number(r.urutan) : 100,
      ...rentangUsia(r.usia_min_bulan, r.usia_max_bulan),
      clarify, validasi: r.validasi, langkah, yang_diamati: r.yang_diamati,
      kenapa_sederhana: r.kenapa_sederhana, kenapa_sumber: r.kenapa_sumber,
    });
    if (!isi.label) E.push(`${b}: label kosong.`);
    // Kekurangan lain tidak menghalangi import (tetap draf), tapi harus beres sebelum diajukan.
    periksaKelengkapanBantu(isi).filter(k => !k.startsWith('Slug') && !k.startsWith('Label')).forEach(k => W.push(`${b}: ${k}`));
    catatanKeselamatan(isi).forEach(k => W.push(`${b}: ${k}`));
    periksaKataBantu(isi).forEach(k => W.push(`${b}: kata yang perlu ditinjau — ${k}.`));
    return { slug, label: isi.label || '(tanpa label)', isi, galat: E, catatan: W };
  });
}

// ── Ekspor ───────────────────────────────────────────────────────────────────

export function keCSVBantu(daftar: IsiBantu[]): string {
  const rows: string[][] = [KOLOM_BANTU];
  daftar.forEach(s => {
    const r: Record<string, string> = {
      slug: s.slug, label: s.label, ringkas: s.ringkas, kategori: s.kategori,
      sensitif_keselamatan: s.sensitif_keselamatan ? 'ya' : 'tidak', urutan: String(s.urutan),
      usia_min_bulan: String(s.usia_min_bulan), usia_max_bulan: String(s.usia_max_bulan), validasi: s.validasi,
      yang_diamati: s.yang_diamati, kenapa_sederhana: s.kenapa_sederhana, kenapa_sumber: s.kenapa_sumber,
    };
    s.langkah.forEach((l, i) => { r[`langkah_${i + 1}`] = l; });
    s.clarify.forEach((c, i) => {
      r[`pertanyaan_${i + 1}`] = c.pertanyaan; r[`opsi_${i + 1}`] = c.opsi.join('; '); r[`opsi_keselamatan_${i + 1}`] = c.opsi_keselamatan.join('; ');
    });
    rows.push(KOLOM_BANTU.map(k => r[k] ?? ''));
  });
  return '﻿' + Papa.unparse(rows);
}

// ── Perbedaan dua versi ──────────────────────────────────────────────────────

export function bandingkanBantu(lama: IsiBantu, baru: IsiBantu): Array<{ bagian: string; lama: string; baru: string }> {
  const out: Array<{ bagian: string; lama: string; baru: string }> = [];
  const s = (v: unknown) => (v === '' || v === null || v === undefined ? '(kosong)' : typeof v === 'boolean' ? (v ? 'ya' : 'tidak') : String(v));
  const cek = (bagian: string, a: unknown, b: unknown) => { if (s(a) !== s(b)) out.push({ bagian, lama: s(a), baru: s(b) }); };
  cek('Label', lama.label, baru.label);
  cek('Ringkas', lama.ringkas, baru.ringkas);
  cek('Kategori', LABEL_KATEGORI[lama.kategori], LABEL_KATEGORI[baru.kategori]);
  cek('Sensitif keselamatan', lama.sensitif_keselamatan, baru.sensitif_keselamatan);
  cek('Urutan', lama.urutan, baru.urutan);
  cek('Usia anak', labelUsia(lama.usia_min_bulan, lama.usia_max_bulan), labelUsia(baru.usia_min_bulan, baru.usia_max_bulan));
  cek('Validasi', lama.validasi, baru.validasi);
  for (let i = 0; i < Math.max(lama.langkah.length, baru.langkah.length); i++) cek(`Langkah ${i + 1}`, lama.langkah[i] ?? '', baru.langkah[i] ?? '');
  for (let i = 0; i < Math.max(lama.clarify.length, baru.clarify.length); i++) {
    const a = lama.clarify[i], c = baru.clarify[i];
    cek(`Pertanyaan ${i + 1}`, a?.pertanyaan ?? '', c?.pertanyaan ?? '');
    cek(`Pertanyaan ${i + 1} · pilihan`, (a?.opsi ?? []).join('; '), (c?.opsi ?? []).join('; '));
    cek(`Pertanyaan ${i + 1} · membuka layar keselamatan`, (a?.opsi_keselamatan ?? []).join('; '), (c?.opsi_keselamatan ?? []).join('; '));
  }
  cek('Yang diamati', lama.yang_diamati, baru.yang_diamati);
  cek('Kenapa · sederhana', lama.kenapa_sederhana, baru.kenapa_sederhana);
  cek('Sumber', lama.kenapa_sumber, baru.kenapa_sumber);
  return out;
}
