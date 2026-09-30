// Katalog Wawasan Tumbuh (Panduan Tumbuh Kembang) yang tayang — migrasi 027.
// Draf tetap lewat pipeline konten_draf (jenis 'panduan_tumbuh'); setelah disetujui peninjau,
// admin menerapkannya dengan RPC terapkan_panduan → tabel panduan_tumbuh (dibaca orang tua).
import { supabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { KnowledgeCard, AgeKey, DomainCode } from '@studiva/shared';

const sb = supabase as unknown as SupabaseClient;

type Isi = Record<string, unknown>;
const teks = (v: unknown) => (typeof v === 'string' ? v : '');
const daftarTeks = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()) : []);

/** Isi draf panduan_tumbuh (format form admin) → KnowledgeCard yang dipakai galeri orang tua. */
export function isiKeKartu(isi: Isi): KnowledgeCard {
  const slug = teks(isi.slug);
  const sci = (isi.scientific && typeof isi.scientific === 'object' ? isi.scientific : {}) as Isi;
  const sections = (Array.isArray(sci.sections) ? sci.sections : [])
    .map(s => ({ judul: teks((s as Isi)?.judul), isi: teks((s as Isi)?.isi) }))
    .filter(s => s.isi.trim());
  const referensi = Array.isArray(sci.references) ? (sci.references as KnowledgeCard['scientific']['references']) : undefined;
  return {
    id: slug,
    ageKey: teks(isi.age_key) as AgeKey,
    domain: teks(isi.domain) as DomainCode,
    title: teks(isi.title),
    photo: {
      src: teks(isi.photo_src) || `/images/rl/${slug}.jpg`,
      alt: teks(isi.photo_alt) || teks(isi.title),
      credit: teks(isi.photo_credit) || undefined,
    },
    readMinutes: Number(isi.read_minutes) || 2,
    isMedical: !!isi.is_medical,
    summary: {
      terjadi: teks(isi.terjadi),
      penting: teks(isi.penting),
      lakukan: daftarTeks(isi.lakukan),
      perhatian: teks(isi.perhatian),
    },
    scientific: {
      title: teks(sci.title),
      readMinutes: Number(sci.readMinutes) || undefined,
      stats: Array.isArray(sci.stats) ? (sci.stats as KnowledgeCard['scientific']['stats']) : undefined,
      sections: sections.length ? sections : undefined,
      figures: Array.isArray(sci.figures) && sci.figures.length ? (sci.figures as KnowledgeCard['scientific']['figures']) : undefined,
      takeaways: daftarTeks(sci.takeaways).length ? daftarTeks(sci.takeaways) : undefined,
      references: referensi && referensi.length ? referensi : undefined,
    },
    sources: daftarTeks(isi.sources),
  };
}

export interface PanduanTayang { slug: string; status: 'tayang' | 'diarsipkan'; versi: number; isi: Isi; kartu: KnowledgeCard }

/** Kartu tayang dari Supabase. null = tabel belum ada / belum login / gagal (pakai data lain). */
export async function muatKatalogPanduan(opsi: { sertakanArsip?: boolean } = {}): Promise<PanduanTayang[] | null> {
  try {
    let q = sb.from('panduan_tumbuh').select('slug,status,versi,isi');
    if (!opsi.sertakanArsip) q = q.eq('status', 'tayang');
    const { data, error } = await q.order('diterbitkan_pada', { ascending: false });
    if (error) { console.warn('[wawasan] katalog belum tersedia:', error.message); return null; }
    return (data ?? []).map((r: any) => ({ slug: r.slug, status: r.status, versi: r.versi, isi: r.isi ?? {}, kartu: isiKeKartu(r.isi ?? {}) }));
  } catch (e) {
    console.warn('[wawasan] gagal memuat katalog:', e);
    return null;
  }
}

export async function terapkanPanduan(idDraf: string): Promise<void> {
  const { error } = await sb.rpc('terapkan_panduan', { p_id_draf: idDraf });
  if (error) {
    if (/terapkan_panduan|schema cache|does not exist/i.test(error.message)) {
      throw new Error('Tabel Wawasan Tumbuh belum ada di Supabase. Jalankan migrasi 027_panduan_tumbuh.sql dulu, lalu klik Terapkan lagi.');
    }
    throw new Error(error.message);
  }
}

export async function aturStatusPanduan(slug: string, status: 'tayang' | 'diarsipkan'): Promise<void> {
  const { error } = await sb.rpc('atur_status_panduan', { p_slug: slug, p_status: status });
  if (error) throw new Error(error.message);
}
