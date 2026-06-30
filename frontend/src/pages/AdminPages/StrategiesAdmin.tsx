import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Lightbulb, X, Save } from 'lucide-react';
import { useDashboardTier2, Strategy, LearningStyle } from '../../context/DashboardTier2Context';
import { ACTIVITY_TYPES } from '../DashboardPages/Tier2/strategyData';
import ThumbnailUpload from './ThumbnailUpload';

const THEME_OPTIONS: Strategy['colorTheme'][] = ['amber', 'sky', 'coral', 'green'];
const THEME_SWATCH: Record<Strategy['colorTheme'], string> = {
  amber: 'bg-amber-400', sky: 'bg-sky-400', coral: 'bg-orange-400', green: 'bg-emerald-400',
};
const ALL_LEARNING_STYLES: LearningStyle[] = ['Visual', 'Auditori', 'Kinestetik', 'Membaca/Menulis'];

type FormState = {
  title: string;
  activityType: Strategy['activityType'];
  ageGroup: string;
  learningStyles: LearningStyle[];
  summary: string;
  duration: string;
  materials: string;
  steps: string;
  tip: string;
  colorTheme: Strategy['colorTheme'];
  status: Strategy['status'];
  thumbnailUrl?: string;
};

const EMPTY_FORM: FormState = {
  title: '', activityType: 'Motorik', ageGroup: '', learningStyles: [], summary: '', duration: '',
  materials: '', steps: '', tip: '', colorTheme: 'amber', status: 'draft',
};

