// =============================================================
// PerjalananKeluarga — tab "Perjalanan" di Kelola.
// Phase 23 (design handoff "Kelola › Tab Perjalanan"): tiga kartu, satu aksi utama per kartu.
//   1. Taman minggu ini   — Arah keluarga (BungaNilai per nilai fokus + titik hari ditandai)
//                           + rekap Ajak Main / Wawasan Tumbuh per domain (minggu ini, Senin–Minggu).
//   2. Yang mulai tumbuh  — sorotan mingguan (Ajak Main, Wawasan Tumbuh) + "Yang kamu amati"
//                           dari Jurnal (3 minggu, penyetir saran Rekah). Bisa dibuka/tutup.
//   3. Tinjau minggu ini  — strip 7 hari → 3 langkah → "Yang Rekah sesuaikan" (TinjauMingguKartu).
// Sumber data tetap sama: centang Kebiasaan Baik (props), papan Irama Keseharian (rekapMinggu),
// "terlihat" Jurnal (terlihatData), tinjauan (tinjauData), keadaan keluarga (kehidupanData).
// Batas: KK = keadaan; Perjalanan = arah & hasil (hanya membaca, kecuali tinjauan).
// INVARIANT: tanpa skor/streak; bunga tak pernah layu (mekar / istirahat). Copy DRAFT → Fitri.
// =============================================================
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CentangKebiasaan } from '@studiva/shared';
import type { NilaiAkar } from '../akar-keluarga/content';
import { BUNGA_DARI_NAMA } from '../akar-keluarga/registryBunga';
import { waktuRelatif } from '../akar-keluarga/bandUsia';
import BungaNilai from '../../components/BungaNilai';
import { useAnakAktif } from '../../context/AnakContext';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { promptById } from '../rekah-journey/observation/observationPrompts';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import { useKnowledgeLibrary } from '../../context/KnowledgeLibraryContext';
import { idNilai } from './dayPlanData';
import { localISO } from './rencanaData';
import { useTinjauMinggu } from './tinjauData';
import { hitungRekapMinggu } from './rekapMinggu';
import type { RekapDomain } from './rekapMinggu';
import { useTerlihat, terlihatDalam, JENDELA_PENYETIR_HARI, adalahTulis, labelTerlihat } from './terlihatData';
import TinjauMingguKartu from './TinjauMingguKartu';

const RUTE_BEKAL = '/dashboard/tier2/bekal';
const BULAN = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

const CSS = `
@keyframes jbp-pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.jbp-pop{animation:jbp-pop .28s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion: reduce){.jbp-pop{animation:none}}
`;

// Domain amatan (Jurnal) → nama Indonesia + warna chip.
export const DOMAIN_OBS: Record<string, { label: string; soft: string; ink: string }> = {
  'Gross Motor': { label: 'Motorik Kasar', soft: '#EAF6E4', ink: '#4E7533' },
  'Fine Motor': { label: 'Motorik Halus', soft: '#FFEFE2', ink: '#B5602A' },
  'Cognitive': { label: 'Kognitif', soft: '#E8F1FC', ink: '#3F6FB5' },
  'Language & Communication': { label: 'Bahasa', soft: '#FFF3D6', ink: '#A66E12' },
  'Social-Emotional': { label: 'Sosial-Emosional', soft: '#FDE9F2', ink: '#C2447F' },
  'Self-Regulation & Executive Function': { label: 'Regulasi Diri', soft: '#F1ECFC', ink: '#7B5BB8' },
  'Adaptive / Self-Help': { label: 'Bantu Diri', soft: '#E4F4F1', ink: '#2F8C7E' },
};
export const DOMAIN_TULIS = { label: 'Catatan sendiri', soft: '#F3EEF1', ink: '#8A7385' };

