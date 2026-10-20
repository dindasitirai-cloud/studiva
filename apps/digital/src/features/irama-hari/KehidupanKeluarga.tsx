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
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RekomendasiRekah from './RekomendasiRekah';
import { Baby, Users2, Home, Plus, Sparkles, X, ChevronDown, Pencil, Leaf, Trash2, Heart, CheckCircle2, Check, Utensils, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { bandDariUsia, teksUsia } from '../akar-keluarga/bandUsia';
import { useAnak } from '../../context/AnakContext';
import { useInboxStore } from './inboxData';
import {
  useKehidupanStore, usePeristiwaStore, ringkasanPeta,
  BIDANG, SEJAK_LABEL, STATUS_LABEL, COPY_TAG, TAG_PER_BIDANG,
  JENIS_LABEL,
  jadwalImunisasi, useImunisasiStore, selisihHari, SLOT_LABEL,
  usePetaStore, PETA_PERTANYAAN, bandPeta, lembarTerbuka, jadwalKF, hariNifas, useNifasStore, usePiringStore, TANDA_BAHAYA_NIFAS,
  MOOD_NIFAS, CEK_HARIAN_NIFAS, HINDARI_NIFAS, PIRING_PENUHI, PIRING_BATASI, airTargetGelas,
  tagsDariPeta, langkahHariIni, QUICK_KONTEKS,
} from './kehidupanData';
import type {
  KonteksKehidupan, BidangKehidupan, SejakKapan, TagPenyesuaian, StatusKonteks, BidangPeta,
  Peristiwa, JenisPeristiwa, ImunisasiItem, ImunisasiJadwal, SlotHari,
  PetaPertanyaan, KFItem, NifasStore, NifasJadwal, PiringStore,
} from './kehidupanData';
import { jadwalkanKeHari, bacaStoreHari } from './dayPlanData';
import { localISO } from './rencanaData';
import { useAksiKondisi } from './aksiKondisiStore';
import { tahapToiletDariPeta, TAHAP_KESIAPAN, saranLayar, panduanToilet, panduanSaudara, konteksSaudaraDariPeta, butuhKontenAdik, persiapanRumah, tahapRumahLabel, opsiAman, AMAN_REMINDER } from './kontenMetadata';
import type { KategoriPersiapan, ItemPersiapan } from './kontenMetadata';


const PLUM = '#6E3B57';
const PINK_TUA = '#C6407F';
const KABUT = '#B79AAC';
const GARIS = 'rgba(110,59,87,.1)';
const KEG_NAMA: Record<string, string> = { sarapan: 'Sarapan', main: 'Main bersama', tidur: 'Rutinitas sebelum tidur' };
const TILE_PROFIL: Record<'anak' | 'caregiver' | 'rumah', { soft: string; ink: string }> = {
  anak: { soft: '#FDE9F2', ink: '#D2559A' },
  caregiver: { soft: '#F0EAFB', ink: '#7B5BB8' },
  rumah: { soft: '#FFF6DC', ink: '#B07A1E' },
};

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
/** Isian awal form "Ceritakan yang berubah" yang dikirim dari tab lain (mis. Perjalanan → "Cukup berat"). */
export type KonteksAwal = Partial<Pick<DraftKonteks, 'bidang' | 'judul' | 'catatan' | 'sejak' | 'tag'>>;

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
  const copy = COPY_TAG[k.tag];
  return (
    <div style={{ background: buka ? '#FFFCF8' : '#fff', border: `1px solid ${buka ? '#F6E0EA' : '#F6EEF2'}`, borderRadius: 20, padding: '13px 15px', transition: 'background .2s, border-color .2s' }}>
      <button type="button" onClick={() => setBuka(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ width: 10, height: 10, flexShrink: 0, borderRadius: '50%', background: b.bar }} />
        <span style={{ flex: 1, fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15, color: PLUM, lineHeight: 1.3 }}>{k.judul}</span>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, letterSpacing: '.6px', textTransform: 'uppercase', color: b.ink }}>{b.label}</span>
        <ChevronDown size={16} strokeWidth={2.4} color={KABUT} style={{ transform: buka ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {buka && (
        <div style={{ paddingLeft: 20, marginTop: 10 }}>
          {copy && copy.baris && (
            <div style={{ background: '#F1F8F2', borderRadius: 12, padding: '10px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13.5, color: '#3F7A55', lineHeight: 1.5 }}>{copy.baris}</div>
          )}
          {copy && copy.rujukan && copy.rujukan !== '—' && (
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 11, color: KABUT, marginTop: 6, lineHeight: 1.5 }}>{copy.rujukan}</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <button type="button" onClick={onTenang}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#4E9A6A', color: '#fff', border: 'none', borderRadius: 999, padding: '7px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}><Leaf size={13} strokeWidth={2.4} /> Sudah tenang</button>
            <button type="button" onClick={onPerbarui}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', color: '#8A5A74', border: '1px solid #F2DDE7', borderRadius: 999, padding: '7px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}><Pencil size={13} strokeWidth={2.4} /> Perbarui</button>
            <button type="button" onClick={onHapus} aria-label="Hapus"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', background: 'none', color: KABUT, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}><Trash2 size={15} strokeWidth={2} /></button>
          </div>
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

const badgeBaru: React.CSSProperties = { fontWeight: 800, fontSize: 8.5, letterSpacing: '.3px', textTransform: 'uppercase', color: '#2F7D57', background: '#E6F4EC', borderRadius: 5, padding: '1px 6px', marginLeft: 6 };
const badgeOpt: React.CSSProperties = { fontWeight: 800, fontSize: 8.5, letterSpacing: '.3px', textTransform: 'uppercase', color: '#8A6A2A', background: '#FBF0D6', borderRadius: 5, padding: '1px 6px', marginLeft: 6 };

// Satu pertanyaan Peta + pilihan chip (single / multi). Rekah yang bertanya.
function PetaChips({ q, sel, warna, onPilih, onInbox, pesan, labelInbox }: {
  q: PetaPertanyaan; sel: string[]; warna: string; onPilih: (v: string) => void; onInbox?: () => void; pesan?: string; labelInbox?: string;
}) {
  return (
    <div style={{ padding: '12px 0', borderTop: `1px dashed ${GARIS}` }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span aria-hidden="true" style={{ flex: 'none', width: 22, height: 22, borderRadius: '70% 70% 70% 5px', background: '#FCE3EE', color: '#C6407F', fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 11, display: 'grid', placeItems: 'center', marginTop: 1 }}>R</span>
        <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13.5, color: PLUM, lineHeight: 1.4 }}>
          {q.teks}
          {q.baru && <span style={badgeBaru}>Baru</span>}
          {q.sensitif && <span style={badgeOpt}>Opsional</span>}
          {q.multi && <span style={{ fontWeight: 700, fontSize: 10.5, color: KABUT, marginLeft: 6 }}>(boleh banyak)</span>}
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, margin: '9px 0 0 30px' }}>
        {q.opsi.map(op => {
          const on = sel.includes(op.v);
          return (
            <button key={op.v} type="button" onClick={() => onPilih(op.v)}
              style={{ border: on ? `1.5px solid ${warna}` : '1.5px solid #E7D3E0', background: on ? warna : '#fff', color: on ? '#fff' : '#8A5A74', borderRadius: 999, padding: '7px 13px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', transition: 'background .14s, border-color .14s' }}>
              {op.v}
            </button>
          );
        })}
      </div>
      {pesan && sel.length > 0 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '9px 0 0 30px', background: '#EFE9FB', borderRadius: 12, padding: '9px 11px' }}>
          <CheckCircle2 size={14} strokeWidth={2.4} color="#7A5CA6" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, color: '#7A5CA6', lineHeight: 1.45 }}>{pesan}</span>
        </div>
      )}
      {onInbox && sel.length > 0 && (
        <div style={{ margin: '8px 0 0 30px' }}>
          <button type="button" onClick={onInbox} style={{ ...miniLink, color: '#B4477F' }}><Plus size={13} strokeWidth={2.4} /> {labelInbox ?? 'Kirim ke Inbox'}</button>
        </div>
      )}
    </div>
  );
}

