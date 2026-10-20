// =============================================================
// PapanKegiatan — papan 3 kolom (Pagi/Siang/Malam) bersama untuk Kelola.
// Dipakai oleh "Hari Ini" (tanggal berjalan) dan "Rencana Minggu" (tanggal mana
// pun) dengan satu sumber data per tanggal (useDayPlan). Mendukung kegiatan
// default, tambah kegiatan & to-do (4 jenis, termasuk pilih dari Bekal), hapus,
// dan atur urutan lewat tombol naik/turun. Copy DRAFT — review Fitri.
// Tiap slot bergaya kartu botani seragam dengan Beranda (Rencana hari ini).
// =============================================================
import React, { useMemo, useState } from 'react';
import TautanSumber from '../../components/TautanSumber';
import FilterSubUsia, { resolveSubUsia, SUB_USIA_TO_AGE_KEY } from '../../components/FilterSubUsia';
import type { IdSubUsia } from '../../components/FilterSubUsia';
import { Trash2, Check, Pencil, X, ChevronUp, ChevronDown, Leaf, RefreshCw } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import BungaNilai from '../../components/BungaNilai';
import IlustrasiKegiatan from './IlustrasiKegiatan';
import { plant, Tanaman, type TanamanCfg } from '../beranda/komponen/plant';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import { useKnowledgeLibrary } from '../../context/KnowledgeLibraryContext';
import {
  useDayPlan, DEFAULT_KOLOM, LB, SUBT, TINT, CHIP, labelWarna, idNilai, ORDER,
} from './dayPlanData';
import type { Tipe, Item, Store, Waktu } from './dayPlanData';
import type { ParameterPenyesuaian } from './kehidupanData';
import { usePetaStore } from './kehidupanData';
import { alergenHindariDariPeta, bahasaRumahDariPeta } from './kontenMetadata';
import { saringKebiasaanKartu } from './iramaKatalog';
import { useAnak } from '../../context/AnakContext';
import { useIdPenyetir } from './terlihatData';
import { saranRekahPerKeg, bacaProgresTemani, bandAjakMain, AWALAN_REKAH, idTemaniDariRekah, jenisSaranRekah, domainMinat } from './kurasiPapan';
import { useTemaniKatalog } from '../temani/temaniKatalog';
import { useTemaniSelesaiHari, tandaiLangkahTemani } from '../temani/temaniKelola';
import { dispatchRekahError } from '../../utils/rekahApiError';

// ─── Kepala botani per slot (seragam dengan Beranda · RencanaHariIni) ─────────

const SLOT_CAP: Record<Waktu, { bg: string; sub: string; subInk: string; bunga: TanamanCfg[] }> = {
  pagi: { bg: '#F8C9DF', sub: 'Bangun sampai mandi', subInk: '#A24E86', bunga: [
    { w: '28px', h: '44px', dur: '10s', cfg: plant('tulip', { b: '#F0479B', b2: '#F890BE' }) },
    { w: '38px', h: '58px', dur: '12s', cfg: plant('daisy', { b: '#FFE29A', b2: '#FFF3E6', c: '#F0479B' }) },
    { w: '24px', h: '38px', dur: '9s', cfg: plant('foliage', {}) } ] },
  siang: { bg: '#FFE29A', sub: 'Main dan makan', subInk: '#8A5510', bunga: [
    { w: '24px', h: '38px', dur: '11s', cfg: plant('foliage', {}) },
    { w: '36px', h: '56px', dur: '13s', cfg: plant('fivepetal', { b: '#FF5FA2', b2: '#FFF1F7', c: '#FFE29A' }) },
    { w: '28px', h: '44px', dur: '10s', cfg: plant('bell', { b: '#7FA6FF', b2: '#DCEAFD' }) } ] },
  malam: { bg: '#E4D8FA', sub: 'Menjelang tidur', subInk: '#4A2F94', bunga: [
    { w: '30px', h: '46px', dur: '12s', cfg: plant('sprig', { b: '#9C7BF0', b2: '#EFE9FD' }) },
    { w: '36px', h: '56px', dur: '14s', cfg: plant('tulip', { b: '#7FA6FF', b2: '#DCEAFD' }) },
    { w: '24px', h: '38px', dur: '9.5s', cfg: plant('leaf', {}) } ] },
};
const RING = [0, 1, 2, 3, 4, 5, 6];

// ─── Marker jenis to-do non-kebiasaan ────────────────────────────────────────

