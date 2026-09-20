// =============================================================
// KehidupanKeluarga — tab "Kehidupan Keluarga" di Kelola (Phase 15C · Tahap inti).
// Kelola sebagai CONTEXT ENGINE: orang tua mencatat "yang sedang berubah" di
// keluarga → Rekah menampilkan bagaimana ia menyesuaikan saran (mesin adaptasi
// sederhana). Bagian: Hero "Keadaan sekarang" · Yang sedang berubah (CRUD +
// 3-layer "kenapa" + "sudah tenang") · panel "Bagaimana Rekah menyesuaikan".
//
// INVARIANT: Langit Peony; tanpa skor/level/persen; tanpa diagnosis/defisit;
// "sudah tenang" (bukan "selesai"); AI diberi label; escape hatch (ubah/hapus).
// Konten baru (4 bidang detail, Cara mengasuh, Peristiwa) = tahap lanjut.
// SEMUA copy DRAFT → tinjauan Psikolog Fitri Effendy.
// =============================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Baby, Users2, Home, CalendarDays, Plus, Sparkles, X, ChevronDown, Pencil, Leaf, Trash2, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { useAnak } from '../../context/AnakContext';
import { useInboxStore } from './inboxData';
import {
  useKehidupanStore, useBidangStore, useCaraStore, usePeristiwaStore, ringkasPenyesuaian, kalimatKeadaan,
  BIDANG, SEJAK_LABEL, STATUS_LABEL, COPY_TAG, TAG_PER_BIDANG,
  SIAPA_LABEL, SIAPA_WARNA, JENIS_LABEL, JENIS_WARNA,
} from './kehidupanData';
import type {
  KonteksKehidupan, BidangKehidupan, SejakKapan, TagPenyesuaian, StatusKonteks, FaktaBidang, BidangPeta,
  CaraMengasuh, SiapaPengasuh, Peristiwa, JenisPeristiwa,
} from './kehidupanData';

const IKON_BIDANG: Record<BidangKehidupan, LucideIcon> = {
  anak: Baby, caregiver: Users2, rumah: Home, peristiwa: CalendarDays,
};

const PLUM = '#6E3B57';
const PINK = '#F06BA8';
const PINK_TUA = '#C6407F';
const KABUT = '#B79AAC';
const GARIS = 'rgba(110,59,87,.1)';

// ─── Draft form ───────────────────────────────────────────────────────────────

interface DraftKonteks {
  id?: string;
  bidang: BidangKehidupan;
  judul: string;
  catatan: string;
  sejak: SejakKapan;
  tag: TagPenyesuaian;
  status: StatusKonteks;
}
const DRAFT_BARU: DraftKonteks = { bidang: 'anak', judul: '', catatan: '', sejak: 'beberapa_minggu', tag: 'tidur', status: 'aktif' };

// ─── Komponen kecil ─────────────────────────────────────────────────────────