// Lembar Nifas — sheet (Buku KIA, DRAFT). Dibungkus ModalBungkus; hero + tab di dalam.
function KartuNifas({ hari, items, store, onKePiring, onSyncKF }: {
  hari: number | null; items: KFItem[]; store: NifasStore; onKePiring?: () => void; onSyncKF: (it: KFItem, v: NifasJadwal) => void;
}) {
  const [tab, setTab] = useState<'hari' | 'kunjungan' | 'hindari'>('hari');
  const hr = store.hari;
  const moodBerat = hr.mood === 'Sering sedih / cemas' || hr.mood === 'Butuh dukungan';
  const vitDone = (store.vitaminA[0] ? 1 : 0) + (store.vitaminA[1] ? 1 : 0);
  const pct = hari != null ? Math.min(100, Math.round((hari / 42) * 100)) : 0;
  const TABS: ['hari' | 'kunjungan' | 'hindari', string][] = [['hari', 'Hari ini'], ['kunjungan', 'Kunjungan'], ['hindari', 'Hindari']];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#FDE9F2', borderRadius: 22, padding: '18px 20px' }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '1px', textTransform: 'uppercase', color: '#C2447F' }}>Khusus ibu nifas</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 32, color: '#6E3B57' }}>{hari != null ? `Hari ke-${hari}` : 'Masa nifas'}</span>
          {hari != null && <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#9A6F86' }}>dari 42</span>}
        </div>
        {hari != null && (
          <div style={{ height: 8, borderRadius: 999, background: '#fff', marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#F06BA8', borderRadius: 999, transition: 'width .3s' }} />
          </div>
        )}
      </div>

      {hr.danger.length > 0 && (
        <div style={{ background: '#D64553', color: '#fff', borderRadius: 16, padding: '12px 16px' }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13.5 }}>Segera periksa ke Puskesmas / Rumah Sakit</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, opacity: .92, marginTop: 2 }}>{hr.danger.length} tanda bahaya dicentang</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, background: '#F7EDF2', borderRadius: 14, padding: 4 }}>
        {TABS.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} style={{ flex: 1, border: 'none', borderRadius: 11, padding: '8px 0', cursor: 'pointer', background: tab === k ? '#fff' : 'transparent', color: tab === k ? '#D2559A' : '#9A6F86', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, boxShadow: tab === k ? '0 4px 10px -6px rgba(90,50,70,.5)' : 'none' }}>{l}</button>
        ))}
      </div>

      {tab === 'hari' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={sheetH}>Perasaan hari ini</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
              {MOOD_NIFAS.map(m => {
                const on = hr.mood === m;
                return <button key={m} type="button" onClick={() => store.setMood(m)} style={{ border: on ? '1.5px solid #F06BA8' : '1.5px solid #F2DDE7', background: on ? '#FDE9F2' : '#fff', color: on ? '#C2447F' : '#8A5A74', borderRadius: 999, padding: '7px 13px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>{m}</button>;
              })}
            </div>
            {moodBerat && <div style={{ background: '#F0EAFB', borderRadius: 12, padding: '11px 13px', marginTop: 10, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#5E4396', lineHeight: 1.5 }}>Kamu tidak sendiri. Ceritakan ke pasangan atau tenaga kesehatan, terutama bila sedih terus berhari-hari.</div>}
          </div>

          <div>
            <h4 style={sheetH}>Sudah hari ini</h4>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', marginTop: 8 }}>
              {CEK_HARIAN_NIFAS.map(c => {
                const on = hr.checks.includes(c);
                return (
                  <button key={c} type="button" onClick={() => store.toggleCheck(c)} style={{ display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left', border: `1px solid ${on ? '#D6EBDA' : '#F0ECE4'}`, background: on ? '#EEF7EF' : '#fff', borderRadius: 14, padding: '11px 13px', cursor: 'pointer' }}>
                    <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 6, border: on ? '2px solid #4E9A6A' : '2px solid #E0CBDA', background: on ? '#4E9A6A' : '#fff', display: 'grid', placeItems: 'center' }}><Check size={11} strokeWidth={3} color="#fff" style={{ opacity: on ? 1 : 0 }} /></span>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: PLUM }}>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ background: '#FFFAEB', borderRadius: 16, padding: '13px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13.5, color: '#8A5A74' }}>Kapsul vitamin A</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: KABUT, marginTop: 1 }}>2 kapsul selama nifas, diberikan tenaga kesehatan</div>
              </div>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: vitDone === 2 ? '#3F7A55' : '#A66E12' }}>{vitDone === 2 ? 'Lengkap' : `${vitDone}/2`}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {[0, 1].map(i => {
                const on = !!store.vitaminA[i];
                return <button key={i} type="button" onClick={() => store.toggleVitaminA(i)} style={{ flex: 1, border: on ? '1.5px solid #E8B93C' : '1.5px solid #EBD9A6', background: on ? '#FFE9A8' : '#fff', color: '#8A5A74', borderRadius: 12, padding: '9px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>{on ? '✓ ' : ''}Kapsul {i + 1}</button>;
              })}
            </div>
          </div>

          {onKePiring && <button type="button" onClick={onKePiring} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#4E9A6A', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Lihat porsi di Piring Ibu →</button>}

          <div>
            <h4 style={sheetH}>Ada yang dialami? <span style={{ fontWeight: 600, fontSize: 11.5, color: KABUT }}>(centang bila ya)</span></h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {TANDA_BAHAYA_NIFAS.map(t => {
                const on = hr.danger.includes(t);
                return (
                  <button key={t} type="button" onClick={() => store.toggleDanger(t)} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left', border: `1px solid ${on ? '#F2B3BB' : '#F0ECE4'}`, background: on ? '#FDECEE' : '#fff', borderRadius: 12, padding: '10px 12px', cursor: 'pointer' }}>
                    <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 6, border: on ? '2px solid #D64553' : '2px solid #E0CBDA', background: on ? '#D64553' : '#fff', display: 'grid', placeItems: 'center' }}><Check size={11} strokeWidth={3} color="#fff" style={{ opacity: on ? 1 : 0 }} /></span>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: PLUM, lineHeight: 1.4 }}>{t}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'kunjungan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(it => {
            const done = !!store.kfDone[it.key];
            const terjadwal = !!store.kf[it.key];
            let status = `Mulai hari ke-${it.dMin}`; let warna = '#8A5A74'; let sekarang = false;
            if (done) { status = 'Sudah dilakukan'; warna = '#3F7A55'; }
            else if (hari != null && hari > it.dMax) { status = 'Terlewat, tanyakan ke bidan'; warna = '#C2447F'; }
            else if (hari != null && hari >= it.dMin) { status = 'Belum dilakukan'; warna = '#8A5A74'; sekarang = true; }
            return (
              <div key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${done ? '#D6EBDA' : '#F0ECE4'}`, background: done ? '#EEF7EF' : '#fff', borderRadius: 16, padding: '12px 14px' }}>
                <button type="button" onClick={() => store.toggleKFDone(it.key)} aria-label={`Tandai ${it.key.toUpperCase()}`} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', border: done ? 'none' : '2px solid #E7D3E0', background: done ? '#4E9A6A' : '#fff', color: done ? '#fff' : '#9A6F86', fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>{done ? <Check size={18} strokeWidth={3} /> : it.key.toUpperCase()}</button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: PLUM }}>{it.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2, flexWrap: 'wrap' }}>
                    {sekarang && <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, color: '#C2447F', background: '#FDE9F2', borderRadius: 999, padding: '2px 8px' }}>Sekarang</span>}
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, color: warna }}>{status}</span>
                  </div>
                </div>
                {!done && (terjadwal
                  ? <span style={{ ...chipS, background: '#E6F4EC', color: '#2F7D57', flexShrink: 0 }}><Check size={12} strokeWidth={2.6} /> Di Irama</span>
                  : <button type="button" onClick={() => { const v: NifasJadwal = { tgl: it.dueMin, slot: 'pagi' }; store.konfirmasiKF(it.key, v); onSyncKF(it, v); }} style={{ flexShrink: 0, background: '#F0EAFB', color: '#7B5BB8', border: 'none', borderRadius: 999, padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Jadwalkan</button>)}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'hindari' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HINDARI_NIFAS.map(h => (
            <div key={h.teks} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: '1px solid #F0ECE4', borderRadius: 14, padding: '11px 13px', background: '#fff' }}>
              <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 8, background: '#FDECEE', color: '#D64553', display: 'grid', placeItems: 'center' }}><X size={14} strokeWidth={2.6} /></span>
              <div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: PLUM, lineHeight: 1.4 }}>{h.teks}</div>
                {h.alasan && <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: KABUT, marginTop: 2, lineHeight: 1.4 }}>{h.alasan}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: `1px dashed ${GARIS}`, paddingTop: 12, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11, color: KABUT, lineHeight: 1.5 }}>Sumber: Buku KIA · Lembar Pemantauan Ibu Nifas. <span style={{ fontWeight: 800, color: '#7A5CA6' }}>DRAFT — menunggu tinjauan tenaga kesehatan.</span></div>
    </div>
  );
}

// Piring Ibu — sheet (Isi Piringku, Buku KIA, DRAFT). Dibungkus ModalBungkus.
function KartuPiring({ store, usiaBulan }: { store: PiringStore; usiaBulan: number | null }) {
  const [bukaBahan, setBukaBahan] = useState<string | null>(null);
  const totalTarget = PIRING_PENUHI.reduce((a, b) => a + b.target, 0);
  const totalDone = PIRING_PENUHI.reduce((a, b) => a + Math.min(store.porsi[b.key] ?? 0, b.target), 0);
  const airTarget = airTargetGelas(usiaBulan);
  const tapDot = (cur: number, i: number, set: (n: number) => void) => set(cur === i ? i - 1 : i);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#EEF7EF', borderRadius: 22, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '1px', textTransform: 'uppercase', color: '#3F7A55' }}>Ibu menyusui{usiaBulan != null ? ` · ${usiaBulan} bulan` : ''}</div>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 24, color: '#2F5E40', marginTop: 3 }}>Porsi sehari</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12.5, color: '#4E7358', marginTop: 2, maxWidth: 320, lineHeight: 1.4 }}>Separuh piring sayur &amp; buah, separuh makanan pokok &amp; lauk.</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '10px 14px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 20, color: '#2F5E40' }}>{totalDone}/{totalTarget}</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 10.5, color: '#4E7358' }}>porsi</div>
        </div>
      </div>

      <div>
        <h4 style={sheetH}>Penuhi</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {PIRING_PENUHI.map(b => {
            const n = store.porsi[b.key] ?? 0; const full = n >= b.target; const open = bukaBahan === b.key;
            return (
              <div key={b.key} style={{ border: '1px solid #F0ECE4', borderRadius: 16, padding: '12px 14px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <button type="button" onClick={() => setBukaBahan(o => o === b.key ? null : b.key)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13.5, color: PLUM, textAlign: 'left' }}>{b.label}</button>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: full ? '#3F7A55' : '#9A6F86' }}>{n}/{b.target}</span>
                </div>
                <div style={{ display: 'flex', gap: 7, marginTop: 9, flexWrap: 'wrap' }}>
                  {Array.from({ length: b.target }, (_, idx) => idx + 1).map(i => (
                    <button key={i} type="button" aria-label={`porsi ${i}`} onClick={() => tapDot(n, i, (x) => store.setPorsi(b.key, x))} style={{ width: 22, height: 22, borderRadius: '50%', border: i <= n ? 'none' : '2px solid #E0E6DD', background: i <= n ? '#6DB282' : '#fff', cursor: 'pointer' }} />
                  ))}
                </div>
                {open && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11, color: KABUT, alignSelf: 'center' }}>1 porsi =</span>
                    {b.contoh.map(c => <span key={c} style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#3F7A55', background: '#F1F8F2', borderRadius: 999, padding: '3px 10px' }}>{c}</span>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 style={sheetH}>Batasi <span style={{ fontWeight: 600, fontSize: 11.5, color: KABUT }}>(paling banyak)</span></h4>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', marginTop: 8 }}>
          {PIRING_BATASI.map(b => (
            <div key={b.label} style={{ background: '#FFFAF0', borderRadius: 14, padding: '11px 13px' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: '#8A5A74' }}>{b.label} <span style={{ color: '#A66E12' }}>{b.porsi}</span></div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: KABUT, marginTop: 2, lineHeight: 1.4 }}>{b.ket}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#E8F1FC', borderRadius: 16, padding: '13px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <h4 style={{ ...sheetH, fontSize: 13.5 }}>Air putih</h4>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: store.water >= airTarget ? '#2F5E40' : '#4C7BC0' }}>{store.water}/{airTarget} gelas</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 9 }}>
          {Array.from({ length: airTarget }, (_, idx) => idx + 1).map(i => (
            <button key={i} type="button" aria-label={`gelas ${i}`} onClick={() => tapDot(store.water, i, store.setWater)} style={{ width: 22, height: 22, borderRadius: '50%', border: i <= store.water ? 'none' : '2px solid #CBD9EC', background: i <= store.water ? '#7FA9DE' : '#fff', cursor: 'pointer' }} />
          ))}
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11, color: '#6E89B0', marginTop: 8 }}>14 gelas di 6 bulan pertama, 12 gelas di 6 bulan kedua.</div>
      </div>

      <div style={{ borderTop: `1px dashed ${GARIS}`, paddingTop: 12, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11, color: KABUT, lineHeight: 1.5 }}>Bukan hitung kalori, cukup beragam &amp; cukup. Konsultasikan porsi ke tenaga kesehatan. Sumber: Buku KIA. <span style={{ fontWeight: 800, color: '#7A5CA6' }}>DRAFT.</span></div>
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

const chipS: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, borderRadius: 999, padding: '3px 10px' };
const sheetH: React.CSSProperties = { fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 14, color: '#6E3B57', margin: 0 };
const fldL: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 3 };
const fldT: React.CSSProperties = { fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.3px', color: '#8A5A74' };
const fldI: React.CSSProperties = { border: `1px solid ${GARIS}`, borderRadius: 9, padding: '7px 9px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: PLUM, outline: 'none', background: '#fff' };


// ─── Yang akan datang: timeline (design handoff) + tambah peristiwa ───────────
function TambahPeristiwaForm({ onAdd, onBatal }: { onAdd: (judul: string, tanggal: string, jenis: JenisPeristiwa, opts: { waktu?: string; slot?: SlotHari }) => void; onBatal: () => void }) {
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jenis, setJenis] = useState<JenisPeristiwa>('kesehatan');
  const [waktu, setWaktu] = useState('');
  const [slot, setSlot] = useState<SlotHari>('pagi');
  const simpan = () => { if (!judul.trim() || !tanggal) return; onAdd(judul, tanggal, jenis, { waktu: waktu || undefined, slot }); };
  return (
    <div style={{ border: `1px solid ${GARIS}`, borderRadius: 16, padding: '14px 16px', background: '#FFFAF5', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input autoFocus value={judul} onChange={e => setJudul(e.target.value)} placeholder="mis. kontrol tumbuh kembang"
        style={{ border: `1px solid ${GARIS}`, borderRadius: 10, padding: '8px 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: PLUM, outline: 'none' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <label style={fldL}><span style={fldT}>Tanggal</span><input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} style={fldI} /></label>
        <label style={fldL}><span style={fldT}>Jam</span><input type="time" value={waktu} onChange={e => setWaktu(e.target.value)} style={fldI} /></label>
        <label style={fldL}><span style={fldT}>Waktu</span><select value={slot} onChange={e => setSlot(e.target.value as SlotHari)} style={fldI}><option value="pagi">Pagi</option><option value="siang">Siang</option><option value="malam">Malam</option></select></label>
      </div>
      <Seg value={jenis} onPick={setJenis} options={(Object.keys(JENIS_LABEL) as JenisPeristiwa[]).map(j => [j, JENIS_LABEL[j]] as const)} />
      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11, color: KABUT, margin: 0 }}>Tanggal &amp; waktu akan otomatis masuk ke Irama Keseharian.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={simpan} style={{ background: PINK_TUA, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>Simpan</button>
        <button type="button" onClick={onBatal} style={{ background: 'none', border: `1px solid ${GARIS}`, color: '#8A5A74', borderRadius: 10, padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>Batal</button>
      </div>
    </div>
  );
}

interface EvMendatang { id: string; tgl: string; day: string; mon: string; name: string; sub: string; soft: string; ink: string; done: boolean; doneLabel?: string; canConfirm: boolean; onConfirm?: () => void; onHapus?: () => void }
function KartuMendatang({ imList, jadwalImun, onKonfirmasiImun, peristiwa, onHapusPeristiwa, onTambahPeristiwa, hariIni }: {
  imList: ImunisasiItem[]; jadwalImun: Record<string, ImunisasiJadwal>; onKonfirmasiImun: (key: string, v: ImunisasiJadwal) => void;
  peristiwa: Peristiwa[]; onHapusPeristiwa: (id: string) => void;
  onTambahPeristiwa: (judul: string, tanggal: string, jenis: JenisPeristiwa, opts: { waktu?: string; slot?: SlotHari }) => void; hariIni: Date;
}) {
  const [bukaNanti, setBukaNanti] = useState(false);
  const [tambahBuka, setTambahBuka] = useState(false);
  const evImun = imList.map(im => {
    const j = jadwalImun[im.key]; const tgl = j?.tgl ?? im.due; const dp = tglPecah(tgl); const dd = selisihHari(im.due, hariIni);
    const ev: EvMendatang & { nanti: boolean } = {
      id: 'im-' + im.key, tgl, day: dp.hari, mon: (dp.bulan || '').toUpperCase(),
      name: im.label, sub: `Usia ${im.bln} bln${j?.waktu ? ' · ' + j.waktu : ''}`,
      soft: '#F0EAFB', ink: '#7B5BB8', done: !!j, doneLabel: 'Terjadwal',
      canConfirm: !j, onConfirm: () => onKonfirmasiImun(im.key, { tgl: im.due, slot: 'pagi' }), nanti: !j && dd > 30,
    };
    return ev;
  });
  const evPeri: EvMendatang[] = peristiwa.map(p => {
    const dp = tglPecah(p.tanggal);
    return { id: 'pr-' + p.id, tgl: p.tanggal, day: dp.hari, mon: (dp.bulan || '').toUpperCase(),
      name: p.judul, sub: `${JENIS_LABEL[p.jenis]}${p.waktu ? ' · ' + p.waktu : ''}`,
      soft: '#FDE9F2', ink: '#D2559A', done: !!p.slot, doneLabel: 'Di Irama', canConfirm: false, onHapus: () => onHapusPeristiwa(p.id) };
  });
  const inline = [...evPeri, ...evImun.filter(e => !e.nanti)].sort((a, b) => a.tgl.localeCompare(b.tgl));
  const nanti = evImun.filter(e => e.nanti).sort((a, b) => a.tgl.localeCompare(b.tgl));
  const kosong = inline.length === 0 && nanti.length === 0;
  const Baris = (e: EvMendatang, last: boolean) => (
    <div key={e.id} style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 52 }}>
        <div style={{ width: 52, padding: '6px 0', borderRadius: 16, background: e.soft, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 19, lineHeight: 1.1, color: e.ink }}>{e.day}</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '.8px', color: e.ink }}>{e.mon}</div>
        </div>
        {!last && <span style={{ flex: 1, width: 2, minHeight: 10, background: '#F3E3EB', margin: '4px 0' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '4px 0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15, color: '#6E3B57' }}>{e.name}</div>
          {e.onHapus && <button type="button" onClick={e.onHapus} aria-label="Hapus" style={{ ...miniLink, color: KABUT }}><Trash2 size={13} strokeWidth={2} /></button>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12.5, fontWeight: 700, color: '#9A6F86' }}>{e.sub}</span>
          {e.done && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 999, background: '#EEF7EF', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#3F7A55' }}><Check size={11} strokeWidth={3} /> {e.doneLabel}</span>}
          {e.canConfirm && <button type="button" onClick={e.onConfirm} style={{ padding: '4px 11px', borderRadius: 999, background: '#F0EAFB', border: 'none', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#7B5BB8', cursor: 'pointer' }}>Konfirmasi</button>}
        </div>
      </div>
    </div>
  );
  return (
    <section style={{ background: '#fff', borderRadius: 28, border: '1.5px solid #F6E6EE', padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 21, color: PLUM, margin: 0 }}>Yang akan datang</h2>
        <button type="button" onClick={() => setTambahBuka(o => !o)} aria-label="Tambah peristiwa" style={{ width: 34, height: 34, borderRadius: '50%', background: '#FFF4F9', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Plus size={14} strokeWidth={3} color="#D2559A" style={{ transform: tambahBuka ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }} /></button>
      </div>
      {tambahBuka && <div style={{ marginTop: 14 }}><TambahPeristiwaForm onAdd={(j, t, jn, o) => { onTambahPeristiwa(j, t, jn, o); setTambahBuka(false); }} onBatal={() => setTambahBuka(false)} /></div>}
      {kosong && !tambahBuka ? (
        <div style={{ background: '#FFFAF5', border: `1px dashed ${GARIS}`, borderRadius: 20, padding: 20, textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#8A5A74', marginTop: 14 }}>Belum ada peristiwa. Tambah kontrol, mudik, atau tamu yang mengubah ritme.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 14 }}>
          {inline.map((e, idx) => Baris(e, idx === inline.length - 1 && (nanti.length === 0 || !bukaNanti)))}
          {bukaNanti && nanti.map((e, idx) => Baris(e, idx === nanti.length - 1))}
          {nanti.length > 0 && (
            <button type="button" onClick={() => setBukaNanti(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 66, background: 'none', border: 'none', padding: '2px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13.5, color: '#7B5BB8', cursor: 'pointer' }}>
              {nanti.length} jadwal imunisasi berikutnya
              <ChevronDown size={14} strokeWidth={2.6} style={{ transform: bukaNanti ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
          )}
        </div>
      )}
      <div style={{ marginTop: 14, fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#B48DA3' }}>Imunisasi dihitung dari Buku KIA.</div>
    </section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function KartuPersiapanRumah({ items, stageLabel, onTambah, sudah }: { items: ItemPersiapan[]; stageLabel: string; onTambah: (judul: string) => void; sudah: (judul: string) => boolean }) {
  const KAT: Record<KategoriPersiapan, { label: string; soft: string; ink: string }> = {
    keamanan: { label: 'KEAMANAN', soft: '#FDE9F2', ink: '#C2447F' },
    penataan: { label: 'PENATAAN', soft: '#EAF3E7', ink: '#4E9C6E' },
    logistik: { label: 'LOGISTIK', soft: '#FFF6DC', ink: '#A66E12' },
  };
  return (
    <div className="pop" style={{ padding: '18px 20px', borderRadius: 24, background: '#fff', border: '1.5px solid #DCE8F7' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 18, color: '#6E3B57' }}>Persiapan rumah</div>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12.5, fontWeight: 700, color: '#8AA3C4' }}>{stageLabel}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {items.map((it, i) => {
          const k = KAT[it.kategori]; const on = sudah(it.judul);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 16, background: '#F7FAFE', flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 9px', borderRadius: 999, background: k.soft, fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '.6px', color: k.ink, flexShrink: 0 }}>{k.label}</span>
              <span style={{ flex: 1, minWidth: 160, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: '#6E3B57' }}>{it.judul}</span>
              {on ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 999, background: '#EEF7EF', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#3F7A55', flexShrink: 0 }}><Check size={12} strokeWidth={2.8} /> Dikelola</span>
              ) : (
                <button type="button" onClick={() => onTambah(it.judul)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 999, background: '#fff', border: '1.5px solid #DCE8F7', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#4C7BC0', cursor: 'pointer', flexShrink: 0 }}><Plus size={12} strokeWidth={2.8} /> Kelola</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModalBungkus({ judul, onTutup, children }: { judul: string; onTutup: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onTutup} style={{ position: 'fixed', inset: 0, background: 'rgba(60,30,50,.34)', backdropFilter: 'blur(2px)', zIndex: 60, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: 20, border: `1px solid ${GARIS}`, boxShadow: '0 24px 60px rgba(90,40,70,.26)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '16px 20px', borderBottom: `1px solid ${GARIS}` }}>
          <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 16, color: PLUM, margin: 0 }}>{judul}</h3>
          <button type="button" onClick={onTutup} style={{ background: '#FBF6F1', border: `1px solid ${GARIS}`, borderRadius: 10, padding: 7, cursor: 'pointer', display: 'inline-flex' }}><X size={16} strokeWidth={2.4} color="#8A5A74" /></button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

function KartuPanduan({ label, judul, detail, extra, tile, ink }: { label: string; judul: string; detail: string; extra?: string; tile: string; ink: string }) {
  return (
    <div style={{ background: tile, border: `1px solid ${ink}2E`, borderRadius: 16, padding: '14px 16px' }}>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, color: ink, letterSpacing: '.03em', marginBottom: 4 }}>{label}</div>
      <p style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 15, color: PLUM, margin: '0 0 4px' }}>{judul}</p>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12.5, color: '#7d6b73', margin: 0, lineHeight: 1.5 }}>{detail}</p>
      {extra && <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, color: ink, margin: '8px 0 0', lineHeight: 1.45 }}>{extra}</p>}
    </div>
  );
}

// ─── Untukmu hari ini: semua tawaran Rekah berdasarkan keadaan (dipakai tab Kelola & Beranda) ──
export function UntukmuHariIni({ idAnak, nama, usiaBulan, tanggalLahir, peta, aktif, inbox, onKeInbox, onBuka }: {
  idAnak: string; nama: string; usiaBulan: number | null; tanggalLahir: string | null;
  peta: { jawaban: Record<string, string[]> };
  aktif: readonly KonteksKehidupan[];
  inbox: { semua: { judul: string }[]; tambah: (j: string) => void };
  onKeInbox?: () => void; onBuka?: (to: string) => void;
}) {
  const nifas = useNifasStore(idAnak);
  const piring = usePiringStore(idAnak);
  const usiaTeks = teksUsia(usiaBulan ?? null);
  const lembar = lembarTerbuka(peta.jawaban);
  const hNifas = hariNifas(tanggalLahir, new Date());
  const kfItems = jadwalKF(tanggalLahir);
  const tampilNifas = lembar.nifas || (hNifas != null && hNifas <= 42);
  const tampilPiring = lembar.piring || (usiaBulan != null && usiaBulan <= 24);
  const aksiLangkah = useAksiKondisi('langkah_hari_ini');
  const aksiToilet = useAksiKondisi('panduan_toilet');
  const aksiLayar = useAksiKondisi('panduan_layar');
  const aksiSaudara = useAksiKondisi('panduan_saudara');
  const aksiPersiapan = useAksiKondisi('persiapan_rumah');
  const langkah = langkahHariIni([...aktif.map(k => k.tag), ...tagsDariPeta(peta.jawaban)], aksiLangkah);
  const tahapToilet = tahapToiletDariPeta(peta.jawaban, usiaBulan ?? null);
  const toiletSaran = tahapToilet ? panduanToilet(tahapToilet, aksiToilet) : null;
  const saranLyr = (peta.jawaban['a_layar']?.length ?? 0) > 0 ? saranLayar(usiaBulan ?? null, aksiLayar) : null;
  const ksSaudara = konteksSaudaraDariPeta(peta.jawaban);
  const saranSdr = butuhKontenAdik(ksSaudara) ? panduanSaudara(ksSaudara!, aksiSaudara) : null;
  const persiapan = persiapanRumah(usiaBulan ?? null, aksiPersiapan);
  const langkahSudahDiHari = (j: string) => { try { const sh = bacaStoreHari(idAnak, localISO(new Date())); const diExtra = Object.values(sh.extra).some(arr => arr.some(it => it.t === j)); const diKeg = Object.values(sh.addedKeg).some(arr => arr.some(k => k.nm === j)); return diExtra || diKeg; } catch { return false; } };
  const [langkahAksi, setLangkahAksi] = useState<'idle' | 'tambah' | 'tutup'>(() => (langkah && langkahSudahDiHari(langkah.judul) ? 'tambah' : 'idle'));
  const [lembarBuka, setLembarBuka] = useState<null | 'nifas' | 'piring'>(null);
  const [resourcePanel, setResourcePanel] = useState<null | 'prep' | 'kakak'>(null);
  const tambahInboxUnik = (judul: string) => { if (judul.trim() && !inbox.semua.some(i => i.judul === judul)) inbox.tambah(judul); };

  return (
    <>
      <section style={{ background: '#fff', borderRadius: 28, border: '1.5px solid #F6E6EE', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 21, color: PLUM, margin: 0 }}>Untukmu hari ini</h3>

        {langkah && langkahAksi !== 'tutup' && (
          <div style={{ background: '#EEF7EF', border: '1px solid #D6EBDA', borderRadius: 28, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '.6px', color: '#4E9A6A', textTransform: 'uppercase' }}>Satu langkah hari ini</span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 9.5, color: '#7B5BB8', background: '#fff', borderRadius: 6, padding: '2px 7px' }}>DISUSUN AI</span>
            </div>
            <p style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 21, color: '#2F5E40', margin: '0 0 6px', lineHeight: 1.25 }}>{langkah.judul}</p>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#4E7A5C', margin: '0 0 12px', lineHeight: 1.5 }}>{langkah.detail}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, color: '#6d8a72' }}>{SLOT_LABEL[langkah.slot]} · {KEG_NAMA[langkah.kegKey] ?? 'kegiatan'}</span>
              {langkahAksi === 'tambah' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#3F7A55' }}><CheckCircle2 size={14} strokeWidth={2.4} /> Ada di Hari Ini</span>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => { if (!langkahSudahDiHari(langkah.judul)) jadwalkanKeHari(idAnak, localISO(new Date()), { slot: langkah.slot, kegKey: langkah.kegKey, tipe: 'lainnya', teks: langkah.judul }); setLangkahAksi('tambah'); }}
                    style={{ background: '#4E9A6A', color: '#fff', border: 'none', borderRadius: 999, padding: '7px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Tambah ke Hari Ini</button>
                  <button type="button" onClick={() => setLangkahAksi('tutup')}
                    style={{ background: '#fff', color: '#8A5A74', border: '1px solid #D6EBDA', borderRadius: 999, padding: '7px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Nanti saja</button>
                </div>
              )}
            </div>
          </div>
        )}

        <RekomendasiRekah idAnak={idAnak} aktif={aktif} onBuka={onBuka} />

        {(toiletSaran || saranLyr) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tahapToilet && toiletSaran && <KartuPanduan label={`TOILET TRAINING · ${TAHAP_KESIAPAN[tahapToilet].toUpperCase()}`} judul={toiletSaran.judul} detail={toiletSaran.detail} tile="#EAF3E7" ink="#4E9C6E" />}
            {saranLyr && <KartuPanduan label="WAKTU LAYAR" judul={saranLyr.judul} detail={saranLyr.detail} extra={saranLyr.alternatif} tile="#EEF3FF" ink="#3F6FD8" />}
          </div>
        )}

        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
          {tampilNifas && (
            <button type="button" onClick={() => setLembarBuka('nifas')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #F6E6EE', borderRadius: 22, padding: 14, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 14, background: '#FDE9F2', color: '#D2559A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={19} strokeWidth={2} /></span>
              <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 14.5, color: PLUM }}>Lembar Nifas</span>
            </button>
          )}
          {tampilPiring && (
            <button type="button" onClick={() => setLembarBuka('piring')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #F6E6EE', borderRadius: 22, padding: 14, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 14, background: '#FFF6DC', color: '#B07A1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Utensils size={19} strokeWidth={2} /></span>
              <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 14.5, color: PLUM }}>Piring Ibu</span>
            </button>
          )}
          {persiapan.length > 0 && (
            <button type="button" onClick={() => setResourcePanel(p => (p === 'prep' ? null : 'prep'))}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1.5px solid ${resourcePanel === 'prep' ? '#F8B9D4' : '#F6E6EE'}`, borderRadius: 22, padding: 14, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 14, background: '#E8F1FC', color: '#4C7BC0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={19} strokeWidth={2} /></span>
              <span style={{ flex: 1, fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 14.5, color: PLUM }}>Persiapan rumah</span>
              <ChevronDown size={16} strokeWidth={2.4} color={KABUT} style={{ transform: resourcePanel === 'prep' ? 'rotate(180deg)' : 'rotate(-90deg)', transition: 'transform .2s' }} />
            </button>
          )}
          {saranSdr && (
            <button type="button" onClick={() => setResourcePanel(p => (p === 'kakak' ? null : 'kakak'))}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1.5px solid ${resourcePanel === 'kakak' ? '#F8B9D4' : '#F6E6EE'}`, borderRadius: 22, padding: 14, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 14, background: '#F0EAFB', color: '#7B5BB8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users2 size={19} strokeWidth={2} /></span>
              <span style={{ flex: 1, fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 14.5, color: PLUM }}>Jadi kakak</span>
              <ChevronDown size={16} strokeWidth={2.4} color={KABUT} style={{ transform: resourcePanel === 'kakak' ? 'rotate(180deg)' : 'rotate(-90deg)', transition: 'transform .2s' }} />
            </button>
          )}
        </div>

        {resourcePanel === 'prep' && persiapan.length > 0 && (
          <KartuPersiapanRumah items={persiapan} stageLabel={`${nama} · ${usiaTeks || 'bayi'} · ${tahapRumahLabel(usiaBulan ?? null)}`} onTambah={(j) => { tambahInboxUnik(j); onKeInbox?.(); }} sudah={(j) => inbox.semua.some(i => i.judul === j)} />
        )}
        {resourcePanel === 'kakak' && saranSdr && (
          <div style={{ background: '#F7F3FD', borderRadius: 20, padding: '16px 18px' }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 15, color: '#5E4396', marginBottom: 4 }}>{saranSdr.judul}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#6E3B57', lineHeight: 1.55 }}>{saranSdr.detail}</div>
          </div>
        )}
      </section>

      {lembarBuka === 'nifas' && (
        <ModalBungkus judul="Lembar Nifas" onTutup={() => setLembarBuka(null)}>
          <KartuNifas hari={hNifas} items={kfItems} store={nifas} onKePiring={() => setLembarBuka('piring')} onSyncKF={(it, v) => jadwalkanKeHari(idAnak, v.tgl, { slot: v.slot ?? 'pagi', kegKey: null, tipe: 'lainnya', teks: `Nifas — ${it.label}` })} />
        </ModalBungkus>
      )}
      {lembarBuka === 'piring' && (
        <ModalBungkus judul="Piring Ibu" onTutup={() => setLembarBuka(null)}>
          <KartuPiring store={piring} usiaBulan={usiaBulan ?? null} />
        </ModalBungkus>
      )}
    </>
  );
}

export default function KehidupanKeluarga({ nilaiFokus = [], onKeInbox, konteksAwal, onKonteksAwalDipakai }: {
  nilaiFokus?: readonly NilaiAkar[]; onKeInbox?: () => void;
  konteksAwal?: KonteksAwal | null; onKonteksAwalDipakai?: () => void;
}) {
  const { profile, usiaBulan } = useChildProfile();
  const nama = profile.namaAnak || 'Anak';
  // Konteks Hidup (dipindah dari halaman Arah · Phase 21): usia & tahap usia.
  const band = bandDariUsia(usiaBulan ?? null);
  const usiaTeks = teksUsia(usiaBulan ?? null);
  const { anakAktif } = useAnak();
  const idAnak = anakAktif?.id ?? 'anon';
  const navigate = useNavigate();
  const { aktif, tenang, tambah, perbarui, setStatus, hapus } = useKehidupanStore(idAnak);
  const peta = usePetaStore(idAnak);
  const bandNow = bandPeta(usiaBulan);
  const inbox = useInboxStore(idAnak);
  const peristiwa = usePeristiwaStore(idAnak);
  const imun = useImunisasiStore(idAnak);
  const hariIniDate = new Date();
  const imList = jadwalImunisasi(profile.tanggalLahir, usiaBulan);
  const konfirmasiImun = (key: string, v: ImunisasiJadwal) => {
    imun.konfirmasi(key, v);
    const it = imList.find(a => a.key === key);
    if (v.slot) jadwalkanKeHari(idAnak, v.tgl, { slot: v.slot, kegKey: null, tipe: 'lainnya', teks: `Imunisasi — ${it?.label ?? ''}`.trim() });
  };

  const [draft, setDraft] = useState<DraftKonteks | null>(() => (konteksAwal ? { ...DRAFT_BARU, ...konteksAwal } : null));
  // Isian awal dipakai sekali saja, lalu dilepas agar tidak terbuka lagi saat tab dibuka ulang.
  useEffect(() => { if (konteksAwal) onKonteksAwalDipakai?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [lihatTenang, setLihatTenang] = useState(false);
  const [bukaBidang, setBukaBidang] = useState<BidangPeta | null>('anak');
  const [bukaPeta, setBukaPeta] = useState(false);
  const [ringkasSemua, setRingkasSemua] = useState<Record<string, boolean>>({});

  const bukaPerbarui = (k: KonteksKehidupan) => setDraft({ id: k.id, bidang: k.bidang, judul: k.judul, catatan: k.catatan ?? '', sejak: k.sejak, tag: k.tag, status: k.status });
  const tambahCepat = (qp: typeof QUICK_KONTEKS[number]) => { if (aktif.some(k => k.judul === qp.judul)) return; tambah({ bidang: qp.bidang, judul: qp.judul, sejak: 'baru', tag: qp.tag }); };
  const simpan = () => {
    if (!draft || !draft.judul.trim()) return;
    if (draft.id) perbarui(draft.id, { bidang: draft.bidang, judul: draft.judul, catatan: draft.catatan, sejak: draft.sejak, tag: draft.tag, status: draft.status });
    else tambah({ bidang: draft.bidang, judul: draft.judul, catatan: draft.catatan, sejak: draft.sejak, tag: draft.tag });
    setDraft(null);
  };

  const tambahInboxUnik = (judul: string) => { if (judul.trim() && !inbox.semua.some(i => i.judul === judul)) inbox.tambah(judul); };
  const konfirmasiPeta = (qid: string, sel: string[]): string | undefined => {
    if (sel.length === 0) return undefined;
    if (qid === 'a_alergi') {
      const al = sel.filter(v => v !== 'Tidak ada' && v !== 'Lainnya');
      return al.length ? `Rekah akan menghindari ide main yang memakai ${al.map(x => x.toLowerCase()).join(', ')} di sarannya.` : undefined;
    }
    if (qid === 'c_bahasa') {
      const dw = sel.includes('Dwibahasa') || (sel.includes('Indonesia') && sel.includes('Bahasa daerah'));
      return dw ? 'Rekah akan mengutamakan ide yang ramah dua bahasa.' : undefined;
    }
    if (qid === 'c_ibu') {
      const l = lembarTerbuka({ c_ibu: sel });
      const nm: string[] = [];
      if (l.nifas) nm.push('Nifas');
      if (l.piring) nm.push('Piring Ibu');
      return nm.length ? `Lembar ${nm.join(' & ')} sekarang aktif untukmu.` : undefined;
    }
    if (qid === 'r_rokok') {
      if (sel.includes('Ya, di dalam') || sel.includes('Ya, di luar saja')) return 'Rekah menaruh pengingat: jadikan rumah & mobil bebas asap, ganti baju setelah merokok.';
      return sel.includes('Tidak ada') ? 'Rumah bebas asap melindungi tumbuh kembang anak.' : undefined;
    }
    if (qid === 'r_tidur') {
      return 'Panduan tidur aman: telentang, kasur keras & datar, area tidur kosong, sekamar dengan ortu bukan seranjang. (DRAFT)';
    }
    return undefined;
  };

  const ringkas = ringkasanPeta(peta.jawaban);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Editor Peta (muncul saat "Perbarui data keluarga") */}
      {bukaPeta && (
        <div style={{ background: '#FBF6F1', border: `1px solid ${GARIS}`, borderRadius: 20, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 18, color: PLUM, margin: 0 }}>Perbarui peta kehidupan keluarga</h2>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: KABUT }}>jawaban langsung tersimpan</span>
          </div>

          <Bidang label={`Anak — ${nama}`} sub={usiaTeks ? (band ? `${usiaTeks} · tahap ${band.judul}` : usiaTeks) : 'profil anak'} Ikon={Baby} tile={BIDANG.anak.tile} ink={BIDANG.anak.ink}
            open={bukaBidang === 'anak'} onToggle={() => setBukaBidang(b => (b === 'anak' ? null : 'anak'))}>
            {band && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 0', borderTop: `1px dashed ${GARIS}` }}>
                <span style={{ flex: '0 0 128px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74' }}>Tahap usia</span>
                <span style={{ flex: 1, fontFamily: 'Nunito, sans-serif', fontSize: 13, color: PLUM, lineHeight: 1.5 }}>
                  <b style={{ fontWeight: 800 }}>{band.judul}</b> · {band.usia}
                  <span style={{ display: 'block', fontWeight: 600, color: '#8A5A74' }}>{band.nilaiInti}</span>
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderTop: `1px dashed ${GARIS}` }}>
              <span style={{ flex: '0 0 128px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74' }}>Nilai fokus</span>
              <span style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {nilaiFokus.length ? nilaiFokus.map(n => (
                  <span key={n} style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#C6407F', background: '#FBE7EC', borderRadius: 999, padding: '3px 11px' }}>{n}</span>
                )) : <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12.5, color: KABUT }}>Tetapkan di tab Perjalanan</span>}
              </span>
            </div>
            {PETA_PERTANYAAN.filter(q => q.bidang === 'anak' && (q.band === 'all' || q.band === bandNow)).map(q => (
              <PetaChips key={q.id} q={q} sel={peta.jawaban[q.id] ?? []} warna={BIDANG.anak.ink} onPilih={v => peta.pilih(q, v)} pesan={konfirmasiPeta(q.id, peta.jawaban[q.id] ?? [])} />
            ))}
          </Bidang>

          <Bidang label="Caregiver — siapa & ritmenya" sub="Bunda · Ayah · Nenek" Ikon={Users2} tile={BIDANG.caregiver.tile} ink={BIDANG.caregiver.ink}
            open={bukaBidang === 'caregiver'} onToggle={() => setBukaBidang(b => (b === 'caregiver' ? null : 'caregiver'))}>
            {PETA_PERTANYAAN.filter(q => q.bidang === 'caregiver' && (q.band === 'all' || q.band === bandNow)).map(q => (
              <PetaChips key={q.id} q={q} sel={peta.jawaban[q.id] ?? []} warna={BIDANG.caregiver.ink} onPilih={v => peta.pilih(q, v)} pesan={konfirmasiPeta(q.id, peta.jawaban[q.id] ?? [])} />
            ))}
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, background: '#EFE9FB', borderRadius: 12, padding: '11px 13px', flexWrap: 'wrap' }}>
              <Heart size={16} strokeWidth={2} color="#7A5CA6" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 150, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12, color: '#6E3B57', lineHeight: 1.5 }}>Energi &amp; suasana pengasuh dijaga di Ruang Teduh (Langit Hati).</span>
              <Link to="/dashboard/tier2/ruang-teduh" style={{ flexShrink: 0, background: '#fff', border: '1px solid #D9C7E8', color: '#7A5CA6', borderRadius: 10, padding: '7px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>Buka Ruang Teduh</Link>
            </div>
          </Bidang>

          <Bidang label="Rumah — ritme & kebutuhan" sub="Jam sibuk, ruang main, kebutuhan" Ikon={Home} tile={BIDANG.rumah.tile} ink={BIDANG.rumah.ink}
            open={bukaBidang === 'rumah'} onToggle={() => setBukaBidang(b => (b === 'rumah' ? null : 'rumah'))}>
            {PETA_PERTANYAAN.filter(q => q.bidang === 'rumah' && (q.band === 'all' || q.band === bandNow)).map(q => {
              const qRender = q.id === 'r_aman' ? { ...q, opsi: opsiAman(usiaBulan ?? null).map(v => ({ v })) } : q;
              return (
                <PetaChips key={q.id} q={qRender} sel={peta.jawaban[q.id] ?? []} warna={BIDANG.rumah.ink} onPilih={v => peta.pilih(qRender, v)}
                  pesan={konfirmasiPeta(q.id, peta.jawaban[q.id] ?? [])}
                  labelInbox={q.id === 'r_aman' ? 'Tambah pengingat keselamatan' : undefined}
                  onInbox={q.inbox ? () => { (peta.jawaban[q.id] ?? []).forEach(v => tambahInboxUnik(v)); onKeInbox?.(); }
                    : q.id === 'r_aman' ? () => { (peta.jawaban[q.id] ?? []).forEach(v => { const j = AMAN_REMINDER[v]; if (j) tambahInboxUnik(j); }); onKeInbox?.(); }
                    : undefined} />
              );
            })}
          </Bidang>

          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <button type="button" onClick={() => setBukaPeta(false)}
              style={{ background: '#fff', color: '#8A5A74', border: '1.5px solid #E7D3E0', borderRadius: 11, padding: '8px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>Selesai memperbarui</button>
          </div>
        </div>
      )}

      {/* ===== SECTION 1 — Keluarga {nama} sekarang (profil) ===== */}
      <section style={{ background: '#fff', borderRadius: 28, border: '1.5px solid #F6E6EE', padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: '1.6px', color: '#B48DA3', textTransform: 'uppercase' }}>{nama} · {usiaTeks || '0 bulan'}</div>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 26, color: PLUM, margin: '4px 0 0' }}>Keluarga {nama} sekarang</h2>
          </div>
          <button type="button" onClick={() => setBukaPeta(o => !o)}
            style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FBF8FF', color: '#7B5BB8', border: '1.5px solid #DCCBF3', borderRadius: 999, padding: '9px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            <Pencil size={15} strokeWidth={2.4} /> Perbarui
            <ChevronDown size={14} strokeWidth={2.4} style={{ transform: bukaPeta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </button>
        </div>

        {ringkas.length === 0 ? (
          <div style={{ background: '#FFFAF5', border: `1px dashed ${GARIS}`, borderRadius: 20, padding: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13.5, color: '#8A5A74', margin: '0 0 12px' }}>Peta kehidupan keluarga belum terisi. Isi sebentar agar saran Rekah terasa pas.</p>
            <button type="button" onClick={() => setBukaPeta(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#D2559A', color: '#fff', border: 'none', borderRadius: 999, padding: '9px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              <Pencil size={14} strokeWidth={2.4} /> Isi peta keluarga
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', alignItems: 'start' }}>
            {(['anak', 'caregiver', 'rumah'] as const).map(bd => {
              const pts = ringkas.filter(p => p.bidang === bd);
              if (pts.length === 0) return null;
              const T = TILE_PROFIL[bd];
              const semua = !!ringkasSemua[bd];
              const shown = semua ? pts : pts.slice(0, 3);
              const Ikon = bd === 'anak' ? Baby : bd === 'caregiver' ? Users2 : Home;
              return (
                <div key={bd} style={{ background: T.soft, borderRadius: 22, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 14, background: '#fff', color: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ikon size={20} strokeWidth={2.2} /></span>
                    <span style={{ flex: 1, fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 19, color: PLUM }}>{BIDANG[bd].label}</span>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: T.ink, background: '#fff', borderRadius: 999, padding: '2px 10px' }}>{pts.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {shown.map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: '#9A6F86', flexShrink: 0 }}>{p.label}</span>
                        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, color: '#6E3B57', textAlign: 'right' }}>{p.nilai}</span>
                      </div>
                    ))}
                  </div>
                  {pts.length > 3 && (
                    <button type="button" onClick={() => setRingkasSemua(o => ({ ...o, [bd]: !o[bd] }))}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: T.ink }}>
                      {semua ? 'Ringkas' : 'Lihat semua'} <ChevronDown size={14} strokeWidth={2.6} style={{ transform: semua ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== SECTION 2 — 2 kolom: kiri yang berubah, kanan untukmu ===== */}
      <div className="grid items-start gap-[18px] lg:grid-cols-2">

        {/* 2a. Yang sedang berubah */}
        <section style={{ background: '#fff', borderRadius: 28, border: '1.5px solid #F6E6EE', padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 21, color: PLUM, margin: 0 }}>Yang sedang berubah</h3>
              {aktif.length > 0 && <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#D2559A', background: '#FDE9F2', borderRadius: 999, padding: '2px 10px' }}>{aktif.length}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, color: KABUT }}>Tambah:</span>
            {QUICK_KONTEKS.map(qp => {
              const ada = aktif.some(k => k.judul === qp.judul);
              return (
                <button key={qp.key} type="button" disabled={ada} onClick={() => tambahCepat(qp)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: ada ? '#EEF7EF' : '#fff', color: ada ? '#3F7A55' : '#8A5A74', border: `1px solid ${ada ? '#D6EBDA' : '#F2DDE7'}`, borderRadius: 999, padding: '6px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: ada ? 'default' : 'pointer' }}>
                  {ada ? <Check size={12} strokeWidth={2.6} /> : <Plus size={12} strokeWidth={2.6} />} {qp.chip}
                </button>
              );
            })}
          </div>

          {aktif.length === 0 ? (
            <div style={{ background: '#FFFAF5', border: `1px dashed ${GARIS}`, borderRadius: 20, padding: '22px 18px', textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13.5, color: '#8A5A74' }}>
              Semuanya sedang tenang.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aktif.map(k => (
                <KartuKonteks key={k.id} k={k} onPerbarui={() => bukaPerbarui(k)} onTenang={() => setStatus(k.id, 'tenang')} onHapus={() => hapus(k.id)} />
              ))}
            </div>
          )}

          {tenang.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <button type="button" onClick={() => setLihatTenang(o => !o)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#7FA88C', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', padding: 0 }}>
                <Check size={14} strokeWidth={2.6} /> {tenang.length} sudah tenang, dirapikan
                <ChevronDown size={14} strokeWidth={2.4} style={{ transform: lihatTenang ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {lihatTenang && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  {tenang.map(k => (
                    <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FBF6F1', border: `1px solid ${GARIS}`, borderRadius: 14, padding: '10px 13px' }}>
                      <span style={{ flex: 1, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74' }}>{k.judul}</span>
                      <button type="button" onClick={() => setStatus(k.id, 'aktif')} style={{ ...miniBtn, padding: '4px 10px', fontSize: 11.5 }}>Munculkan lagi</button>
                      <button type="button" onClick={() => hapus(k.id)} style={{ ...miniBtn, padding: '4px 10px', fontSize: 11.5, color: KABUT }}>Hapus</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* 2b. Untukmu hari ini (komponen bersama — sama dengan Beranda) */}
        <UntukmuHariIni idAnak={idAnak} nama={nama} usiaBulan={usiaBulan ?? null} tanggalLahir={profile.tanggalLahir} peta={peta} aktif={aktif} inbox={inbox} onKeInbox={onKeInbox} onBuka={(to) => navigate(to)} />
      </div>

      {/* Yang akan datang (timeline — design handoff) */}
      <KartuMendatang imList={imList} jadwalImun={imun.jadwal} onKonfirmasiImun={konfirmasiImun} peristiwa={peristiwa.items} onHapusPeristiwa={(id) => peristiwa.hapus(id)} onTambahPeristiwa={(j, t, jn, opts) => { peristiwa.tambah(j, t, jn, opts); if (opts.slot) jadwalkanKeHari(idAnak, t, { slot: opts.slot, kegKey: null, tipe: 'lainnya', teks: j }); }} hariIni={hariIniDate} />

      {/* Footer jujur */}
      <p style={{ display: 'flex', gap: 8, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 12, color: KABUT, lineHeight: 1.55, margin: '4px 0 0' }}>
        Rekah tidak menilai keluargamu dan tidak membandingkan dengan siapa pun. Semua di sini bisa kamu ubah, jeda, atau rapikan — kamu yang memegang kemudi. Hal bernuansa kesehatan sebaiknya dibicarakan dengan tenaga profesional.
      </p>

      {draft && <ModalKonteks draft={draft} onChange={setDraft} onSimpan={simpan} onTutup={() => setDraft(null)} />}
    </div>
  );
}