function StrategyFormModal({ initial, onClose, onSave }: { initial: FormState; onClose: () => void; onSave: (form: FormState) => void }) {
  const { ageGroups } = useDashboardTier2();
  const [form, setForm] = useState<FormState>(() => ({ ...initial, ageGroup: initial.ageGroup || ageGroups[0] || '' }));
  const [error, setError] = useState('');

  function toggleStyle(style: LearningStyle) {
    setForm(f => ({
      ...f,
      learningStyles: f.learningStyles.includes(style) ? f.learningStyles.filter(s => s !== style) : [...f.learningStyles, style],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.steps.trim()) {
      setError('Judul, ringkasan, dan langkah-langkah wajib diisi.');
      return;
    }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">{initial.title ? 'Edit Strategi' : 'Tambah Strategi Baru'}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-stv-green-tint text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <ThumbnailUpload value={form.thumbnailUrl} onChange={url => setForm(f => ({ ...f, thumbnailUrl: url }))} label="Media Pendukung (opsional)" />

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Judul *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-stv-green focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Jenis Aktivitas</label>
              <select
                value={form.activityType}
                onChange={e => setForm(f => ({ ...f, activityType: e.target.value as Strategy['activityType'] }))}
                className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-stv-green focus:outline-none"
              >
                {ACTIVITY_TYPES.filter(t => t !== 'Semua').map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Kelompok Usia</label>
              <select
                value={form.ageGroup}
                onChange={e => setForm(f => ({ ...f, ageGroup: e.target.value }))}
                className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-stv-green focus:outline-none"
              >
                {ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Tipe Belajar yang Cocok</label>
            <div className="flex flex-wrap gap-2">
              {ALL_LEARNING_STYLES.map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  aria-pressed={form.learningStyles.includes(style)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${form.learningStyles.includes(style) ? 'bg-stv-green text-white' : 'bg-stv-green-tint text-stv-green'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Ringkasan *</label>
            <textarea
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              rows={2}
              className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-stv-green focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Estimasi Durasi</label>
            <input
              value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
              placeholder="mis. 15-20 menit"
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-stv-green focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Bahan/Alat (satu per baris)</label>
            <textarea
              value={form.materials}
              onChange={e => setForm(f => ({ ...f, materials: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-stv-green focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Langkah-Langkah * (satu per baris)</label>
            <textarea
              value={form.steps}
              onChange={e => setForm(f => ({ ...f, steps: e.target.value }))}
              rows={4}
              className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-stv-green focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Tips Tambahan</label>
            <textarea
              value={form.tip}
              onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}
              rows={2}
              className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-stv-green focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Warna Tema Kartu</label>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, colorTheme: t }))}
                  aria-pressed={form.colorTheme === t}
                  className={`h-8 w-8 rounded-full ${THEME_SWATCH[t]} ${form.colorTheme === t ? 'ring-2 ring-offset-2 ring-stv-navy' : ''}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, status: 'draft' }))}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${form.status === 'draft' ? 'bg-slate-500 text-white' : 'bg-slate-100 text-stv-body'}`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, status: 'published' }))}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${form.status === 'published' ? 'bg-stv-green text-white' : 'bg-stv-green-tint text-stv-green'}`}
              >
                Terbit
              </button>
            </div>
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-stv-border px-5 py-2 text-[14px] font-semibold text-stv-body hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" className="flex items-center gap-1.5 rounded-full bg-stv-green px-5 py-2 text-[14px] font-bold text-white transition hover:opacity-90">
              <Save className="h-4 w-4" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StrategiesAdmin() {
  const { strategies, addStrategy, updateStrategy, deleteStrategy } = useDashboardTier2();
  const [search, setSearch] = useState('');
  const [modalStrategy, setModalStrategy] = useState<Strategy | 'new' | null>(null);

  const filtered = useMemo(
    () => strategies.filter(s => s.title.toLowerCase().includes(search.toLowerCase())),
    [strategies, search]
  );

  function handleSave(form: FormState) {
    const payload = {
      title: form.title.trim(),
      activityType: form.activityType,
      ageGroup: form.ageGroup,
      learningStyles: form.learningStyles,
      summary: form.summary.trim(),
      duration: form.duration.trim() || 'Tidak ditentukan',
      materials: form.materials.split('\n').map(m => m.trim()).filter(Boolean),
      steps: form.steps.split('\n').map(s => s.trim()).filter(Boolean),
      tip: form.tip.trim(),
      colorTheme: form.colorTheme,
      status: form.status,
      thumbnailUrl: form.thumbnailUrl,
    };
    if (modalStrategy && modalStrategy !== 'new') {
      updateStrategy(modalStrategy.id, payload);
    } else {
      addStrategy(payload);
    }
    setModalStrategy(null);
  }

  function handleDelete(strategy: Strategy) {
    if (window.confirm(`Hapus strategi "${strategy.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteStrategy(strategy.id);
    }
  }

  function toFormState(s: Strategy): FormState {
    return {
      title: s.title, activityType: s.activityType, ageGroup: s.ageGroup, learningStyles: s.learningStyles,
      summary: s.summary, duration: s.duration, materials: s.materials.join('\n'), steps: s.steps.join('\n'),
      tip: s.tip, colorTheme: s.colorTheme, status: s.status, thumbnailUrl: s.thumbnailUrl,
    };
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Learning Strategies</h2>
          <p className="text-[14px] text-stv-muted">Kelola strategi & kegiatan yang tampil di Learning Strategies Tier 1 dan Tier 2.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalStrategy('new')}
          className="flex items-center gap-1.5 rounded-full bg-stv-green px-5 py-2.5 text-[14px] font-bold text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Tambah Strategi Baru
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Cari judul strategi..."
        className="w-full max-w-[320px] rounded-full border border-stv-border bg-white px-4 py-2.5 text-[14px] focus:border-stv-green focus:outline-none"
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-stv-green-tint py-14 text-center">
          <Lightbulb className="h-10 w-10 text-stv-green/60" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Tidak ada strategi yang cocok</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(s => (
            <div key={s.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:flex-row sm:items-center">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                {s.thumbnailUrl ? (
                  <img src={s.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center ${THEME_SWATCH[s.colorTheme]} bg-opacity-20`}>
                    <Lightbulb className="h-6 w-6 text-stv-navy/50" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.status === 'published' ? 'bg-stv-green-tint text-stv-green' : 'bg-slate-100 text-slate-600'}`}>
                    {s.status === 'published' ? 'Terbit' : 'Draft'}
                  </span>
                  <span className="rounded-full bg-stv-green-tint px-2.5 py-0.5 text-[11px] font-bold text-stv-green">{s.activityType}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">{s.ageGroup}</span>
                </div>
                <p className="mt-1.5 font-baloo text-[15px] font-bold text-stv-navy">{s.title}</p>
                <p className="mt-0.5 text-[12px] text-stv-muted">{s.duration}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateStrategy(s.id, { status: s.status === 'published' ? 'draft' : 'published' })}
                  title={s.status === 'published' ? 'Sembunyikan' : 'Terbitkan'}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-stv-muted transition hover:bg-slate-100 hover:text-stv-navy"
                >
                  {s.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setModalStrategy(s)}
                  title="Edit"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-stv-muted transition hover:bg-slate-100 hover:text-stv-navy"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s)}
                  title="Hapus"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalStrategy && (
        <StrategyFormModal
          initial={modalStrategy === 'new' ? EMPTY_FORM : toFormState(modalStrategy)}
          onClose={() => setModalStrategy(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
