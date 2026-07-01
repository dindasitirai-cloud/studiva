import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Trash2, TrendingUp, CalendarCheck, FolderOpen,
  ClipboardList, Target, Baby, X, Save,
} from 'lucide-react';
import { useGuru, KELOMPOK_OPTIONS, DIAGNOSIS_OPTIONS } from './GuruContext';
import { GURU_COLORS } from './guruFeatureColors';
import ThumbnailUpload from '../AdminPages/ThumbnailUpload';

const QUICK_LINKS = [
  { key: 'perkembangan' as const, to: (id: string) => `/guru/perkembangan?siswa=${id}`, label: 'Perkembangan Harian', icon: TrendingUp },
  { key: 'kehadiran' as const, to: (id: string) => `/guru/kehadiran?siswa=${id}`, label: 'Kehadiran', icon: CalendarCheck },
  { key: 'portfolio' as const, to: (id: string) => `/guru/portfolio?siswa=${id}`, label: 'Portfolio', icon: FolderOpen },
  { key: 'asesmen' as const, to: (id: string) => `/guru/asesmen?siswa=${id}`, label: 'Asesmen', icon: ClipboardList },
  { key: 'iep' as const, to: (id: string) => `/guru/iep?siswa=${id}`, label: 'IEP', icon: Target },
];

type EditFormState = {
  name: string;
  age: number;
  kelompok: string;
  diagnosis: string[];
  ringkasan: string;
  photo?: string;
};

export default function StudentProfileGuru() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { students, updateStudent, deleteStudent } = useGuru();

  const student = students.find(s => s.id === id);
  const [editOpen, setEditOpen] = useState(false);

  if (!student) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <Baby className="h-10 w-10 text-teal-300" strokeWidth={1.5} />
        <h2 className="font-baloo text-[20px] font-bold text-stv-navy">Siswa tidak ditemukan</h2>
        <button type="button" onClick={() => navigate('/guru/kelas')} className="rounded-full bg-teal-600 px-5 py-2 text-[14px] font-bold text-white hover:bg-teal-700">
          Kembali ke Kelas Saya
        </button>
      </div>
    );
  }

  // student is guaranteed non-null past the early-return guard above —
  // the non-null assertions below just satisfy the TypeScript narrowing
  // that doesn't propagate into nested function bodies.
  function handleSaveEdit(form: EditFormState) {
    updateStudent(student!.id, form);
    setEditOpen(false);
  }

  function handleDelete() {
    if (window.confirm(`Hapus data siswa "${student!.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteStudent(student!.id);
      navigate('/guru/kelas');
    }
  }

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-5">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/guru/kelas')}
          className="flex items-center gap-1.5 text-[14px] font-semibold text-stv-muted transition hover:text-teal-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kelas Saya
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-teal-700"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profil
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
            title="Hapus siswa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Identity card */}
      <div className="animate-fade-in-up flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:flex-row sm:items-start">
        {student.photo ? (
          <img src={student.photo} alt={student.name} className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-teal-600 font-baloo text-[38px] font-bold text-white">
            {student.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">{student.name}</h2>
          <p className="mt-0.5 text-[14px] text-stv-body">{student.age} tahun &middot; {student.kelompok}</p>
          <p className="mt-0.5 text-[13px] text-stv-muted">Wali Kelas: {student.waliKelas}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {student.diagnosis.map(d => (
              <span key={d} className="rounded-full bg-stv-sky-tint px-2.5 py-0.5 text-[12px] font-semibold text-stv-sky-stroke">{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Catatan guru */}
      {student.ringkasan && (
        <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          <h3 className="font-baloo text-[15px] font-bold text-stv-navy">Tentang {student.name.split(' ')[0]}</h3>
          <p className="mt-2 text-[14px] leading-[1.7] text-stv-body">{student.ringkasan}</p>
        </div>
      )}

      {/* Quick links to student's modules */}
      <div>
        <h3 className="mb-3 font-baloo text-[15px] font-bold text-stv-navy">Lihat & Kelola Data {student.name.split(' ')[0]}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {QUICK_LINKS.map(({ key, to, label, icon: Icon }) => {
            const colors = GURU_COLORS[key];
            return (
              <Link
                key={key}
                to={to(student.id)}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center no-underline shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.1)]"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} strokeWidth={2} />
                </div>
                <p className="font-baloo text-[12px] font-bold text-stv-navy">{label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <EditProfileModal
          student={student}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

function EditProfileModal({ student, onClose, onSave }: {
  student: ReturnType<typeof useGuru>['students'][0];
  onClose: () => void;
  onSave: (form: EditFormState) => void;
}) {
  const { students } = useGuru();
  const kelompokOptions = [...new Set([...KELOMPOK_OPTIONS, ...students.map(s => s.kelompok).filter(Boolean)])];

  const [form, setForm] = useState<EditFormState>({
    name: student.name,
    age: student.age,
    kelompok: student.kelompok,
    diagnosis: student.diagnosis,
    ringkasan: student.ringkasan,
    photo: student.photo,
  });
  const [error, setError] = useState('');

  function toggleDiagnosis(d: string) {
    setForm(f => ({
      ...f,
      diagnosis: f.diagnosis.includes(d) ? f.diagnosis.filter(x => x !== d) : [...f.diagnosis, d],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nama wajib diisi.'); return; }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Edit Profil {student.name.split(' ')[0]}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <ThumbnailUpload value={form.photo} onChange={url => setForm(f => ({ ...f, photo: url }))} label="Foto Siswa" />
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-teal-400 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Usia</label>
              <input type="number" min={3} max={18} value={form.age} onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))} className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-teal-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Kelas</label>
              <input
                type="text"
                list="kelompok-edit-datalist"
                value={form.kelompok}
                onChange={e => setForm(f => ({ ...f, kelompok: e.target.value }))}
                placeholder="Ketik nama kelas atau pilih..."
                className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-teal-400 focus:outline-none"
              />
              <datalist id="kelompok-edit-datalist">
                {kelompokOptions.map(k => <option key={k} value={k} />)}
              </datalist>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Kebutuhan Khusus</label>
            <div className="flex flex-wrap gap-2">
              {DIAGNOSIS_OPTIONS.map(d => (
                <button key={d} type="button" onClick={() => toggleDiagnosis(d)} aria-pressed={form.diagnosis.includes(d)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${form.diagnosis.includes(d) ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:opacity-80'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Catatan tentang Anak</label>
            <textarea value={form.ringkasan} onChange={e => setForm(f => ({ ...f, ringkasan: e.target.value }))} rows={3} className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-teal-400 focus:outline-none" />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-stv-border px-5 py-2 text-[14px] font-semibold text-stv-body hover:bg-slate-50">Batal</button>
            <button type="submit" className="flex items-center gap-1.5 rounded-full bg-teal-600 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-teal-700">
              <Save className="h-4 w-4" />Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
