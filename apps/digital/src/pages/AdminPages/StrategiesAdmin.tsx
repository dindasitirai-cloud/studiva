import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Search, X, Save, ChevronDown, ChevronUp,
  Send, RefreshCw, Copy, ShoppingBag, ExternalLink, AlertTriangle, ChevronRight, Eye,
} from 'lucide-react';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import {
  ACTIVITIES as STATIC_ACTIVITIES,
  WEEKLY_PLANS as STATIC_PLANS,
  EDU_TOOLS as STATIC_TOOLS,
  DOWNLOADABLES as STATIC_DOWNLOADS,
} from '../../data/learningStrategies';
import { api } from '../../api/client';
import {
  AGE_RANGES, DOMAIN_META,
  Activity, WeeklyPlan, EduTool, Downloadable, DomainKey, DownloadKategori, ContentStatus,
} from '../../data/learningStrategies';
import CsvImportModal from './CsvImportModal';
import {
  ActivityCard,
  ActivityModal as ActivityDetailModal,
  PlanCard,
  PlanModal as PlanDetailModal,
  ToolCard,
  ToolModal as ToolDetailModal,
  DownloadCard,
  DownloadModal as DownloadDetailModal,
} from '../DashboardPages/Tier2/LearningStrategiesTier2';

// ── helpers ──────────────────────────────────────────────────────────────────

const DOMAIN_KEYS = Object.keys(DOMAIN_META) as DomainKey[];
const KATEGORI_OPTIONS: DownloadKategori[] = ['Buku Cerita', 'Flashcard', 'Worksheet', 'Checklist', 'Panduan'];

function ageStr(min: number, max: number) {
  const f = (m: number) => m >= 12 ? `${Math.floor(m / 12)} thn` : `${m} bln`;
  return `${f(min)} - ${f(max)}`;
}

const STATUS_META: Record<ContentStatus, { label: string; bg: string; text: string }> = {
  draft:     { label: 'Draft',    bg: 'bg-slate-100',  text: 'text-slate-600' },
  review:    { label: 'Review',   bg: 'bg-blue-100',   text: 'text-blue-700' },
  approved:  { label: 'Disetujui', bg: 'bg-green-100', text: 'text-green-700' },
  published: { label: 'Terbit',   bg: 'bg-green-500',  text: 'text-white' },
};

const LINK_STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  KOSONG:    { label: 'Kosong',    bg: 'bg-slate-100', text: 'text-slate-600' },
  TERPASANG: { label: 'Terpasang', bg: 'bg-green-100', text: 'text-green-700' },
  PERLU_CEK: { label: 'Perlu Cek', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  MATI:      { label: 'Mati',      bg: 'bg-red-100',   text: 'text-red-700' },
};

function StatusBadge({ status }: { status?: ContentStatus }) {
  const s = status ?? 'published';
  const m = STATUS_META[s];
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
}

