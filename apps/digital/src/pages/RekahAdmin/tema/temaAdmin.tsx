// Tema visual Rekah Admin — satu warna + satu komposisi ilustrasi per bagian.
// Palet diambil dari Langit Peony v1.0 (tailwind.config: rekah, rose-soft, langit, ungu,
// kuning, daun, madu, pekat, fajar, kanvas) + cornflower dari registryBunga.
// Ilustrasi memakai ornamen botani Temani (Ornament/Bloom) & bunga 12 nilai (BungaMekar);
// registryBunga.ts hanya DIBACA, tidak diubah.
import React from 'react';
import { Ornament, Bloom } from '../../../features/temani/ornamen';
import BungaMekar from '../../../features/irama-hari/BungaMekar';
import { BUNGA_DARI_NAMA } from '../../../features/akar-keluarga/registryBunga';
import type { NilaiAkar } from '../../../features/akar-keluarga/content';
import { TAHAP_MAKS } from '../../../lib/mekar';

export type KunciTema = 'beranda' | 'ajak' | 'wawasan' | 'sikap' | 'temani' | 'bantu' | 'tracker' | 'antrean' | 'semua';
type JenisOrnamen = 'sprig' | 'tulip' | 'leaf' | 'daisy' | 'foliage' | 'bell';

export interface Tema {
  /** Warna isian (chip, tombol, titik). */
  aksen: string;
  /** Versi gelap aksen untuk teks & ikon di atas latar terang (kontras ≥ 4.5:1). */
  teks: string;
  /** Latar lembut hero & header tabel. */
  tint: string;
  tint2: string;
  ornamen: Array<{ jenis: JenisOrnamen; bloom: string; bloom2: string; center?: string }>;
  bloom: { petals: string[]; center: string[] };
  /** Bunga nilai yang mewakili bagian ini (dari registryBunga). */
  nilai: NilaiAkar;
}

