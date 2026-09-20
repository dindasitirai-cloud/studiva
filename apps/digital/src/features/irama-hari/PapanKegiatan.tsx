// =============================================================
// PapanKegiatan — papan 3 kolom (Pagi/Siang/Malam) bersama untuk Kelola.
// Dipakai oleh "Hari Ini" (tanggal berjalan) dan "Rencana Minggu" (tanggal mana
// pun) dengan satu sumber data per tanggal (useDayPlan). Mendukung kegiatan
// default, tambah kegiatan & to-do (4 jenis, termasuk pilih dari Bekal), hapus,
// dan atur urutan lewat tombol naik/turun. Copy DRAFT — review Fitri.
// =============================================================
import React, { useMemo, useState } from 'react';
import { Trash2, Check, Pencil, X, ChevronUp, ChevronDown, Leaf } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import BungaNilai from '../../components/BungaNilai';
import IlustrasiKegiatan from './IlustrasiKegiatan';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import { CARDS } from '../../pages/DashboardPages/Tier2/knowledgeCardData';
import {
  useDayPlan, DEFAULT_KOLOM, LB, SUBT, TINT, CHIP, labelWarna, idNilai, ORDER,
} from './dayPlanData';
import type { Tipe, Item, Store } from './dayPlanData';
import type { ParameterPenyesuaian } from './kehidupanData';

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

interface PilihanBekal { id: string; judul: string; sub?: string }

function ajakMainBandIds(usiaBulan: number): Set<string> {
  if (usiaBulan < 12) return new Set(['b03', 'b36', 'b69', 'b912']);
  if (usiaBulan < 24) return new Set(['t1218', 't1824']);
  if (usiaBulan < 36) return new Set(['u23']);
  if (usiaBulan < 48) return new Set(['u34']);
  if (usiaBulan < 60) return new Set(['u45']);
  return new Set(['u56']);
}
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

