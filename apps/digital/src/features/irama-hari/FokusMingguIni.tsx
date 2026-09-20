// =============================================================
// FokusMingguIni — "poin 1" Irama Hari dalam Family Journey Map.
// Fokus minggu ini = turunan dari Kompas Keluarga (arah keluarga + konteks usia +
// kompas perkembangan). Menyajikan DUA hal, bukan dibagi per nilai:
//   • Untuk anak     → kegiatan Ajak Main paling relevan (dapat dimasukkan ke hari)
//   • Untuk caregiver → pengetahuan (Wawasan Tumbuh) yang relevan untuk usia ini
// Additive; memakai kolam, tambah, dan CARDS yang sudah ada.
// STATUS: DRAFT copy — menunggu review Psikolog Fitri Effendy.
// =============================================================
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Compass, BookOpen } from 'lucide-react';
import { usePilihanHarian } from './PilihanHarianContext';
import DetailKegiatan from './DetailKegiatan';
import { useObservasiKompas } from '../../hooks/useObservasiKompas';
import { useObservasiTeks } from '../../hooks/useObservasiTeks';
import { idKegiatanDariText } from '../beranda-usia/cariKegiatan';
import { promptById } from '../rekah-journey/observation/observationPrompts';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { ItemBekal } from '../beranda-usia/bekal';
import { CARDS } from '../../pages/DashboardPages/Tier2/knowledgeCardData';
import type { KnowledgeCard } from '../../pages/DashboardPages/Tier2/knowledgeCardData';
import { DOMAIN_CODE_LABEL } from '../../pages/DashboardPages/Tier2/bekalDomainTokens';
import { AGE_RANGES } from '../../data/learningStrategies';

const MAKS_KEGIATAN = 4;
const MAKS_PENGETAHUAN = 3;

// Usia (bulan) → age keys Wawasan Tumbuh (selaras WawasanTumbuh & KnowledgeGallery).
// Rentang bulan per sub-tahap (untuk menyaring kegiatan ke band usia anak SEKARANG).
const RENTANG_TAHAP = new Map(AGE_RANGES.map(r => [r.id, r] as const));

const AGE_BAND_KEYS: ReadonlyArray<{ maxMonths: number; keys: string[] }> = [
  { maxMonths: 12, keys: ['0-3m', '3-6m', '6-9m', '9-12m'] },
  { maxMonths: 24, keys: ['12-18m', '18-24m'] },
  { maxMonths: 36, keys: ['2-3y'] },
  { maxMonths: 48, keys: ['3-4y'] },
  { maxMonths: 60, keys: ['4-5y'] },
  { maxMonths: Infinity, keys: ['5-6y'] },
];
function allowedAgeKeys(usiaBulan: number): Set<string> {
  for (const band of AGE_BAND_KEYS) {
    if (usiaBulan <= band.maxMonths) return new Set(band.keys);
  }
  return new Set(['5-6y']);
}

// Jembatan dua sistem domain: domain perkembangan (observasi/Kompas Perkembangan)
// → kode domain kegiatan (DomainKey Learning Strategies). Best-effort, terdokumentasi.
const DOMAIN_PERKEMBANGAN_KE_KEGIATAN: Record<string, string[]> = {
  'Gross Motor': ['mk'],
  'Fine Motor': ['mh'],
  'Cognitive': ['kog'],
  'Language & Communication': ['bhs'],
  'Social-Emotional': ['sos'],
  'Self-Regulation & Executive Function': ['fe'],
  'Adaptive / Self-Help': ['mh', 'sos'],
};

interface Props {
  idAnak: string;
  /** Nilai keluarga yang sudah ditanam (arah keluarga). */
  nilaiKeluarga: readonly NilaiAkar[];
  namaAnak: string;
  usiaBulan: number;
  /** Sembunyikan blok 'Untuk Ibu/Ayah — pengetahuan' (dipakai di tab Kegiatan Kelola). */
  sembunyikanPengetahuan?: boolean;
}