const relTgl = (tgl: string) => waktuRelatif(`${tgl}T00:00:00`);
const gabung = (xs: string[]) => xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} dan ${xs[xs.length - 1]}`;

// Warna turunan bunga nilai: tile lembut (campur putih) & titik (sedikit digelapkan ke plum).
function campur(hex: string, ke: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex); const b = p(ke);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const warnaNilai = (n: NilaiAkar) => {
  const w = BUNGA_DARI_NAMA.get(n)?.warnaPetal ?? '#F8B9D4';
  return { soft: campur(w, '#FFFFFF', 0.72), dot: campur(w, '#6E3B57', 0.22) };
};

const TILE = {
  main: { nama: 'Ajak Main', unit: 'kegiatan', soft: '#FDE9F2', ink: '#D2559A', seg: ['#D2559A', '#F38DBB', '#F8B9D4', '#FBD3E4'] },
  wawasan: { nama: 'Wawasan Tumbuh', unit: 'bacaan', soft: '#F0EAFB', ink: '#7B5BB8', seg: ['#7B5BB8', '#A88BDE', '#CDBDF0', '#E3D9F7'] },
};

// ─── 1. Taman minggu ini ─────────────────────────────────────────────────────

function TileAktivitas({ jenis, jumlah, domain }: { jenis: keyof typeof TILE; jumlah: number; domain: RekapDomain[] }) {
  const t = TILE[jenis];
  return (
    <div className="rounded-[20px] px-[18px] py-4" style={{ background: t.soft }}>
      <div className="flex items-center gap-3.5">
        <div className="min-w-[34px] text-center font-fredoka text-[34px] font-bold leading-none" style={{ color: t.ink }}>{jumlah}</div>
        <div className="min-w-0 flex-1">
          <div className="font-nunito text-[15px] font-extrabold text-pekat">{t.nama}</div>
          <div className="font-nunito text-[13px] font-semibold text-[#8A5A74]">
            {jumlah > 0 ? `${t.unit} · ${domain.length} domain` : `belum ada ${t.unit} yang ditandai`}
          </div>
        </div>
      </div>
      {domain.length > 0 && (
        <>
          <div className="mt-3 flex h-2 gap-[3px] overflow-hidden rounded-full" aria-hidden>
            {domain.map((d, i) => <span key={d.label} style={{ flex: d.jumlah, background: t.seg[Math.min(i, t.seg.length - 1)] }} />)}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {domain.map((d, i) => (
              <span key={d.label} title={d.judul.join(', ')} className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-[5px] font-nunito text-[12.5px] font-extrabold text-pekat">
                <span className="h-2 w-2 rounded-full" style={{ background: t.seg[Math.min(i, t.seg.length - 1)] }} />{d.label}
                <span style={{ color: t.ink }}>{d.jumlah}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PerjalananKeluarga({ nilaiFokus = [], centangKebiasaan = {}, onKeIrama, onKeKeluarga, onCeritakanBerat, onKeJurnal }: {
  nilaiFokus?: readonly NilaiAkar[];
  centangKebiasaan?: CentangKebiasaan;
  onKeIrama?: () => void;
  onKeKeluarga?: () => void;
  /** "Cukup berat" → buka form Kehidupan Keluarga terisi awal (bukan mesin peringan kedua). */
  onCeritakanBerat?: () => void;
  /** Buka tab Jurnal (hari ini). */
  onKeJurnal?: () => void;
}) {
  const navigate = useNavigate();
  const { anak } = useAnakAktif();
  const idAnak = anak.id;
  const { profile, sapaan } = useChildProfile();
  const nama = profile.namaAnak || sapaan.cap || 'si kecil';
  const hariIniISO = localISO(new Date());
  const tinjau = useTinjauMinggu(idAnak, hariIniISO);

  // Rekap 7 hari (Kebiasaan Baik per nilai + Ajak Main / Wawasan per domain)
  const { publishedActivities } = useLearningStrategies();
  const { publishedCards } = useKnowledgeLibrary();
  const rekap = useMemo(() => hitungRekapMinggu({
    idAnak, hariIni: hariIniISO, nilaiFokus, centang: centangKebiasaan, kegiatan: publishedActivities, kartu: publishedCards,
  }), [idAnak, hariIniISO, nilaiFokus, centangKebiasaan, publishedActivities, publishedCards]);
  const rentang = (() => {
    const [, m1, d1] = rekap.dari.split('-').map(Number); const [, m2, d2] = rekap.sampai.split('-').map(Number);
    return m1 === m2 ? `${d1} – ${d2} ${BULAN[m2 - 1]}` : `${d1} ${BULAN[m1 - 1]} – ${d2} ${BULAN[m2 - 1]}`;
  })();

  // Yang kamu amati (Jurnal, 21 hari) — terbaru dulu
  const terlihat = useTerlihat(idAnak);
  const amatan = useMemo(() => Object.entries(terlihatDalam(terlihat.peta, hariIniISO, JENDELA_PENYETIR_HARI))
    .map(([id, tgl]) => {
      const label = labelTerlihat(id);
      const d = adalahTulis(id) ? DOMAIN_TULIS : (DOMAIN_OBS[promptById(id)?.domainOrArea ?? ''] ?? DOMAIN_TULIS);
      return label ? { id, label, dom: d, how: adalahTulis(id) ? 'ditulis' : 'dipilih', tgl: tgl[0] } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.tgl.localeCompare(a.tgl)), [terlihat.peta, hariIniISO]);

  // Sorotan mingguan (dibuat sistem dari rekap; tanpa angka)
  const domMain = rekap.main.domain.filter(d => d.label !== 'Lainnya').slice(0, 2).map(d => d.label);
  const domWawasan = rekap.wawasan.domain.filter(d => d.label !== 'Lainnya').slice(0, 2).map(d => d.label);
  const sorotan: { teks: string; src: string; soft: string; ink: string }[] = [];
  if (domMain.length) sorotan.push({ teks: `Minggu ini ${nama} banyak bermain yang mengasah ${gabung(domMain)}.`, src: 'Ajak Main', soft: TILE.main.soft, ink: TILE.main.ink });
  if (domWawasan.length) sorotan.push({ teks: `Kamu sedang mendalami ${gabung(domWawasan)} lewat bacaan Wawasan Tumbuh.`, src: 'Wawasan Tumbuh', soft: TILE.wawasan.soft, ink: TILE.wawasan.ink });
  const domSorotan = [...new Set([...domMain.slice(0, 1), ...domWawasan.slice(0, 1)])];
  const bagianRingkas = [...domSorotan, ...(amatan.length ? [`${amatan.length} hal baru terlihat`] : [])];
  const ringkasTumbuh = bagianRingkas.length ? gabung(bagianRingkas) : 'Belum ada yang dicatat minggu ini';
  const [bukaTumbuh, setBukaTumbuh] = useState(true); // terbuka: bersebelahan dengan Taman, ruangnya cukup
  const adaTumbuh = sorotan.length > 0 || amatan.length > 0;

  return (
    <div className="flex w-full flex-col gap-[18px] pb-6">
      <style>{CSS}</style>

      {/* ── 1 + 2 bersebelahan (layar lebar), tinggi sama ── */}
      <div className="grid items-stretch gap-[18px] xl:grid-cols-2">
      {/* ── 1. Taman minggu ini ── */}
      <section className="grid h-full content-start gap-[22px] rounded-[28px] border-[1.5px] border-[#F6E6EE] bg-white px-[26px] py-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))' }}>
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <div className="font-nunito text-[12px] font-extrabold tracking-[1.6px] text-[#B48DA3]">{rentang}</div>
              <h2 className="m-0 mt-0.5 font-fredoka text-[26px] font-bold text-pekat">Taman minggu ini</h2>
            </div>
            <button type="button" onClick={() => navigate(RUTE_BEKAL)} className="font-nunito text-[13.5px] font-extrabold text-rekah-tua hover:text-rekah">
              {nilaiFokus.length ? 'Ubah nilai →' : 'Pilih nilai →'}
            </button>
          </div>
          {nilaiFokus.length === 0 ? (
            <div className="mt-3.5 rounded-[20px] border-[1.5px] border-dashed border-[#F2DDE7] px-4 py-5 text-center">
              <p className="m-0 font-nunito text-[14px] font-bold leading-relaxed text-[#8A5A74]">
                Pilih nilai yang ingin kalian tumbuhkan bersama {nama}. Kebiasaan Baik dan saran Rekah akan mengikuti arah ini.
              </p>
              <button type="button" onClick={() => navigate(RUTE_BEKAL)} className="mt-3 min-h-[44px] rounded-full bg-rekah px-5 font-nunito text-[14px] font-extrabold text-white hover:bg-[#D2559A]">Pilih nilai keluarga</button>
            </div>
          ) : (
            <>
              <div className="mt-3.5 grid items-end gap-2" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
                {rekap.kebiasaan.map(k => {
                  const w = warnaNilai(k.nilai);
                  return (
                    <div key={k.nilai} className="flex flex-col items-center gap-2 rounded-[20px] px-1 py-3" style={{ background: w.soft }}>
                      <div className="flex w-[52px] items-end justify-center" aria-hidden>
                        <BungaNilai value={idNilai(k.nilai)} state={k.hari > 0 ? 'mekar' : 'istirahat'} size={52} />
                      </div>
                      <div className="text-center font-nunito text-[13.5px] font-extrabold leading-tight text-pekat">{k.nilai}</div>
                      <div className="flex gap-[3px]" title={`${k.hari} dari 7 hari`} aria-label={`${k.nilai}: ${k.hari} dari 7 hari`}>
                        {k.perHari.map((on, i) => {
                          const nanti = rekap.tanggal[i] > hariIniISO; // hari yang belum tiba
                          return <span key={i} className="h-[7px] w-[7px] rounded-full" style={{ background: on ? w.dot : '#fff', boxShadow: on ? 'none' : `inset 0 0 0 1px ${w.dot}55`, opacity: nanti ? 0.45 : 1 }} />;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2.5 font-nunito text-[12.5px] font-bold text-[#B48DA3]">Tiap titik = satu hari kamu menandainya</div>
            </>
          )}
        </div>

        <div className="flex flex-col justify-center gap-2.5">
          <TileAktivitas jenis="main" jumlah={rekap.main.jumlah} domain={rekap.main.domain} />
          <TileAktivitas jenis="wawasan" jumlah={rekap.wawasan.jumlah} domain={rekap.wawasan.domain} />
          {onKeIrama && (
            <button type="button" onClick={onKeIrama} className="mt-0.5 self-start font-nunito text-[13.5px] font-extrabold text-rekah-tua hover:text-rekah">Buka Irama Keseharian →</button>
          )}
        </div>
      </section>

      {/* ── 2. Yang mulai tumbuh ── */}
      <section className="relative flex h-full flex-col rounded-[28px] border-[1.5px] border-[#F6E6EE] bg-white px-[26px] py-[22px]">
        {adaTumbuh ? (
          <button type="button" onClick={() => setBukaTumbuh(v => !v)} aria-expanded={bukaTumbuh} aria-controls="perjalanan-tumbuh"
            className="flex w-full flex-wrap items-center gap-4 text-left">
            <span className="flex" aria-hidden>
              {sorotan.map(s => (
                <span key={s.src} className="-mr-2.5 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white" style={{ background: s.soft }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.ink }} />
                </span>
              ))}
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-[#E3F2E6]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E9A6A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4.5 4.5L19 7" /></svg>
              </span>
            </span>
            <span className="min-w-[200px] flex-1">
              <span className="block font-fredoka text-[20px] font-bold text-pekat">Yang mulai tumbuh</span>
              <span className="mt-0.5 block font-nunito text-[14px] font-bold text-[#8A5A74]">{ringkasTumbuh}</span>
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-[#FFF4F9] px-3.5 py-[9px] font-nunito text-[13.5px] font-extrabold text-rekah-tua">
              {bukaTumbuh ? 'Tutup' : 'Lihat'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D2559A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: bukaTumbuh ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><path d="m6 9 6 6 6-6" /></svg>
            </span>
          </button>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            <span className="min-w-[200px]">
              <span className="block font-fredoka text-[20px] font-bold text-pekat">Yang mulai tumbuh</span>
              <span className="mt-0.5 block font-nunito text-[14px] font-bold text-[#8A5A74]">Tandai yang terlihat dari {nama} di Jurnal. Hal-hal yang mulai tumbuh akan muncul di sini.</span>
            </span>
            {onKeJurnal && <div className="mt-auto"><TombolCatat onClick={onKeJurnal} /></div>}
          </div>
        )}

        {adaTumbuh && bukaTumbuh && (
          <div id="perjalanan-tumbuh" className="jbp-pop mt-[18px] flex flex-1 flex-col gap-2.5 border-t-[1.5px] border-dashed border-[#F2E4EB] pt-[18px]">
            {sorotan.map(s => (
              <div key={s.src} className="flex items-baseline gap-3">
                <span className="h-2 w-2 flex-none rounded-full" style={{ background: s.ink }} />
                <div className="flex-1 font-nunito text-[14.5px] font-bold leading-[1.4] text-pekat">{s.teks}</div>
                <span className="flex-none rounded-full px-2.5 py-[3px] font-nunito text-[12px] font-extrabold" style={{ background: s.soft, color: s.ink }}>{s.src}</span>
              </div>
            ))}

            <div className="mt-2 flex flex-col gap-2 rounded-[20px] bg-[#F1F8F2] px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4E9A6A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                <span className="font-nunito text-[12px] font-extrabold tracking-[1.4px] text-[#4E9A6A]">YANG KAMU AMATI</span>
                <span className="font-nunito text-[12.5px] font-bold text-[#8A9A8E]">dari Jurnal · 3 minggu terakhir</span>
              </div>
              {amatan.length === 0 ? (
                <p className="m-0 rounded-[14px] bg-white px-3 py-2.5 font-nunito text-[13.5px] font-bold text-[#8A9A8E]">Belum ada yang ditandai. Saat menulis Jurnal, tandai hal yang terlihat dari {nama} hari itu.</p>
              ) : amatan.map(s => (
                <div key={s.id} className="flex flex-wrap items-center gap-2.5 rounded-[14px] bg-white px-3 py-2.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4E9A6A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-none" aria-hidden><path d="m5 12 4.5 4.5L19 7" /></svg>
                  <div className="min-w-[160px] flex-1 font-nunito text-[14px] font-extrabold text-pekat">{s.label}</div>
                  <span className="flex items-center gap-[5px] rounded-full px-[9px] py-[3px] font-nunito text-[12px] font-extrabold" style={{ background: s.dom.soft, color: s.dom.ink }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dom.ink }} />{s.dom.label}
                  </span>
                  <span className="min-w-[96px] text-right font-nunito text-[12px] font-bold text-[#B48DA3]">{s.how} · {relTgl(s.tgl)}</span>
                </div>
              ))}
            </div>
            {onKeJurnal && <div className="mt-auto pt-1.5"><TombolCatat onClick={onKeJurnal} /></div>}
          </div>
        )}
      </section>

      </div>

      {/* ── 3. Tinjau minggu ini ── */}
      <TinjauMingguKartu idAnak={idAnak} nama={nama} hariIni={hariIniISO} tinjau={tinjau}
        onCeritakanBerat={onCeritakanBerat} onKeKeluarga={onKeKeluarga} onKeBekal={() => navigate(RUTE_BEKAL)} onKeIrama={onKeIrama} />

      <p className="m-0 text-center font-nunito text-[12.5px] font-semibold text-[#B48DA3]">Rekah mendampingi Buku KIA, bukan menggantikannya.</p>
    </div>
  );
}

function TombolCatat({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[44px] items-center gap-2 rounded-full bg-[#4E9A6A] px-4 py-2.5 font-nunito text-[14px] font-extrabold text-white hover:brightness-95">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
      Catat di Jurnal
    </button>
  );
}
