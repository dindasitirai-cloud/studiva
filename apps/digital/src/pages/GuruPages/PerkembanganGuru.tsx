import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Star, Smile, Meh, Frown, Save, TrendingUp } from 'lucide-react';
import {
  useGuru, UpdateCategoryGuru, UpdateMoodGuru,
  UPDATE_CATEGORIES, PANGGILAN_GURU,
} from './GuruContext';
import { useAuth } from '../../context/AuthContext';
import ThumbnailUpload from '../AdminPages/ThumbnailUpload';

const MOOD_META: Record<UpdateMoodGuru, { icon: typeof Star; label: string; color: string; bg: string; solid: string }> = {
  great: { icon: Star, label: 'Luar Biasa', color: 'text-stv-green', bg: 'bg-stv-green-tint', solid: 'bg-stv-green' },
  good: { icon: Smile, label: 'Baik', color: 'text-stv-sky-stroke', bg: 'bg-stv-sky-tint', solid: 'bg-stv-sky-stroke' },
  ok: { icon: Meh, label: 'Cukup', color: 'text-orange-500', bg: 'bg-orange-50', solid: 'bg-orange-500' },
  challenging: { icon: Frown, label: 'Perlu Perhatian', color: 'text-red-500', bg: 'bg-red-50', solid: 'bg-red-500' },
};

type FormState = {
  studentId: string;
  date: string;
  category: UpdateCategoryGuru;
  note: string;
  mood?: UpdateMoodGuru;
  photo?: string;
};