function MarkerNon({ tipe }: { tipe: 'main' | 'buku' | 'lainnya' }) {
  const [bg, ink] = TINT[tipe];
  return (
    <span style={{ width: 21, height: 21, flexShrink: 0, marginTop: 1, borderRadius: 7, background: bg, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {tipe === 'lainnya' ? <Pencil style={{ width: 13, height: 13 }} strokeWidth={2} /> : <IlustrasiKegiatan ikon={tipe === 'main' ? 'main' : 'buku'} size={14} />}
    </span>
  );
}

// ─── Bekal picker (grid) ──────────────────────────────────────────────────────

interface PilihanBekal { id: string; judul: string; sub?: string; ageKey?: string }

// ajakMainBandIds dipindah ke kurasiPapan.ts (bandAjakMain) agar dipakai bersama kurasi Rekah.
function wawasanKeys(usiaBulan: number): Set<string> {
  const bands: { max: number; keys: string[] }[] = [
    { max: 12, keys: ['0-3m', '3-6m', '6-9m', '9-12m'] },
    { max: 24, keys: ['12-18m', '18-24m'] },
    { max: 36, keys: ['2-3y'] },
    { max: 48, keys: ['3-4y'] },
    { max: 60, keys: ['4-5y'] },
    { max: Infinity, keys: ['5-6y'] },
  ];
  for (const b of bands) if (usiaBulan <= b.max) return new Set(b.keys);
  return new Set(['5-6y']);
}

function BekalPicker({ tipe, items: semuaItem, onPick, onClose, usiaBulan, ganti, bisaDefault }: {
  tipe: 'main' | 'buku'; items: PilihanBekal[]; onPick: (judul: string, cakupan: 'hari' | 'default') => void; onClose: () => void;
  /** Kegiatan bawaan: boleh ditambahkan ke default (semua hari). */
  bisaDefault?: boolean;
  /** Filter sub tahap usia 0–1 tahun, sama dengan Bekal (Ajak Main & Wawasan Tumbuh). */
  usiaBulan?: number;
  /** Judul item yang sedang diganti (tidak ditawarkan lagi). */
  ganti?: string;
}) {
  // Sama dengan Bekal: tahun pertama dipilah per sub tahap usia (Ajak Main: ageId b03…; Wawasan: ageKey 0-3m…).
  const subTahun = usiaBulan != null && usiaBulan < 12;
  const [subUsia, setSubUsia] = useState<IdSubUsia>(() => resolveSubUsia(usiaBulan ?? 0));
  const [cakupan, setCakupan] = useState<'hari' | 'default'>('hari');
  const kunciSub = tipe === 'main' ? subUsia : SUB_USIA_TO_AGE_KEY[subUsia];
  const items = semuaItem.filter(it =>
    (!subTahun || it.ageKey === kunciSub)
    && (!ganti || it.judul.trim().toLowerCase() !== ganti.trim().toLowerCase()));
  const judul = tipe === 'main' ? 'Pilih dari Ajak Main' : 'Pilih dari Wawasan Tumbuh';
  const sumber = tipe === 'main' ? 'Bekal · Ajak Main' : 'Bekal · Wawasan Tumbuh';
  const accent = tipe === 'main' ? '#D2559A' : '#7A5CA6';
  return (
    <div role="dialog" aria-label={judul} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(110,59,87,.28)', backdropFilter: 'blur(3px)', padding: '24px 16px' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 440, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -30px rgba(90,50,70,.5)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '16px 18px 12px', borderBottom: '1px solid rgba(110,59,87,.08)' }}>
          <div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '.6px', textTransform: 'uppercase', color: accent }}>{sumber}</div>
            <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57', margin: '2px 0 0' }}>{ganti ? `Ganti “${ganti}”` : judul}</h3>
            {subTahun && <div style={{ marginTop: 8 }}><FilterSubUsia nilai={subUsia} onPilih={setSubUsia} /></div>}
            {bisaDefault && !ganti && (
              <div role="radiogroup" aria-label="Tambahkan untuk" style={{ marginTop: 10, display: 'inline-flex', gap: 4, background: '#FBF3F8', borderRadius: 999, padding: 3 }}>
                {([['hari', 'Hanya hari ini'], ['default', 'Jadikan default']] as const).map(([v, l]) => (
                  <button key={v} type="button" role="radio" aria-checked={cakupan === v} onClick={() => setCakupan(v)}
                    style={{ border: 'none', borderRadius: 999, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5,
                      background: cakupan === v ? accent : 'transparent', color: cakupan === v ? '#fff' : '#8A5A74' }}>{l}</button>
                ))}
              </div>
            )}
          </div>
          <button type="button" aria-label="Tutup" onClick={onClose} style={{ flexShrink: 0, background: '#FBF3F8', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8A5A74' }}>
            <X style={{ width: 16, height: 16 }} strokeWidth={2.4} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '12px 14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {items.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74', padding: '18px 6px', textAlign: 'center' }}>Belum ada item untuk usia ini di Bekal.</div>
          ) : items.map(it => (
            <button key={it.id} type="button" onClick={() => onPick(it.judul, cakupan)}
              style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', border: '1.5px solid rgba(110,59,87,.1)', borderRadius: 16, padding: '13px 13px', minHeight: 78, background: '#FFFDFE', cursor: 'pointer', transition: 'background .14s, border-color .14s, transform .14s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FBF3F8'; e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFDFE'; e.currentTarget.style.borderColor = 'rgba(110,59,87,.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <span aria-hidden="true" style={{ width: 26, height: 5, borderRadius: 999, background: accent, display: 'block', marginBottom: 9, opacity: 0.7 }} />
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, lineHeight: 1.3, color: '#6E3B57' }}>{it.judul}</div>
              {it.sub && <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11, lineHeight: 1.4, color: '#A98BA0', marginTop: 4 }}>{it.sub}</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tambah kegiatan (dengan waktu opsional) ──────────────────────────────────