function BekalPicker({ tipe, items, onPick, onClose }: {
  tipe: 'main' | 'buku'; items: PilihanBekal[]; onPick: (judul: string) => void; onClose: () => void;
}) {
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
            <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57', margin: '2px 0 0' }}>{judul}</h3>
          </div>
          <button type="button" aria-label="Tutup" onClick={onClose} style={{ flexShrink: 0, background: '#FBF3F8', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8A5A74' }}>
            <X style={{ width: 16, height: 16 }} strokeWidth={2.4} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '12px 14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {items.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74', padding: '18px 6px', textAlign: 'center' }}>Belum ada item untuk usia ini di Bekal.</div>
          ) : items.map(it => (
            <button key={it.id} type="button" onClick={() => onPick(it.judul)}
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
        style={{ border: '1.8px dashed #F4B4D2', borderRadius: 20, padding: 14, textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, color: '#D2559A', cursor: 'pointer', background: hov ? '#fff' : 'rgba(255,255,255,.45)', transition: 'background .16s', width: '100%' }}>
        + tambah kegiatan
      </button>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, border: '1.8px dashed #F4B4D2', borderRadius: 20, padding: 12, background: '#fff' }}>
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
  param,
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

  const resetForm = () => { setMenuOpen(false); setFormTipe(null); setTeks(''); setNilaiPilih(''); };
  const submitForm = () => {
    const t = teks.trim(); if (!t) return;
    if (formTipe === 'kebiasaan') { onAddExtra(kegKey, 'kebiasaan', t, (nilaiPilih || nilaiFokus[0]) as NilaiAkar); }
    else if (formTipe) { onAddExtra(kegKey, formTipe, t); }
    resetForm();
  };
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
      style={{ background: '#fff', borderRadius: 22, padding: '16px 16px 14px', boxShadow: hovered ? '0 22px 44px -34px rgba(90,50,70,.55)' : '0 18px 40px -34px rgba(90,50,70,.55)', transform: hovered ? 'translateY(-3px)' : 'translateY(0)', transition: 'transform .22s cubic-bezier(.2,.7,.2,1), box-shadow .22s ease' }}>
      {/* Head */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span aria-hidden="true" style={{ width: 5, height: 34, flexShrink: 0, borderRadius: 999, background: accent, display: 'block' }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 16, color: '#6E3B57', lineHeight: 1.2 }}>{nm}</div>
          {wk && <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#B79AAC', marginTop: 1 }}>{wk}</div>}
          {badge && <span style={{ display: 'inline-block', marginTop: 4, fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 9.5, letterSpacing: '.4px', textTransform: 'uppercase', color: '#B4477F', background: '#FCE4EE', borderRadius: 999, padding: '2px 8px' }}>{badge}</span>}
        </div>
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

      {/* To-do groups */}
      {ORDER.map(tp => {
        const list = all.filter(i => i.tipe === tp);
        if (!list.length) return null;
        return (
          <div key={tp} style={{ marginTop: 12 }}>
            <div aria-hidden="true" style={{ borderTop: '1.5px dashed #F0DCE7', marginBottom: 10 }} />
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '.7px', textTransform: 'uppercase', color: labelWarna(tp), marginBottom: 9 }}>{LB[tp]}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {list.map(it => {
                const def = isDefault(it);
                if (it.tipe === 'kebiasaan') {
                  const c = (it.n ?? 'Kemandirian') as NilaiAkar;
                  const done = (centangHari[c] ?? []).includes(it.id);
                  return (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <button type="button" role="checkbox" aria-checked={done} aria-label={it.t} onClick={() => onToggleKeb(c, it.id)}
                        style={{ width: 22, height: 22, flexShrink: 0, marginTop: 1, borderRadius: 7, cursor: 'pointer', background: done ? '#F06BA8' : '#fff', border: done ? '2px solid #F06BA8' : '2px solid #E7CFDD', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'background .16s, border-color .16s' }}>
                        <Check style={{ width: 13, height: 13, opacity: done ? 1 : 0, transition: 'opacity .12s' }} stroke="#fff" strokeWidth={3.4} />
                      </button>
                      <span aria-hidden="true" style={{ width: 21, height: 21, flexShrink: 0, marginTop: 1, display: 'block' }}>
                        <BungaNilai value={idNilai(c)} state={mekarDari(c) > 0 ? 'mekar' : 'istirahat'} size={21} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, lineHeight: 1.35, color: done ? '#8A5A74' : '#6E3B57', textDecoration: done ? 'line-through' : 'none', transition: 'color .16s' }}>{it.t}</div>
                        <div style={{ marginTop: 5 }}>
                          <span style={{ display: 'inline-block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, lineHeight: 1.3, color: '#6E3B57', background: '#FBEFF5', borderRadius: 999, padding: '3px 10px' }}>Menanam: {c}</span>
                        </div>
                      </div>
                      <button type="button" aria-label={`Hapus ${it.t}`} onClick={() => def ? onHide(it.id) : onDelExtra(kegKey, it.id)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#C9AEBD', marginTop: 2, padding: 0, lineHeight: 1 }}>
                        <Trash2 style={{ width: 14, height: 14 }} strokeWidth={2} />
                      </button>
                    </div>
                  );
                }
                const t2 = it.tipe as 'main' | 'buku' | 'lainnya';
                const done = doneExtra.has(it.id);
                const [chipBg, chipInk] = CHIP[t2];
                return (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <button type="button" role="checkbox" aria-checked={done} aria-label={it.t} onClick={() => onToggleExtra(it.id)}
                      style={{ width: 22, height: 22, flexShrink: 0, marginTop: 1, borderRadius: 7, cursor: 'pointer', background: done ? '#F06BA8' : '#fff', border: done ? '2px solid #F06BA8' : '2px solid #E7CFDD', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'background .16s, border-color .16s' }}>
                      <Check style={{ width: 13, height: 13, opacity: done ? 1 : 0, transition: 'opacity .12s' }} stroke="#fff" strokeWidth={3.4} />
                    </button>
                    <MarkerNon tipe={t2} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, lineHeight: 1.35, color: done ? '#8A5A74' : '#6E3B57', textDecoration: done ? 'line-through' : 'none' }}>{it.t}</div>
                      <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ display: 'inline-block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, lineHeight: 1.3, color: chipInk, background: chipBg, borderRadius: 999, padding: '3px 10px' }}>{SUBT[t2]}</span>
                        {param?.langkahPendek && <span style={{ display: 'inline-block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, lineHeight: 1.3, color: '#4F7A48', background: '#E7F2E4', borderRadius: 999, padding: '3px 10px' }}>versi singkat · beberapa menit</span>}
                      </div>
                    </div>
                    <button type="button" aria-label={`Hapus ${it.t}`} onClick={() => def ? onHide(it.id) : onDelExtra(kegKey, it.id)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#C9AEBD', marginTop: 2, padding: 0, lineHeight: 1 }}>
                      <Trash2 style={{ width: 14, height: 14 }} strokeWidth={2} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {jmlDisembunyikan > 0 && (
        <p style={{ margin: '12px 0 0', display: 'flex', alignItems: 'flex-start', gap: 7, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, lineHeight: 1.5, color: '#4F7A48', background: '#E7F2E4', borderRadius: 12, padding: '9px 11px' }}>
          <Leaf style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} strokeWidth={2} /> {jmlDisembunyikan} aktivitas dijeda sementara agar hari terasa lebih ringan, mengikuti keadaan keluarga.
        </p>
      )}

      {/* Footer: tambah to-do */}
      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={() => { if (menuOpen) { resetForm(); } else { setMenuOpen(true); setFormTipe(null); } }}
          style={{ width: '100%', textAlign: 'center', border: `1.5px dashed ${menuOpen ? '#F4B4D2' : '#EBD6E2'}`, borderRadius: 14, padding: 10, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: menuOpen ? '#D2559A' : '#B79AAC', background: menuOpen ? '#FFF7FB' : 'none', cursor: 'pointer', transition: 'border-color .16s, color .16s, background .16s' }}>
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
            <input autoFocus value={teks} onChange={e => setTeks(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitForm(); if (e.key === 'Escape') resetForm(); }} placeholder={PH[formTipe]}
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
              <button type="button" onClick={submitForm} disabled={!teks.trim()} style={{ flex: 1, borderRadius: 10, border: 'none', padding: '9px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#fff', background: teks.trim() ? '#C6407F' : '#E7C4D6', cursor: teks.trim() ? 'pointer' : 'default' }}>Tambah</button>
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
  const usia = usiaBulan ?? 0;
  const fokusSet = useMemo(() => new Set(nilaiFokus), [nilaiFokus]);
  const [picker, setPicker] = useState<{ kegKey: string; tipe: 'main' | 'buku' } | null>(null);

  const ajakMainList = useMemo<PilihanBekal[]>(() => {
    const band = ajakMainBandIds(usia);
    return publishedActivities.filter(a => band.has(a.ageId)).map(a => ({ id: `am-${a.id}`, judul: a.judul }));
  }, [publishedActivities, usia]);
  const wawasanList = useMemo<PilihanBekal[]>(() => {
    const keys = wawasanKeys(usia);
    return CARDS.filter(c => keys.has(c.ageKey) && c.summary).map(c => ({ id: `wt-${c.id}`, judul: c.title }));
  }, [usia]);

  return (
    <>
      <div className="overflow-x-auto -mx-1 px-1 pb-2 lg:overflow-visible lg:mx-0 lg:px-0">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18, alignItems: 'start', minWidth: 820 }}>
          {DEFAULT_KOLOM.map(col => {
            const kegs = plan.orderedKeg(col.key);
            return (
              <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: col.soft, borderRadius: 28, padding: '16px 14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 4px 0' }}>
                  <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: col.dot, display: 'block', flexShrink: 0 }} />
                  <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 21, color: '#6E3B57', margin: 0 }}>{col.label}</h2>
                </div>
                {kegs.map((k, idx) => (
                  <KartuAktivitas key={k.key} kegKey={k.key} nm={k.nm} wk={k.wk} accent={col.dot}
                    items={k.items} extra={plan.store.extra[k.key] ?? []} store={plan.store} centangHari={centangHari} mekarDari={mekarDari} fokusSet={fokusSet} nilaiFokus={nilaiFokus}
                    onToggleKeb={onToggleKeb} onToggleExtra={plan.toggleExtra} onHide={plan.hideItem} onDelExtra={plan.delExtra} onAddExtra={plan.addExtra}
                    onOpenPicker={tp => setPicker({ kegKey: k.key, tipe: tp })}
                    onDelKeg={() => k.isDefault ? plan.hideKeg(k.key) : plan.delKeg(col.key, k.key)}
                    onUp={() => plan.reorder(col.key, k.key, -1)} onDown={() => plan.reorder(col.key, k.key, 1)}
                    canUp={idx > 0} canDown={idx < kegs.length - 1}
                    param={param} />
                ))}
                <TambahKegiatanRow onAdd={(nm, wk) => plan.addKeg(col.key, nm, wk)} />
              </div>
            );
          })}
        </div>
      </div>

      {picker && (
        <BekalPicker tipe={picker.tipe} items={picker.tipe === 'main' ? ajakMainList : wawasanList}
          onPick={judul => { plan.addExtra(picker.kegKey, picker.tipe, judul); setPicker(null); }}
          onClose={() => setPicker(null)} />
      )}
    </>
  );
}
