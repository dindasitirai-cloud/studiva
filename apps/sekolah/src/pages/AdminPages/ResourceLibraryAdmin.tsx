import React, { useMemo, useState } from 'react';
import {
  Search, Plus, Pencil, Trash2, Eye, EyeOff, Clock, BookOpen, X, Save,
} from 'lucide-react';
import { useDashboardTier2, Article } from '../../context/DashboardTier2Context';
import ThumbnailUpload from './ThumbnailUpload';

const THEME_OPTIONS: Article['colorTheme'][] = ['amber', 'sky', 'coral', 'green'];
const THEME_SWATCH: Record<Article['colorTheme'], string> = {
  amber: 'bg-amber-400', sky: 'bg-sky-400', coral: 'bg-orange-400', green: 'bg-emerald-400',
};

type FormState = {
  title: string;
  category: string;
  readTime: number;
  summary: string;
  content: string;
  colorTheme: Article['colorTheme'];
  status: Article['status'];
  author: string;
  thumbnailUrl?: string;
};

const EMPTY_FORM: FormState = {
  title: '', category: '', readTime: 5, summary: '', content: '', colorTheme: 'amber', status: 'draft', author: 'Tim Studiva',
};

function ArticleFormModal({ initial, onClose, onSave }: {
  initial: FormState;
  onClose: () => void;
  onSave: (form: FormState) => void;
}) {
  const { categories } = useDashboardTier2();
  const [form, setForm] = useState<FormState>(() => ({ ...initial, category: initial.category || categories[0] || '' }));
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      setError('Judul, ringkasan, dan konten wajib diisi.');
      return;
    }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">{initial.title ? 'Edit Materi' : 'Upload Materi Baru'}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <ThumbnailUpload value={form.thumbnailUrl} onChange={url => setForm(f => ({ ...f, thumbnailUrl: url }))} />

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Judul *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Kategori</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-blue-400 focus:outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Estimasi Baca (menit)</label>
              <input
                type="number"
                min={1}
                value={form.readTime}
                onChange={e => setForm(f => ({ ...f, readTime: Number(e.target.value) }))}
                className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Penulis</label>
            <input
              value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Ringkasan *</label>
            <textarea
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              rows={2}
              className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Konten * (satu paragraf per baris)</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={6}
              placeholder="Tulis isi materi di sini..."
              className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-blue-400 focus:outline-none"
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
            <button type="submit" className="flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-blue-700">
              <Save className="h-4 w-4" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResourceLibraryAdmin() {
  const { articles, categories, addArticle, updateArticle, deleteArticle } = useDashboardTier2();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [modalArticle, setModalArticle] = useState<Article | 'new' | null>(null);

  const filtered = useMemo(() => {
    return articles.filter(a => {
      const matchesCategory = category === 'Semua' || a.category === category;
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [articles, search, category]);

  function handleSave(form: FormState) {
    const payload = {
      title: form.title.trim(),
      category: form.category,
      readTime: form.readTime,
      summary: form.summary.trim(),
      content: form.content.split('\n').map(p => p.trim()).filter(Boolean),
      colorTheme: form.colorTheme,
      status: form.status,
      author: form.author.trim() || 'Tim Studiva',
      thumbnailUrl: form.thumbnailUrl,
      publishedDate: new Date().toISOString(),
    };
    if (modalArticle && modalArticle !== 'new') {
      updateArticle(modalArticle.id, payload);
    } else {
      addArticle(payload);
    }
    setModalArticle(null);
  }

  function handleDelete(article: Article) {
    if (window.confirm(`Hapus materi "${article.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteArticle(article.id);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Resource Library</h2>
          <p className="text-[14px] text-stv-muted">Kelola artikel & rangkuman yang tampil di Resource Library Tier 1 dan Tier 2.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalArticle('new')}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Upload Materi Baru
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul materi..."
            className="w-full rounded-full border border-stv-border bg-white py-2.5 pl-10 pr-4 text-[14px] focus:border-blue-400 focus:outline-none"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="rounded-full border border-stv-border bg-white px-4 py-2.5 text-[14px] focus:border-blue-400 focus:outline-none"
        >
          {['Semua', ...categories].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-blue-200 py-14 text-center">
          <BookOpen className="h-10 w-10 text-blue-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Tidak ada materi yang cocok</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(a => (
            <div key={a.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:flex-row sm:items-center">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                {a.thumbnailUrl ? (
                  <img src={a.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center ${THEME_SWATCH[a.colorTheme]} bg-opacity-20`}>
                    <BookOpen className="h-6 w-6 text-stv-navy/50" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${a.status === 'published' ? 'bg-stv-green-tint text-stv-green' : 'bg-slate-100 text-slate-600'}`}>
                    {a.status === 'published' ? 'Terbit' : 'Draft'}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">{a.category}</span>
                </div>
                <p className="mt-1.5 font-baloo text-[15px] font-bold text-stv-navy">{a.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-stv-muted">
                  <span>{a.author}</span>
                  <span>{new Date(a.publishedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.readTime} menit</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.readCount} dibaca</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateArticle(a.id, { status: a.status === 'published' ? 'draft' : 'published' })}
                  title={a.status === 'published' ? 'Sembunyikan' : 'Terbitkan'}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-stv-muted transition hover:bg-slate-100 hover:text-stv-navy"
                >
                  {a.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setModalArticle(a)}
                  title="Edit"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-stv-muted transition hover:bg-slate-100 hover:text-stv-navy"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a)}
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

      {modalArticle && (
        <ArticleFormModal
          initial={modalArticle === 'new' ? EMPTY_FORM : {
            title: modalArticle.title,
            category: modalArticle.category,
            readTime: modalArticle.readTime,
            summary: modalArticle.summary,
            content: modalArticle.content.join('\n'),
            colorTheme: modalArticle.colorTheme,
            status: modalArticle.status,
            author: modalArticle.author,
            thumbnailUrl: modalArticle.thumbnailUrl,
          }}
          onClose={() => setModalArticle(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
