import React, { useMemo, useState } from 'react';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Video, PlayCircle, Users2, X, Save, Download, CalendarDays, Clock,
} from 'lucide-react';
import { useDashboardTier2, Course } from '../../context/DashboardTier2Context';
import { isVideoLike } from '../DashboardPages/Tier2/courseData';
import ThumbnailUpload from './ThumbnailUpload';

const THEME_OPTIONS: Course['colorTheme'][] = ['amber', 'sky', 'coral', 'green'];
const THEME_SWATCH: Record<Course['colorTheme'], string> = {
  amber: 'bg-amber-400', sky: 'bg-sky-400', coral: 'bg-orange-400', green: 'bg-emerald-400',
};

// No real multi-user backend yet, so the participant LIST itself is
// generated deterministically from participantCount for display/export -
// only the count itself is meaningful mock data (see courseData.ts).
// TODO: replace with a real GET /courses/:id/participants once webinar
// registration is backend-tracked across users.
const MOCK_PARENT_POOL = [
  'Rina Wulandari', 'Andi Saputra', 'Dewi Kartika', 'Maya Anggraini', 'Joko Prasetyo',
  'Siti Rahma', 'Bambang Hidayat', 'Putri Lestari', 'Hendra Gunawan', 'Lina Marlina',
  'Fajar Nugraha', 'Ayu Permatasari', 'Rudi Hartono', 'Nita Sari', 'Eko Wibowo',
];

function mockParticipants(count: number) {
  return Array.from({ length: count }, (_, i) => MOCK_PARENT_POOL[i % MOCK_PARENT_POOL.length] + (i >= MOCK_PARENT_POOL.length ? ` ${Math.floor(i / MOCK_PARENT_POOL.length) + 1}` : ''));
}

type FormState = {
  type: Course['type'];
  title: string;
  psychologist: string;
  description: string;
  date: string;
  duration: number;
  webinarLink: string;
  colorTheme: Course['colorTheme'];
  status: Course['status'];
  visibility: Course['visibility'];
  thumbnailUrl?: string;
};

const EMPTY_FORM: FormState = {
  type: 'webinar', title: '', psychologist: 'Psikolog Fitri Effendy, S.Psi', description: '', date: '', duration: 60, webinarLink: '', colorTheme: 'amber', status: 'upcoming', visibility: 'draft',
};