export const TEMA: Record<KunciTema, Tema> = {
  beranda: {
    aksen: '#F06BA8', teks: '#B8337C', tint: '#FFE3EF', tint2: '#FFF3E6', nilai: 'Kasih Sayang',
    ornamen: [{ jenis: 'tulip', bloom: '#F06BA8', bloom2: '#F8B9D4' }, { jenis: 'daisy', bloom: '#FFE29A', bloom2: '#F6B860', center: '#F06BA8' }, { jenis: 'bell', bloom: '#C9B8F0', bloom2: '#FFF3E6' }],
    bloom: { petals: ['#F06BA8', '#F8B9D4', '#E05898'], center: ['#FFE29A', '#F6B860'] },
  },
  ajak: {
    aksen: '#F6B860', teks: '#8A5A10', tint: '#FFF1C9', tint2: '#FFF7E6', nilai: 'Kemandirian',
    ornamen: [{ jenis: 'daisy', bloom: '#FFE29A', bloom2: '#FFF3E6', center: '#F6B860' }, { jenis: 'sprig', bloom: '#F06BA8', bloom2: '#FFE29A' }, { jenis: 'tulip', bloom: '#F6B860', bloom2: '#FFE29A' }],
    bloom: { petals: ['#FFE29A', '#F6B860', '#FFD36B'], center: ['#F06BA8', '#E05898'] },
  },
  wawasan: {
    aksen: '#8FB8F7', teks: '#355EB8', tint: '#E3EEFF', tint2: '#F4F8FF', nilai: 'Cinta Ilmu',
    ornamen: [{ jenis: 'bell', bloom: '#8FB8F7', bloom2: '#FFF3E6' }, { jenis: 'leaf', bloom: '#8FB8F7', bloom2: '#8FB8F7' }, { jenis: 'daisy', bloom: '#5F84E6', bloom2: '#FFE29A', center: '#FFE29A' }],
    bloom: { petals: ['#8FB8F7', '#5F84E6', '#B9D3FB'], center: ['#FFE29A', '#F6B860'] },
  },
  sikap: {
    aksen: '#4E9C6E', teks: '#2E7049', tint: '#E1F2E6', tint2: '#F6FBF1', nilai: 'Tanggung Jawab',
    ornamen: [{ jenis: 'foliage', bloom: '#4E9C6E', bloom2: '#4E9C6E' }, { jenis: 'sprig', bloom: '#F8B9D4', bloom2: '#FFE29A' }, { jenis: 'tulip', bloom: '#F06BA8', bloom2: '#F8B9D4' }],
    bloom: { petals: ['#A7C63E', '#8FB84A', '#C8DB7A'], center: ['#F06BA8', '#E05898'] },
  },
  temani: {
    aksen: '#C9B8F0', teks: '#6246A8', tint: '#EEE6FB', tint2: '#FBF6FF', nilai: 'Empati',
    ornamen: [{ jenis: 'tulip', bloom: '#C9B8F0', bloom2: '#F8B9D4' }, { jenis: 'bell', bloom: '#F8B9D4', bloom2: '#FFF3E6' }, { jenis: 'sprig', bloom: '#8FB8F7', bloom2: '#FFE29A' }],
    bloom: { petals: ['#C9B8F0', '#A993E6', '#E0D5F8'], center: ['#FFE29A', '#F6B860'] },
  },
  bantu: {
    aksen: '#F8B9D4', teks: '#B8337C', tint: '#FFE6F0', tint2: '#FFF4EA', nilai: 'Sabar',
    ornamen: [{ jenis: 'sprig', bloom: '#F06BA8', bloom2: '#FFE29A' }, { jenis: 'daisy', bloom: '#F8B9D4', bloom2: '#FFF3E6', center: '#6E3B57' }, { jenis: 'leaf', bloom: '#F8B9D4', bloom2: '#F8B9D4' }],
    bloom: { petals: ['#F8B9D4', '#F06BA8', '#FCD6E6'], center: ['#6E3B57', '#8E5A78'] },
  },
  tracker: {
    aksen: '#F6B860', teks: '#8A5A10', tint: '#FFEBD1', tint2: '#FFF7EC', nilai: 'Kesederhanaan',
    ornamen: [{ jenis: 'leaf', bloom: '#F6B860', bloom2: '#F6B860' }, { jenis: 'foliage', bloom: '#4E9C6E', bloom2: '#4E9C6E' }, { jenis: 'daisy', bloom: '#F6B860', bloom2: '#FFF3E6', center: '#6E3B57' }],
    bloom: { petals: ['#F6B860', '#FFE29A', '#F0A23E'], center: ['#6E3B57', '#8E5A78'] },
  },
  antrean: {
    aksen: '#C9B8F0', teks: '#6E3B57', tint: '#F1E7F4', tint2: '#FFF0F7', nilai: 'Hormat pada Sesama',
    ornamen: [{ jenis: 'bell', bloom: '#C9B8F0', bloom2: '#FFF3E6' }, { jenis: 'tulip', bloom: '#F06BA8', bloom2: '#F8B9D4' }, { jenis: 'sprig', bloom: '#8FB8F7', bloom2: '#FFF3E6' }],
    bloom: { petals: ['#C9B8F0', '#F8B9D4', '#A993E6'], center: ['#6E3B57', '#8E5A78'] },
  },
  semua: {
    aksen: '#8FB8F7', teks: '#355EB8', tint: '#E8F0FF', tint2: '#FFF3E6', nilai: 'Kejujuran',
    ornamen: [{ jenis: 'foliage', bloom: '#4E9C6E', bloom2: '#4E9C6E' }, { jenis: 'daisy', bloom: '#8FB8F7', bloom2: '#FFE29A', center: '#FFE29A' }, { jenis: 'tulip', bloom: '#FFE29A', bloom2: '#F6B860' }],
    bloom: { petals: ['#5F84E6', '#8FB8F7', '#B9D3FB'], center: ['#FFE29A', '#F6B860'] },
  },
};

/** Tentukan tema dari path /rekah-admin/... */
export function temaDariPath(path: string): KunciTema {
  const seg = path.replace(/^\/rekah-admin\/?/, '').split('/')[0];
  const peta: Record<string, KunciTema> = {
    '': 'beranda', 'ajak-main': 'ajak', wawasan: 'wawasan', sikap: 'sikap', temani: 'temani', bantu: 'bantu',
    tracker: 'tracker', antrean: 'antrean', semua: 'semua', diff: 'antrean',
  };
  return peta[seg] ?? 'beranda';
}

/** CSS variable untuk dipasang di pembungkus halaman. */
export function varTema(k: KunciTema): React.CSSProperties {
  const t = TEMA[k];
  return { ['--ra-aksen' as string]: t.aksen, ['--ra-teks' as string]: t.teks, ['--ra-tint' as string]: t.tint, ['--ra-tint2' as string]: t.tint2 } as React.CSSProperties;
}

// ── Ilustrasi ────────────────────────────────────────────────────────────────

/** Bunga nilai (registryBunga) dalam keadaan mekar penuh. */
export function BungaNilai({ nilai, size = 40 }: { nilai: NilaiAkar; size?: number }) {
  const b = BUNGA_DARI_NAMA.get(nilai);
  if (!b) return null;
  return <BungaMekar bunga={b} mekar={TAHAP_MAKS} size={size} />;
}