function LinkStatusBadge({ statusLink }: { statusLink?: string }) {
  if (!statusLink) return <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">-</span>;
  const m = LINK_STATUS_META[statusLink] ?? { label: statusLink, bg: 'bg-slate-100', text: 'text-slate-600' };
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${m.bg} ${m.text}`}>{m.label}</span>;
}

// ── shared form field components ─────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-stv-navy">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full rounded-xl border border-stv-border px-3 py-2 text-[13px] focus:border-amber-400 focus:outline-none";
const ta  = `${inp} resize-none`;

// ── shared modal shell ────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[640px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[17px] font-bold text-stv-navy">{title}</h2>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-stv-muted hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onClose, onSaveDraft, currentStatus }: { onClose: () => void; onSaveDraft?: () => void; currentStatus?: ContentStatus }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
      <button type="button" onClick={onClose}
        className="rounded-full border border-stv-border px-4 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50">
        Batal
      </button>
      <div className="flex gap-2">
        {onSaveDraft && (
          <button type="button" onClick={onSaveDraft}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50">
            <Save className="h-3.5 w-3.5" /> Simpan Draft
          </button>
        )}
        <button type="submit"
          className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-amber-600">
          <Send className="h-3.5 w-3.5" /> Simpan
        </button>
      </div>
    </div>
  );
}

// ── Activity Form ─────────────────────────────────────────────────────────────

type AForm = Omit<Activity, 'id' | 'bahan' | 'langkah' | 'domain'> & {
  bahanItems: { nama: string; affiliateUrl: string }[];
  langkahItems: string[];
  domain: DomainKey[];
};

const EMPTY_AFORM: AForm = {
  icon: '🎯', judul: '', ageId: 'b03', domain: ['mk'],
  durasiMenit: 15, isDIY: true,
  deskripsi: '', sci: '', sumber: '', tujuan: '',
  bahanItems: [], langkahItems: [''],
  variasiMudah: '', variasiMenantang: '', adaptasiABK: '',
  catatanReviewer: '', status: 'draft',
};

function toAForm(a: Activity): AForm {
  return {
    ...a,
    bahanItems: a.bahan.map(b => ({ nama: b.nama, affiliateUrl: b.affiliateUrl ?? '' })),
    langkahItems: a.langkah.length > 0 ? a.langkah : [''],
  };
}

function fromAForm(f: AForm, id?: number): Activity {
  return {
    id: id ?? 0,
    icon: f.icon, judul: f.judul, ageId: f.ageId, domain: f.domain,
    durasiMenit: f.durasiMenit, isDIY: f.isDIY,
    deskripsi: f.deskripsi, sci: f.sci, sumber: f.sumber, tujuan: f.tujuan,
    bahan: f.bahanItems.filter(b => b.nama.trim()).map(b => ({ nama: b.nama.trim(), affiliateUrl: b.affiliateUrl || undefined })),
    langkah: f.langkahItems.filter(s => s.trim()).map(s => s.trim()),
    variasiMudah: f.variasiMudah, variasiMenantang: f.variasiMenantang, adaptasiABK: f.adaptasiABK,
    catatanReviewer: f.catatanReviewer,
    status: f.status,
  };
}

function ActivityModal({ initial, id, onClose }: { initial: AForm; id?: number; onClose: () => void }) {
  const { adminAddActivity, adminUpdateActivity } = useLearningStrategies();
  const [form, setForm] = useState<AForm>(initial);
  const [err, setErr] = useState('');

  function save(status: ContentStatus) {
    if (!form.judul.trim() || !form.deskripsi.trim()) { setErr('Judul dan deskripsi wajib diisi.'); return; }
    const a = { ...fromAForm(form, id), status };
    if (id !== undefined) adminUpdateActivity(id, a);
    else adminAddActivity(a);
    onClose();
  }

  function submit(e: React.FormEvent) { e.preventDefault(); save(form.status ?? 'draft'); }

  function toggleDomain(d: DomainKey) {
    setForm(f => ({
      ...f,
      domain: f.domain.includes(d) ? f.domain.filter(x => x !== d) : [...f.domain, d],
    }));
  }

  function updateBahan(i: number, field: 'nama' | 'affiliateUrl', val: string) {
    setForm(f => {
      const items = [...f.bahanItems];
      items[i] = { ...items[i], [field]: val };
      return { ...f, bahanItems: items };
    });
  }

  function addBahan() { setForm(f => ({ ...f, bahanItems: [...f.bahanItems, { nama: '', affiliateUrl: '' }] })); }
  function removeBahan(i: number) { setForm(f => ({ ...f, bahanItems: f.bahanItems.filter((_, idx) => idx !== i) })); }

  function updateLangkah(i: number, val: string) {
    setForm(f => {
      const items = [...f.langkahItems];
      items[i] = val;
      return { ...f, langkahItems: items };
    });
  }
  function addLangkah() {
    if (form.langkahItems.length >= 10) return;
    setForm(f => ({ ...f, langkahItems: [...f.langkahItems, ''] }));
  }
  function removeLangkah(i: number) { setForm(f => ({ ...f, langkahItems: f.langkahItems.filter((_, idx) => idx !== i) })); }

  return (
    <Modal title={id !== undefined ? 'Edit Aktivitas' : 'Tambah Aktivitas'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ikon (emoji)" required>
            <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inp} />
          </Field>
          <Field label="Status">
            <select value={form.status ?? 'draft'} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContentStatus }))} className={inp}>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Disetujui</option>
              <option value="published">Terbit</option>
            </select>
          </Field>
        </div>

        <Field label="Judul" required>
          <input value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} className={inp} />
        </Field>

        <Field label="Kelompok Usia" required>
          <select value={form.ageId} onChange={e => setForm(f => ({ ...f, ageId: e.target.value }))} className={inp}>
            {AGE_RANGES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>

        <Field label="Domain (pilih satu atau lebih)">
          <div className="flex flex-wrap gap-1.5 pt-1">
            {DOMAIN_KEYS.map(d => {
              const m = DOMAIN_META[d];
              const active = form.domain.includes(d);
              return (
                <button key={d} type="button" onClick={() => toggleDomain(d)}
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold transition"
                  style={active ? { background: m.bg, color: m.color, outline: `2px solid ${m.color}` } : { background: '#F1F5F9', color: '#64748B' }}>
                  {m.emoji} {m.label}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Durasi (menit)">
            <input type="number" min={1} value={form.durasiMenit}
              onChange={e => setForm(f => ({ ...f, durasiMenit: Number(e.target.value) }))} className={inp} />
          </Field>
          <Field label="Tipe">
            <div className="flex gap-2 pt-1">
              {[true, false].map(v => (
                <button key={String(v)} type="button" onClick={() => setForm(f => ({ ...f, isDIY: v }))}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${form.isDIY === v ? 'bg-amber-500 text-white' : 'bg-slate-100 text-stv-body'}`}>
                  {v ? 'DIY (tanpa alat)' : 'Perlu Alat'}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Deskripsi Singkat" required>
          <textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={2} className={ta} />
        </Field>

        <Field label="Tujuan">
          <textarea value={form.tujuan} onChange={e => setForm(f => ({ ...f, tujuan: e.target.value }))} rows={2} className={ta} />
        </Field>

        <Field label="Bukti Ilmiah">
          <textarea value={form.sci} onChange={e => setForm(f => ({ ...f, sci: e.target.value }))} rows={2} className={ta} />
        </Field>

        <Field label="Sumber / Referensi">
          <input value={form.sumber} onChange={e => setForm(f => ({ ...f, sumber: e.target.value }))} className={inp} />
        </Field>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[12px] font-semibold text-stv-navy">Bahan</label>
            <button type="button" onClick={addBahan}
              className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-stv-body hover:bg-slate-200">
              <Plus className="h-3 w-3" /> Tambah Bahan
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {form.bahanItems.map((b, i) => (
              <div key={i} className="flex gap-1.5">
                <input value={b.nama} onChange={e => updateBahan(i, 'nama', e.target.value)}
                  placeholder="Nama bahan" className={`${inp} flex-1`} />
                <input value={b.affiliateUrl} onChange={e => updateBahan(i, 'affiliateUrl', e.target.value)}
                  placeholder="URL afiliasi (opsional)" className={`${inp} flex-1`} />
                <button type="button" onClick={() => removeBahan(i)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[12px] font-semibold text-stv-navy">Langkah-Langkah</label>
            <button type="button" onClick={addLangkah} disabled={form.langkahItems.length >= 10}
              className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-stv-body hover:bg-slate-200 disabled:opacity-40">
              <Plus className="h-3 w-3" /> Tambah Langkah
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {form.langkahItems.map((s, i) => (
              <div key={i} className="flex gap-1.5 items-start">
                <span className="mt-2 text-[11px] font-bold text-stv-muted w-5 shrink-0 text-right">{i + 1}.</span>
                <textarea value={s} onChange={e => updateLangkah(i, e.target.value)}
                  rows={1} placeholder={`Langkah ${i + 1}...`} className={`${ta} flex-1`} />
                <button type="button" onClick={() => removeLangkah(i)}
                  className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Variasi Lebih Mudah">
            <textarea value={form.variasiMudah} onChange={e => setForm(f => ({ ...f, variasiMudah: e.target.value }))} rows={2} className={ta} />
          </Field>
          <Field label="Variasi Lebih Menantang">
            <textarea value={form.variasiMenantang} onChange={e => setForm(f => ({ ...f, variasiMenantang: e.target.value }))} rows={2} className={ta} />
          </Field>
        </div>

        <Field label="Adaptasi untuk Anak dengan Kebutuhan Khusus">
          <textarea value={form.adaptasiABK} onChange={e => setForm(f => ({ ...f, adaptasiABK: e.target.value }))} rows={2} className={ta} />
        </Field>

        <Field label="Catatan Reviewer">
          <textarea value={form.catatanReviewer ?? ''} onChange={e => setForm(f => ({ ...f, catatanReviewer: e.target.value }))} rows={2} className={ta} />
        </Field>

        {err && <p className="text-[12px] text-red-500">{err}</p>}
        <ModalFooter onClose={onClose} onSaveDraft={() => save('draft')} currentStatus={form.status} />
      </form>
    </Modal>
  );
}

// ── Plan Form ─────────────────────────────────────────────────────────────────

type PForm = Omit<WeeklyPlan, 'id'>;

const EMPTY_PFORM: PForm = {
  icon: '📅', judul: '', ageLabel: '', minBulan: 0, maxBulan: 12,
  deskripsi: '', sci: '', sumber: '', caraPakai: '',
  hari: Array.from({ length: 7 }, (_, i) => ({ judul: `Hari ${i + 1}`, deskripsi: '', activityIds: [] })),
  catatanReviewer: '', status: 'draft',
};

function PlanModal({ initial, id, onClose }: { initial: PForm; id?: number; onClose: () => void }) {
  const { adminAddPlan, adminUpdatePlan, publishedActivities } = useLearningStrategies();
  const [form, setForm] = useState<PForm>(initial);
  const [err, setErr] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  function updateHari(i: number, patch: Partial<PForm['hari'][0]>) {
    setForm(f => {
      const hari = [...f.hari];
      hari[i] = { ...hari[i], ...patch };
      return { ...f, hari };
    });
  }

  function save(status: ContentStatus) {
    if (!form.judul.trim()) { setErr('Judul wajib diisi.'); return; }
    const payload = { ...form, status };
    if (id !== undefined) adminUpdatePlan(id, payload);
    else adminAddPlan(payload);
    onClose();
  }

  function submit(e: React.FormEvent) { e.preventDefault(); save(form.status ?? 'draft'); }

  return (
    <Modal title={id !== undefined ? 'Edit Program Mingguan' : 'Tambah Program'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ikon"><input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inp} /></Field>
          <Field label="Status">
            <select value={form.status ?? 'draft'} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContentStatus }))} className={inp}>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Disetujui</option>
              <option value="published">Terbit</option>
            </select>
          </Field>
        </div>
        <Field label="Judul" required><input value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} className={inp} /></Field>
        <Field label="Label Usia"><input value={form.ageLabel} onChange={e => setForm(f => ({ ...f, ageLabel: e.target.value }))} className={inp} placeholder="0-3 bulan" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Usia Min (bulan)"><input type="number" min={0} value={form.minBulan} onChange={e => setForm(f => ({ ...f, minBulan: Number(e.target.value) }))} className={inp} /></Field>
          <Field label="Usia Max (bulan)"><input type="number" min={0} value={form.maxBulan} onChange={e => setForm(f => ({ ...f, maxBulan: Number(e.target.value) }))} className={inp} /></Field>
        </div>
        <Field label="Deskripsi"><textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Bukti Ilmiah"><textarea value={form.sci} onChange={e => setForm(f => ({ ...f, sci: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Sumber"><input value={form.sumber} onChange={e => setForm(f => ({ ...f, sumber: e.target.value }))} className={inp} /></Field>
        <Field label="Cara Menggunakan"><textarea value={form.caraPakai} onChange={e => setForm(f => ({ ...f, caraPakai: e.target.value }))} rows={2} className={ta} /></Field>

        <div>
          <p className="mb-2 text-[12px] font-semibold text-stv-navy">7 Hari Program</p>
          <div className="flex flex-col gap-1.5">
            {form.hari.map((h, i) => (
              <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
                <button type="button" onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] font-semibold text-stv-navy hover:bg-slate-50">
                  {h.judul || `Hari ${i + 1}`}
                  {expandedDay === i ? <ChevronUp className="h-4 w-4 text-stv-muted" /> : <ChevronDown className="h-4 w-4 text-stv-muted" />}
                </button>
                {expandedDay === i && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 p-3">
                    <input value={h.judul} onChange={e => updateHari(i, { judul: e.target.value })}
                      placeholder={`Judul Hari ${i + 1}`} className={inp} />
                    <textarea value={h.deskripsi} onChange={e => updateHari(i, { deskripsi: e.target.value })}
                      rows={2} placeholder="Deskripsi singkat hari ini..." className={ta} />
                    <div>
                      <p className="mb-1 text-[11px] text-stv-muted">Pilih aktivitas (dari yang sudah terbit):</p>
                      <div className="max-h-32 overflow-y-auto rounded-xl border border-stv-border p-2 flex flex-col gap-0.5">
                        {publishedActivities.slice(0, 50).map(a => (
                          <label key={a.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                            <input type="checkbox"
                              checked={h.activityIds.includes(a.id)}
                              onChange={e => {
                                const ids = e.target.checked
                                  ? [...h.activityIds, a.id]
                                  : h.activityIds.filter(x => x !== a.id);
                                updateHari(i, { activityIds: ids });
                              }}
                            />
                            <span className="text-[12px] text-stv-body">{a.icon} {a.judul}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Field label="Catatan Reviewer">
          <textarea value={form.catatanReviewer ?? ''} onChange={e => setForm(f => ({ ...f, catatanReviewer: e.target.value }))} rows={2} className={ta} />
        </Field>

        {err && <p className="text-[12px] text-red-500">{err}</p>}
        <ModalFooter onClose={onClose} onSaveDraft={() => save('draft')} />
      </form>
    </Modal>
  );
}

// ── Tool Form ─────────────────────────────────────────────────────────────────

type TForm = Omit<EduTool, 'id' | 'keunggulan'> & { keunggulanItems: string[] };

const EMPTY_TFORM: TForm = {
  icon: '🧸', nama: '', hargaEstimasi: '', pilihanPsikolog: false,
  minBulan: 0, maxBulan: 12, ageLabel: '',
  deskripsi: '', sci: '', sumber: '', keunggulanItems: [''], affiliateUrl: '',
  statusLink: 'KOSONG', tanggalCekLink: '', catatanReviewer: '', status: 'draft',
};

function toTForm(t: EduTool): TForm {
  return {
    ...t,
    keunggulanItems: t.keunggulan.length > 0 ? t.keunggulan : [''],
  };
}

function ToolModal({ initial, id, onClose }: { initial: TForm; id?: number; onClose: () => void }) {
  const { adminAddTool, adminUpdateTool } = useLearningStrategies();
  const [form, setForm] = useState<TForm>(initial);
  const [err, setErr] = useState('');

  function save(status: ContentStatus) {
    if (!form.nama.trim()) { setErr('Nama wajib diisi.'); return; }
    const t: Omit<EduTool, 'id'> = {
      ...form, status,
      keunggulan: form.keunggulanItems.filter(s => s.trim()).map(s => s.trim()),
    };
    if (id !== undefined) adminUpdateTool(id, t);
    else adminAddTool(t);
    onClose();
  }

  function submit(e: React.FormEvent) { e.preventDefault(); save(form.status ?? 'draft'); }

  function updateKeunggulan(i: number, val: string) {
    setForm(f => {
      const items = [...f.keunggulanItems];
      items[i] = val;
      return { ...f, keunggulanItems: items };
    });
  }

  return (
    <Modal title={id !== undefined ? 'Edit Alat Edukasi' : 'Tambah Alat Edukasi'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ikon"><input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inp} /></Field>
          <Field label="Status">
            <select value={form.status ?? 'draft'} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContentStatus }))} className={inp}>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Disetujui</option>
              <option value="published">Terbit</option>
            </select>
          </Field>
        </div>
        <Field label="Nama Alat" required><input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} className={inp} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Estimasi Harga"><input value={form.hargaEstimasi} onChange={e => setForm(f => ({ ...f, hargaEstimasi: e.target.value }))} className={inp} placeholder="Rp 50.000 - 120.000" /></Field>
          <Field label="Label Usia"><input value={form.ageLabel} onChange={e => setForm(f => ({ ...f, ageLabel: e.target.value }))} className={inp} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Usia Min (bulan)"><input type="number" min={0} value={form.minBulan} onChange={e => setForm(f => ({ ...f, minBulan: Number(e.target.value) }))} className={inp} /></Field>
          <Field label="Usia Max (bulan)"><input type="number" min={0} value={form.maxBulan} onChange={e => setForm(f => ({ ...f, maxBulan: Number(e.target.value) }))} className={inp} /></Field>
        </div>
        <Field label="Pilihan Psikolog">
          <button type="button" onClick={() => setForm(f => ({ ...f, pilihanPsikolog: !f.pilihanPsikolog }))}
            className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition ${form.pilihanPsikolog ? 'bg-violet-500 text-white' : 'bg-slate-100 text-stv-body'}`}>
            {form.pilihanPsikolog ? 'Pilihan Psikolog' : 'Bukan Pilihan Psikolog'}
          </button>
        </Field>
        <Field label="Deskripsi"><textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Bukti Ilmiah"><textarea value={form.sci} onChange={e => setForm(f => ({ ...f, sci: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Sumber"><input value={form.sumber} onChange={e => setForm(f => ({ ...f, sumber: e.target.value }))} className={inp} /></Field>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[12px] font-semibold text-stv-navy">Keunggulan</label>
            <button type="button" onClick={() => setForm(f => ({ ...f, keunggulanItems: [...f.keunggulanItems, ''] }))}
              className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-stv-body hover:bg-slate-200">
              <Plus className="h-3 w-3" /> Tambah
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {form.keunggulanItems.map((k, i) => (
              <div key={i} className="flex gap-1.5">
                <input value={k} onChange={e => updateKeunggulan(i, e.target.value)}
                  placeholder={`Keunggulan ${i + 1}`} className={`${inp} flex-1`} />
                <button type="button" onClick={() => setForm(f => ({ ...f, keunggulanItems: f.keunggulanItems.filter((_, idx) => idx !== i) }))}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <Field label="Link Afiliasi"><input value={form.affiliateUrl} onChange={e => setForm(f => ({ ...f, affiliateUrl: e.target.value }))} className={inp} placeholder="https://shopee.co.id/..." /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status Link">
            <select value={form.statusLink ?? 'KOSONG'} onChange={e => setForm(f => ({ ...f, statusLink: e.target.value as EduTool['statusLink'] }))} className={inp}>
              <option value="KOSONG">Kosong</option>
              <option value="TERPASANG">Terpasang</option>
              <option value="PERLU_CEK">Perlu Cek</option>
              <option value="MATI">Mati</option>
            </select>
          </Field>
          <Field label="Tanggal Cek Link">
            <input type="date" value={form.tanggalCekLink ?? ''} onChange={e => setForm(f => ({ ...f, tanggalCekLink: e.target.value }))} className={inp} />
          </Field>
        </div>
        <Field label="Catatan Reviewer">
          <textarea value={form.catatanReviewer ?? ''} onChange={e => setForm(f => ({ ...f, catatanReviewer: e.target.value }))} rows={2} className={ta} />
        </Field>
        {err && <p className="text-[12px] text-red-500">{err}</p>}
        <ModalFooter onClose={onClose} onSaveDraft={() => save('draft')} />
      </form>
    </Modal>
  );
}

// ── Download Form ─────────────────────────────────────────────────────────────

type DForm = Omit<Downloadable, 'id'>;

const EMPTY_DFORM: DForm = {
  icon: '📄', nama: '', kategori: 'Panduan', minBulan: 0, maxBulan: 72,
  deskripsi: '', sci: '', sumber: '', caraPakai: '',
  halaman: '', jumlahUnduhan: 0, fileUrl: '',
  catatanReviewer: '', status: 'draft',
};

function DownloadModal({ initial, id, onClose }: { initial: DForm; id?: number; onClose: () => void }) {
  const { adminAddDownload, adminUpdateDownload } = useLearningStrategies();
  const [form, setForm] = useState<DForm>(initial);
  const [err, setErr] = useState('');

  function save(status: ContentStatus) {
    if (!form.nama.trim()) { setErr('Nama wajib diisi.'); return; }
    const payload = { ...form, status };
    if (id !== undefined) adminUpdateDownload(id, payload);
    else adminAddDownload(payload);
    onClose();
  }

  function submit(e: React.FormEvent) { e.preventDefault(); save(form.status ?? 'draft'); }

  return (
    <Modal title={id !== undefined ? 'Edit Materi Unduhan' : 'Tambah Unduhan'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ikon"><input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inp} /></Field>
          <Field label="Status">
            <select value={form.status ?? 'draft'} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContentStatus }))} className={inp}>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Disetujui</option>
              <option value="published">Terbit</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori">
            <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value as DownloadKategori }))} className={inp}>
              {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Jumlah Halaman"><input value={form.halaman} onChange={e => setForm(f => ({ ...f, halaman: e.target.value }))} className={inp} placeholder="8 halaman" /></Field>
        </div>
        <Field label="Nama Materi" required><input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} className={inp} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Usia Min (bulan)"><input type="number" min={0} value={form.minBulan} onChange={e => setForm(f => ({ ...f, minBulan: Number(e.target.value) }))} className={inp} /></Field>
          <Field label="Usia Max (bulan)"><input type="number" min={0} value={form.maxBulan} onChange={e => setForm(f => ({ ...f, maxBulan: Number(e.target.value) }))} className={inp} /></Field>
        </div>
        <Field label="Deskripsi"><textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Bukti Ilmiah"><textarea value={form.sci} onChange={e => setForm(f => ({ ...f, sci: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Sumber"><input value={form.sumber} onChange={e => setForm(f => ({ ...f, sumber: e.target.value }))} className={inp} /></Field>
        <Field label="Cara Menggunakan"><textarea value={form.caraPakai} onChange={e => setForm(f => ({ ...f, caraPakai: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="URL File"><input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} className={inp} /></Field>
        <Field label="Catatan Reviewer">
          <textarea value={form.catatanReviewer ?? ''} onChange={e => setForm(f => ({ ...f, catatanReviewer: e.target.value }))} rows={2} className={ta} />
        </Field>
        {err && <p className="text-[12px] text-red-500">{err}</p>}
        <ModalFooter onClose={onClose} onSaveDraft={() => save('draft')} />
      </form>
    </Modal>
  );
}

// ── Overview Section ──────────────────────────────────────────────────────────

function countByStatus(items: Array<{ status?: ContentStatus }>) {
  const counts = { draft: 0, review: 0, approved: 0, published: 0, total: 0 };
  items.forEach(x => {
    counts.total++;
    const s = x.status ?? 'published';
    counts[s]++;
  });
  return counts;
}

function StatCard({ label, items }: { label: string; items: Array<{ status?: ContentStatus }> }) {
  const c = countByStatus(items);
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(16,58,107,.06)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-bold text-stv-navy">{label}</span>
        <span className="text-[20px] font-extrabold text-stv-navy">{c.total}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {c.draft > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Draft {c.draft}</span>}
        {c.review > 0 && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">Review {c.review}</span>}
        {c.approved > 0 && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Disetujui {c.approved}</span>}
        {c.published > 0 && <span className="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">Terbit {c.published}</span>}
      </div>
    </div>
  );
}

function CoverageMatrix({ activities }: { activities: Activity[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(16,58,107,.06)]">
      <h3 className="mb-3 text-[13px] font-bold text-stv-navy">Matriks Cakupan Usia</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-1.5 text-left font-semibold text-stv-muted">Kelompok Usia</th>
              <th className="pb-1.5 text-right font-semibold text-stv-muted">Total</th>
              <th className="pb-1.5 text-right font-semibold text-stv-muted">Terbit</th>
            </tr>
          </thead>
          <tbody>
            {AGE_RANGES.map(r => {
              const total = activities.filter(a => a.ageId === r.id).length;
              const published = activities.filter(a => a.ageId === r.id && (a.status === 'published' || a.status === undefined)).length;
              const low = published < 8;
              return (
                <tr key={r.id} className={`border-b border-slate-50 ${low ? 'bg-yellow-50' : ''}`}>
                  <td className="py-1.5 font-medium text-stv-body">{r.label}</td>
                  <td className="py-1.5 text-right text-stv-muted">{total}</td>
                  <td className={`py-1.5 text-right font-bold ${low ? 'text-yellow-600' : 'text-green-600'}`}>{published}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-1.5 text-[10px] text-stv-muted">Baris kuning = kurang dari 8 aktivitas terbit</p>
      </div>
    </div>
  );
}

function AffiliateWarnings({ tools, onFilterLink }: { tools: EduTool[]; onFilterLink: (f: string) => void }) {
  const today = new Date();
  const mati = tools.filter(t => t.statusLink === 'MATI');
  const perluCek = tools.filter(t => {
    if (t.statusLink === 'PERLU_CEK') return true;
    if (t.statusLink === 'TERPASANG') {
      if (!t.tanggalCekLink) return true;
      const cek = new Date(t.tanggalCekLink);
      const diffDays = (today.getTime() - cek.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 90;
    }
    return false;
  });
  const kosong = tools.filter(t => !t.statusLink || t.statusLink === 'KOSONG');

  if (mati.length === 0 && perluCek.length === 0 && kosong.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <h3 className="text-[13px] font-bold text-amber-800">Peringatan Affiliate</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {mati.length > 0 && (
          <button type="button" onClick={() => onFilterLink('MATI')}
            className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-[12px] font-semibold text-red-700 hover:bg-red-200 transition">
            Mati: {mati.length} alat <ChevronRight className="h-3 w-3" />
          </button>
        )}
        {perluCek.length > 0 && (
          <button type="button" onClick={() => onFilterLink('PERLU_CEK')}
            className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-[12px] font-semibold text-yellow-700 hover:bg-yellow-200 transition">
            Perlu Cek: {perluCek.length} alat <ChevronRight className="h-3 w-3" />
          </button>
        )}
        {kosong.length > 0 && (
          <button type="button" onClick={() => onFilterLink('KOSONG')}
            className="flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-[12px] font-semibold text-slate-700 hover:bg-slate-300 transition">
            Kosong: {kosong.length} alat <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Affiliate Panel ───────────────────────────────────────────────────────────

function AffiliatePanelRow({ tool }: { tool: EduTool }) {
  const { adminUpdateToolLink } = useLearningStrategies();
  const [url, setUrl] = useState(tool.affiliateUrl ?? '');

  function handleSave() {
    adminUpdateToolLink(tool.id, url, 'TERPASANG', new Date().toISOString().split('T')[0]);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-stv-navy truncate">{tool.icon} {tool.nama}</p>
        <p className="text-[11px] text-stv-muted">{tool.hargaEstimasi}</p>
      </div>
      <LinkStatusBadge statusLink={tool.statusLink} />
      <a href={`https://shopee.co.id/search?keyword=${encodeURIComponent(tool.nama)}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-1.5 text-[12px] font-semibold text-orange-600 hover:bg-orange-100 transition">
        <ShoppingBag className="h-3.5 w-3.5" /> Cari di Shopee
      </a>
      <div className="flex gap-1.5 flex-1 min-w-[200px]">
        <input value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://shopee.co.id/..." className={`${inp} flex-1`} />
        <button type="button" onClick={handleSave}
          className="flex items-center gap-1 rounded-xl bg-green-500 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-green-600 transition whitespace-nowrap">
          <Save className="h-3.5 w-3.5" /> Simpan Link
        </button>
      </div>
    </div>
  );
}

function AffiliatePanel({ tools }: { tools: EduTool[] }) {
  const [open, setOpen] = useState(false);

  const today = new Date();
  const needsAttention = tools.filter(t => {
    if (!t.statusLink || t.statusLink === 'KOSONG' || t.statusLink === 'MATI' || t.statusLink === 'PERLU_CEK') return true;
    if (t.statusLink === 'TERPASANG') {
      if (!t.tanggalCekLink) return true;
      const cek = new Date(t.tanggalCekLink);
      return (today.getTime() - cek.getTime()) / (1000 * 60 * 60 * 24) > 90;
    }
    return false;
  });

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-orange-500" />
          <span className="text-[14px] font-bold text-stv-navy">Panel Link Affiliate</span>
          {needsAttention.length > 0 && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">{needsAttention.length} perlu tindakan</span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-stv-muted" /> : <ChevronDown className="h-4 w-4 text-stv-muted" />}
      </button>
      {open && (
        <div className="border-t border-slate-200 p-4 flex flex-col gap-2">
          {needsAttention.length === 0 ? (
            <p className="text-[13px] text-stv-muted text-center py-4">Semua link afiliasi sudah terpasang dan aktif.</p>
          ) : (
            needsAttention.map(t => <AffiliatePanelRow key={t.id} tool={t} />)
          )}
        </div>
      )}
    </div>
  );
}

// ── Row component ─────────────────────────────────────────────────────────────

function Row({
  icon, title, meta, status, statusLink, onEdit, onDelete, onDuplicate, onStatusChange, onPreview,
}: {
  icon: string; title: string; meta: string[];
  status?: ContentStatus;
  statusLink?: string;
  onEdit: () => void; onDelete: () => void; onDuplicate: () => void;
  onStatusChange: (s: ContentStatus) => void;
  onPreview?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(16,58,107,.05)]">
      <span className="shrink-0 text-xl opacity-70">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-[14px] truncate text-stv-navy">{title}</p>
          <StatusBadge status={status} />
          {statusLink && <LinkStatusBadge statusLink={statusLink} />}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {meta.filter(Boolean).map((m, i) => (
            <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{m}</span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <select
          value={status ?? 'published'}
          onChange={e => onStatusChange(e.target.value as ContentStatus)}
          className="rounded-xl border border-stv-border px-2 py-1 text-[11px] font-semibold text-stv-navy focus:border-amber-400 focus:outline-none">
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="approved">Disetujui</option>
          <option value="published">Terbit</option>
        </select>
        {onPreview && (
          <button type="button" onClick={onPreview} title="Preview tampilan orang tua"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition">
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
        <button type="button" onClick={onEdit} title="Edit"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={onDuplicate} title="Duplikat"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={onDelete} title="Hapus"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="py-12 text-center text-stv-muted">
      <p className="font-semibold">Tidak ada {label} yang cocok</p>
      <p className="text-[13px] mt-1">Ubah filter atau tambahkan {label} baru.</p>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

type TabKey = 'aktivitas' | 'program' | 'alat' | 'unduhan';

export default function StrategiesAdmin() {
  const {
    managedActivities, managedPlans, managedTools, managedDownloads,
    adminDeleteActivity, adminDeletePlan, adminDeleteTool, adminDeleteDownload,
    adminSetStatus,
    adminDuplicateActivity, adminDuplicatePlan, adminDuplicateTool, adminDuplicateDownload,
    apiLoaded,
  } = useLearningStrategies();

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const syncToBackend = useCallback(async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await Promise.all([
        api.post('/learning-strategies/admin/activities/bulk', { items: STATIC_ACTIVITIES }),
        api.post('/learning-strategies/admin/plans/bulk',      { items: STATIC_PLANS }),
        api.post('/learning-strategies/admin/tools/bulk',      { items: STATIC_TOOLS }),
        api.post('/learning-strategies/admin/downloads/bulk',  { items: STATIC_DOWNLOADS }),
      ]);
      setSyncMsg(`Berhasil: ${STATIC_ACTIVITIES.length + STATIC_PLANS.length + STATIC_TOOLS.length + STATIC_DOWNLOADS.length} item disinkron ke database`);
    } catch {
      setSyncMsg('Sinkronisasi gagal. Pastikan backend berjalan dan Anda sudah login sebagai admin.');
    } finally {
      setSyncing(false);
    }
  }, []);

  const [activeTab, setActiveTab] = useState<TabKey>('aktivitas');
  const [search, setSearch] = useState('');
  const [filterAge, setFilterAge] = useState('all');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'all'>('all');
  const [filterLinkStatus, setFilterLinkStatus] = useState<string>('all');

  // Modals
  const [activityModal, setActivityModal] = useState<{ form: AForm; id?: number } | null>(null);
  const [planModal, setPlanModal]         = useState<{ form: PForm; id?: number } | null>(null);
  const [toolModal, setToolModal]         = useState<{ form: TForm; id?: number } | null>(null);
  const [downloadModal, setDownloadModal] = useState<{ form: DForm; id?: number } | null>(null);
  const [csvModal, setCsvModal]           = useState<TabKey | null>(null);

  // Preview state — shows parent-facing card + modal
  const [lsPreview, setLsPreview] = useState<
    | { type: 'activity'; item: Activity }
    | { type: 'plan';     item: WeeklyPlan }
    | { type: 'tool';     item: EduTool }
    | { type: 'download'; item: Downloadable }
    | null
  >(null);
  const [lsPreviewOpen, setLsPreviewOpen] = useState(false); // true = modal open, false = grid view

  const filteredActs = useMemo(() => {
    const qs = search.toLowerCase();
    return managedActivities.filter(a =>
      (!search || a.judul.toLowerCase().includes(qs) || a.deskripsi.toLowerCase().includes(qs)) &&
      (filterAge === 'all' || a.ageId === filterAge) &&
      (filterStatus === 'all' || (a.status ?? 'published') === filterStatus)
    );
  }, [managedActivities, search, filterAge, filterStatus]);

  const filteredPlans = useMemo(() => {
    const qs = search.toLowerCase();
    const r = filterAge !== 'all' ? AGE_RANGES.find(x => x.id === filterAge) : null;
    return managedPlans.filter(p =>
      (!search || p.judul.toLowerCase().includes(qs)) &&
      (!r || (p.minBulan < r.max && p.maxBulan > r.min)) &&
      (filterStatus === 'all' || (p.status ?? 'published') === filterStatus)
    );
  }, [managedPlans, search, filterAge, filterStatus]);

  const filteredTools = useMemo(() => {
    const qs = search.toLowerCase();
    const r = filterAge !== 'all' ? AGE_RANGES.find(x => x.id === filterAge) : null;
    return managedTools.filter(t =>
      (!search || t.nama.toLowerCase().includes(qs) || t.deskripsi.toLowerCase().includes(qs)) &&
      (!r || (t.minBulan < r.max && t.maxBulan > r.min)) &&
      (filterStatus === 'all' || (t.status ?? 'published') === filterStatus) &&
      (filterLinkStatus === 'all' || (t.statusLink ?? 'KOSONG') === filterLinkStatus)
    );
  }, [managedTools, search, filterAge, filterStatus, filterLinkStatus]);

  const filteredDls = useMemo(() => {
    const qs = search.toLowerCase();
    const r = filterAge !== 'all' ? AGE_RANGES.find(x => x.id === filterAge) : null;
    return managedDownloads.filter(d =>
      (!search || d.nama.toLowerCase().includes(qs)) &&
      (!r || (d.minBulan < r.max && d.maxBulan > r.min)) &&
      (filterStatus === 'all' || (d.status ?? 'published') === filterStatus)
    );
  }, [managedDownloads, search, filterAge, filterStatus]);

  const TABS: { id: TabKey; label: string; count: number }[] = [
    { id: 'aktivitas', label: 'Aktivitas',       count: managedActivities.length },
    { id: 'program',   label: 'Program Mingguan', count: managedPlans.length },
    { id: 'alat',      label: 'Alat Edukasi',     count: managedTools.length },
    { id: 'unduhan',   label: 'Unduhan',           count: managedDownloads.length },
  ];

  function confirmDelete(label: string, onConfirm: () => void) {
    if (window.confirm(`Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`)) onConfirm();
  }

  function handleFilterLink(f: string) {
    setActiveTab('alat');
    setFilterLinkStatus(f);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Kelola Learning Strategies</h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px]">
            <span className="text-stv-muted">
              Total: <strong className="text-stv-navy">{managedActivities.length + managedPlans.length + managedTools.length + managedDownloads.length}</strong> konten
            </span>
            {!apiLoaded && (
              <span className="text-slate-400 text-[12px]">Memuat dari backend...</span>
            )}
          </div>
          {syncMsg && (
            <p className={`mt-1 text-[12px] font-medium ${syncMsg.startsWith('Berhasil') ? 'text-green-600' : 'text-red-500'}`}>
              {syncMsg}
            </p>
          )}
        </div>
        <button type="button" onClick={syncToBackend} disabled={syncing}
          className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-stv-body hover:bg-slate-50 disabled:opacity-50 transition">
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Menyinkron...' : 'Sinkron ke Backend'}
        </button>
      </div>

      {/* Overview stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Aktivitas" items={managedActivities} />
        <StatCard label="Program Mingguan" items={managedPlans} />
        <StatCard label="Alat Edukasi" items={managedTools} />
        <StatCard label="Unduhan" items={managedDownloads} />
      </div>

      {/* Coverage matrix + Affiliate warnings */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CoverageMatrix activities={managedActivities} />
        <AffiliateWarnings tools={managedTools} onFilterLink={handleFilterLink} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100">
        {TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-semibold transition ${
              activeTab === tab.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-stv-muted hover:text-stv-body'
            }`}>
            {tab.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab.id ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul..."
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-[13px] focus:border-amber-400 focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ContentStatus | 'all')}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] focus:border-amber-400 focus:outline-none">
          <option value="all">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="approved">Disetujui</option>
          <option value="published">Terbit</option>
        </select>
        <select value={filterAge} onChange={e => setFilterAge(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] focus:border-amber-400 focus:outline-none">
          <option value="all">Semua Usia</option>
          {AGE_RANGES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        {activeTab === 'alat' && (
          <select value={filterLinkStatus} onChange={e => setFilterLinkStatus(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] focus:border-amber-400 focus:outline-none">
            <option value="all">Semua Link</option>
            <option value="KOSONG">Kosong</option>
            <option value="TERPASANG">Terpasang</option>
            <option value="PERLU_CEK">Perlu Cek</option>
            <option value="MATI">Mati</option>
          </select>
        )}
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => setCsvModal(activeTab)}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50 transition">
            <ExternalLink className="h-3.5 w-3.5" /> Impor CSV
          </button>
          <button type="button"
            onClick={() => {
              if (activeTab === 'aktivitas') setActivityModal({ form: { ...EMPTY_AFORM } });
              else if (activeTab === 'program') setPlanModal({ form: { ...EMPTY_PFORM } });
              else if (activeTab === 'alat') setToolModal({ form: { ...EMPTY_TFORM } });
              else setDownloadModal({ form: { ...EMPTY_DFORM } });
            }}
            className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-amber-600 transition">
            <Plus className="h-4 w-4" />
            Tambah {activeTab === 'aktivitas' ? 'Aktivitas' : activeTab === 'program' ? 'Program' : activeTab === 'alat' ? 'Alat' : 'Unduhan'}
          </button>
        </div>
      </div>

      {/* ── Aktivitas tab ─── */}
      {activeTab === 'aktivitas' && (
        <div className="flex flex-col gap-2">
          {filteredActs.length === 0
            ? <Empty label="aktivitas" />
            : filteredActs.map(a => (
              <Row key={a.id}
                icon={a.icon} title={a.judul} status={a.status}
                meta={[AGE_RANGES.find(r => r.id === a.ageId)?.label ?? a.ageId, `${a.durasiMenit} mnt`, a.isDIY ? 'DIY' : 'Perlu Alat', a.domain.map(d => DOMAIN_META[d]?.emoji ?? d).join(' ')]}
                onEdit={() => setActivityModal({ form: toAForm(a), id: a.id })}
                onDelete={() => confirmDelete(a.judul, () => adminDeleteActivity(a.id))}
                onDuplicate={() => adminDuplicateActivity(a.id)}
                onStatusChange={s => adminSetStatus('activity', a.id, s)}
                onPreview={() => { setLsPreview({ type: 'activity', item: a }); setLsPreviewOpen(false); }}
              />
            ))}
        </div>
      )}

      {/* ── Program tab ─── */}
      {activeTab === 'program' && (
        <div className="flex flex-col gap-2">
          {filteredPlans.length === 0
            ? <Empty label="program" />
            : filteredPlans.map(p => (
              <Row key={p.id}
                icon={p.icon} title={p.judul} status={p.status}
                meta={[p.ageLabel, ageStr(p.minBulan, p.maxBulan), `${p.hari.length} hari`]}
                onEdit={() => setPlanModal({ form: { icon: p.icon, judul: p.judul, ageLabel: p.ageLabel, minBulan: p.minBulan, maxBulan: p.maxBulan, deskripsi: p.deskripsi, sci: p.sci, sumber: p.sumber, caraPakai: p.caraPakai, hari: p.hari, catatanReviewer: p.catatanReviewer, status: p.status }, id: p.id })}
                onDelete={() => confirmDelete(p.judul, () => adminDeletePlan(p.id))}
                onDuplicate={() => adminDuplicatePlan(p.id)}
                onStatusChange={s => adminSetStatus('plan', p.id, s)}
                onPreview={() => { setLsPreview({ type: 'plan', item: p }); setLsPreviewOpen(false); }}
              />
            ))}
        </div>
      )}

      {/* ── Alat Edukasi tab ─── */}
      {activeTab === 'alat' && (
        <>
          <div className="flex flex-col gap-2">
            {filteredTools.length === 0
              ? <Empty label="alat edukasi" />
              : filteredTools.map(t => (
                <Row key={t.id}
                  icon={t.icon} title={t.nama} status={t.status} statusLink={t.statusLink}
                  meta={[t.ageLabel, t.hargaEstimasi, t.pilihanPsikolog ? 'Pilihan Psikolog' : '']}
                  onEdit={() => setToolModal({ form: toTForm(t), id: t.id })}
                  onDelete={() => confirmDelete(t.nama, () => adminDeleteTool(t.id))}
                  onDuplicate={() => adminDuplicateTool(t.id)}
                  onStatusChange={s => adminSetStatus('tool', t.id, s)}
                  onPreview={() => { setLsPreview({ type: 'tool', item: t }); setLsPreviewOpen(false); }}
                />
              ))}
          </div>
          <AffiliatePanel tools={managedTools} />
        </>
      )}

      {/* ── Unduhan tab ─── */}
      {activeTab === 'unduhan' && (
        <div className="flex flex-col gap-2">
          {filteredDls.length === 0
            ? <Empty label="unduhan" />
            : filteredDls.map(d => (
              <Row key={d.id}
                icon={d.icon} title={d.nama} status={d.status}
                meta={[d.kategori, ageStr(d.minBulan, d.maxBulan), d.halaman]}
                onEdit={() => setDownloadModal({ form: { icon: d.icon, nama: d.nama, kategori: d.kategori, minBulan: d.minBulan, maxBulan: d.maxBulan, deskripsi: d.deskripsi, sci: d.sci, sumber: d.sumber, caraPakai: d.caraPakai, halaman: d.halaman, jumlahUnduhan: d.jumlahUnduhan, fileUrl: d.fileUrl, catatanReviewer: d.catatanReviewer, status: d.status }, id: d.id })}
                onDelete={() => confirmDelete(d.nama, () => adminDeleteDownload(d.id))}
                onDuplicate={() => adminDuplicateDownload(d.id)}
                onStatusChange={s => adminSetStatus('download', d.id, s)}
                onPreview={() => { setLsPreview({ type: 'download', item: d }); setLsPreviewOpen(false); }}
              />
            ))}
        </div>
      )}

      {/* Modals */}
      {activityModal && (
        <ActivityModal initial={activityModal.form} id={activityModal.id} onClose={() => setActivityModal(null)} />
      )}
      {planModal && (
        <PlanModal initial={planModal.form} id={planModal.id} onClose={() => setPlanModal(null)} />
      )}
      {toolModal && (
        <ToolModal initial={toolModal.form} id={toolModal.id} onClose={() => setToolModal(null)} />
      )}
      {downloadModal && (
        <DownloadModal initial={downloadModal.form} id={downloadModal.id} onClose={() => setDownloadModal(null)} />
      )}
      {csvModal && (
        <CsvImportModal type={csvModal} onClose={() => setCsvModal(null)} />
      )}

      {/* ── LS Preview Overlay ─── */}
      {lsPreview && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#FAFAF8] overflow-y-auto">
          {/* Admin banner */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-indigo-700 px-4 py-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold text-white uppercase tracking-wide">
                Preview Admin
              </span>
              <span className="text-[13px] text-indigo-100">
                {lsPreview.type === 'activity' ? lsPreview.item.judul
                  : lsPreview.type === 'plan' ? lsPreview.item.judul
                  : lsPreview.type === 'tool' ? lsPreview.item.nama
                  : lsPreview.item.nama}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                (lsPreview.item.status === 'published') ? 'bg-green-500 text-white'
                : (lsPreview.item.status === 'approved') ? 'bg-blue-500 text-white'
                : (lsPreview.item.status === 'review') ? 'bg-yellow-400 text-yellow-900'
                : 'bg-white/30 text-white'
              }`}>
                {lsPreview.item.status ?? 'draft'}
              </span>
            </div>
            <button
              onClick={() => setLsPreview(null)}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-white/20 transition">
              ✕ Tutup Preview
            </button>
          </div>

          {/* Grid card view */}
          {!lsPreviewOpen && (
            <div className="flex flex-col items-center gap-5 px-4 py-8">
              <p className="text-[13px] text-slate-500">Tampilan kartu seperti yang dilihat orang tua. Klik kartu untuk melihat detail.</p>
              <div className="w-full max-w-sm">
                {lsPreview.type === 'activity' && (
                  <ActivityCard activity={lsPreview.item} onOpen={() => setLsPreviewOpen(true)} />
                )}
                {lsPreview.type === 'plan' && (
                  <PlanCard plan={lsPreview.item} onOpen={() => setLsPreviewOpen(true)} />
                )}
                {lsPreview.type === 'tool' && (
                  <ToolCard tool={lsPreview.item} onOpen={() => setLsPreviewOpen(true)} />
                )}
                {lsPreview.type === 'download' && (
                  <DownloadCard item={lsPreview.item} onOpen={() => setLsPreviewOpen(true)} />
                )}
              </div>
            </div>
          )}

          {/* Detail modal view */}
          {lsPreviewOpen && lsPreview.type === 'activity' && (
            <ActivityDetailModal activity={lsPreview.item} onClose={() => setLsPreviewOpen(false)} />
          )}
          {lsPreviewOpen && lsPreview.type === 'plan' && (
            <PlanDetailModal plan={lsPreview.item} onClose={() => setLsPreviewOpen(false)} />
          )}
          {lsPreviewOpen && lsPreview.type === 'tool' && (
            <ToolDetailModal tool={lsPreview.item} onClose={() => setLsPreviewOpen(false)} />
          )}
          {lsPreviewOpen && lsPreview.type === 'download' && (
            <DownloadDetailModal item={lsPreview.item} onClose={() => setLsPreviewOpen(false)} />
          )}
        </div>
      )}
    </div>
  );
}
