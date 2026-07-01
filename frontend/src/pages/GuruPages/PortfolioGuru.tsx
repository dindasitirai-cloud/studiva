import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Video, Image as ImageIcon, X, Save, FolderOpen } from 'lucide-react';
import { useGuru, PortfolioItemGuru, PortfolioCategoryGuru, PORTFOLIO_CATEGORIES } from './GuruContext';
import ThumbnailUpload from '../AdminPages/ThumbnailUpload';

type FormState = {
  studentId: string;
  title: string;
  date: string;
  category: PortfolioCategoryGuru;
  description: string;
  mediaType: 'photo' | 'video';
  thumbnailUrl?: string;
  videoUrl?: string;
  thumbnailColor: string;
};

function todayISO() { return new Date().toISOString().slice(0, 10); }

// Random fallback color if no thumbnail uploaded
const FALLBACK_COLORS = ['#A78BFA', '#F472B6', '#60A5FA', '#22D3EE', '#F97316', '#94A3B8'];
let colorIdx = 0;
const nextColor = () => FALLBACK_COLORS[colorIdx++ % FALLBACK_COLORS.length];

function PortfolioFormModal({ students, initial, title, onClose, onSave }: {
  students: ReturnType<typeof useGuru>['students'];
  initial: FormState;
  title: string;
  onClose: () => void;
  onSave: (form: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Judul karya wajib diisi.'); return; }
    if (!form.studentId) { setError('Pilih siswa terlebih dahulu.'); return; }
    if (!form.description.trim()) { setError('Keterangan karya wajib diisi.'); return; }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[540px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Student selector */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Siswa</label>
            <div className="flex flex-wrap gap-2">
              {students.map(s => (
                <button key={s.id} type="button" onClick={() => setForm(f => ({ ...f, studentId: s.id }))}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${form.studentId === s.id ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:opacity-80'}`}>
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${form.studentId === s.id ? 'bg-white/30' : 'bg-purple-200 text-purple-800'}`}>{s.name.charAt(0)}</span>
                  {s.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Media type toggle */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Jenis Media</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm(f => ({ ...f, mediaType: 'photo' }))}
                className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-[13px] font-semibold transition ${form.mediaType === 'photo' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-stv-border text-stv-body'}`}>
                <ImageIcon className="h-4 w-4" />Foto
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, mediaType: 'video' }))}
                className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-[13px] font-semibold transition ${form.mediaType === 'video' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-stv-border text-stv-body'}`}>
                <Video className="h-4 w-4" />Video
              </button>
            </div>
          </div>

          {/* Upload / video URL */}
          {form.mediaType === 'photo' ? (
            <ThumbnailUpload value={form.thumbnailUrl} onChange={url => setForm(f => ({ ...f, thumbnailUrl: url }))} label="Upload Foto Karya" />
          ) : (
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">URL Video (YouTube / Google Drive / dll)</label>
              <input value={form.videoUrl ?? ''} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-purple-400 focus:outline-none" />
            </div>
          )}

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Judul Karya *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="mis. Lukisan Jari, Proyek Menara Balok..."
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-purple-400 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Tanggal</label>
              <input type="date" value={form.date} max={todayISO()} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-purple-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Kategori</label>
              <div className="flex flex-wrap gap-1.5">
                {PORTFOLIO_CATEGORIES.map(c => (
                  <button key={c.key} type="button" onClick={() => setForm(f => ({ ...f, category: c.key, thumbnailColor: c.color }))}
                    className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${form.category === c.key ? c.chipActive : `${c.bg} ${c.text} hover:opacity-80`}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Keterangan dari Guru *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Deskripsikan karya dan apa yang dipelajari atau dicapai anak..."
              className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-purple-400 focus:outline-none" />
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-stv-border px-5 py-2 text-[14px] font-semibold text-stv-body hover:bg-slate-50">Batal</button>
            <button type="submit" className="flex items-center gap-1.5 rounded-full bg-purple-500 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-purple-600">
              <Save className="h-4 w-4" />Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Detail / lightbox modal
function PortfolioDetailModal({ item, studentName, onClose, onEdit, onDelete }: {
  item: PortfolioItemGuru;
  studentName: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const catMeta = PORTFOLIO_CATEGORIES.find(c => c.key === item.category);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stv-navy/50 px-4" onClick={onClose}>
      <div className="w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(16,58,107,.25)]" onClick={e => e.stopPropagation()}>
        {/* Media preview */}
        <div className="relative flex h-56 items-center justify-center" style={{ backgroundColor: `${item.thumbnailColor}33` }}>
          <button type="button" onClick={onClose} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stv-navy hover:bg-white"><X className="h-4 w-4" /></button>
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
          ) : item.mediaType === 'video' ? (
            <Video className="h-16 w-16" style={{ color: item.thumbnailColor }} strokeWidth={1.5} />
          ) : (
            <ImageIcon className="h-16 w-16" style={{ color: item.thumbnailColor }} strokeWidth={1.5} />
          )}
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            {catMeta && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${catMeta.bg} ${catMeta.text}`}>{catMeta.label}</span>}
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700">{studentName}</span>
            <span className="ml-auto text-[12px] text-stv-muted">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h3 className="mt-2 font-baloo text-[17px] font-bold text-stv-navy">{item.title}</h3>
          <p className="mt-2 text-[14px] leading-[1.65] text-stv-body">{item.description}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onEdit} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-1.5 text-[13px] font-semibold text-stv-navy hover:bg-slate-200"><Pencil className="h-3.5 w-3.5" />Edit</button>
            <button type="button" onClick={onDelete} className="flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-1.5 text-[13px] font-semibold text-red-600 hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" />Hapus</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioGuru() {
  const { students, portfolioItems, addPortfolioItem, updatePortfolioItem, deletePortfolioItem } = useGuru();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('siswa') ?? '';

  const [studentFilter, setStudentFilter] = useState(preselectedId || '');
  const [categoryFilter, setCategoryFilter] = useState<PortfolioCategoryGuru | 'semua'>('semua');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<PortfolioItemGuru | null>(null);
  const [editItem, setEditItem] = useState<PortfolioItemGuru | null>(null);

  const EMPTY_FORM: FormState = {
    studentId: preselectedId || (students[0]?.id ?? ''),
    title: '', date: todayISO(), category: 'seni',
    description: '', mediaType: 'photo', thumbnailColor: nextColor(),
  };

  const filtered = useMemo(() => {
    return [...portfolioItems]
      .filter(p => (studentFilter === '' || p.studentId === studentFilter) && (categoryFilter === 'semua' || p.category === categoryFilter))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [portfolioItems, studentFilter, categoryFilter]);

  function handleAdd(form: FormState) {
    addPortfolioItem(form);
    setAddModalOpen(false);
  }

  function handleEdit(form: FormState) {
    if (!editItem) return;
    updatePortfolioItem(editItem.id, form);
    setEditItem(null);
    setDetailItem(null);
  }

  function handleDelete(id: string) {
    const item = portfolioItems.find(p => p.id === id);
    if (window.confirm(`Hapus karya "${item?.title}"?`)) {
      deletePortfolioItem(id);
      setDetailItem(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Portfolio</h2>
          <p className="text-[14px] text-stv-muted">Dokumentasi hasil karya siswa — tampil sebagai galeri di dashboard orang tua.</p>
        </div>
        <button type="button" onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-purple-500 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-purple-600">
          <Plus className="h-4 w-4" />Unggah Karya
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setStudentFilter('')}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${studentFilter === '' ? 'bg-purple-500 text-white' : 'border border-stv-border bg-white text-stv-body hover:bg-purple-50'}`}>
          Semua Siswa
        </button>
        {students.map(s => (
          <button key={s.id} type="button" onClick={() => setStudentFilter(s.id)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${studentFilter === s.id ? 'bg-purple-500 text-white' : 'border border-stv-border bg-white text-stv-body hover:bg-purple-50'}`}>
            {s.name.split(' ')[0]}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setCategoryFilter('semua')}
            className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${categoryFilter === 'semua' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600 hover:opacity-80'}`}>
            Semua
          </button>
          {PORTFOLIO_CATEGORIES.map(c => (
            <button key={c.key} type="button" onClick={() => setCategoryFilter(c.key)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${categoryFilter === c.key ? c.chipActive : `${c.bg} ${c.text} hover:opacity-80`}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-purple-200 py-14 text-center">
          <FolderOpen className="h-10 w-10 text-purple-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Belum ada karya</p>
          <p className="mt-1 text-[13px] text-stv-muted">Klik "Unggah Karya" untuk mendokumentasikan hasil karya siswa.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(item => {
            const catMeta = PORTFOLIO_CATEGORIES.find(c => c.key === item.category);
            const student = students.find(s => s.id === item.studentId);
            return (
              <button key={item.id} type="button" onClick={() => setDetailItem(item)}
                className="animate-fade-in-up overflow-hidden rounded-2xl bg-white text-left shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]">
                <div className="relative flex h-36 items-center justify-center" style={{ backgroundColor: `${item.thumbnailColor}33` }}>
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
                  ) : item.mediaType === 'video' ? (
                    <Video className="h-10 w-10" style={{ color: item.thumbnailColor }} />
                  ) : (
                    <ImageIcon className="h-10 w-10" style={{ color: item.thumbnailColor }} />
                  )}
                  {catMeta && <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${catMeta.chipActive}`}>{catMeta.label}</span>}
                </div>
                <div className="p-3.5">
                  <p className="truncate font-baloo text-[14px] font-bold text-stv-navy">{item.title}</p>
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="text-[11px] text-stv-muted">{student?.name.split(' ')[0] ?? '-'}</span>
                    <span className="text-[11px] text-stv-muted">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {addModalOpen && (
        <PortfolioFormModal students={students} initial={EMPTY_FORM} title="Unggah Karya Baru"
          onClose={() => setAddModalOpen(false)} onSave={handleAdd} />
      )}

      {/* Edit modal */}
      {editItem && (
        <PortfolioFormModal
          students={students}
          initial={{ studentId: editItem.studentId, title: editItem.title, date: editItem.date, category: editItem.category, description: editItem.description, mediaType: editItem.mediaType, thumbnailUrl: editItem.thumbnailUrl, videoUrl: editItem.videoUrl, thumbnailColor: editItem.thumbnailColor }}
          title="Edit Karya"
          onClose={() => setEditItem(null)}
          onSave={handleEdit}
        />
      )}

      {/* Detail lightbox */}
      {detailItem && !editItem && (
        <PortfolioDetailModal
          item={detailItem}
          studentName={students.find(s => s.id === detailItem.studentId)?.name ?? '-'}
          onClose={() => setDetailItem(null)}
          onEdit={() => { setEditItem(detailItem); setDetailItem(null); }}
          onDelete={() => handleDelete(detailItem.id)}
        />
      )}
    </div>
  );
}