function CourseFormModal({ initial, onClose, onSave }: { initial: FormState; onClose: () => void; onSave: (form: FormState) => void }) {
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.psychologist.trim() || !form.description.trim()) {
      setError('Judul, pembicara, dan deskripsi wajib diisi.');
      return;
    }
    if (form.type === 'webinar' && !form.date.trim()) {
      setError('Tanggal & waktu webinar wajib diisi.');
      return;
    }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">{initial.title ? 'Edit Course' : 'Buat Course Baru'}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Jenis</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, type: 'webinar', status: 'upcoming' }))}
                className={`flex items-center justify-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-[13px] font-semibold transition ${form.type === 'webinar' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-stv-border text-stv-body'}`}
              >
                <Video className="h-4 w-4" />
                Live Webinar
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, type: 'video', status: 'available' }))}
                className={`flex items-center justify-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-[13px] font-semibold transition ${form.type === 'video' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-stv-border text-stv-body'}`}
              >
                <PlayCircle className="h-4 w-4" />
                Video Rekaman
              </button>
            </div>
          </div>

          <ThumbnailUpload value={form.thumbnailUrl} onChange={url => setForm(f => ({ ...f, thumbnailUrl: url }))} />

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Judul *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Psikolog Pembicara *</label>
            <input
              value={form.psychologist}
              onChange={e => setForm(f => ({ ...f, psychologist: e.target.value }))}
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Deskripsi *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-purple-400 focus:outline-none"
            />
          </div>

          {form.type === 'webinar' ? (
            <>
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Tanggal & Waktu *</label>
                <input
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  placeholder="mis. Sabtu, 12 Juli 2026 · 19.00 WIB"
                  className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Durasi (menit)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Course['status'] }))}
                    className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-purple-400 focus:outline-none"
                  >
                    <option value="upcoming">Akan Datang</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Link Akses Webinar</label>
                <input
                  value={form.webinarLink}
                  onChange={e => setForm(f => ({ ...f, webinarLink: e.target.value }))}
                  placeholder="https://meet.studiva.id/webinar/..."
                  className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-purple-400 focus:outline-none"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Durasi Video (menit)</label>
              <input
                type="number"
                min={1}
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-purple-400 focus:outline-none"
              />
              <p className="mt-1 text-[12px] text-stv-muted">TODO: upload file video langsung - untuk sekarang link saja via field di atas (ganti webinarLink jadi link video bila perlu).</p>
            </div>
          )}

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
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Visibilitas</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, visibility: 'draft' }))}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${form.visibility === 'draft' ? 'bg-slate-500 text-white' : 'bg-slate-100 text-stv-body'}`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, visibility: 'published' }))}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${form.visibility === 'published' ? 'bg-stv-green text-white' : 'bg-stv-green-tint text-stv-green'}`}
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
            <button type="submit" className="flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-purple-700">
              <Save className="h-4 w-4" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ParticipantsModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const participants = mockParticipants(course.participantCount);

  function handleExport() {
    const csv = ['Nama Orang Tua', ...participants].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `peserta-${course.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Peserta Webinar</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-[13px] text-stv-muted">{course.title}</p>

        {participants.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-stv-muted">Belum ada yang mendaftar.</p>
        ) : (
          <div className="flex max-h-[320px] flex-col gap-1.5 overflow-y-auto">
            {participants.map((name, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[11px] font-bold text-purple-700">
                  {name.charAt(0).toUpperCase()}
                </span>
                <span className="text-[13px] text-stv-navy">{name}</span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleExport}
          disabled={participants.length === 0}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-purple-600 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Ekspor Daftar (CSV)
        </button>
      </div>
    </div>
  );
}

export default function CoursesAdmin() {
  const { courses, addCourse, updateCourse, deleteCourse } = useDashboardTier2();
  const [tab, setTab] = useState<'webinar' | 'video'>('webinar');
  const [modalCourse, setModalCourse] = useState<Course | 'new' | null>(null);
  const [participantsCourse, setParticipantsCourse] = useState<Course | null>(null);

  const filtered = useMemo(
    () => courses.filter(c => (tab === 'webinar' ? !isVideoLike(c) : isVideoLike(c))),
    [courses, tab]
  );

  function handleSave(form: FormState) {
    const payload = {
      type: form.type,
      title: form.title.trim(),
      psychologist: form.psychologist.trim(),
      description: form.description.trim(),
      status: form.status,
      visibility: form.visibility,
      date: form.type === 'webinar' ? form.date.trim() : undefined,
      duration: form.duration,
      webinarLink: form.type === 'webinar' ? form.webinarLink.trim() || undefined : undefined,
      colorTheme: form.colorTheme,
      thumbnailUrl: form.thumbnailUrl,
    };
    if (modalCourse && modalCourse !== 'new') {
      updateCourse(modalCourse.id, payload);
    } else {
      addCourse(payload);
    }
    setModalCourse(null);
  }

  function handleDelete(course: Course) {
    if (window.confirm(`Hapus course "${course.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteCourse(course.id);
    }
  }

  function toFormState(c: Course): FormState {
    return {
      type: c.type, title: c.title, psychologist: c.psychologist, description: c.description,
      date: c.date ?? '', duration: c.duration, webinarLink: c.webinarLink ?? '',
      colorTheme: c.colorTheme, status: c.status, visibility: c.visibility, thumbnailUrl: c.thumbnailUrl,
    };
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Courses</h2>
          <p className="text-[14px] text-stv-muted">Kelola webinar & video rekaman yang tampil di Courses Tier 1 dan Tier 2.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalCourse('new')}
          className="flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Buat Course Baru
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('webinar')}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${tab === 'webinar' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'}`}
        >
          Live Webinar
        </button>
        <button
          type="button"
          onClick={() => setTab('video')}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${tab === 'video' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'}`}
        >
          Video Rekaman
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-purple-200 py-14 text-center">
          <Video className="h-10 w-10 text-purple-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Belum ada course di kategori ini</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(c => (
            <div key={c.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:flex-row sm:items-center">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                {c.thumbnailUrl ? (
                  <img src={c.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center ${THEME_SWATCH[c.colorTheme]} bg-opacity-20`}>
                    {c.type === 'webinar' ? <Video className="h-6 w-6 text-stv-navy/50" /> : <PlayCircle className="h-6 w-6 text-stv-navy/50" />}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${c.visibility === 'published' ? 'bg-stv-green-tint text-stv-green' : 'bg-slate-100 text-slate-600'}`}>
                    {c.visibility === 'published' ? 'Terbit' : 'Draft'}
                  </span>
                  <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-600">
                    {c.status === 'upcoming' ? 'Akan Datang' : c.status === 'completed' ? 'Selesai' : 'Tersedia'}
                  </span>
                </div>
                <p className="mt-1.5 font-baloo text-[15px] font-bold text-stv-navy">{c.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-stv-muted">
                  <span>{c.psychologist}</span>
                  {c.date && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{c.date}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration} menit</span>
                  <span className="flex items-center gap-1"><Users2 className="h-3 w-3" />{c.participantCount} {c.type === 'webinar' ? 'peserta' : 'penonton'}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {c.type === 'webinar' && (
                  <button
                    type="button"
                    onClick={() => setParticipantsCourse(c)}
                    title="Lihat Peserta"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-stv-muted transition hover:bg-slate-100 hover:text-stv-navy"
                  >
                    <Users2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => updateCourse(c.id, { visibility: c.visibility === 'published' ? 'draft' : 'published' })}
                  title={c.visibility === 'published' ? 'Sembunyikan' : 'Terbitkan'}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-stv-muted transition hover:bg-slate-100 hover:text-stv-navy"
                >
                  {c.visibility === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setModalCourse(c)}
                  title="Edit"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-stv-muted transition hover:bg-slate-100 hover:text-stv-navy"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c)}
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

      {modalCourse && (
        <CourseFormModal
          initial={modalCourse === 'new' ? EMPTY_FORM : toFormState(modalCourse)}
          onClose={() => setModalCourse(null)}
          onSave={handleSave}
        />
      )}

      {participantsCourse && (
        <ParticipantsModal course={participantsCourse} onClose={() => setParticipantsCourse(null)} />
      )}
    </div>
  );
}
