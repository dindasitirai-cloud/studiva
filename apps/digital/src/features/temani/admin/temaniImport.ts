// Temani admin — import/ekspor CSV & Excel + pemeriksaan konten (fungsi murni).
// Format: satu baris = satu hari; baris dengan slug sama = satu perjalanan.
// Kolom = template "Rekah_Template_Import_Temani_v1.xlsx" (public/templates).
import Papa from 'papaparse';
import { NILAI } from '../../akar-keluarga/content';
import { normalisasiIsi } from '../../../lib/supabase/temani';
import type { IsiTemani, IsiHariTemani } from '../../../lib/supabase/temani';

export const KOLOM = [
  'slug', 'judul', 'deskripsi', 'nilai_terkait', 'usia_min_bulan', 'usia_max_bulan', 'durasi_hari',
  'kebiasaan_utama', 'hari', 'jenis', 'kebiasaan_id', 'fokus_hari', 'script', 'kenapa_sederhana',
  'kenapa_evidence', 'kenapa_sumber', 'yang_diamati',
] as const;
type Kolom = typeof KOLOM[number];
type Baris = Partial<Record<Kolom, string>> & { _baris: number };

const POLA_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const POLA_KB = /^kb-\d{3}$/;

// ── Pemeriksaan kata ─────────────────────────────────────────────────────────
// Kata pemindai global (lib/pemindaiKata) + kata yang dihindari di copy Rekah, dicocokkan
// sebagai KATA UTUH agar "berkurang"/"dikurangi" tidak ikut tertandai.
const KATA_DIHINDARI = [
  'terlambat', 'belum mencapai', 'di bawah', 'tertinggal', 'kurang', 'gagal', 'seharusnya sudah',
  'harus', 'seharusnya', 'tidak normal', 'abnormal', 'normal', 'gangguan', 'skor', 'peringkat',
  'ranking', 'lambat', 'streak', 'diagnosis', 'nakal', 'malas', 'bodoh',
];
// Frasa yang menaungi kata lain — bila frasanya ditemukan, kata di dalamnya tidak dilaporkan dua kali.
const DINAUNGI: Record<string, string> = { normal: 'tidak normal', harus: 'seharusnya sudah', seharusnya: 'seharusnya sudah' };

export function cekKata(teks: string | undefined | null): string[] {
  if (!teks) return [];
  const t = teks.toLowerCase();
  const out: string[] = [];
  KATA_DIHINDARI.forEach(k => {
    const re = new RegExp(`(^|[^a-z])${k.replace(/ /g, '\\s+')}(?=$|[^a-z])`);
    if (re.test(t) && !out.includes(k)) out.push(k);
  });
  return out.filter(k => !(DINAUNGI[k] && out.includes(DINAUNGI[k])));
}

const LABEL_TEKS_HARI: Array<[keyof IsiHariTemani, string]> = [
  ['fokus_hari', 'fokus'], ['script', 'contoh kalimat'], ['kenapa_sederhana', 'kenapa'],
  ['kenapa_evidence', 'kenapa (lebih dalam)'], ['yang_diamati', 'yang diamati'],
];

/** Daftar temuan kata per bagian, mis. "Hari 3: harus". */
export function periksaKata(isi: IsiTemani): string[] {
  const out: string[] = [];
  const kj = cekKata(isi.judul); if (kj.length) out.push(`Judul: ${kj.join(', ')}`);
  const kd = cekKata(isi.deskripsi); if (kd.length) out.push(`Deskripsi: ${kd.join(', ')}`);
  isi.hari.forEach(h => {
    const k: string[] = [];
    LABEL_TEKS_HARI.forEach(([f]) => cekKata(h[f] as string).forEach(x => { if (!k.includes(x)) k.push(x); }));
    if (k.length) out.push(`Hari ${h.hari}: ${k.join(', ')}`);
  });
  return out;
}