/** Kelopak khas Rekah (border-radius 70% 70% 70% 4px) sebagai bentuk latar. */
function Kelopak({ warna, className, style }: { warna: string; className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden className={`absolute block ${className ?? ''}`} style={{ background: warna, borderRadius: '70% 70% 70% 4px', ...style }} />;
}

/** Taman kecil: tiga ornamen botani + satu bloom + kelopak latar. Dekoratif. */
export function TamanTema({ tema, kecil = false }: { tema: KunciTema; kecil?: boolean }) {
  const t = TEMA[tema];
  const s = kecil ? 0.62 : 1;
  const [a, b, c] = t.ornamen;
  return (
    <div aria-hidden className="relative" style={{ width: 250 * s, height: 150 * s }}>
      <Kelopak warna={t.aksen} style={{ width: 120 * s, height: 120 * s, right: 18 * s, top: 6 * s, opacity: 0.28, transform: 'rotate(-12deg)' }} />
      <Kelopak warna="#FFFFFF" style={{ width: 70 * s, height: 70 * s, left: 20 * s, top: 18 * s, opacity: 0.7, transform: 'rotate(24deg)' }} />
      <span className="absolute block rounded-[50%]" style={{ left: 10 * s, right: 4 * s, bottom: 0, height: 16 * s, background: '#A7C63E', opacity: 0.35 }} />
      <div className="absolute" style={{ left: 30 * s, bottom: 6 * s, width: 58 * s, height: 96 * s }}><Ornament type={a.jenis} bloom={a.bloom} bloom2={a.bloom2} center={a.center} /></div>
      <div className="absolute" style={{ left: 92 * s, bottom: 6 * s, width: 72 * s, height: 124 * s }}><Ornament type={b.jenis} bloom={b.bloom} bloom2={b.bloom2} center={b.center} /></div>
      <div className="absolute" style={{ left: 162 * s, bottom: 6 * s, width: 54 * s, height: 86 * s }}><Ornament type={c.jenis} bloom={c.bloom} bloom2={c.bloom2} center={c.center} /></div>
      <div className="absolute" style={{ right: 0, top: 0, width: 62 * s, height: 62 * s }}><Bloom petalColors={t.bloom.petals} centerColors={t.bloom.center} seed={tema.length * 7 + 3} /></div>
    </div>
  );
}

// ── Hero halaman ─────────────────────────────────────────────────────────────

export function HeroAdmin({
  tema, eyebrow, judul, deskripsi, aksi, children,
}: {
  tema: KunciTema; eyebrow?: string; judul: string; deskripsi?: React.ReactNode; aksi?: React.ReactNode; children?: React.ReactNode;
}) {
  const t = TEMA[tema];
  return (
    <section
      className="relative mb-6 overflow-hidden rounded-[28px] border px-6 py-6 sm:px-8"
      style={{ background: `linear-gradient(120deg, ${t.tint} 0%, ${t.tint2} 100%)`, borderColor: `${t.aksen}55` }}
    >
      <div className="relative z-[1] flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 max-w-[62ch]">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: t.teks }}>
            <BungaNilai nilai={t.nilai} size={14} /> {eyebrow ?? 'Rekah Admin'}
          </span>
          <h1 className="font-bricolage text-[26px] font-extrabold leading-tight text-pekat sm:text-[30px]" style={{ textWrap: 'balance' } as React.CSSProperties}>{judul}</h1>
          {deskripsi && <p className="mt-1.5 text-[14px] leading-relaxed text-pekat/70">{deskripsi}</p>}
          {children && <div className="mt-4">{children}</div>}
          {aksi && <div className="mt-4 flex flex-wrap gap-2">{aksi}</div>}
        </div>
        <div className="hidden shrink-0 sm:block"><TamanTema tema={tema} /></div>
      </div>
    </section>
  );
}

/** Kotak kosong berilustrasi (pengganti teks polos "belum ada data"). */
export function KosongBerilustrasi({ tema, judul, children }: { tema: KunciTema; judul: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[24px] border border-dashed bg-white px-8 py-10 text-center" style={{ borderColor: `${TEMA[tema].aksen}88` }}>
      <TamanTema tema={tema} kecil />
      <p className="mt-2 font-bricolage text-[16px] font-bold text-pekat">{judul}</p>
      {children}
    </div>
  );
}

/** Pembungkus halaman bersama (/admin & /rekah-admin) agar tampil dengan tema Rekah. */
export function HalamanTema({ tema, judul, deskripsi, children }: { tema: KunciTema; judul: string; deskripsi?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <HeroAdmin tema={tema} judul={judul} deskripsi={deskripsi} />
      {children}
    </div>
  );
}
