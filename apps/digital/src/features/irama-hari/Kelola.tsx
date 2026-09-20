// =============================================================
// Kelola — Family Operating System (route tersendiri).
// Tab: Overall · Momen Sehari-hari · Kegiatan · Kebiasaan Baik · Rencana.
// Momen / kegiatan / rencana yang ditulis sendiri masuk sebagai item kustom.
// STATUS: DRAFT copy — menunggu review Psikolog Fitri Effendy.
// =============================================================
import React, { useMemo, useState } from 'react';
import TemaniEntryCard from '../temani/TemaniEntryCard';
import { Link, useNavigate } from 'react-router-dom';
import { X, Check, Plus } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { DomainKey } from '../../data/learningStrategies';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import type { SapaanSet } from '../beranda-usia/useChildProfile';
import { useAnak } from '../../context/AnakContext';
import { renderRichText } from '../beranda-usia/renderRichText';
import { resolveTahapAktif } from '../beranda-usia/resolveTahap';
import type { ProfilAnak } from '../beranda-usia/resolveTahap';
import { rakitBekal } from '../beranda-usia/adapter/rakitBekal';
import { PilihanHarianProvider, usePilihanHarian } from './PilihanHarianContext';
import type { BlokWaktu } from './PilihanHarianContext';
import type { ItemBekal } from '../beranda-usia/bekal';
import type { CentangKebiasaan } from '@studiva/shared';
import PapanCatatan from './PapanCatatan';
import KegiatanSehariHari from './KegiatanSehariHari';
import { JADWAL_KIA_2024 } from './papanUtil';
import SusunanHari from './SusunanHari';
import IramaPeluncur from './IramaPeluncur';
import FokusMingguIni from './FokusMingguIni';
import { CARDS } from '../../pages/DashboardPages/Tier2/knowledgeCardData';
import {
  LAYAR_BELUM_LAHIR,
  LAYAR_DATA_BELUM_DIISI,
  LAYAR_MELEWATI_RENTANG,
  LAYAR_KONTEN_BELUM_SIAP,
} from './content';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';

interface PropsKelola {
  nilaiFokus?: readonly NilaiAkar[];
  centangKebiasaan: CentangKebiasaan;
  tanggalHariIni: string;
  onCentangToggle: (nilaiId: NilaiAkar, butirId: string) => void;
  onBekal: () => void;
  /** Saat true, Kelola dirender sebagai isi tab "Irama" di dalam KelolaHub:
   *  header & strip tab internal disembunyikan, hanya susunan hari + papan. */
  modeShell?: boolean;
}

type TabId = 'overall' | 'kegiatan' | 'kebiasaan' | 'rencana';
const TABS: { id: TabId; label: string }[] = [
  { id: 'overall', label: 'Overall' },
  { id: 'kegiatan', label: 'Kegiatan' },
  { id: 'kebiasaan', label: 'Kebiasaan Baik' },
  { id: 'rencana', label: 'Rencana' },
];