/** Hal yang wajib ada sebelum diajukan ke peninjau. */
export function periksaKelengkapan(isi: IsiTemani): string[] {
  const out: string[] = [];
  if (!POLA_SLUG.test(isi.slug)) out.push('Slug hanya boleh huruf kecil, angka, dan tanda-hubung.');
  if (!isi.judul) out.push('Judul belum diisi.');
  if (!isi.nilai_terkait.length) out.push('Pilih minimal satu nilai.');
  isi.nilai_terkait.forEach(n => { if (!(NILAI as readonly string[]).includes(n)) out.push(`Nilai "${n}" tidak ada di daftar 12 nilai.`); });
  const a = isi.usia_min_bulan, b = isi.usia_max_bulan;
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b > 72 || a > b) out.push('Rentang usia belum benar (0–72 bulan, minimal ≤ maksimal).');
  if (isi.kebiasaan_utama && !POLA_KB.test(isi.kebiasaan_utama)) out.push('Kebiasaan yang diadopsi perlu berformat kb-000.');
  if (!isi.hari.length) out.push('Tambahkan minimal satu hari.');
  if (isi.hari.length > 30) out.push('Maksimal 30 hari per perjalanan.');
  isi.hari.forEach(h => {
    if (!h.fokus_hari) out.push(`Hari ${h.hari}: fokus kosong.`);
    if (!h.kenapa_sederhana) out.push(`Hari ${h.hari}: penjelasan sederhana kosong.`);
    if (h.jenis === 'target' && !h.kebiasaan_id) out.push(`Hari ${h.hari}: jenis target butuh kebiasaan_id.`);
    if (h.kebiasaan_id && !POLA_KB.test(h.kebiasaan_id)) out.push(`Hari ${h.hari}: kebiasaan_id tidak berformat kb-000.`);
  });
  return out;
}

// ── Membaca file ─────────────────────────────────────────────────────────────

function barisKeObjek(rows: unknown[][]): { data?: Baris[]; error?: string } {
  const hi = rows.findIndex(r => r.map(x => String(x ?? '').trim().toLowerCase()).includes('slug'));
  if (hi < 0) return { error: "Kolom 'slug' tidak ditemukan. Pastikan baris pertama berisi nama kolom dari template." };
  const head = rows[hi].map(x => String(x ?? '').trim().toLowerCase());
  const hilang = ['slug', 'hari', 'fokus_hari'].filter(k => !head.includes(k));
  if (hilang.length) return { error: `Kolom wajib tidak ada: ${hilang.join(', ')}.` };
  const data: Baris[] = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const o: Baris = { _baris: i + 1 };
    let kosong = true;
    head.forEach((h, j) => {
      if (!(KOLOM as readonly string[]).includes(h)) return;
      const v = String(rows[i]?.[j] ?? '').trim();
      o[h as Kolom] = v;
      if (v) kosong = false;
    });
    if (!kosong) data.push(o);
  }
  return { data };
}

export interface HasilBaca { nama: string; data?: Baris[]; error?: string }