function todayISO() { return new Date().toISOString().slice(0, 10); }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function NoteForm({ students, initial, onSave, onCancel, title }: {
  students: ReturnType<typeof useGuru>['students'];
  initial: FormState;
  onSave: (form: FormState) => void;
  onCancel: () => void;
  title: string;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.studentId) { setError('Pilih siswa terlebih dahulu.'); return; }
    if (!form.note.trim()) { setError('Catatan tidak boleh kosong.'); return; }
    onSave(form);
  }

  return (
    <div className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
      <h3 className="mb-4 font-baloo text-[16px] font-bold text-stv-navy">{title}</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Student selector */}
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Siswa</label>
          <div className="flex flex-wrap gap-2">
            {students.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, studentId: s.id }))}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${form.studentId === s.id ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:opacity-80'}`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${form.studentId === s.id ? 'bg-white/30' : 'bg-teal-200 text-teal-800'}`}>
                  {s.name.charAt(0)}
                </span>
                {s.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Tanggal</label>
            <input
              type="date"
              value={form.date}
              max={todayISO()}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-teal-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Kategori</label>
            <div className="flex flex-wrap gap-1.5">
              {UPDATE_CATEGORIES.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: c.key }))}
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${form.category === c.key ? c.chipActive : `${c.bg} ${c.text} hover:opacity-80`}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Catatan Perkembangan</label>
          <textarea
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            rows={4}
            placeholder="Deskripsikan perkembangan, pencapaian, atau hal yang perlu diperhatikan hari ini..."
            className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-teal-400 focus:outline-none"
          />
        </div>

        {/* Mood */}
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Mood/Kondisi Hari Ini (opsional)</label>
          <div className="flex gap-2">
            {(Object.keys(MOOD_META) as UpdateMoodGuru[]).map(m => {
              const meta = MOOD_META[m];
              const Icon = meta.icon;
              const active = form.mood === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, mood: active ? undefined : m }))}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold transition ${active ? `${meta.solid} text-white` : `${meta.bg} ${meta.color} hover:opacity-80`}`}
                >
                  <Icon className="h-5 w-5" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo */}
        <ThumbnailUpload value={form.photo} onChange={url => setForm(f => ({ ...f, photo: url }))} label="Foto Lampiran (opsional)" />

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <div className="mt-1 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-stv-border px-5 py-2 text-[14px] font-semibold text-stv-body hover:bg-slate-50">
            Batal
          </button>
          <button type="submit" className="flex items-center gap-1.5 rounded-full bg-teal-600 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-teal-700">
            <Save className="h-4 w-4" />
            Simpan Catatan
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PerkembanganGuru() {
  const { user } = useAuth();
  const { students, dailyUpdates, addDailyUpdate, updateDailyUpdate, deleteDailyUpdate } = useGuru();
  const [searchParams] = useSearchParams();

  const preselectedStudentId = searchParams.get('siswa') ?? '';

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [studentFilter, setStudentFilter] = useState(preselectedStudentId);
  const [categoryFilter, setCategoryFilter] = useState<UpdateCategoryGuru | 'semua'>('semua');

  const EMPTY_FORM = { studentId: preselectedStudentId || (students[0]?.id ?? ''), date: todayISO(), category: 'akademik' as UpdateCategoryGuru, note: '' };

  const filtered = useMemo(() => {
    return [...dailyUpdates]
      .filter(u => (studentFilter === '' || u.studentId === studentFilter) && (categoryFilter === 'semua' || u.category === categoryFilter))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [dailyUpdates, studentFilter, categoryFilter]);

  function handleSave(form: FormState) {
    const teacherName = `${PANGGILAN_GURU} ${user?.name ?? 'Guru'}`;
    addDailyUpdate({ ...form, teacherName });
    setShowForm(false);
  }

  function handleEdit(form: FormState) {
    if (!editingId) return;
    updateDailyUpdate(editingId, form);
    setEditingId(null);
  }

  const editingEntry = editingId ? dailyUpdates.find(u => u.id === editingId) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Perkembangan Harian</h2>
          <p className="text-[14px] text-stv-muted">Catat perkembangan setiap siswa, data ini tampil read-only di dashboard orang tua.</p>
        </div>
        {!showForm && !editingId && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Tulis Catatan Baru
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <NoteForm
          students={students}
          initial={EMPTY_FORM}
          title="Tulis Catatan Perkembangan"
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit form */}
      {editingId && editingEntry && (
        <NoteForm
          students={students}
          initial={{
            studentId: editingEntry.studentId,
            date: editingEntry.date,
            category: editingEntry.category,
            note: editingEntry.note,
            mood: editingEntry.mood,
            photo: editingEntry.photo,
          }}
          title="Edit Catatan"
          onSave={handleEdit}
          onCancel={() => setEditingId(null)}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStudentFilter('')}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${studentFilter === '' ? 'bg-teal-600 text-white' : 'border border-stv-border bg-white text-stv-body hover:bg-teal-50'}`}
          >
            Semua Siswa
          </button>
          {students.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStudentFilter(s.id)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${studentFilter === s.id ? 'bg-teal-600 text-white' : 'border border-stv-border bg-white text-stv-body hover:bg-teal-50'}`}
            >
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('semua')}
            className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${categoryFilter === 'semua' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600 hover:opacity-80'}`}
          >
            Semua Kategori
          </button>
          {UPDATE_CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategoryFilter(c.key)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${categoryFilter === c.key ? c.chipActive : `${c.bg} ${c.text} hover:opacity-80`}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-orange-200 py-14 text-center">
          <TrendingUp className="h-10 w-10 text-orange-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Belum ada catatan perkembangan</p>
          <p className="mt-1 text-[13px] text-stv-muted">Mulai catat perkembangan siswa hari ini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(update => {
            const student = students.find(s => s.id === update.studentId);
            const catMeta = UPDATE_CATEGORIES.find(c => c.key === update.category);
            const moodMeta = update.mood ? MOOD_META[update.mood] : null;
            const MoodIcon = moodMeta?.icon;
            return (
              <div key={update.id} className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Student badge */}
                    <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-[12px] font-bold text-teal-700">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[9px] font-bold text-white">
                        {student?.name.charAt(0) ?? '?'}
                      </span>
                      {student?.name.split(' ')[0] ?? '-'}
                    </span>
                    {/* Category */}
                    {catMeta && (
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${catMeta.bg} ${catMeta.text}`}>
                        {catMeta.label}
                      </span>
                    )}
                    {/* Mood */}
                    {moodMeta && MoodIcon && (
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${moodMeta.bg} ${moodMeta.color}`}>
                        <MoodIcon className="h-3 w-3" />
                        {moodMeta.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-stv-muted">{formatDate(update.date)}</span>
                    <button
                      type="button"
                      onClick={() => { setEditingId(update.id); setShowForm(false); }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-stv-muted hover:bg-slate-100 hover:text-stv-navy"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (window.confirm('Hapus catatan ini?')) deleteDailyUpdate(update.id); }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-[15px] leading-[1.7] text-stv-body">{update.note}</p>
                {update.photo && (
                  <div className="mt-3 h-40 w-full overflow-hidden rounded-xl">
                    <img src={update.photo} alt="Lampiran" className="h-full w-full object-cover" />
                  </div>
                )}
                <p className="mt-2.5 text-[12px] text-stv-muted">,  {update.teacherName}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