function TambahKegiatanRow({ onAdd }: { onAdd: (nm: string, wk?: string) => void }) {
  const [hov, setHov] = useState(false);
  const [adding, setAdding] = useState(false);
  const [nm, setNm] = useState('');
  const [wk, setWk] = useState('');
  const reset = () => { setAdding(false); setNm(''); setWk(''); };
  const submit = () => { const t = nm.trim(); if (!t) return; onAdd(t, wk || undefined); reset(); };

  if (!adding) {
    return (
      <button type="button" onClick={() => setAdding(true)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ border: '1.8px dashed #F4B4D2', borderRadius: 14, padding: '11px 10px', textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#D2559A', cursor: 'pointer', background: hov ? '#fff' : 'rgba(255,255,255,.55)', transition: 'background .16s', width: '100%' }}>
        + tambah kegiatan
      </button>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, border: '1.8px dashed #F4B4D2', borderRadius: 14, padding: 12, background: '#fff' }}>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase', color: '#D2559A' }}>Kegiatan baru</div>
      <input autoFocus value={nm} onChange={e => setNm(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') reset(); }} placeholder="mis. Waktu cemilan sore"
        style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #E7CFDD', padding: '9px 11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#6E3B57', outline: 'none', background: '#FFFDFE' }} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#8A5A74', flexShrink: 0 }}>Waktu (opsional)</span>
        <input type="time" value={wk} onChange={e => setWk(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') reset(); }}
          style={{ boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #E7CFDD', padding: '7px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#6E3B57', outline: 'none', background: '#FFFDFE' }} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={submit} disabled={!nm.trim()}
          style={{ flex: 1, borderRadius: 10, border: 'none', padding: '9px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#fff', background: nm.trim() ? '#C6407F' : '#E7C4D6', cursor: nm.trim() ? 'pointer' : 'default' }}>Tambah</button>
        <button type="button" onClick={reset}
          style={{ borderRadius: 10, border: '1.5px solid #EBD6E2', padding: '9px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#8A5A74', background: 'none', cursor: 'pointer' }}>Batal</button>
      </div>
    </div>
  );
}

// ─── Kartu kegiatan ───────────────────────────────────────────────────────────

function KartuAktivitas({
  kegKey, nm, wk, accent, badge, items, extra, store, centangHari, mekarDari, fokusSet, nilaiFokus,
  onToggleKeb, onToggleExtra, onHide, onDelExtra, onAddExtra, onOpenPicker, onDelKeg, onUp, onDown, canUp, canDown,
  param, onGanti, onGantiPilih, isDefaultKeg, diubah, asli, onUbahKeg, onPulihkanKeg, onTambahDefault, onHapusDefault,
}: {
  kegKey: string; nm: string; wk?: string; accent: string; badge?: string;
  param?: ParameterPenyesuaian;
  items: Item[]; extra: Item[]; store: Store;
  centangHari: Record<string, string[]>;
  mekarDari: (n: NilaiAkar) => number;
  fokusSet: Set<NilaiAkar>;
  nilaiFokus: readonly NilaiAkar[];
  onToggleKeb: (n: NilaiAkar, id: string) => void;
  onToggleExtra: (id: string) => void;
  onHide: (id: string) => void;
  onDelExtra: (kegKey: string, id: string) => void;
  /** Ganti saran Rekah (Ajak Main / Wawasan Tumbuh) dengan pilihan Rekah lain. */
  onGanti?: (kegKey: string, id: string) => void;
  /** Ganti Ajak Main / Wawasan Tumbuh yang dipilih sendiri → buka pemilih Bekal. */
  onGantiPilih?: (id: string, tipe: 'main' | 'buku') => void;
  /** Kegiatan bawaan Rekah (bukan buatan pengguna) — boleh dijadikan default saat diubah. */
  isDefaultKeg?: boolean;
  diubah?: 'hari' | 'default';
  asli?: { nm: string; wk?: string };
  onUbahKeg?: (nm: string, wk: string, cakupan: 'hari' | 'default') => void;
  onPulihkanKeg?: () => void;
  /** Kegiatan bawaan: tambah / hapus to-do di DEFAULT (semua hari). */
  onTambahDefault?: (tipe: Tipe, teks: string, nilai?: NilaiAkar) => void;
  onHapusDefault?: (id: string) => void;
  onAddExtra: (kegKey: string, tipe: Tipe, teks: string, nilai?: NilaiAkar) => void;
  onOpenPicker: (tipe: 'main' | 'buku') => void;
  onDelKeg?: () => void;
  onUp?: () => void; onDown?: () => void; canUp?: boolean; canDown?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formTipe, setFormTipe] = useState<Tipe | null>(null);
  const [teks, setTeks] = useState('');
  const [nilaiPilih, setNilaiPilih] = useState<NilaiAkar | ''>('');
  // Ubah kegiatan (nama & jam)
  const [ubah, setUbah] = useState(false);
  const [nmBaru, setNmBaru] = useState(nm);
  const [wkBaru, setWkBaru] = useState('');
  const jamValid = (w?: string) => (w && /^\d{1,2}:\d{2}$/.test(w) ? w.padStart(5, '0') : '');
  const bukaUbah = () => { setNmBaru(nm); setWkBaru(jamValid(wk)); setUbah(true); };
  const simpanUbah = (cakupan: 'hari' | 'default') => { if (!nmBaru.trim() || !onUbahKeg) return; onUbahKeg(nmBaru, wkBaru, cakupan); setUbah(false); };

  const resetForm = () => { setMenuOpen(false); setFormTipe(null); setTeks(''); setNilaiPilih(''); };
  const submitForm = (cakupan: 'hari' | 'default' = 'hari') => {
    const t = teks.trim(); if (!t || !formTipe) return;
    const nilai = formTipe === 'kebiasaan' ? (nilaiPilih || nilaiFokus[0]) as NilaiAkar : undefined;
    if (cakupan === 'default' && onTambahDefault) onTambahDefault(formTipe, t, nilai);
    else onAddExtra(kegKey, formTipe, t, nilai);
    resetForm();
  };
  // Hapus to-do di kegiatan bawaan: pilih hari ini saja atau dari default.
  const [hapusId, setHapusId] = useState<string | null>(null);
  const mintaHapus = (it: Item, def: boolean) => {
    if (def && onHapusDefault && !it.id.startsWith('rk-')) { setHapusId(h => (h === it.id ? null : it.id)); return; }
    if (def) onHide(it.id); else onDelExtra(kegKey, it.id);
  };
  const menuHapus = (it: Item) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, margin: '-2px 0 2px 29px', padding: '7px 9px', borderRadius: 10, background: '#FBF3F8' }}>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#8A5A74', marginRight: 2 }}>Hapus “{it.t}”:</span>
      <button type="button" onClick={() => { onHide(it.id); setHapusId(null); }}
        style={{ border: '1.5px solid #F4B4D2', background: '#fff', color: '#B4477F', borderRadius: 999, padding: '4px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, cursor: 'pointer' }}>Hari ini saja</button>
      <button type="button" onClick={() => { onHapusDefault?.(it.id); setHapusId(null); }}
        style={{ border: 'none', background: '#F06BA8', color: '#fff', borderRadius: 999, padding: '4px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, cursor: 'pointer' }}>Dari default</button>
      <button type="button" onClick={() => setHapusId(null)}
        style={{ border: 'none', background: 'none', color: '#B79AAC', padding: '4px 4px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, cursor: 'pointer' }}>Batal</button>
    </div>
  );
  const PH: Record<Tipe, string> = {
    kebiasaan: 'mis. Merapikan sepatu sendiri',
    main: 'mis. Tebak suara benda (dari Ajak Main)',
    buku: 'mis. Buku bergambar hewan (dari Wawasan Tumbuh)',
    lainnya: 'Tulis to-do kamu sendiri',
  };
  const MENU: [Tipe, string][] = [['kebiasaan', 'Kebiasaan Baik'], ['main', 'Ajak Main'], ['buku', 'Wawasan Tumbuh'], ['lainnya', 'Tulis sendiri']];

  const hidden = new Set(store.hidden);
  const vis = items.filter(i => !hidden.has(i.id) && (i.tipe !== 'kebiasaan' || (i.n != null && fokusSet.has(i.n))));
  const allRaw = [...vis, ...extra];
  // Penyesuaian konten sungguhan dari Kehidupan Keluarga: saat energi terbatas,
  // batasi jumlah aktivitas non-kebiasaan agar hari terasa ringan (kebiasaan tetap).
  let all = allRaw;
  let jmlDisembunyikan = 0;
  if (param?.kurangiJumlah) {
    const keb = allRaw.filter(i => i.tipe === 'kebiasaan');
    const non = allRaw.filter(i => i.tipe !== 'kebiasaan');
    const nonTampil = non.slice(0, 1);
    jmlDisembunyikan = non.length - nonTampil.length;
    all = [...keb, ...nonTampil];
  }
  const isDefault = (it: Item) => vis.includes(it);
  const doneExtra = new Set(store.doneExtra);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="animate-fade-in-up"
      style={{ background: '#fff', border: '1px solid #F3E7EF', borderRadius: 16, padding: '13px 13px 12px', boxShadow: hovered ? '0 16px 32px -28px rgba(90,50,70,.55)' : '0 10px 24px -22px rgba(90,50,70,.5)', transform: hovered ? 'translateY(-2px)' : 'translateY(0)', transition: 'transform .22s cubic-bezier(.2,.7,.2,1), box-shadow .22s ease' }}>
      {/* Head */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span aria-hidden="true" style={{ width: 4, height: 28, flexShrink: 0, borderRadius: 999, background: accent, display: 'block' }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 14.5, color: '#6E3B57', lineHeight: 1.2 }}>{nm}</div>
          {wk && <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#B79AAC', marginTop: 1 }}>{wk}</div>}
          {badge && <span style={{ display: 'inline-block', marginTop: 4, fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 9.5, letterSpacing: '.4px', textTransform: 'uppercase', color: '#B4477F', background: '#FCE4EE', borderRadius: 999, padding: '2px 8px' }}>{badge}</span>}
        </div>
        {onUbahKeg && !ubah && (
          <button type="button" aria-label={`Ubah ${nm}`} onClick={bukaUbah} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#C9AEBD', padding: 0, lineHeight: 1 }}>
            <Pencil style={{ width: 15, height: 15 }} strokeWidth={2} />
          </button>
        )}
        {(onUp || onDown) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
            <button type="button" aria-label="Naikkan urutan" onClick={onUp} disabled={!canUp} style={{ background: 'none', border: 'none', cursor: canUp ? 'pointer' : 'default', color: canUp ? '#B79AAC' : '#EAD8E2', padding: 0, lineHeight: 0 }}><ChevronUp style={{ width: 16, height: 16 }} strokeWidth={2.4} /></button>
            <button type="button" aria-label="Turunkan urutan" onClick={onDown} disabled={!canDown} style={{ background: 'none', border: 'none', cursor: canDown ? 'pointer' : 'default', color: canDown ? '#B79AAC' : '#EAD8E2', padding: 0, lineHeight: 0 }}><ChevronDown style={{ width: 16, height: 16 }} strokeWidth={2.4} /></button>
          </div>
        )}
        {onDelKeg && (
          <button type="button" aria-label={`Hapus ${nm}`} onClick={onDelKeg} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#C9AEBD', padding: 0, lineHeight: 1 }}>
            <Trash2 style={{ width: 15, height: 15 }} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Ubah kegiatan: nama & jam → hanya hari ini / jadikan default */}
      {ubah && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 12, border: '1.5px solid #F4D6E5', background: '#FFFDFE', padding: 10 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase', color: '#D2559A' }}>Ubah kegiatan</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input autoFocus value={nmBaru} onChange={e => setNmBaru(e.target.value)} aria-label="Nama kegiatan" placeholder="Nama kegiatan"
              onKeyDown={e => { if (e.key === 'Escape') setUbah(false); if (e.key === 'Enter' && !isDefaultKeg) simpanUbah('hari'); }}
              style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #E7CFDD', padding: '8px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#6E3B57', outline: 'none', background: '#fff' }} />
            <input type="time" value={wkBaru} onChange={e => setWkBaru(e.target.value)} aria-label="Jam kegiatan"
              style={{ width: 92, flexShrink: 0, boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #E7CFDD', padding: '8px 6px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#6E3B57', outline: 'none', background: '#fff' }} />
          </div>
          {isDefaultKeg ? (
            <>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, lineHeight: 1.45, color: '#A98BA0' }}>Simpan perubahan ini untuk…</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <button type="button" onClick={() => simpanUbah('hari')} disabled={!nmBaru.trim()}
                  style={{ flex: '1 1 110px', borderRadius: 10, border: '1.5px solid #F4B4D2', background: '#fff', color: '#B4477F', padding: '8px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                  Hanya hari ini
                </button>
                <button type="button" onClick={() => simpanUbah('default')} disabled={!nmBaru.trim()}
                  style={{ flex: '1 1 110px', borderRadius: 10, border: 'none', background: '#F06BA8', color: '#fff', padding: '8px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                  Jadikan default
                </button>
              </div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11, lineHeight: 1.45, color: '#B79AAC' }}>Default dipakai di semua hari, kecuali hari yang kamu ubah sendiri.</div>
            </>
          ) : (
            <button type="button" onClick={() => simpanUbah('hari')} disabled={!nmBaru.trim()}
              style={{ borderRadius: 10, border: 'none', background: '#F06BA8', color: '#fff', padding: '8px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
              Simpan
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            {isDefaultKeg && diubah && asli && onPulihkanKeg ? (
              <button type="button" onClick={() => { onPulihkanKeg(); setUbah(false); }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, color: '#8A5A74', textDecoration: 'underline' }}>
                Kembalikan ke bawaan Rekah ({asli.nm}{asli.wk ? `, ${asli.wk}` : ''}, to-do bawaan)
              </button>
            ) : <span />}
            <button type="button" onClick={() => setUbah(false)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#B79AAC' }}>Batal</button>
          </div>
        </div>
      )}

      {/* To-do groups */}
      {ORDER.map(tp => {
        const list = all.filter(i => i.tipe === tp);
        if (!list.length) return null;
        return (
          <div key={tp} style={{ marginTop: 11 }}>
            <div aria-hidden="true" style={{ borderTop: '1.5px dashed #F0DCE7', marginBottom: 9 }} />
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '.6px', textTransform: 'uppercase', color: labelWarna(tp), marginBottom: 8 }}>{LB[tp]}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {list.map(it => <React.Fragment key={it.id}>{(() => {
                const def = isDefault(it);
                if (it.tipe === 'kebiasaan') {
                  const c = (it.n ?? 'Kemandirian') as NilaiAkar;
                  const done = (centangHari[c] ?? []).includes(it.id);
                  return (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <button type="button" role="checkbox" aria-checked={done} aria-label={it.t} onClick={() => onToggleKeb(c, it.id)}
                        style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, borderRadius: 6, cursor: 'pointer', background: done ? '#F06BA8' : '#fff', border: done ? '2px solid #F06BA8' : '2px solid #E7CFDD', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'background .16s, border-color .16s' }}>
                        <Check style={{ width: 12, height: 12, opacity: done ? 1 : 0, transition: 'opacity .12s' }} stroke="#fff" strokeWidth={3.4} />
                      </button>
                      <span aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, display: 'block' }}>
                        <BungaNilai value={idNilai(c)} state={mekarDari(c) > 0 ? 'mekar' : 'istirahat'} size={20} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, lineHeight: 1.35, color: done ? '#8A5A74' : '#6E3B57', textDecoration: done ? 'line-through' : 'none', transition: 'color .16s' }}>{it.t}</div>
                        <div style={{ marginTop: 4 }}>
                          <span style={{ display: 'inline-block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, lineHeight: 1.3, color: '#6E3B57', background: '#FBEFF5', borderRadius: 999, padding: '2px 9px' }}>Menanam: {c}</span>
                          {it.sumber && (
                            <div style={{ marginTop: 5, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11, lineHeight: 1.45, color: '#A98BA0' }}>
                              Sumber: <TautanSumber sumber={it.sumber} ringkas />
                            </div>
                          )}
                        </div>
                      </div>
                      <button type="button" aria-label={`Hapus ${it.t}`} onClick={() => mintaHapus(it, def)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#C9AEBD', marginTop: 2, padding: 0, lineHeight: 1 }}>
                        <Trash2 style={{ width: 14, height: 14 }} strokeWidth={2} />
                      </button>
                    </div>
                  );
                }
                const t2 = it.tipe as 'main' | 'buku' | 'lainnya';
                const done = doneExtra.has(it.id);
                const [chipBg, chipInk] = CHIP[t2];
                return (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <button type="button" role="checkbox" aria-checked={done} aria-label={it.t} onClick={() => onToggleExtra(it.id)}
                      style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, borderRadius: 6, cursor: 'pointer', background: done ? '#F06BA8' : '#fff', border: done ? '2px solid #F06BA8' : '2px solid #E7CFDD', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'background .16s, border-color .16s' }}>
                      <Check style={{ width: 12, height: 12, opacity: done ? 1 : 0, transition: 'opacity .12s' }} stroke="#fff" strokeWidth={3.4} />
                    </button>
                    <MarkerNon tipe={t2} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, lineHeight: 1.35, color: done ? '#8A5A74' : '#6E3B57', textDecoration: done ? 'line-through' : 'none' }}>{it.t}</div>
                      {it.asal === 'rekah' && it.alasan && !done && (
                        <div style={{ marginTop: 3, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11, lineHeight: 1.45, color: '#A98BA0' }}>{it.alasan}</div>
                      )}
                      <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ display: 'inline-block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, lineHeight: 1.3, color: chipInk, background: chipBg, borderRadius: 999, padding: '2px 9px' }}>{it.labelSumber ?? SUBT[t2]}</span>
                        {it.asal === 'rekah' && <span style={{ display: 'inline-block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, lineHeight: 1.3, color: '#7A5CA6', background: '#F1EAFB', borderRadius: 999, padding: '2px 9px' }}>Disarankan Rekah</span>}
                        {!done && (t2 === 'main' || t2 === 'buku') && (it.asal === 'rekah'
                          ? !!onGanti && (jenisSaranRekah(it.id) === 'main' || jenisSaranRekah(it.id) === 'wawasan')
                          : !!onGantiPilih && !def) && (
                          <button type="button" aria-label={`Ganti ${it.t}`}
                            onClick={() => { if (it.asal === 'rekah') onGanti?.(kegKey, it.id); else onGantiPilih?.(it.id, t2 as 'main' | 'buku'); }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, lineHeight: 1.3, color: '#D2559A', background: '#fff', border: '1.5px solid #F4C6DC', borderRadius: 999, padding: '1px 9px', cursor: 'pointer' }}>
                            <RefreshCw style={{ width: 11, height: 11 }} strokeWidth={2.6} /> Ganti
                          </button>
                        )}
                        {param?.langkahPendek && <span style={{ display: 'inline-block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, lineHeight: 1.3, color: '#4F7A48', background: '#E7F2E4', borderRadius: 999, padding: '2px 9px' }}>versi singkat · beberapa menit</span>}
                      </div>
                    </div>
                    <button type="button" aria-label={`Hapus ${it.t}`} onClick={() => mintaHapus(it, def)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#C9AEBD', marginTop: 2, padding: 0, lineHeight: 1 }}>
                      <Trash2 style={{ width: 14, height: 14 }} strokeWidth={2} />
                    </button>
                  </div>
                );
              })()}{hapusId === it.id && menuHapus(it)}</React.Fragment>)}
            </div>
          </div>
        );
      })}

      {jmlDisembunyikan > 0 && (
        <p style={{ margin: '11px 0 0', display: 'flex', alignItems: 'flex-start', gap: 7, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, lineHeight: 1.5, color: '#4F7A48', background: '#E7F2E4', borderRadius: 12, padding: '9px 11px' }}>
          <Leaf style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} strokeWidth={2} /> {jmlDisembunyikan} aktivitas dijeda sementara agar hari terasa lebih ringan, mengikuti keadaan keluarga.
        </p>
      )}

      {/* Footer: tambah to-do */}
      <div style={{ marginTop: 11 }}>
        <button type="button" onClick={() => { if (menuOpen) { resetForm(); } else { setMenuOpen(true); setFormTipe(null); } }}
          style={{ width: '100%', textAlign: 'center', border: `1.5px dashed ${menuOpen ? '#F4B4D2' : '#EBD6E2'}`, borderRadius: 12, padding: 9, fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: menuOpen ? '#D2559A' : '#B79AAC', background: menuOpen ? '#FFF7FB' : 'none', cursor: 'pointer', transition: 'border-color .16s, color .16s, background .16s' }}>
          + tambah to-do list
        </button>
        {menuOpen && !formTipe && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, borderRadius: 12, border: '1.5px solid #F4D6E5', background: '#fff', padding: 6, boxShadow: '0 16px 34px -24px rgba(90,50,70,.6)' }}>
            {MENU.map(([tp, l]) => (
              <button key={tp} type="button" onClick={() => { if (tp === 'main' || tp === 'buku') { resetForm(); onOpenPicker(tp); } else { setFormTipe(tp); setTeks(''); setNilaiPilih(nilaiFokus[0] ?? ''); } }}
                style={{ textAlign: 'left', borderRadius: 8, padding: '9px 11px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#6E3B57', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FBF3F8')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>{l}</button>
            ))}
          </div>
        )}
        {menuOpen && formTipe && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 12, border: '1.5px solid #F4D6E5', background: '#fff', padding: 10, boxShadow: '0 16px 34px -24px rgba(90,50,70,.6)' }}>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase', color: labelWarna(formTipe) }}>{MENU.find(m => m[0] === formTipe)?.[1]}</div>
            <input autoFocus value={teks} onChange={e => setTeks(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitForm('hari'); if (e.key === 'Escape') resetForm(); }} placeholder={PH[formTipe]}
              style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #E7CFDD', padding: '9px 11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#6E3B57', outline: 'none', background: '#FFFDFE' }} />
            {formTipe === 'kebiasaan' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#8A5A74' }}>Nilai yang ditanam</span>
                <select value={nilaiPilih} onChange={e => setNilaiPilih(e.target.value as NilaiAkar)}
                  style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #E7CFDD', padding: '9px 11px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#6E3B57', background: '#FFFDFE', cursor: 'pointer' }}>
                  {nilaiFokus.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              {onTambahDefault ? (
                <>
                  <button type="button" onClick={() => submitForm('hari')} disabled={!teks.trim()} style={{ flex: 1, borderRadius: 10, border: '1.5px solid #F4B4D2', padding: '8px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: teks.trim() ? '#B4477F' : '#D9B8C8', background: '#fff', cursor: teks.trim() ? 'pointer' : 'default' }}>Hari ini saja</button>
                  <button type="button" onClick={() => submitForm('default')} disabled={!teks.trim()} style={{ flex: 1, borderRadius: 10, border: 'none', padding: '9px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#fff', background: teks.trim() ? '#C6407F' : '#E7C4D6', cursor: teks.trim() ? 'pointer' : 'default' }}>Jadikan default</button>
                </>
              ) : (
                <button type="button" onClick={() => submitForm('hari')} disabled={!teks.trim()} style={{ flex: 1, borderRadius: 10, border: 'none', padding: '9px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#fff', background: teks.trim() ? '#C6407F' : '#E7C4D6', cursor: teks.trim() ? 'pointer' : 'default' }}>Tambah</button>
              )}
              <button type="button" onClick={resetForm} style={{ borderRadius: 10, border: '1.5px solid #EBD6E2', padding: '9px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#8A5A74', background: 'none', cursor: 'pointer' }}>Batal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Papan utama ──────────────────────────────────────────────────────────────

export default function PapanKegiatan({ idAnak, tanggal, nilaiFokus, centangHari, onToggleKeb, mekarDari, param }: {
  idAnak: string;
  tanggal: string;
  nilaiFokus: readonly NilaiAkar[];
  centangHari: Record<string, string[]>;
  onToggleKeb: (n: NilaiAkar, id: string) => void;
  mekarDari: (n: NilaiAkar) => number;
  param?: ParameterPenyesuaian;
}) {
  const plan = useDayPlan(idAnak, tanggal);
  const { usiaBulan } = useChildProfile();
  const { publishedActivities } = useLearningStrategies();
  const { publishedCards: CARDS } = useKnowledgeLibrary(); // statis + kartu tayang dari admin
  const usia = usiaBulan ?? 0;
  const fokusSet = useMemo(() => new Set(nilaiFokus), [nilaiFokus]);
  const [picker, setPicker] = useState<{ kegKey: string; tipe: 'main' | 'buku'; ganti?: string; bisaDefault?: boolean } | null>(null);

  // Phase 21C/21D — saran yang DIPILIH REKAH (menggantikan saran statis template):
  //   Ajak Main → "Main bersama" · Wawasan Tumbuh → "Tidur siang" (cadangan: sebelum tidur)
  //   · langkah Temani aktif → kegiatan yang cocok. Disetir usia, yang diamati (Kompas),
  //   keadaan keluarga (Kehidupan Keluarga), dan perjalanan Temani. Tampil virtual;
  //   disimpan ke papan saat ditandai selesai (adopsi) agar tercatat & ikut Tinjau Minggu.
  const { anakAktif } = useAnak();
  const penyetir = useIdPenyetir(anakAktif?.id ?? idAnak); // yang terlihat ≤21 hari (Jurnal)
  const diamatiKunci = penyetir.join(',');
  const petaJawaban = usePetaStore(idAnak).jawaban;
  const petaMain = petaJawaban['a_main'] ?? [];
  const minatKunci = petaMain.join(',');
  const minatMain = domainMinat(petaMain);
  const hindariAlergen = alergenHindariDariPeta(petaJawaban);
  const rumahBahasa = bahasaRumahDariPeta(petaJawaban);
  const alergiKunci = [...hindariAlergen].sort().join(',');
  const journeys = useTemaniKatalog();
  const progresTemani = bacaProgresTemani(idAnak);
  const kunciTemani = progresTemani ? `${progresTemani.slug}:${progresTemani.status}:${progresTemani.mulaiTanggal ?? ''}` : '';
  const kegTampil = DEFAULT_KOLOM.flatMap(c => plan.orderedKeg(c.key).map(k => `${c.key}:${k.key}`)).join(',');
  const saranPerKeg = useMemo(() => saranRekahPerKeg({
    idAnak, tanggal, usiaBulan: usia, kegiatan: publishedActivities, kartu: CARDS,
    idObservasi: diamatiKunci ? diamatiKunci.split(',') : [], minat: minatMain, minatLabel: petaMain, hindariAlergen, dwibahasa: rumahBahasa.dwibahasa, param, store: plan.store,
    journeys, progresTemani,
    kegDiSlot: (slot) => kegTampil.split(',').filter(x => x.startsWith(`${slot}:`)).map(x => x.slice(slot.length + 1)),
    // progresTemani dibaca dari localStorage tiap render; kunciTemani mewakilinya.
  }), [idAnak, tanggal, usia, publishedActivities, CARDS, journeys, kunciTemani, diamatiKunci, minatKunci, alergiKunci, rumahBahasa.dwibahasa, param, plan.store, kegTampil]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sinkron dua arah Temani: status selesai langkah Temani dibaca & ditulis ke sumber
  // tunggal Temani (pilihan_harian), jadi centang di Kelola = centang di Temani.
  const adaTemani = Object.values(saranPerKeg).flat().some(it => it.id.startsWith('rk-tm-'))
    || Object.values(plan.store.extra).flat().some(it => it.id.startsWith('rk-tm-'));
  const temani = useTemaniSelesaiHari(idAnak, tanggal, adaTemani);
  const doneTemaniRk = Object.values(saranPerKeg).flat().concat(Object.values(plan.store.extra).flat())
    .filter(it => { const m = idTemaniDariRekah(it.id); return !!m && temani.ids.has(m.idTemani); })
    .map(it => it.id);
  const storeTampil = doneTemaniRk.length > 0 ? { ...plan.store, doneExtra: [...new Set([...plan.store.doneExtra, ...doneTemaniRk])] } : plan.store;
  const toggleTemani = (id: string) => {
    const m = idTemaniDariRekah(id);
    const j = m ? journeys.find(x => x.slug === m.slug) : undefined;
    const h = m && j ? j.hari.find(x => x.hari === m.hari) : undefined;
    if (!m || !j || !h) return false;
    const selesai = !temani.ids.has(m.idTemani);
    temani.setIds(prev => { const n = new Set(prev); if (selesai) n.add(m.idTemani); else n.delete(m.idTemani); return n; });
    tandaiLangkahTemani(idAnak, tanggal, j, h, selesai).catch(() => {
      temani.setIds(prev => { const n = new Set(prev); if (selesai) n.delete(m.idTemani); else n.add(m.idTemani); return n; });
      dispatchRekahError('Koneksi terputus — tanda selesai Temani belum tersimpan. Coba lagi ya.');
    });
    return true;
  };
  const toggleExtraRekah = (kegKey: string) => (id: string) => {
    if (id.startsWith('rk-tm-') && toggleTemani(id)) return;
    const cur = id.startsWith(AWALAN_REKAH) ? (saranPerKeg[kegKey] ?? []).find(s => s.id === id) : undefined;
    if (cur) plan.adopsi(kegKey, cur, true); else plan.toggleExtra(id);
  };

  const ajakMainList = useMemo<PilihanBekal[]>(() => {
    const band = bandAjakMain(usia);
    return publishedActivities.filter(a => band.has(a.ageId)).map(a => ({ id: `am-${a.id}`, judul: a.judul, ageKey: a.ageId }));
  }, [publishedActivities, usia]);
  const wawasanList = useMemo<PilihanBekal[]>(() => {
    const keys = wawasanKeys(usia);
    return CARDS.filter(c => keys.has(c.ageKey) && c.summary).map(c => ({ id: `wt-${c.id}`, judul: c.title, ageKey: c.ageKey }));
  }, [usia, CARDS]);

  return (
    <>
      <div className="overflow-x-auto -mx-1 px-1 pb-2 lg:overflow-visible lg:mx-0 lg:px-0">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, alignItems: 'start', minWidth: 620 }}>
          {DEFAULT_KOLOM.map(col => {
            const kegs = plan.orderedKeg(col.key);
            const cap = SLOT_CAP[col.key];
            return (
              <div key={col.key} className="animate-fade-in-up"
                style={{ display: 'flex', flexDirection: 'column', background: '#FFFBF2', borderRadius: '8px 8px 20px 20px', overflow: 'hidden', boxShadow: '0 18px 36px -30px rgba(90,50,70,.5)' }}>
                {/* Kepala botani */}
                <div aria-hidden="true" style={{ position: 'relative', height: 72, overflow: 'hidden', background: cap.bg }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: -6, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
                    {cap.bunga.map((b, i) => <Tanaman key={i} {...b} />)}
                  </div>
                </div>
                <div aria-hidden="true" style={{ display: 'flex', gap: 4, padding: '6px 12px 0', justifyContent: 'space-between' }}>
                  {RING.map(r => <span key={r} style={{ width: 6, height: 6, borderRadius: '50%', background: '#E4CDB4', display: 'block' }} />)}
                </div>
                {/* Isi slot */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '10px 12px 14px' }}>
                  <div>
                    <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57', lineHeight: 1.15 }}>{col.label}</div>
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: cap.subInk, marginTop: 2 }}>{cap.sub}</div>
                  </div>
                  {kegs.map((k, idx) => (
                    <KartuAktivitas key={k.key} kegKey={k.key} nm={k.nm} wk={k.wk} accent={col.dot}
                      badge={k.diubah === 'hari' ? 'diubah hari ini' : undefined}
                      isDefaultKeg={k.isDefault} diubah={k.diubah} asli={k.asli}
                      onUbahKeg={(nm, wk, cakupan) => plan.ubahKeg(col.key, k.key, nm, wk, cakupan)}
                      onPulihkanKeg={() => plan.pulihkanKeg(k.key)}
                      onTambahDefault={k.isDefault ? (tp, teks, nilai) => plan.tambahTodoDefault(k.key, tp, teks, nilai) : undefined}
                      onHapusDefault={k.isDefault ? id => plan.hapusTodoDefault(k.key, id) : undefined}
                      items={[...saringKebiasaanKartu(k.items, usia, fokusSet), ...(saranPerKeg[k.key] ?? [])]} extra={plan.store.extra[k.key] ?? []} store={storeTampil} centangHari={centangHari} mekarDari={mekarDari} fokusSet={fokusSet} nilaiFokus={nilaiFokus}
                      onToggleKeb={onToggleKeb} onToggleExtra={toggleExtraRekah(k.key)} onHide={plan.hideItem} onDelExtra={plan.delExtra} onGanti={plan.gantiRekah} onGantiPilih={(id, tp) => setPicker({ kegKey: k.key, tipe: tp, ganti: id })} onAddExtra={plan.addExtra}
                      onOpenPicker={tp => setPicker({ kegKey: k.key, tipe: tp, bisaDefault: k.isDefault })}
                      onDelKeg={() => k.isDefault ? plan.hideKeg(k.key) : plan.delKeg(col.key, k.key)}
                      onUp={() => plan.reorder(col.key, k.key, -1)} onDown={() => plan.reorder(col.key, k.key, 1)}
                      canUp={idx > 0} canDown={idx < kegs.length - 1}
                      param={param} />
                  ))}
                  <TambahKegiatanRow onAdd={(nm, wk) => plan.addKeg(col.key, nm, wk)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {picker && (
        <BekalPicker tipe={picker.tipe} items={picker.tipe === 'main' ? ajakMainList : wawasanList} usiaBulan={usia}
          ganti={picker.ganti ? Object.values(plan.store.extra).flat().find(e => e.id === picker.ganti)?.t : undefined}
          bisaDefault={picker.bisaDefault}
          onPick={(judul, cakupan) => {
            if (picker.ganti) plan.gantiExtra(picker.kegKey, picker.ganti, judul);
            else if (cakupan === 'default') plan.tambahTodoDefault(picker.kegKey, picker.tipe, judul);
            else plan.addExtra(picker.kegKey, picker.tipe, judul);
            setPicker(null);
          }}
          onClose={() => setPicker(null)} />
      )}
    </>
  );
}