const NILAI_LIST: string[] = ['Kasih Sayang','Kemandirian','Komunikasi','Tanggung Jawab','Empati','Syukur','Keberanian','Kejujuran','Sabar','Berbagi','Kesederhanaan','Cinta Ilmu'];
const DOMAIN_LIST: { key: DomainKey; label: string }[] = [
  { key: 'mk', label: 'Motorik Kasar' }, { key: 'mh', label: 'Motorik Halus' },
  { key: 'bhs', label: 'Bahasa' }, { key: 'kog', label: 'Kognitif' },
  { key: 'sos', label: 'Sosial' }, { key: 'sen', label: 'Sensorik' },
];
const KAPAN_OPSI = ['Pagi', 'Siang', 'Sore', 'Malam / jelang tidur', 'Saat makan', 'Saat mandi', 'Saat bermain', 'Saat rewel', 'Kapan saja'];
function kapanKeBlok(k?: string): BlokWaktu | null {
  if (k === 'Pagi') return 'pagi';
  if (k === 'Siang') return 'siang';
  if (k === 'Sore') return 'sore';
  if (k === 'Malam / jelang tidur') return 'jelangTidur';
  return null;
}
function buatItemKustom(opts: { judul: string; kategori: 'momen' | 'kegiatan' | 'rencana'; deskripsi?: string; kapan?: string; nilai?: string; domain?: DomainKey }): ItemBekal {
  const id = `kustom-${opts.kategori}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id, judul: opts.judul, tipe: 'aktivitas', domain: opts.domain ?? 'sos',
    nilai: opts.nilai ? [opts.nilai as NilaiAkar] : [], pemilik: 'anak', sumberId: id,
    kustom: true, kategoriKustom: opts.kategori, keteranganKapan: opts.kapan, deskripsiKustom: opts.deskripsi,
  };
}
function ageKeys(usia: number): string[] {
  if (usia <= 12) return ['0-3m', '3-6m', '6-9m', '9-12m'];
  if (usia <= 24) return ['12-18m', '18-24m'];
  if (usia <= 36) return ['2-3y'];
  if (usia <= 48) return ['3-4y'];
  if (usia <= 60) return ['4-5y'];
  return ['5-6y'];
}

type Payload = { judul: string; deskripsi?: string; kapan?: string; nilai?: string; domain?: DomainKey };
function FormItem({ mode, nama, onSimpan, onBatal }: { mode: 'momen' | 'kegiatan' | 'rencana'; nama: string; onSimpan: (p: Payload) => void; onBatal: () => void }) {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kapan, setKapan] = useState('');
  const [sel, setSel] = useState<{ t: 'nilai' | 'domain'; v: string } | null>(null);
  const showKapan = mode === 'momen' || mode === 'rencana';
  const showDeskripsi = mode === 'kegiatan' || mode === 'rencana';
  const showNilaiDomain = mode === 'momen' || mode === 'kegiatan';
  const boleh = judul.trim().length > 0;
  const simpan = () => { if (!boleh) return; onSimpan({ judul: judul.trim(), deskripsi: deskripsi.trim() || undefined, kapan: kapan || undefined, nilai: sel?.t === 'nilai' ? sel.v : undefined, domain: sel?.t === 'domain' ? (sel.v as DomainKey) : undefined }); };
  const labelJudul = mode === 'momen' ? 'Momen apa?' : mode === 'rencana' ? 'Rencana apa?' : 'Judul kegiatan';
  const phJudul = mode === 'momen' ? `Momen untuk ${nama}…` : mode === 'rencana' ? 'Rencana untuk keluarga…' : `Judul kegiatan untuk ${nama}…`;
  return (
    <div className="rounded-[16px] border border-rekah/15 bg-white p-4">
      <label className="block font-nunito text-[11px] font-extrabold uppercase tracking-wide text-pekat/45">{labelJudul} <span className="text-rekah">*</span></label>
      <input value={judul} onChange={e => setJudul(e.target.value)} placeholder={phJudul} className="mt-1 w-full rounded-[12px] border border-bordergray px-3 py-2.5 font-nunito text-[14px] text-pekat focus:outline-none focus:ring-2 focus:ring-rekah" />
      {showKapan && (
        <div className="mt-3">
          <label className="block font-nunito text-[11px] font-extrabold uppercase tracking-wide text-pekat/45">Kapan?</label>
          <select value={kapan} onChange={e => setKapan(e.target.value)} className="mt-1 w-full rounded-[12px] border border-bordergray bg-white px-3 py-2.5 font-nunito text-[14px] text-pekat focus:outline-none focus:ring-2 focus:ring-rekah">
            <option value="">— pilih —</option>
            {KAPAN_OPSI.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      )}
      {showDeskripsi && (
        <div className="mt-3">
          <label className="block font-nunito text-[11px] font-extrabold uppercase tracking-wide text-pekat/45">{mode === 'rencana' ? 'Catatan' : 'Deskripsi'} <span className="font-normal normal-case text-pekat/35">(opsional)</span></label>
          <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={2} className="mt-1 w-full resize-none rounded-[12px] border border-bordergray px-3 py-2.5 font-nunito text-[13.5px] text-pekat focus:outline-none focus:ring-2 focus:ring-rekah" />
        </div>
      )}
      {showNilaiDomain && (
        <div className="mt-3">
          <label className="block font-nunito text-[11px] font-extrabold uppercase tracking-wide text-pekat/45">Menstimulasi nilai / domain <span className="font-normal normal-case text-pekat/35">(opsional)</span></label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {NILAI_LIST.map(n => { const aktif = sel?.t === 'nilai' && sel.v === n; return <button key={n} type="button" onClick={() => setSel(aktif ? null : { t: 'nilai', v: n })} className={['rounded-full px-2.5 py-1 font-nunito text-[11.5px] font-semibold', aktif ? 'bg-daun text-white' : 'bg-daun/10 text-daun'].join(' ')}>{n}</button>; })}
            {DOMAIN_LIST.map(d => { const aktif = sel?.t === 'domain' && sel.v === d.key; return <button key={d.key} type="button" onClick={() => setSel(aktif ? null : { t: 'domain', v: d.key })} className={['rounded-full px-2.5 py-1 font-nunito text-[11.5px] font-semibold', aktif ? 'bg-sky-500 text-white' : 'bg-langit/40 text-pekat/70'].join(' ')}>{d.label}</button>; })}
          </div>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button type="button" disabled={!boleh} onClick={simpan} className="flex-1 rounded-[12px] bg-rekah px-4 py-2.5 font-nunito text-[13.5px] font-extrabold text-white transition disabled:opacity-40">Masukkan ke hari</button>
        <button type="button" onClick={onBatal} className="rounded-[12px] border border-bordergray px-4 py-2.5 font-nunito text-[13.5px] font-extrabold text-pekat/55">Batal</button>
      </div>
    </div>
  );
}

function PilihDariBekal({ usiaBulan, onTutup }: { usiaBulan: number; onTutup: () => void }) {
  const { kolamAnak, pilihanEfektif, tambah, hapus, pilihWawasan, wawasanIds } = usePilihanHarian();
  const [seg, setSeg] = useState<'main' | 'wawasan'>('main');
  const aktivitas = useMemo(() => kolamAnak.filter(i => i.tipe === 'aktivitas'), [kolamAnak]);
  const wawasan = useMemo(() => { const allow = new Set(ageKeys(usiaBulan)); return CARDS.filter(c => allow.has(c.ageKey) && c.summary); }, [usiaBulan]);
  const dipilih = new Set(pilihanEfektif.map(i => i.id));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ background: 'rgba(110,59,87,0.28)', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onTutup(); }}>
      <div role="dialog" aria-modal="true" aria-label="Pilih dari Bekal" className="flex w-full max-w-lg flex-col rounded-t-[28px] bg-white sm:max-h-[80vh] sm:rounded-[24px]" style={{ maxHeight: '88dvh' }}>
        <div className="flex items-center justify-between px-5 pt-5">
          <p className="font-bricolage text-[17px] font-bold text-pekat">Pilih dari Bekal</p>
          <button type="button" aria-label="Tutup" onClick={onTutup} className="flex h-8 w-8 items-center justify-center rounded-full text-pekat/40 hover:bg-mawar/20"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex gap-2 px-5 pt-3">
          <button type="button" onClick={() => setSeg('main')} className={['rounded-full px-4 py-1.5 font-nunito text-[12.5px] font-extrabold', seg === 'main' ? 'bg-rekah text-white' : 'bg-kanvas text-pekat/55'].join(' ')}>Ajak Main</button>
          <button type="button" onClick={() => setSeg('wawasan')} className={['rounded-full px-4 py-1.5 font-nunito text-[12.5px] font-extrabold', seg === 'wawasan' ? 'bg-rekah text-white' : 'bg-kanvas text-pekat/55'].join(' ')}>Wawasan Tumbuh</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {seg === 'main' ? (
            aktivitas.length === 0 ? <p className="py-10 text-center text-[14px] text-pekat/45">Belum ada kegiatan.</p> : (
              <ul className="flex flex-col gap-2">
                {aktivitas.map(item => { const sudah = dipilih.has(item.id); return (
                  <li key={item.id} className="flex items-center gap-2 rounded-[14px] border border-mawar/20 bg-white px-3 py-2.5">
                    <span className="min-w-0 flex-1 font-nunito text-[13.5px] font-semibold text-pekat">{item.judul}</span>
                    <button type="button" onClick={() => sudah ? hapus(item.id) : tambah(item)} className={['flex items-center gap-1 rounded-full px-3 py-1.5 font-nunito text-[12px] font-extrabold', sudah ? 'bg-daun/12 text-daun' : 'bg-rekah/10 text-rekah'].join(' ')}>{sudah ? <><Check className="h-3.5 w-3.5" /> Di hari ini</> : <><Plus className="h-3.5 w-3.5" /> Tambah</>}</button>
                  </li>); })}
              </ul>
            )
          ) : (
            wawasan.length === 0 ? <p className="py-10 text-center text-[14px] text-pekat/45">Belum ada wawasan untuk usia ini.</p> : (
              <ul className="flex flex-col gap-2">
                {wawasan.map(c => { const sudah = wawasanIds.includes(c.id); return (
                  <li key={c.id} className="flex items-center gap-2 rounded-[14px] border border-[#E0A21F]/20 bg-madu/25 px-3 py-2.5">
                    <span className="min-w-0 flex-1 font-nunito text-[13.5px] font-semibold text-pekat">{c.title}</span>
                    <button type="button" onClick={() => pilihWawasan(c.id)} className={['flex items-center gap-1 rounded-full px-3 py-1.5 font-nunito text-[12px] font-extrabold', sudah ? 'bg-daun/12 text-daun' : 'bg-[#E0A21F]/15 text-[#C79020]'].join(' ')}>{sudah ? <><Check className="h-3.5 w-3.5" /> Di hari ini</> : <><Plus className="h-3.5 w-3.5" /> Tambah</>}</button>
                  </li>); })}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}

const HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
function StripKalender({ onHariLain }: { onHariLain?: () => void }) {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;
  const senin = new Date(now); senin.setDate(now.getDate() - dow);
  const hari = Array.from({ length: 7 }, (_, i) => { const d = new Date(senin); d.setDate(senin.getDate() + i); return { label: HARI_PENDEK[i], tgl: d.getDate(), isToday: d.toDateString() === now.toDateString() }; });
  return (
    <div className="mt-3">
      <p className="mb-2 font-nunito text-[12px] font-extrabold text-pekat/55">{BULAN_ID[now.getMonth()]} {now.getFullYear()}</p>
      <div className="flex gap-1.5">
        {hari.map((h, i) => (
          <button key={i} type="button" onClick={() => { if (!h.isToday && onHariLain) onHariLain(); }} className={['flex-1 rounded-[14px] py-2 text-center transition', h.isToday ? 'bg-rekah text-white shadow-[0_6px_16px_-6px_rgba(208,69,149,.6)]' : 'bg-white hover:bg-mawar/15'].join(' ')}>
            <span className={['block font-nunito text-[10px] font-extrabold uppercase', h.isToday ? 'text-white/90' : 'text-pekat/40'].join(' ')}>{h.label}</span>
            <span className={['block font-fredoka text-[16px] font-semibold', h.isToday ? 'text-white' : 'text-pekat'].join(' ')}>{h.tgl}</span>
          </button>
        ))}
      </div>
      {onHariLain && <p className="mt-2 font-nunito text-[11px] text-pekat/40">Ketuk hari lain untuk menyusunnya di Rencana mingguan.</p>}
    </div>
  );
}
function HeaderKelola({ sapaan, usiaBulan, onHariLain }: { sapaan: SapaanSet; usiaBulan: number | null; onHariLain?: () => void }) {
  const info = sapaan.cap ? `${sapaan.cap}${usiaBulan !== null ? ` · ${usiaBulan} bln` : ''}` : null;
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#FCE3EE] px-6 py-5">
      <div className="flex items-end justify-between gap-3">
        <div><p className="font-nunito text-[10px] font-extrabold uppercase tracking-widest text-rekah/60">Pusat kendali keluarga</p><h1 className="font-fredoka text-[32px] font-semibold leading-none text-pekat">Kelola</h1></div>
        {info && <span className="rounded-full bg-white/70 px-3 py-1.5 font-nunito text-[12px] font-extrabold text-pekat/70">{info}</span>}
      </div>
      <StripKalender onHariLain={onHariLain} />
    </div>
  );
}
function KelolaShell({ sapaan, usiaBulan, onHariLain, children, tanpaHeader = false }: { sapaan: SapaanSet; usiaBulan: number | null; onHariLain?: () => void; children: React.ReactNode; tanpaHeader?: boolean }) {
  if (tanpaHeader) {
    // Dipakai saat Kelola menjadi tab "Irama" di KelolaHub — tanpa header & padding luar sendiri.
    return <div className="pb-4 text-pekat">{children}</div>;
  }
  return (
    <article className="bg-kanvas pt-5 text-pekat sm:pt-6">
      <div className="px-6 sm:px-10"><HeaderKelola sapaan={sapaan} usiaBulan={usiaBulan} onHariLain={onHariLain} /></div>
      <div className="px-6 pb-16 pt-5 sm:px-10">{children}</div>
    </article>
  );
}
function KondisiAwalKompas({ nama }: { nama: string }) {
  return (
    <section className="rounded-[22px] border border-rekah/15 bg-gradient-to-br from-fajar via-white to-white p-6 shadow-[0_16px_40px_-30px_rgba(90,50,70,.5)]">
      <p className="font-nunito text-[11px] font-extrabold uppercase tracking-widest text-rekah/60">Sebelum mulai</p>
      <h2 className="mt-1 font-fredoka text-[21px] font-semibold leading-tight text-pekat">Kelola tumbuh dari Kompas Keluarga</h2>
      <p className="mt-2 font-nunito text-[13.5px] leading-relaxed text-pekat/60">Isi dua hal ini dulu agar Rekah tahu apa yang relevan untuk {nama}.</p>
      <div className="mt-4 flex flex-col gap-2.5">
        <Link to="/dashboard/tier2/kompas-keluarga" className="flex items-center gap-3 rounded-[15px] border border-rekah/10 bg-white px-4 py-3 no-underline"><span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] bg-daun/12 text-[17px]">🌱</span><span className="min-w-0 flex-1"><span className="block font-nunito text-[14px] font-extrabold text-pekat">Nilai keluarga</span><span className="block font-nunito text-[11.5px] text-pekat/50">Pilih 2–3 nilai yang ingin ditanam</span></span><span className="font-nunito text-[16px] font-extrabold text-rekah/40">›</span></Link>
        <Link to="/dashboard/tier2/kompas-keluarga" className="flex items-center gap-3 rounded-[15px] border border-rekah/10 bg-white px-4 py-3 no-underline"><span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] bg-langit/40 text-[17px]">👶</span><span className="min-w-0 flex-1"><span className="block font-nunito text-[14px] font-extrabold text-pekat">Kompas Perkembangan</span><span className="block font-nunito text-[11.5px] text-pekat/50">Amati tahap {nama}</span></span><span className="font-nunito text-[16px] font-extrabold text-rekah/40">›</span></Link>
      </div>
      <Link to="/dashboard/tier2/kompas-keluarga" className="mt-4 inline-flex w-full items-center justify-center rounded-[14px] bg-rekah px-5 py-3.5 font-nunito text-[15px] font-extrabold text-white no-underline">Buka Kompas Keluarga →</Link>
    </section>
  );
}

function TabKegiatan({ idAnak, nilaiFokus, nama, usiaBulan, onDariBekal }: { idAnak: string; nilaiFokus: readonly NilaiAkar[]; nama: string; usiaBulan: number; onDariBekal: () => void }) {
  const { tambahKustom } = usePilihanHarian();
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [formTerbuka, setFormTerbuka] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <FokusMingguIni idAnak={idAnak} nilaiKeluarga={nilaiFokus} namaAnak={nama} usiaBulan={usiaBulan} />
      <div>
        {!formTerbuka && (
          <div className="relative inline-block">
            <button type="button" onClick={() => setMenuTerbuka(m => !m)} className="rounded-full bg-rekah px-4 py-2 font-nunito text-[12.5px] font-extrabold text-white shadow-[0_5px_14px_-5px_rgba(208,69,149,.6)]">+ Kegiatan</button>
            {menuTerbuka && (
              <div role="dialog" className="absolute left-0 top-11 z-20 w-64 rounded-[14px] border border-bordergray bg-white p-1.5 shadow-md">
                <button type="button" onClick={() => { setMenuTerbuka(false); onDariBekal(); }} className="block w-full rounded-lg px-3 py-2 text-left font-nunito text-[13px] font-semibold text-pekat hover:bg-kanvas">🎒 Dari Bekal (Ajak Main / Wawasan)</button>
                <button type="button" onClick={() => { setMenuTerbuka(false); setFormTerbuka(true); }} className="block w-full rounded-lg px-3 py-2 text-left font-nunito text-[13px] font-semibold text-pekat hover:bg-kanvas">✏️ Tulis sendiri</button>
              </div>
            )}
          </div>
        )}
        {formTerbuka && (
          <FormItem mode="kegiatan" nama={nama} onSimpan={p => { tambahKustom(buatItemKustom({ judul: p.judul, kategori: 'kegiatan', deskripsi: p.deskripsi, nilai: p.nilai, domain: p.domain })); setFormTerbuka(false); }} onBatal={() => setFormTerbuka(false)} />
        )}
      </div>
    </div>
  );
}

function TabRencana({ usiaBulan, nama }: { usiaBulan: number; nama: string }) {
  const { tambahKustom, pindahBlok } = usePilihanHarian();
  const [formTerbuka, setFormTerbuka] = useState(false);
  const vaksin = JADWAL_KIA_2024[usiaBulan] ?? null;
  return (
    <div className="flex flex-col gap-4">
      <section>
        <p className="mb-2 font-nunito text-[11px] font-extrabold uppercase tracking-wider text-pekat/45">📣 Pengingat dari Rekah</p>
        {vaksin ? (
          <div className="flex items-start gap-3 rounded-[16px] border border-rekah/12 bg-white px-4 py-3.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] bg-rekah/10 text-[17px]">💉</span>
            <div className="min-w-0 flex-1"><p className="font-nunito text-[14.5px] font-extrabold text-pekat">Imunisasi {usiaBulan} bulan</p><p className="mt-0.5 font-nunito text-[12.5px] text-pekat/55">{vaksin.join(' · ')}</p><p className="mt-1 font-nunito text-[11.5px] italic text-rekah/70">Sesuai jadwal Buku KIA 2024 — tinggal pilih tanggal.</p></div>
            <button type="button" className="flex-shrink-0 rounded-full bg-langit/50 px-3.5 py-1.5 font-nunito text-[12px] font-extrabold text-pekat/70">Jadwalkan</button>
          </div>
        ) : (
          <p className="rounded-[16px] border border-rekah/10 bg-white px-4 py-3.5 font-nunito text-[13px] text-pekat/55">Tidak ada imunisasi wajib tepat di usia {usiaBulan} bulan menurut Buku KIA 2024.</p>
        )}
      </section>
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-nunito text-[11px] font-extrabold uppercase tracking-wider text-pekat/45">🗂️ Rencana kamu</p>
          {!formTerbuka && <button type="button" onClick={() => setFormTerbuka(true)} className="rounded-full bg-rekah px-3.5 py-1.5 font-nunito text-[12px] font-extrabold text-white">+ Rencana</button>}
        </div>
        {formTerbuka && (
          <FormItem mode="rencana" nama={nama} onSimpan={p => { const it = buatItemKustom({ judul: p.judul, kategori: 'rencana', kapan: p.kapan, deskripsi: p.deskripsi }); tambahKustom(it); const b = kapanKeBlok(p.kapan); if (b) pindahBlok(it.id, b); setFormTerbuka(false); }} onBatal={() => setFormTerbuka(false)} />
        )}
        <Link to="/dashboard/tier2/rencana" className="mt-3 flex items-center gap-3 rounded-[16px] border border-rekah/10 bg-white px-4 py-3.5 no-underline"><span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] bg-daun/12 text-[17px]">📅</span><span className="min-w-0 flex-1"><span className="block font-nunito text-[14px] font-extrabold text-pekat">Rencana mingguan &amp; rutinitas</span><span className="block font-nunito text-[11.5px] text-pekat/50">Susun untuk hari lain</span></span><span className="font-nunito text-[16px] font-extrabold text-rekah/40">›</span></Link>
      </section>
    </div>
  );
}

function SheetTambah({ nama, onTutup, onKe, onDariBekal }: { nama: string; onTutup: () => void; onKe: (t: TabId) => void; onDariBekal: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ background: 'rgba(110,59,87,0.28)', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onTutup(); }}>
      <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-t-[28px] bg-white p-5 sm:rounded-[24px]">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-mawar/40" />
        <p className="font-fredoka text-[19px] font-semibold text-pekat">Tambah untuk {nama}</p>
        <div className="mt-4 flex flex-col">
          <button type="button" onClick={() => { onKe('kebiasaan'); onTutup(); }} className="flex items-center gap-3 rounded-[14px] px-2 py-3 text-left hover:bg-kanvas"><span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-madu/40 text-[19px]">✨</span><span className="flex-1 font-nunito text-[14.5px] font-extrabold text-pekat">Momen sehari-hari</span><span className="text-[16px] font-extrabold text-rekah/40">›</span></button>
          <div className="border-t border-bordergray/60" />
          <div className="px-2 pt-3">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-langit/40 text-[19px]">🧺</span><span className="flex-1 font-nunito text-[14.5px] font-extrabold text-pekat">Kegiatan</span></div>
            <div className="mt-2 flex flex-wrap gap-2 pl-[52px] pb-3">
              <button type="button" onClick={() => { onDariBekal(); onTutup(); }} className="rounded-full bg-rekah/10 px-3.5 py-1.5 font-nunito text-[12px] font-extrabold text-rekah">🎒 Dari Bekal</button>
              <button type="button" onClick={() => { onKe('kegiatan'); onTutup(); }} className="rounded-full bg-kanvas px-3.5 py-1.5 font-nunito text-[12px] font-extrabold text-pekat/70">✏️ Tulis sendiri</button>
            </div>
          </div>
          <div className="border-t border-bordergray/60" />
          <button type="button" onClick={() => { onKe('kebiasaan'); onTutup(); }} className="flex items-center gap-3 rounded-[14px] px-2 py-3 text-left hover:bg-kanvas"><span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-daun/12 text-[19px]">🌱</span><span className="flex-1 font-nunito text-[14.5px] font-extrabold text-pekat">Kebiasaan baik</span><span className="text-[16px] font-extrabold text-rekah/40">›</span></button>
          <div className="border-t border-bordergray/60" />
          <button type="button" onClick={() => { onKe('rencana'); onTutup(); }} className="flex items-center gap-3 rounded-[14px] px-2 py-3 text-left hover:bg-kanvas"><span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-mawar/30 text-[19px]">📅</span><span className="flex-1 font-nunito text-[14.5px] font-extrabold text-pekat">Rencana / rutinitas</span><span className="text-[16px] font-extrabold text-rekah/40">›</span></button>
        </div>
        <button type="button" onClick={onTutup} className="mt-4 w-full rounded-[14px] border border-bordergray py-3 font-nunito text-[13.5px] font-extrabold text-pekat/55">Tutup</button>
      </div>
    </div>
  );
}

export default function Kelola({ nilaiFokus = [], centangKebiasaan, tanggalHariIni, onCentangToggle, onBekal, modeShell = false }: PropsKelola) {
  const navigate = useNavigate();
  const { profile, sapaan, usiaBulan } = useChildProfile();
  const { anakAktif } = useAnak();
  const { bekal: bekalRakit, katalogSikap } = useMemo(() => rakitBekal(), []);
  const { publishedDownloads } = useLearningStrategies();
  const [tab, setTab] = useState<TabId>('overall');
  const tabAktif: TabId = modeShell ? 'overall' : tab;
  const [sheetTerbuka, setSheetTerbuka] = useState(false);
  const [pickTerbuka, setPickTerbuka] = useState(false);

  const profilAnak = useMemo<ProfilAnak | null>(() => {
    if (!profile.tanggalLahir) return null;
    const tgl = new Date(profile.tanggalLahir);
    if (isNaN(tgl.getTime())) return null;
    return { tanggalLahir: tgl };
  }, [profile.tanggalLahir]);
  const statusTahap = useMemo(() => (profilAnak ? resolveTahapAktif(profilAnak, new Date()) : null), [profilAnak]);

  if (profilAnak === null || statusTahap === null) {
    return (<KelolaShell sapaan={sapaan} usiaBulan={null} tanpaHeader={modeShell}><div className="rounded-[20px] border border-rekah/10 bg-white px-5 py-6"><h2 className="mb-2 font-bricolage text-[20px] font-bold text-pekat">{renderRichText(LAYAR_DATA_BELUM_DIISI.judul, sapaan)}</h2><p className="text-[14px] leading-relaxed text-ink-soft">{renderRichText(LAYAR_DATA_BELUM_DIISI.badan, sapaan)}</p></div></KelolaShell>);
  }
  if (statusTahap.status === 'belumLahir') {
    return (<KelolaShell sapaan={sapaan} usiaBulan={null} tanpaHeader={modeShell}><div className="rounded-[20px] border border-rekah/10 bg-white px-5 py-6"><h2 className="mb-2 font-bricolage text-[20px] font-bold text-pekat">{LAYAR_BELUM_LAHIR.judul}</h2><p className="text-[14px] leading-relaxed text-ink-soft">{renderRichText(LAYAR_BELUM_LAHIR.badan, sapaan)}</p></div></KelolaShell>);
  }
  if (statusTahap.status === 'melewatiRentang') {
    return (<KelolaShell sapaan={sapaan} usiaBulan={null} tanpaHeader={modeShell}><div className="rounded-[20px] border border-rekah/10 bg-white px-5 py-6"><h2 className="mb-2 font-bricolage text-[20px] font-bold text-pekat">{renderRichText(LAYAR_MELEWATI_RENTANG.judul, sapaan)}</h2><p className="text-[14px] leading-relaxed text-ink-soft">{renderRichText(LAYAR_MELEWATI_RENTANG.badan, sapaan)}</p></div></KelolaShell>);
  }
  if (statusTahap.status === 'kontenBelumSiap') {
    return (<KelolaShell sapaan={sapaan} usiaBulan={null} tanpaHeader={modeShell}><div className="rounded-[20px] border border-rekah/10 bg-white px-5 py-6"><h2 className="mb-2 font-bricolage text-[20px] font-bold text-pekat">{LAYAR_KONTEN_BELUM_SIAP.judul}</h2><p className="text-[14px] leading-relaxed text-ink-soft">{renderRichText(LAYAR_KONTEN_BELUM_SIAP.badan, sapaan)}</p></div></KelolaShell>);
  }

  const { hasil } = statusTahap;
  const usiaBulanOk = usiaBulan ?? hasil.usiaBulan;
  const subTahapPopulated = bekalRakit.flatMap(b => b.subTahap).find(st => st.id === hasil.subTahap.id);
  const SUB_TAHAP_YEAR_ONE = ['b03', 'b36', 'b69', 'b912'];
  const isYearOneBand = usiaBulanOk < 12;
  const kolamBase: ItemBekal[] = isYearOneBand
    ? bekalRakit.flatMap(b => b.subTahap).filter(st => SUB_TAHAP_YEAR_ONE.includes(st.id)).flatMap(st => st.kegiatan.map(item => ({ ...item, subTahapId: st.id })))
    : (subTahapPopulated?.kegiatan ?? []);
  const unduhAnak: ItemBekal[] = publishedDownloads
    .filter(d => d.minBulan <= usiaBulanOk && d.maxBulan > usiaBulanOk && (d.pemilik ?? 'anak') === 'anak')
    .map(d => ({ id: `ls-dl-${d.id}`, judul: d.nama, tipe: 'unduhan' as const, domain: d.domain, nilai: [], tanpaTemaNilai: d.tanpaTemaNilai, pemilik: 'anak' as const, sumberId: `ls-dl-${d.id}` }));
  const kolam: ItemBekal[] = [...kolamBase, ...unduhAnak];
  const kolamOrangTua = subTahapPopulated?.panduan ?? [];
  const maksItem = subTahapPopulated?.maksItemPerHari ?? hasil.subTahap.maksItemPerHari;
  const idAnak = anakAktif?.id ?? 'anak-default';
  const belumAdaNilai = nilaiFokus.length === 0;
  const nama = profile.namaAnak || 'si kecil';

  return (
    <KelolaShell sapaan={sapaan} usiaBulan={usiaBulanOk} onHariLain={belumAdaNilai ? undefined : () => navigate('/dashboard/tier2/rencana')} tanpaHeader={modeShell}>
      <TemaniEntryCard className="mb-5" />
      {belumAdaNilai ? (
        <KondisiAwalKompas nama={nama} />
      ) : (
        <PilihanHarianProvider key={idAnak} idAnak={idAnak} kolam={kolam} kolamOrangTua={kolamOrangTua} usiaBulan={usiaBulanOk} nilaiFokus={nilaiFokus} katalogSikap={katalogSikap} maksItem={maksItem}>
          {!modeShell && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} className={['flex-shrink-0 rounded-full px-4 py-2 font-nunito text-[12.5px] font-extrabold transition', tab === t.id ? 'bg-rekah text-white shadow-[0_5px_14px_-5px_rgba(208,69,149,.6)]' : 'border border-rekah/12 bg-white text-pekat/55'].join(' ')}>{t.label}</button>
            ))}
          </div>
          )}
          <div className={modeShell ? "" : "mt-5"}>
            {tabAktif === 'overall' && (
              modeShell ? (
                <IramaPeluncur
                  usiaBulan={usiaBulanOk}
                  nilaiFokus={nilaiFokus}
                  centangKebiasaan={centangKebiasaan}
                  onBekal={onBekal}
                />
              ) : (
              <div className="grid items-start gap-5 lg:grid-cols-2">
                <div><SusunanHari keBoard /></div>
                <PapanCatatan
                  usiaBulan={usiaBulanOk}
                  nama={nama}
                  habitProps={{ nilaiFokus, usiaBulan: usiaBulanOk, katalogSikap, centangKebiasaan, tanggalHariIni, sapaan, onCentangToggle, onBekal }}
                />
              </div>
              )
            )}
            {tabAktif === 'kegiatan' && <TabKegiatan idAnak={idAnak} nilaiFokus={nilaiFokus} nama={nama} usiaBulan={usiaBulanOk} onDariBekal={() => setPickTerbuka(true)} />}
            {tabAktif === 'kebiasaan' && (
              <KegiatanSehariHari nilaiFokus={nilaiFokus} usiaBulan={usiaBulanOk} katalogSikap={katalogSikap} centangKebiasaan={centangKebiasaan} tanggalHariIni={tanggalHariIni} onCentangToggle={onCentangToggle} onBekal={onBekal} />
            )}
            {tabAktif === 'rencana' && <TabRencana usiaBulan={usiaBulanOk} nama={nama} />}
          </div>
          <button type="button" onClick={() => setSheetTerbuka(true)} aria-label="Tambah" className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-rekah text-[28px] font-light text-white shadow-[0_10px_22px_-6px_rgba(208,69,149,.7)] sm:bottom-8">+</button>
          {sheetTerbuka && <SheetTambah nama={nama} onTutup={() => setSheetTerbuka(false)} onKe={setTab} onDariBekal={() => setPickTerbuka(true)} />}
          {pickTerbuka && <PilihDariBekal usiaBulan={usiaBulanOk} onTutup={() => setPickTerbuka(false)} />}
        </PilihanHarianProvider>
      )}
    </KelolaShell>
  );
}