export default function FokusMingguIni({ idAnak, nilaiKeluarga, namaAnak, usiaBulan, sembunyikanPengetahuan }: Props) {
  const { kolamAnak, pilihanEfektif, tambah, pilihWawasan, wawasanIds } = usePilihanHarian();
  const [detailItem, setDetailItem] = useState<ItemBekal | null>(null);
  const observasi = useObservasiKompas(idAnak);

  const nama = namaAnak || 'si kecil';
  const nilaiSet = useMemo(() => new Set<string>(nilaiKeluarga), [nilaiKeluarga]);

  const idDalamHari = useMemo(
    () => new Set(pilihanEfektif.map(i => i.id)),
    [pilihanEfektif],
  );

  // Kegiatan yang cocok dengan catatan observasi teks caregiver (pekan ini).
  const obsTeks = useObservasiTeks(idAnak);
  const idCocokTeks = useMemo(() => {
    const now = Date.now();
    const teks = obsTeks.daftar
      .filter(n => now - new Date(n.pada).getTime() < 7 * 86400000)
      .map(n => n.teks)
      .join(' ');
    return idKegiatanDariText(teks, usiaBulan);
  }, [obsTeks.daftar, usiaBulan]);

  // Domain kegiatan (DomainKey) yang sedang diamati caregiver — dari Kompas Perkembangan.
  const domainDiamati = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    for (const id of observasi.dipilih) {
      const dev = promptById(id)?.domainOrArea;
      if (!dev) continue;
      for (const key of DOMAIN_PERKEMBANGAN_KE_KEGIATAN[dev] ?? []) set.add(key);
    }
    return set;
  }, [observasi.dipilih]);

  // Kegiatan Ajak Main paling relevan: sesuai usia (kolam), disetir oleh
  //   • pengamatan (domain yang sedang diamati) — bobot tinggi
  //   • arah keluarga (overlap nilai) — bobot dasar
  // Relevan diprioritaskan, lalu diisi kegiatan usia lain agar tidak kosong.
  const kegiatan = useMemo<ItemBekal[]>(() => {
    // Hanya kegiatan yang SESUAI usia anak pekan ini (band sub-tahap saat ini),
    // supaya tidak menyarankan kegiatan tahap jauh di depan (mis. merangkak utk bayi 0 bln).
    const aktivitas = kolamAnak.filter(i => {
      if (i.tipe !== 'aktivitas') return false;
      const st = i.subTahapId;
      if (!st) return true;
      const r = RENTANG_TAHAP.get(st);
      if (!r) return true;
      return usiaBulan >= r.min && usiaBulan < r.max;
    });
    const skor = (i: ItemBekal) => {
      const sNilai = i.nilai.filter(n => nilaiSet.has(n)).length;
      const domainsItem = i.domainSemua ?? [String(i.domain)];
      const sObs = domainsItem.some(d => domainDiamati.has(String(d))) ? 3 : 0;
      const sTeks = idCocokTeks.has(i.id) ? 4 : 0;
      return sNilai + sObs + sTeks;
    };
    const relevan = [...aktivitas]
      .map(i => ({ i, s: skor(i) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(x => x.i);
    const sisa = aktivitas.filter(a => !relevan.includes(a));
    return [...relevan, ...sisa].slice(0, MAKS_KEGIATAN);
  }, [kolamAnak, nilaiSet, domainDiamati, idCocokTeks, usiaBulan]);

  // Pengetahuan untuk caregiver: Wawasan Tumbuh sesuai usia.
  const pengetahuan = useMemo<KnowledgeCard[]>(() => {
    const allowed = allowedAgeKeys(usiaBulan);
    return CARDS.filter(c => allowed.has(c.ageKey) && c.summary).slice(0, MAKS_PENGETAHUAN);
  }, [usiaBulan]);

  // Area yang sedang diamati caregiver (konteks, dari Kompas Perkembangan).
  const areaDiamati = useMemo(
    () => observasi.dipilih.map(id => promptById(id)?.label).filter((x): x is string => !!x),
    [observasi.dipilih],
  );

  // Peta domain kegiatan → label pengamatan caregiver (untuk penjelasan relevansi).
  const domainDiamatiLabel = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const id of observasi.dipilih) {
      const pr = promptById(id);
      if (!pr) continue;
      for (const key of DOMAIN_PERKEMBANGAN_KE_KEGIATAN[pr.domainOrArea] ?? []) {
        const arr = m.get(key) ?? [];
        arr.push(pr.label);
        m.set(key, arr);
      }
    }
    return m;
  }, [observasi.dipilih]);

  // Penjelasan: kenapa kegiatan ini cocok dengan Kompas Keluarga.
  const alasanKegiatan = (item: ItemBekal): string[] => {
    const parts: string[] = [];
    if (idCocokTeks.has(item.id)) parts.push('sesuai yang kamu tulis di Kompas');
    const nilaiCocok = item.nilai.filter(n => nilaiSet.has(n));
    if (nilaiCocok.length > 0) parts.push(`menumbuhkan ${nilaiCocok.slice(0, 2).join(' & ')}`);
    const domainsItem = item.domainSemua ?? [String(item.domain)];
    const labels = new Set<string>();
    for (const d of domainsItem) for (const l of domainDiamatiLabel.get(String(d)) ?? []) labels.add(l);
    if (labels.size > 0) parts.push(`sejalan dengan pengamatanmu (${[...labels].slice(0, 2).join(', ')})`);
    parts.push(`sesuai usia ${nama}`);
    return parts;
  };

  const adaNilai = nilaiKeluarga.length > 0;

  return (
    <section
      aria-label="Fokus minggu ini"
      className="rounded-[22px] border border-rekah/15 bg-gradient-to-br from-fajar via-white to-white p-5 sm:p-6 shadow-[0_16px_40px_-30px_rgba(90,50,70,.5)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[13px] bg-rekah text-white">
            <Compass aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <p className="font-nunito text-[11px] font-extrabold uppercase tracking-wider text-pekat/40">
              Fokus minggu ini
            </p>
            <p className="mt-0.5 font-fredoka text-[19px] font-semibold leading-tight text-pekat">
              Paling relevan untuk {nama} pekan ini
            </p>
          </div>
        </div>
        <Link
          to="/dashboard/tier2/kompas-keluarga"
          className="flex-shrink-0 font-nunito text-[12.5px] font-extrabold text-rekah no-underline hover:underline"
        >
          Atur di Kompas
        </Link>
      </div>

      {/* Konteks turunan */}
      <p className="mt-3 font-nunito text-[12.5px] text-pekat/55">
        Berdasarkan arah keluarga{adaNilai ? '' : ' (belum ada nilai ditanam)'}, usia {nama}
        {areaDiamati.length > 0 ? <>, dan pengamatanmu: <b className="text-pekat/70">{areaDiamati.join(', ')}</b>.</> : '.'}
      </p>

      {/* ── Untuk anak: kegiatan ── */}
      <div className="mt-4">
        <p className="font-nunito text-[12px] font-extrabold uppercase tracking-wider text-rekah-tua">
          Untuk {nama} &mdash; kegiatan
        </p>
        {kegiatan.length === 0 ? (
          <p className="mt-2 rounded-[15px] border border-rekah/10 bg-white/70 px-4 py-3 font-nunito text-[13.5px] text-pekat/60">
            Belum ada kegiatan yang cocok dengan arah keluarga di usia ini. Jelajahi{' '}
            <Link to="/dashboard/tier2/bekal?tab=ajak-main" className="font-extrabold text-rekah no-underline hover:underline">Bekal</Link>.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2.5">
            {kegiatan.map(item => {
              const sudah = idDalamHari.has(item.id);
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-[15px] border border-rekah/10 bg-white px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setDetailItem(item)}
                      className="group text-left focus-visible:outline-none"
                      aria-label={`Lihat detail: ${item.judul}`}
                    >
                      <span className="block font-nunito text-[14.5px] font-bold text-pekat group-hover:text-rekah">
                        {item.judul}
                      </span>
                      <span className="block font-nunito text-[11px] font-semibold text-rekah/70 group-hover:underline">
                        Lihat detail
                      </span>
                    </button>
                    <p className="mt-1 font-nunito text-[11px] leading-snug text-pekat/50">
                      Cocok karena {alasanKegiatan(item).join(' · ')}.
                    </p>
                  </div>
                  {sudah ? (
                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-daun/12 px-3 py-1.5 font-nunito text-[12.5px] font-extrabold text-daun">
                      <Check aria-hidden className="h-3.5 w-3.5" /> Di hari ini
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => tambah(item)}
                      className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-rekah px-3.5 py-1.5 font-nunito text-[12.5px] font-extrabold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none"
                    >
                      <Plus aria-hidden className="h-3.5 w-3.5" /> Masukkan ke hari
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Untuk caregiver: pengetahuan ── */}
      {!sembunyikanPengetahuan && pengetahuan.length > 0 && (
        <div className="mt-5">
          <p className="font-nunito text-[12px] font-extrabold uppercase tracking-wider text-[#C79020]">
            Untuk Ibu / Ayah &mdash; pengetahuan
          </p>
          <p className="mt-0.5 font-nunito text-[11px] text-pekat/45">
            Bacaan yang sesuai tahap usia {nama} &mdash; membantumu memahami apa yang sedang berkembang.
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {pengetahuan.map(kartu => {
              const sudah = wawasanIds.includes(kartu.id);
              return (
                <li
                  key={kartu.id}
                  className="flex items-center gap-2 rounded-[15px] border border-[#E0A21F]/20 bg-madu/30 px-3 py-2.5"
                >
                  <Link
                    to={`/dashboard/tier2/knowledge/${kartu.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3 no-underline"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#E0A21F] text-white">
                      <BookOpen aria-hidden className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-nunito text-[14px] font-bold leading-tight text-pekat">{kartu.title}</span>
                      <span className="block font-nunito text-[11.5px] font-semibold uppercase tracking-wide text-pekat/45">
                        {DOMAIN_CODE_LABEL[kartu.domain] ?? kartu.domain}
                      </span>
                    </span>
                  </Link>
                  {sudah ? (
                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-daun/12 px-3 py-1.5 font-nunito text-[12px] font-extrabold text-daun">
                      <Check aria-hidden className="h-3.5 w-3.5" /> Di hari ini
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => pilihWawasan(kartu.id)}
                      className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[#E0A21F] px-3 py-1.5 font-nunito text-[12px] font-extrabold text-white transition hover:bg-[#C79020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A21F] motion-reduce:transition-none"
                    >
                      <Plus aria-hidden className="h-3.5 w-3.5" /> Masukkan ke hari
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <DetailKegiatan item={detailItem} onClose={() => setDetailItem(null)} />
    </section>
  );
}
