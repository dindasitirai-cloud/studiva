// =============================================================
// cariKegiatanDariText — deteksi kegiatan Ajak Main dari teks pengamatan bebas.
// Caregiver menulis apa yang diamati; kita cocokkan keyword-nya dengan judul,
// tujuan, deskripsi, domain, dan tag nilai kegiatan — dibatasi ke usia anak.
// Pencocokan sederhana berbasis kata (bukan AI), transparan & deterministik.
// =============================================================
import { ACTIVITIES, AGE_RANGES, DOMAIN_META } from '../../data/learningStrategies';
import type { Activity } from '../../data/learningStrategies';
import { TAG_NILAI_LS } from '../../data/tagNilaiLS.generated';

const STOPWORDS = new Set<string>([
  'dan', 'yang', 'untuk', 'saya', 'anak', 'sudah', 'mulai', 'bisa', 'akan', 'dengan',
  'pada', 'itu', 'ini', 'nya', 'aku', 'kami', 'atau', 'juga', 'sedang', 'masih',
  'sangat', 'lebih', 'saat', 'ketika', 'agar', 'supaya', 'tapi', 'tetapi', 'karena',
  'buat', 'sama', 'ada', 'dia', 'suka', 'sering', 'kadang', 'belum', 'tidak',
]);

function tokenize(teks: string): string[] {
  const kata = teks
    .toLowerCase()
    .replace(/[^a-zà-ÿ\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
  return Array.from(new Set(kata));
}

function sesuaiUsia(a: Activity, usiaBulan: number): boolean {
  const r = AGE_RANGES.find(x => x.id === a.ageId);
  if (!r) return true;
  return usiaBulan >= r.min && usiaBulan < r.max;
}

function terpublikasi(a: Activity): boolean {
  return a.status === undefined || a.status === 'published';
}

function teksCari(a: Activity): string {
  const nilai = TAG_NILAI_LS[`aktivitas:${a.id}`]?.nilai ?? [];
  const domainLabel = a.domain.map(d => DOMAIN_META[d]?.label ?? d);
  return [a.judul, a.tujuan, a.deskripsi, ...domainLabel, ...nilai].join(' ').toLowerCase();
}

export function cariKegiatanDariText(teks: string, usiaBulan: number, maks = 4): Activity[] {
  const tokens = tokenize(teks);
  if (tokens.length === 0) return [];
  return ACTIVITIES.filter(a => terpublikasi(a) && sesuaiUsia(a, usiaBulan))
    .map(a => {
      const hay = teksCari(a);
      const skor = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
      return { a, skor };
    })
    .filter(x => x.skor > 0)
    .sort((x, y) => y.skor - x.skor)
    .slice(0, maks)
    .map(x => x.a);
}

/** Set id ItemBekal (ls-act-N) dari kegiatan yang cocok dengan teks — untuk Fokus. */
export function idKegiatanDariText(teks: string, usiaBulan: number): Set<string> {
  const tokens = tokenize(teks);
  const out = new Set<string>();
  if (tokens.length === 0) return out;
  for (const a of ACTIVITIES) {
    if (!terpublikasi(a) || !sesuaiUsia(a, usiaBulan)) continue;
    const hay = teksCari(a);
    if (tokens.some(t => hay.includes(t))) out.add(`ls-act-${a.id}`);
  }
  return out;
}
