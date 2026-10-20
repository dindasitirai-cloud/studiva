// =============================================================
// rekapMinggu — rekap 7 hari terakhir untuk tab Perjalanan (Phase 22c).
// Membaca yang DITANDAI di papan Irama Keseharian (localStorage per tanggal) +
// centang Kebiasaan Baik (Supabase, lewat props), lalu menyusun:
//   • Kebiasaan Baik per nilai fokus → status kata (sudah rutin / mulai rutin / sesekali / belum)
//   • Ajak Main yang dilakukan → domain yang diasah (dari tag domain kegiatan)
//   • Wawasan Tumbuh yang dibaca → domain yang dipelajari (dari domain kartu)
// Hanya membaca. Langkah Temani tidak dihitung di sini (punya refleksi sendiri).
// Copy DRAFT → review Psikolog Fitri.
// =============================================================
import type { CentangKebiasaan, KnowledgeCard, DomainCode } from '@studiva/shared';
import type { Activity, DomainKey } from '../../data/learningStrategies';
import { DOMAIN_META } from '../../data/learningStrategies';
import type { NilaiAkar } from '../akar-keluarga/content';
import { bacaStoreHari } from './dayPlanData';
import type { Item } from './dayPlanData';
import { localISO, dariISO, seninISO } from './rencanaData';

export const LABEL_DOMAIN_KARTU: Record<DomainCode, string> = {
  FM: 'Fisik & Motorik', KG: 'Kognitif', BH: 'Bahasa & Komunikasi', SE: 'Sosial-Emosional',
  KS: 'Kesehatan & Gizi', PS: 'Pengasuhan & Stimulasi', DK: 'Deteksi Dini & Kebutuhan Khusus',
};

export type StatusKebiasaan = 'rutin' | 'mulai' | 'sesekali' | 'belum';
export const LABEL_STATUS: Record<StatusKebiasaan, string> = {
  rutin: 'Sudah rutin', mulai: 'Mulai rutin', sesekali: 'Sesekali', belum: 'Belum dicoba',
};

export interface RekapDomain { label: string; jumlah: number; judul: string[] }
export interface RekapMinggu {
  dari: string; sampai: string;
  /** 7 tanggal minggu ini, Senin → Minggu. */
  tanggal: string[];
  kebiasaan: { nilai: NilaiAkar; hari: number; status: StatusKebiasaan; perHari: boolean[] }[];
  main: { jumlah: number; domain: RekapDomain[] };
  wawasan: { jumlah: number; domain: RekapDomain[] };
}

const norm = (s: string) => s.trim().toLowerCase();

/** Senin–Minggu dari minggu yang memuat `hariIni` (hari setelah hari ini belum berisi data). */
function tanggalMinggu(hariIni: string): string[] {
  const senin = dariISO(seninISO(dariISO(hariIni)));
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(senin); x.setDate(senin.getDate() + i); return localISO(x); });
}

export function statusDariHari(hari: number): StatusKebiasaan {
  if (hari >= 5) return 'rutin';
  if (hari >= 3) return 'mulai';
  if (hari >= 1) return 'sesekali';
  return 'belum';
}

function susunDomain(peta: Map<string, RekapDomain>): RekapDomain[] {
  return [...peta.values()].sort((a, b) => b.jumlah - a.jumlah || a.label.localeCompare(b.label));
}

export function hitungRekapMinggu(k: {
  idAnak: string;
  hariIni: string;
  nilaiFokus: readonly NilaiAkar[];
  centang: CentangKebiasaan;
  kegiatan: readonly Activity[];
  kartu: readonly KnowledgeCard[];
}): RekapMinggu {
  const tanggal = tanggalMinggu(k.hariIni);

  // Kebiasaan Baik: berapa hari (dari 7) nilai itu punya centang.
  const kebiasaan = k.nilaiFokus.map(nilai => {
    const perHari = tanggal.map(t => ((k.centang[t] ?? {})[nilai] ?? []).length > 0);
    const hari = perHari.filter(Boolean).length;
    return { nilai, hari, status: statusDariHari(hari), perHari };
  });

  const kegById = new Map(k.kegiatan.map(a => [String(a.id), a]));
  const kegByJudul = new Map(k.kegiatan.map(a => [norm(a.judul), a]));
  const kartuById = new Map(k.kartu.map(c => [c.id, c]));
  const kartuByJudul = new Map(k.kartu.map(c => [norm(c.title), c]));

  // Item yang DITANDAI selesai per tanggal (satu judul dihitung sekali per hari).
  const mainDomain = new Map<string, RekapDomain>();
  const wawasanDomain = new Map<string, RekapDomain>();
  let jumlahMain = 0; let jumlahWawasan = 0;
  const tambah = (peta: Map<string, RekapDomain>, label: string, judul: string) => {
    const r = peta.get(label) ?? { label, jumlah: 0, judul: [] };
    r.jumlah += 1;
    if (!r.judul.includes(judul)) r.judul.push(judul);
    peta.set(label, r);
  };

  for (const tgl of tanggal) {
    const s = bacaStoreHari(k.idAnak, tgl);
    const done = new Set(s.doneExtra);
    const sudah = new Set<string>();
    for (const items of Object.values(s.extra)) {
      for (const it of items as Item[]) {
        if (!done.has(it.id) || it.id.startsWith('rk-tm-')) continue;
        const kunci = `${it.tipe}:${norm(it.t)}`;
        if (sudah.has(kunci)) continue;
        sudah.add(kunci);
        if (it.tipe === 'main') {
          jumlahMain += 1;
          const m = /^rk-(\d+)$/.exec(it.id);
          const a = (m ? kegById.get(m[1]) : undefined) ?? kegByJudul.get(norm(it.t));
          const doms: DomainKey[] = a?.domain ?? [];
          if (doms.length === 0) tambah(mainDomain, 'Lainnya', it.t);
          for (const d of doms) tambah(mainDomain, DOMAIN_META[d]?.label ?? d, it.t);
        } else if (it.tipe === 'buku') {
          jumlahWawasan += 1;
          const idKartu = it.id.startsWith('rk-wt-') ? it.id.slice('rk-wt-'.length) : '';
          const c = (idKartu ? kartuById.get(idKartu) : undefined) ?? kartuByJudul.get(norm(it.t));
          tambah(wawasanDomain, c ? (LABEL_DOMAIN_KARTU[c.domain] ?? c.domain) : 'Lainnya', it.t);
        }
      }
    }
  }

  return {
    dari: tanggal[0], sampai: tanggal[tanggal.length - 1],
    tanggal,
    kebiasaan,
    main: { jumlah: jumlahMain, domain: susunDomain(mainDomain) },
    wawasan: { jumlah: jumlahWawasan, domain: susunDomain(wawasanDomain) },
  };
}