export async function bacaFileImport(file: File): Promise<HasilBaca> {
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
    // Utamakan sheet "Isi di sini"; sheet Contoh/Petunjuk/Pilihan dari template tidak diimpor.
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

// ── Validasi per perjalanan ──────────────────────────────────────────────────

export interface GrupImport {
  slug: string;
  judul: string;
  isi: IsiTemani;
  galat: string[];
  catatan: string[];
}

export function validasiImport(data: Baris[]): GrupImport[] {
  const grup = new Map<string, Baris[]>();
  data.forEach(r => {
    const k = r.slug || '(tanpa slug)';
    if (!grup.has(k)) grup.set(k, []);
    grup.get(k)!.push(r);
  });

  return Array.from(grup.entries()).map(([slug, rows]) => {
    const E: string[] = [];
    const W: string[] = [];
    const h = rows.find(r => r.judul) ?? rows[0];

    if (slug === '(tanpa slug)') E.push(`Baris ${rows.map(r => r._baris).join(', ')}: slug kosong.`);
    else if (!POLA_SLUG.test(slug)) E.push(`Slug "${slug}" hanya boleh huruf kecil, angka, dan tanda-hubung.`);
    if (!h.judul) E.push('Judul perjalanan belum diisi (isi di baris hari 1).');

    const nilai = (h.nilai_terkait ?? '').split(/[;,]/).map(s => s.trim()).filter(Boolean);
    nilai.forEach(n => { if (!(NILAI as readonly string[]).includes(n)) E.push(`Nilai "${n}" tidak ada di daftar 12 nilai.`); });
    if (!nilai.length) W.push('nilai_terkait kosong — perjalanan tidak akan muncul di saran berbasis nilai.');

    const umin = h.usia_min_bulan ? Number(h.usia_min_bulan) : NaN;
    const umax = h.usia_max_bulan ? Number(h.usia_max_bulan) : NaN;
    if (Number.isNaN(umin) || Number.isNaN(umax)) E.push('Usia minimal & maksimal (bulan) wajib diisi dengan angka.');
    else if (umin < 0 || umax > 72) E.push('Usia berada di luar 0–72 bulan.');
    else if (umin > umax) E.push(`usia_min_bulan (${umin}) lebih besar dari usia_max_bulan (${umax}).`);
    if (h.kebiasaan_utama && !POLA_KB.test(h.kebiasaan_utama)) E.push(`kebiasaan_utama "${h.kebiasaan_utama}" tidak berformat kb-000.`);

    const dilihat = new Set<number>();
    const hari: IsiHariTemani[] = [];
    rows.forEach(r => {
      const n = Number(r.hari);
      const b = `Baris ${r._baris}`;
      if (!r.hari || !Number.isInteger(n) || n < 1) { E.push(`${b}: nomor hari tidak valid.`); return; }
      if (dilihat.has(n)) E.push(`${b}: Hari ${n} dobel.`);
      dilihat.add(n);
      const jenis = (r.jenis || 'perancah').toLowerCase();
      if (!r.fokus_hari) E.push(`${b} (Hari ${n}): fokus_hari kosong.`);
      if (jenis !== 'target' && jenis !== 'perancah') E.push(`${b}: jenis "${r.jenis}" hanya boleh target atau perancah.`);
      if (jenis === 'target' && !r.kebiasaan_id) E.push(`${b} (Hari ${n}): jenis target wajib punya kebiasaan_id.`);
      if (r.kebiasaan_id && !POLA_KB.test(r.kebiasaan_id)) E.push(`${b}: kebiasaan_id "${r.kebiasaan_id}" tidak berformat kb-000.`);
      if (!r.kenapa_sederhana) W.push(`${b} (Hari ${n}): kenapa_sederhana kosong — perlu diisi sebelum diajukan.`);
      if (r.kenapa_sumber) W.push(`${b} (Hari ${n}): kenapa_sumber terisi — peninjau perlu memverifikasinya.`);
      hari.push({
        hari: n, jenis: jenis === 'target' ? 'target' : 'perancah', kebiasaan_id: r.kebiasaan_id ?? '',
        fokus_hari: r.fokus_hari ?? '', script: r.script ?? '', kenapa_sederhana: r.kenapa_sederhana ?? '',
        kenapa_evidence: r.kenapa_evidence ?? '', kenapa_sumber: r.kenapa_sumber ?? '', yang_diamati: r.yang_diamati ?? '',
      });
    });
    hari.sort((a, b) => a.hari - b.hari);
    if (hari.some((x, i) => x.hari !== i + 1)) W.push('Nomor hari tidak berurutan dari 1 — akan diurutkan ulang.');
    if (hari.length > 30) E.push('Lebih dari 30 hari dalam satu perjalanan.');
    const dur = h.durasi_hari ? Number(h.durasi_hari) : null;
    if (dur !== null && dur !== hari.length) W.push(`durasi_hari tertulis ${dur}, tetapi ada ${hari.length} baris hari. Yang dipakai: jumlah baris (${hari.length}).`);

    const isi = normalisasiIsi({
      slug, judul: h.judul ?? '', deskripsi: h.deskripsi ?? '', nilai_terkait: nilai,
      usia_min_bulan: umin, usia_max_bulan: umax, kebiasaan_utama: h.kebiasaan_utama ?? '', hari,
    });
    periksaKata(isi).forEach(k => W.push(`Kata yang perlu ditinjau — ${k}.`));
    return { slug, judul: h.judul || '(tanpa judul)', isi, galat: E, catatan: W };
  });
}

// ── Ekspor ───────────────────────────────────────────────────────────────────

export function keCSV(daftar: IsiTemani[]): string {
  const rows: string[][] = [[...KOLOM]];
  daftar.forEach(j => j.hari.forEach((d, i) => {
    const r: Record<string, string | number> = {
      slug: j.slug, hari: d.hari, jenis: d.jenis, kebiasaan_id: d.kebiasaan_id, fokus_hari: d.fokus_hari,
      script: d.script, kenapa_sederhana: d.kenapa_sederhana, kenapa_evidence: d.kenapa_evidence,
      kenapa_sumber: d.kenapa_sumber, yang_diamati: d.yang_diamati,
    };
    if (i === 0) Object.assign(r, {
      judul: j.judul, deskripsi: j.deskripsi, nilai_terkait: j.nilai_terkait.join(';'),
      usia_min_bulan: j.usia_min_bulan, usia_max_bulan: j.usia_max_bulan, durasi_hari: j.hari.length,
      kebiasaan_utama: j.kebiasaan_utama,
    });
    rows.push(KOLOM.map(k => String(r[k] ?? '')));
  }));
  return '﻿' + Papa.unparse(rows);
}

export function unduhTeks(namaFile: string, isi: string, tipe = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([isi], { type: tipe }));
  const a = document.createElement('a');
  a.href = url; a.download = namaFile;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Perbedaan dua versi (untuk tinjauan) ─────────────────────────────────────

export interface Beda { bagian: string; lama: string; baru: string }

export function bandingkan(lama: IsiTemani, baru: IsiTemani): Beda[] {
  const out: Beda[] = [];
  const s = (v: unknown) => (Array.isArray(v) ? v.join(', ') : v === null || v === undefined || v === '' ? '(kosong)' : String(v));
  const cek = (bagian: string, a: unknown, b: unknown) => { if (s(a) !== s(b)) out.push({ bagian, lama: s(a), baru: s(b) }); };
  cek('Judul', lama.judul, baru.judul);
  cek('Slug', lama.slug, baru.slug);
  cek('Deskripsi', lama.deskripsi, baru.deskripsi);
  cek('Nilai', lama.nilai_terkait, baru.nilai_terkait);
  cek('Usia (bulan)', `${lama.usia_min_bulan}–${lama.usia_max_bulan}`, `${baru.usia_min_bulan}–${baru.usia_max_bulan}`);
  cek('Kebiasaan diadopsi', lama.kebiasaan_utama, baru.kebiasaan_utama);
  const label: Array<[keyof IsiHariTemani, string]> = [
    ['jenis', 'jenis'], ['kebiasaan_id', 'kebiasaan_id'], ['fokus_hari', 'fokus'], ['script', 'contoh kalimat'],
    ['kenapa_sederhana', 'kenapa · sederhana'], ['kenapa_evidence', 'kenapa · lebih dalam'],
    ['kenapa_sumber', 'sumber'], ['yang_diamati', 'yang diamati'],
  ];
  const n = Math.max(lama.hari.length, baru.hari.length);
  for (let i = 0; i < n; i++) {
    const a = lama.hari[i], b = baru.hari[i];
    if (!a) { out.push({ bagian: `Hari ${i + 1} (baru)`, lama: '—', baru: b.fokus_hari }); continue; }
    if (!b) { out.push({ bagian: `Hari ${i + 1} (dihapus)`, lama: a.fokus_hari, baru: '—' }); continue; }
    label.forEach(([k, l]) => cek(`Hari ${i + 1} · ${l}`, a[k], b[k]));
  }
  return out;
}