function Seg<T extends string>({ value, options, onPick }: { value: T; options: readonly (readonly [T, string])[]; onPick: (v: T) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(([v, l]) => {
        const on = v === value;
        return (
          <button key={v} type="button" onClick={() => onPick(v)}
            style={{ border: on ? `1px solid ${PLUM}` : `1px solid ${GARIS}`, background: on ? PLUM : '#fff', color: on ? '#fff' : '#8A5A74', borderRadius: 999, padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

function KartuKonteks({ k, onPerbarui, onTenang, onHapus }: {
  k: KonteksKehidupan; onPerbarui: () => void; onTenang: () => void; onHapus: () => void;
}) {
  const [buka, setBuka] = useState(false);
  const b = BIDANG[k.bidang];
  const Ikon = IKON_BIDANG[k.bidang];
  const copy = COPY_TAG[k.tag];
  return (
    <div style={{ background: '#fff', border: `1px solid ${GARIS}`, borderLeft: `5px solid ${b.bar}`, borderRadius: 14, padding: '15px 16px', boxShadow: '0 10px 24px -20px rgba(90,50,70,.7)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
        <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: '70% 70% 70% 6px', background: b.tile, color: b.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ikon size={21} strokeWidth={2} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 15.5, color: PLUM, lineHeight: 1.25 }}>{k.judul}</span>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '.02em', textTransform: 'uppercase', color: b.ink, background: b.tile, borderRadius: 6, padding: '2px 8px' }}>{b.label}</span>
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#8A5A74', marginTop: 3 }}>
            {k.catatan ? `${k.catatan} ` : ''}
            <span style={{ fontWeight: 700, color: KABUT, background: '#FBF3F8', borderRadius: 999, padding: '1px 9px', whiteSpace: 'nowrap' }}>{SEJAK_LABEL[k.sejak]}</span>
            {k.status === 'membaik' && <span style={{ fontWeight: 800, color: '#3F7A4F', background: '#E4F3EB', borderRadius: 999, padding: '1px 9px', marginLeft: 6 }}>mulai membaik</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <button type="button" onClick={() => setBuka(o => !o)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: PINK, color: '#fff', border: 'none', borderRadius: 10, padding: '6px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>
          Bagaimana ini memengaruhi Rekah <ChevronDown size={14} strokeWidth={2.6} style={{ transform: buka ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        <button type="button" onClick={onPerbarui} style={miniBtn}><Pencil size={13} strokeWidth={2.4} /> Perbarui</button>
        <button type="button" onClick={onTenang} style={{ ...miniBtn, color: '#3F7A4F', background: '#E4F3EB', border: '1px solid #CDE8D6' }}><Leaf size={13} strokeWidth={2.4} /> Tandai sudah tenang</button>
        <button type="button" onClick={onHapus} style={{ ...miniBtn, color: KABUT }}>Hapus</button>
      </div>

      {buka && (
        <div style={{ marginTop: 12, background: '#FBF6F1', borderRadius: 12, padding: '4px 15px' }}>
          {[['Yang Rekah lakukan', copy.lakukan], ['Kenapa', copy.kenapa], ['Rujukan', copy.rujukan]].map(([nm, tx], i) => (
            <div key={nm} style={{ padding: '10px 0', borderBottom: i < 2 ? `1px dashed ${GARIS}` : 'none' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '.05em', textTransform: 'uppercase', color: '#7A5CA6', marginBottom: 2 }}>{nm}</div>
              <div style={{ fontFamily: nm === 'Rujukan' ? 'Fraunces, serif' : 'Nunito, sans-serif', fontStyle: nm === 'Rujukan' ? 'italic' : 'normal', fontWeight: 600, fontSize: nm === 'Rujukan' ? 12 : 13, color: nm === 'Rujukan' ? KABUT : '#6E3B57', lineHeight: 1.5 }}>{tx}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const miniBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', color: '#8A5A74',
  border: `1px solid ${GARIS}`, borderRadius: 10, padding: '6px 12px',
  fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer',
};

// ─── Modal Tambah / Perbarui ──────────────────────────────────────────────────

function ModalKonteks({ draft, onChange, onSimpan, onTutup }: {
  draft: DraftKonteks; onChange: (d: DraftKonteks) => void; onSimpan: () => void; onTutup: () => void;
}) {
  const tagOptions = TAG_PER_BIDANG[draft.bidang].map(t => [t, COPY_TAG[t].label] as const);
  return (
    <div onClick={onTutup} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(74,53,80,.34)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#FBF6F1', borderRadius: 22, boxShadow: '0 30px 60px -30px rgba(74,53,80,.5)' }}>
        <div style={{ position: 'relative', background: '#fff', borderRadius: '22px 22px 0 0', borderBottom: `1px solid ${GARIS}`, padding: '20px 22px 16px' }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.05em', color: '#7A5CA6' }}>Kehidupan Keluarga</div>
          <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 20, color: PLUM, margin: '4px 0 0' }}>{draft.id ? 'Perbarui keadaan' : 'Ceritakan yang sedang berubah'}</h3>
          <button type="button" onClick={onTutup} aria-label="Tutup" style={{ position: 'absolute', top: 18, right: 18, width: 32, height: 32, borderRadius: 10, background: '#FBF3F8', border: 'none', color: '#8A5A74', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} strokeWidth={2.4} /></button>
        </div>

        <div style={{ padding: '20px 22px' }}>
          <label style={lbl}>Apa yang sedang berubah?</label>
          <input value={draft.judul} onChange={e => onChange({ ...draft, judul: e.target.value })} placeholder="mis. tidur malam belum stabil" style={inp} />

          <label style={{ ...lbl, marginTop: 16 }}>Bidang</label>
          <Seg value={draft.bidang} onPick={v => {
            const tags = TAG_PER_BIDANG[v];
            onChange({ ...draft, bidang: v, tag: tags.includes(draft.tag) ? draft.tag : tags[0] });
          }} options={(Object.keys(BIDANG) as BidangKehidupan[]).map(b => [b, BIDANG[b].label] as const)} />

          <label style={{ ...lbl, marginTop: 16 }}>Sejak kapan (perkiraan)</label>
          <Seg value={draft.sejak} onPick={v => onChange({ ...draft, sejak: v })}
            options={(Object.keys(SEJAK_LABEL) as SejakKapan[]).map(s => [s, SEJAK_LABEL[s]] as const)} />

          <label style={{ ...lbl, marginTop: 16 }}>Jenisnya paling dekat ke</label>
          <Seg value={draft.tag} onPick={v => onChange({ ...draft, tag: v })} options={tagOptions} />
          {COPY_TAG[draft.tag].baris && (
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: KABUT, margin: '8px 0 0', lineHeight: 1.5 }}>
              Rekah akan: {COPY_TAG[draft.tag].baris}
            </p>
          )}

          <label style={{ ...lbl, marginTop: 16 }}>Ceritakan sedikit (opsional)</label>
          <textarea value={draft.catatan} onChange={e => onChange({ ...draft, catatan: e.target.value })} placeholder="Satu kalimat pun cukup." style={{ ...inp, minHeight: 74, resize: 'vertical' }} />

          {draft.id && (
            <>
              <label style={{ ...lbl, marginTop: 16 }}>Status</label>
              <Seg value={draft.status} onPick={v => onChange({ ...draft, status: v })}
                options={(Object.keys(STATUS_LABEL) as StatusKonteks[]).map(s => [s, STATUS_LABEL[s]] as const)} />
            </>
          )}

          <div style={{ display: 'flex', gap: 9, marginTop: 12, background: '#EFE9FB', borderRadius: 12, padding: '11px 13px' }}>
            <Sparkles size={16} strokeWidth={2} color="#7A5CA6" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: '#6E3B57', lineHeight: 1.5 }}>
              Rekah memakai ini untuk menyesuaikan saran — bukan untuk menilai. Kamu bisa mengubah atau menghapusnya kapan saja.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 22px 18px' }}>
          <button type="button" onClick={onTutup} style={{ flex: 1, borderRadius: 12, border: `1px solid ${GARIS}`, background: '#fff', color: '#8A5A74', padding: '11px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>Batal</button>
          <button type="button" onClick={onSimpan} disabled={!draft.judul.trim()} style={{ flex: 1, borderRadius: 12, border: 'none', background: draft.judul.trim() ? PINK_TUA : '#E6C9D8', color: '#fff', padding: '11px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13.5, cursor: draft.judul.trim() ? 'pointer' : 'default' }}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: PLUM, marginBottom: 7 };
const inp: React.CSSProperties = { width: '100%', border: `1px solid ${GARIS}`, borderRadius: 12, padding: '11px 13px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13.5, color: '#6E3B57', background: '#fff', outline: 'none' };

// ─── Peta bidang (accordion) — 3C-b ──────────────────────────────────────────

const miniLink: React.CSSProperties = { flexShrink: 0, background: 'none', border: 'none', color: '#C6407F', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 };

function Bidang({ label, sub, Ikon, tile, ink, open, onToggle, children }: {
  label: string; sub: string; Ikon: LucideIcon; tile: string; ink: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ border: `1px solid ${GARIS}`, borderRadius: 14, overflow: 'hidden', background: '#fff', marginBottom: 12 }}>
      <button type="button" onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: '70% 70% 70% 6px', background: tile, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ikon size={19} strokeWidth={2} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 15, color: PLUM }}>{label}</span>
          <span style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontSize: 12.5, color: KABUT }}>{sub}</span>
        </span>
        <ChevronDown size={20} strokeWidth={2} color={KABUT} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />
      </button>
      {open && <div style={{ padding: '2px 16px 16px' }}>{children}</div>}
    </div>
  );
}

function BarisFakta({ f, onUbah, onHapus, aksiInbox }: { f: FaktaBidang; onUbah: (v: string) => void; onHapus: () => void; aksiInbox?: () => void }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(f.v);
  const simpan = () => { const t = v.trim(); if (t) onUbah(t); setEdit(false); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderTop: `1px dashed ${GARIS}` }}>
      <span style={{ flex: '0 0 128px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74' }}>{f.k}</span>
      {edit ? (
        <input autoFocus value={v} onChange={e => setV(e.target.value)} onBlur={simpan}
          onKeyDown={e => { if (e.key === 'Enter') simpan(); if (e.key === 'Escape') { setV(f.v); setEdit(false); } }}
          style={{ flex: 1, minWidth: 0, border: `1px solid ${GARIS}`, borderRadius: 9, padding: '6px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: PLUM, outline: 'none' }} />
      ) : (
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: PLUM }}>{f.v}</span>
      )}
      {aksiInbox && !edit && <button type="button" onClick={aksiInbox} style={miniLink}>→ Inbox</button>}
      {!edit && <button type="button" onClick={() => { setV(f.v); setEdit(true); }} style={miniLink}>ubah</button>}
      <button type="button" onClick={onHapus} aria-label="Hapus" style={{ ...miniLink, color: KABUT }}><Trash2 size={13} strokeWidth={2} /></button>
    </div>
  );
}

function TambahFakta({ onAdd }: { onAdd: (k: string, v: string) => void }) {
  const [buka, setBuka] = useState(false);
  const [k, setK] = useState(''); const [v, setV] = useState('');
  const simpan = () => { if (!k.trim() || !v.trim()) return; onAdd(k, v); setK(''); setV(''); setBuka(false); };
  if (!buka) return <button type="button" onClick={() => setBuka(true)} style={{ ...miniLink, color: '#8A5A74', marginTop: 12 }}><Plus size={13} strokeWidth={2.4} /> Tambah catatan</button>;
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
      <input autoFocus value={k} onChange={e => setK(e.target.value)} placeholder="Label (mis. Tidur siang)"
        style={{ flex: '1 1 120px', minWidth: 0, border: `1px solid ${GARIS}`, borderRadius: 9, padding: '7px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: PLUM, outline: 'none' }} />
      <input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') simpan(); }} placeholder="Keterangan"
        style={{ flex: '2 1 160px', minWidth: 0, border: `1px solid ${GARIS}`, borderRadius: 9, padding: '7px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12.5, color: PLUM, outline: 'none' }} />
      <button type="button" onClick={simpan} style={{ background: PINK_TUA, color: '#fff', border: 'none', borderRadius: 9, padding: '7px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Tambah</button>
    </div>
  );
}

// ─── Cara kita mengasuh & Peristiwa — 3C-c ───────────────────────────────────

const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function tglPecah(iso: string): { hari: string; bulan: string } {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return { hari: '–', bulan: '' };
  return { hari: String(d.getDate()), bulan: BULAN_SINGKAT[d.getMonth()] ?? '' };
}

function KartuCara({ c, onUbah, onToggle, onHapus }: { c: CaraMengasuh; onUbah: (teks: string) => void; onToggle: () => void; onHapus: () => void }) {
  const [edit, setEdit] = useState(false);
  const [t, setT] = useState(c.teks);
  const w = SIAPA_WARNA[c.siapa];
  const simpan = () => { const x = t.trim(); if (x) onUbah(x); setEdit(false); };
  return (
    <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', border: `1px solid ${GARIS}`, borderRadius: 14, padding: '14px 16px', background: '#fff' }}>
      <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: '70% 70% 70% 6px', background: w.tile, color: w.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 14 }}>{SIAPA_LABEL[c.siapa][0]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 14, color: PLUM }}>{SIAPA_LABEL[c.siapa]}</div>
        {edit ? (
          <textarea autoFocus value={t} onChange={e => setT(e.target.value)} onBlur={simpan}
            style={{ width: '100%', marginTop: 4, minHeight: 54, resize: 'vertical', border: `1px solid ${GARIS}`, borderRadius: 10, padding: '8px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: PLUM, outline: 'none' }} />
        ) : (
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13.5, color: '#8A5A74', marginTop: 2, lineHeight: 1.5 }}>“{c.teks}”</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={onToggle} style={{ ...miniLink, color: c.dibagikan ? '#4F7A48' : KABUT }}>{c.dibagikan ? '✓ dibagikan ke semua pengasuh' : 'bagikan ke semua pengasuh'}</button>
          <button type="button" onClick={() => { setT(c.teks); setEdit(true); }} style={miniLink}>ubah</button>
          <button type="button" onClick={onHapus} aria-label="Hapus" style={{ ...miniLink, color: KABUT }}><Trash2 size={13} strokeWidth={2} /></button>
        </div>
      </div>
    </div>
  );
}

function TambahCara({ onAdd }: { onAdd: (siapa: SiapaPengasuh, teks: string, dibagikan: boolean) => void }) {
  const [buka, setBuka] = useState(false);
  const [siapa, setSiapa] = useState<SiapaPengasuh>('bunda');
  const [teks, setTeks] = useState('');
  const [bagikan, setBagikan] = useState(true);
  const simpan = () => { if (!teks.trim()) return; onAdd(siapa, teks, bagikan); setTeks(''); setSiapa('bunda'); setBagikan(true); setBuka(false); };
  if (!buka) return <button type="button" onClick={() => setBuka(true)} style={{ ...miniLink, color: '#8A5A74' }}><Plus size={13} strokeWidth={2.4} /> Tambah kesepakatan</button>;
  return (
    <div style={{ border: `1px solid ${GARIS}`, borderRadius: 14, padding: '14px 16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Seg value={siapa} onPick={setSiapa} options={(Object.keys(SIAPA_LABEL) as SiapaPengasuh[]).map(s => [s, SIAPA_LABEL[s]] as const)} />
      <textarea autoFocus value={teks} onChange={e => setTeks(e.target.value)} placeholder="mis. beri kesempatan mencoba sendiri sebelum dibantu"
        style={{ minHeight: 56, resize: 'vertical', border: `1px solid ${GARIS}`, borderRadius: 10, padding: '8px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: PLUM, outline: 'none' }} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#8A5A74' }}>
        <input type="checkbox" checked={bagikan} onChange={e => setBagikan(e.target.checked)} /> Bagikan ke semua pengasuh
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={simpan} style={{ background: PINK_TUA, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>Simpan</button>
        <button type="button" onClick={() => setBuka(false)} style={{ background: 'none', border: `1px solid ${GARIS}`, color: '#8A5A74', borderRadius: 10, padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>Batal</button>
      </div>
    </div>
  );
}

function BarisPeristiwa({ p, onHapus }: { p: Peristiwa; onHapus: () => void }) {
  const { hari, bulan } = tglPecah(p.tanggal);
  const w = JENIS_WARNA[p.jenis];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, border: `1px solid ${GARIS}`, borderRadius: 14, padding: '12px 14px', background: '#fff' }}>
      <div style={{ width: 46, flexShrink: 0, textAlign: 'center', background: w.tile, color: w.ink, borderRadius: 11, padding: '5px 0' }}>
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 17, lineHeight: 1 }}>{hari}</div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>{bulan}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: PLUM }}>{p.judul}</div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: w.ink }}>{JENIS_LABEL[p.jenis]}</div>
      </div>
      <button type="button" onClick={onHapus} aria-label="Hapus" style={{ ...miniLink, color: KABUT }}><Trash2 size={14} strokeWidth={2} /></button>
    </div>
  );
}

function TambahPeristiwa({ onAdd }: { onAdd: (judul: string, tanggal: string, jenis: JenisPeristiwa) => void }) {
  const [buka, setBuka] = useState(false);
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jenis, setJenis] = useState<JenisPeristiwa>('kesehatan');
  const simpan = () => { if (!judul.trim() || !tanggal) return; onAdd(judul, tanggal, jenis); setJudul(''); setTanggal(''); setJenis('kesehatan'); setBuka(false); };
  if (!buka) return <button type="button" onClick={() => setBuka(true)} style={{ ...miniLink, color: '#8A5A74' }}><Plus size={13} strokeWidth={2.4} /> Tambah peristiwa</button>;
  return (
    <div style={{ border: `1px solid ${GARIS}`, borderRadius: 14, padding: '14px 16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input autoFocus value={judul} onChange={e => setJudul(e.target.value)} placeholder="mis. imunisasi lanjutan"
        style={{ border: `1px solid ${GARIS}`, borderRadius: 10, padding: '8px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: PLUM, outline: 'none' }} />
      <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
        style={{ border: `1px solid ${GARIS}`, borderRadius: 10, padding: '8px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: PLUM, outline: 'none' }} />
      <Seg value={jenis} onPick={setJenis} options={(Object.keys(JENIS_LABEL) as JenisPeristiwa[]).map(j => [j, JENIS_LABEL[j]] as const)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={simpan} style={{ background: PINK_TUA, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>Simpan</button>
        <button type="button" onClick={() => setBuka(false)} style={{ background: 'none', border: `1px solid ${GARIS}`, color: '#8A5A74', borderRadius: 10, padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>Batal</button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KehidupanKeluarga({ nilaiFokus = [], onKeInbox }: { nilaiFokus?: readonly NilaiAkar[]; onKeInbox?: () => void }) {
  const { profile, usiaBulan } = useChildProfile();
  const nama = profile.namaAnak || 'Anak';
  const { anakAktif } = useAnak();
  const idAnak = anakAktif?.id ?? 'anon';
  const { aktif, tenang, tambah, perbarui, setStatus, hapus } = useKehidupanStore(idAnak);
  const bidang = useBidangStore(idAnak);
  const inbox = useInboxStore(idAnak);
  const cara = useCaraStore(idAnak);
  const peristiwa = usePeristiwaStore(idAnak);

  const [draft, setDraft] = useState<DraftKonteks | null>(null);
  const [lihatTenang, setLihatTenang] = useState(false);
  const [bukaBidang, setBukaBidang] = useState<BidangPeta | null>('anak');

  const bukaTambah = () => setDraft({ ...DRAFT_BARU });
  const bukaPerbarui = (k: KonteksKehidupan) => setDraft({ id: k.id, bidang: k.bidang, judul: k.judul, catatan: k.catatan ?? '', sejak: k.sejak, tag: k.tag, status: k.status });
  const simpan = () => {
    if (!draft || !draft.judul.trim()) return;
    if (draft.id) perbarui(draft.id, { bidang: draft.bidang, judul: draft.judul, catatan: draft.catatan, sejak: draft.sejak, tag: draft.tag, status: draft.status });
    else tambah({ bidang: draft.bidang, judul: draft.judul, catatan: draft.catatan, sejak: draft.sejak, tag: draft.tag });
    setDraft(null);
  };

  const penyesuaian = ringkasPenyesuaian(aktif);

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[1fr_320px]">
      {/* ── Kolom kiri ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13.5, color: '#8A5A74', margin: 0, maxWidth: 460, lineHeight: 1.5 }}>
            Bukan daftar tugas. Di sini Rekah memahami keadaan keluargamu sekarang — lalu menyesuaikan saran agar tetap terasa pas.
          </p>
          <button type="button" onClick={bukaTambah}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: PINK_TUA, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13.5, cursor: 'pointer', flexShrink: 0 }}>
            <Plus size={16} strokeWidth={2.6} /> Ceritakan yang berubah
          </button>
        </div>

        {/* Hero keadaan sekarang */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(140deg,#fff 0%,#EFE9FB 130%)', border: `1px solid ${GARIS}`, borderRadius: 22, padding: '22px 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: `1px solid ${GARIS}`, color: '#7A5CA6', borderRadius: 999, padding: '5px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5 }}>
            <Sparkles size={13} strokeWidth={2.2} /> Musim ini · menata ritme
          </div>
          <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13.5, color: '#8A5A74', margin: '14px 0 6px' }}>Keadaan keluarga sekarang</h2>
          <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 20, lineHeight: 1.45, color: PLUM, margin: 0, maxWidth: 620 }}>
            {kalimatKeadaan(aktif, nama)}
          </p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, background: '#fff', border: '1px dashed #C9A8DD', borderRadius: 12, padding: '6px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: '#8A5A74' }}>
            <span style={{ fontWeight: 800, color: '#7A5CA6', background: '#EFE9FB', borderRadius: 6, padding: '2px 7px', fontSize: 10 }}>RANGKUMAN AI</span>
            Disusun dari yang kamu ceritakan — bisa kamu ubah kapan saja.
          </span>
        </div>

        {/* Yang sedang berubah */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 17, color: PLUM, margin: 0 }}>Yang sedang berubah</h2>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: KABUT }}>yang sudah tenang dirapikan otomatis</span>
          </div>

          {aktif.length === 0 ? (
            <div style={{ background: '#fff', border: `1px dashed ${GARIS}`, borderRadius: 16, padding: '26px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 15.5, color: PLUM, margin: '0 0 4px' }}>Belum ada yang sedang berubah.</p>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#8A5A74', margin: '0 0 14px' }}>Ceritakan satu hal, agar saran Rekah terasa lebih pas dengan keadaan keluargamu.</p>
              <button type="button" onClick={bukaTambah} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: PINK, color: '#fff', border: 'none', borderRadius: 11, padding: '9px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                <Plus size={15} strokeWidth={2.6} /> Ceritakan yang berubah
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {aktif.map(k => (
                <KartuKonteks key={k.id} k={k} onPerbarui={() => bukaPerbarui(k)} onTenang={() => setStatus(k.id, 'tenang')} onHapus={() => hapus(k.id)} />
              ))}
            </div>
          )}

          {tenang.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={() => setLihatTenang(o => !o)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8A5A74', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', padding: 0 }}>
                <Leaf size={14} strokeWidth={2.2} color="#6FA867" /> Yang sudah tenang ({tenang.length})
                <ChevronDown size={14} strokeWidth={2.4} style={{ transform: lihatTenang ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {lihatTenang && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  {tenang.map(k => (
                    <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FBF6F1', border: `1px solid ${GARIS}`, borderRadius: 12, padding: '10px 13px' }}>
                      <span style={{ flex: 1, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74' }}>{k.judul}</span>
                      <button type="button" onClick={() => setStatus(k.id, 'aktif')} style={{ ...miniBtn, padding: '4px 10px', fontSize: 11.5 }}>Munculkan lagi</button>
                      <button type="button" onClick={() => hapus(k.id)} style={{ ...miniBtn, padding: '4px 10px', fontSize: 11.5, color: KABUT }}>Hapus</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Peta kehidupan keluarga (accordion) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 17, color: PLUM, margin: 0 }}>Peta kehidupan keluarga</h2>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: KABUT }}>buka saat ingin memperbarui</span>
          </div>

          <Bidang label={`Anak — ${nama}`} sub={usiaBulan != null ? `${usiaBulan} bulan` : 'profil anak'} Ikon={Baby} tile={BIDANG.anak.tile} ink={BIDANG.anak.ink}
            open={bukaBidang === 'anak'} onToggle={() => setBukaBidang(b => (b === 'anak' ? null : 'anak'))}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderTop: `1px dashed ${GARIS}` }}>
              <span style={{ flex: '0 0 128px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74' }}>Nilai fokus</span>
              <span style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {nilaiFokus.length ? nilaiFokus.map(n => (
                  <span key={n} style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#C6407F', background: '#FBE7EC', borderRadius: 999, padding: '3px 11px' }}>{n}</span>
                )) : <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12.5, color: KABUT }}>Tetapkan di Arah (Kompas)</span>}
              </span>
            </div>
            {bidang.fakta('anak').map(f => <BarisFakta key={f.id} f={f} onUbah={v => bidang.ubah(f.id, { v })} onHapus={() => bidang.hapus(f.id)} />)}
            <TambahFakta onAdd={(k, v) => bidang.tambah('anak', k, v)} />
          </Bidang>

          <Bidang label="Caregiver — siapa & ritmenya" sub="Bunda · Ayah · Nenek" Ikon={Users2} tile={BIDANG.caregiver.tile} ink={BIDANG.caregiver.ink}
            open={bukaBidang === 'caregiver'} onToggle={() => setBukaBidang(b => (b === 'caregiver' ? null : 'caregiver'))}>
            {bidang.fakta('caregiver').map(f => <BarisFakta key={f.id} f={f} onUbah={v => bidang.ubah(f.id, { v })} onHapus={() => bidang.hapus(f.id)} />)}
            <TambahFakta onAdd={(k, v) => bidang.tambah('caregiver', k, v)} />
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, background: '#EFE9FB', borderRadius: 12, padding: '11px 13px', flexWrap: 'wrap' }}>
              <Heart size={16} strokeWidth={2} color="#7A5CA6" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 150, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12, color: '#6E3B57', lineHeight: 1.5 }}>Energi &amp; suasana pengasuh dijaga di Ruang Teduh (Langit Hati).</span>
              <Link to="/dashboard/tier2/ruang-teduh" style={{ flexShrink: 0, background: '#fff', border: '1px solid #D9C7E8', color: '#7A5CA6', borderRadius: 10, padding: '7px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>Buka Ruang Teduh</Link>
            </div>
          </Bidang>

          <Bidang label="Rumah — ritme & kebutuhan" sub="Jam sibuk, ruang main, kebutuhan" Ikon={Home} tile={BIDANG.rumah.tile} ink={BIDANG.rumah.ink}
            open={bukaBidang === 'rumah'} onToggle={() => setBukaBidang(b => (b === 'rumah' ? null : 'rumah'))}>
            {bidang.fakta('rumah').map(f => (
              <BarisFakta key={f.id} f={f} onUbah={v => bidang.ubah(f.id, { v })} onHapus={() => bidang.hapus(f.id)}
                aksiInbox={() => { inbox.tambah(`${f.k}: ${f.v}`); onKeInbox?.(); }} />
            ))}
            <TambahFakta onAdd={(k, v) => bidang.tambah('rumah', k, v)} />
            <p style={{ margin: '12px 0 0', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: KABUT, lineHeight: 1.5 }}>Kebutuhan yang perlu ditindak bisa dikirim ke Inbox lewat tombol "→ Inbox".</p>
          </Bidang>
        </div>

        {/* Cara kita mengasuh */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 17, color: PLUM, margin: 0 }}>Cara kita mengasuh</h2>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: KABUT }}>kesepakatan lembut, bukan pembagian tugas</span>
          </div>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#8A5A74', margin: '0 0 12px' }}>Agar {nama} mengalami cara yang selaras dari siapa pun yang menemaninya.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cara.items.map(c => (
              <KartuCara key={c.id} c={c} onUbah={teks => cara.ubah(c.id, { teks })} onToggle={() => cara.ubah(c.id, { dibagikan: !c.dibagikan })} onHapus={() => cara.hapus(c.id)} />
            ))}
          </div>
          <div style={{ marginTop: 12 }}><TambahCara onAdd={(s, t, b) => cara.tambah(s, t, b)} /></div>
        </div>

        {/* Peristiwa mendatang */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 17, color: PLUM, margin: 0 }}>Peristiwa mendatang</h2>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: KABUT }}>hal yang mengubah ritme minggu</span>
          </div>
          {peristiwa.items.length === 0 ? (
            <div style={{ background: '#fff', border: `1px dashed ${GARIS}`, borderRadius: 14, padding: '20px', textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#8A5A74' }}>
              Belum ada peristiwa. Tambah hal seperti imunisasi, mudik, atau tamu yang mengubah ritme.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {peristiwa.items.map(p => <BarisPeristiwa key={p.id} p={p} onHapus={() => peristiwa.hapus(p.id)} />)}
            </div>
          )}
          <div style={{ marginTop: 12 }}><TambahPeristiwa onAdd={(j, t, jn) => peristiwa.tambah(j, t, jn)} /></div>
        </div>

        {/* Footer jujur */}
        <p style={{ display: 'flex', gap: 8, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 12, color: KABUT, lineHeight: 1.55, margin: '4px 0 0', borderTop: `1px solid ${GARIS}`, paddingTop: 16 }}>
          Rekah tidak menilai keluargamu dan tidak membandingkan dengan siapa pun. Semua di sini bisa kamu ubah, jeda, atau rapikan — kamu yang memegang kemudi. Hal bernuansa kesehatan sebaiknya dibicarakan dengan tenaga profesional.
        </p>
      </div>

      {/* ── Kolom kanan: panel penyesuaian ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'linear-gradient(150deg,#fff,#E7F2E4 140%)', border: '1px solid #D6E8D0', borderRadius: 22, padding: '18px 20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 16, color: PLUM, margin: 0 }}>
            <Sparkles size={16} strokeWidth={2} color="#6FA867" /> Bagaimana Rekah menyesuaikan
          </h3>
          {penyesuaian.length === 0 ? (
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#8A5A74', margin: '12px 0 0', lineHeight: 1.5 }}>
              Belum ada konteks aktif, jadi Rekah menyarankan langkah seperti biasa. Ceritakan yang sedang berubah untuk membuat saran lebih pas.
            </p>
          ) : (
            <div style={{ marginTop: 10 }}>
              {penyesuaian.map((p, i) => (
                <div key={p.tag} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < penyesuaian.length - 1 ? `1px dashed ${GARIS}` : 'none' }}>
                  <span style={{ width: 9, height: 9, flexShrink: 0, marginTop: 5, borderRadius: '70% 70% 70% 3px', background: '#6FA867' }} />
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#4A3550', lineHeight: 1.5 }}>{p.baris}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
            <span style={{ fontWeight: 800, color: '#7A5CA6', background: '#EFE9FB', borderRadius: 6, padding: '2px 7px', fontFamily: 'Nunito, sans-serif', fontSize: 10 }}>DISUSUN AI</span>
            <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 11.5, color: KABUT }}>Berubah otomatis mengikuti "yang sedang berubah".</span>
          </div>
        </div>
      </div>

      {draft && <ModalKonteks draft={draft} onChange={setDraft} onSimpan={simpan} onTutup={() => setDraft(null)} />}
    </div>
  );
}
